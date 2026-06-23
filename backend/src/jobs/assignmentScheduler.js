import { Queue } from "bullmq";
import { getIORedisConnection } from "../db/redis.connect.js";
import { AutomationSettings } from "../models/automationSettings.model.js";
import { runAssignmentEngine } from "./assignmentWorker.js";

let assignmentQueue;
let notificationQueue;
let reassessmentQueue;
let isRedisConnected = false;
let fallbackTimer = null;

export const getSystemStatus = () => {
  return isRedisConnected ? "HEALTHY" : "DEGRADED";
};

export const getQueueInstances = () => {
  return {
    assignmentQueue,
    notificationQueue,
    reassessmentQueue,
  };
};

export async function initScheduler() {
  const connection = getIORedisConnection();

  if (connection) {
    try {
      // Connect check using IORedis status
      await connection.connect().catch(() => {});
      isRedisConnected = connection.status === "ready" || connection.status === "connect";

      // BullMQ requires Redis >= 5.0. Check version before creating queues.
      if (isRedisConnected) {
        try {
          const info = await connection.info("server");
          const versionMatch = info.match(/redis_version:(\d+)\.(\d+)/);
          if (versionMatch) {
            const majorVersion = parseInt(versionMatch[1], 10);
            if (majorVersion < 5) {
              console.warn(
                `[BullMQ] Redis version ${versionMatch[1]}.${versionMatch[2]} is too old (need >= 5.0). ` +
                `Skipping BullMQ and using in-memory scheduler instead.`
              );
              isRedisConnected = false;
            }
          }
        } catch (versionCheckErr) {
          console.warn("[BullMQ] Could not check Redis version, skipping BullMQ:", versionCheckErr.message);
          isRedisConnected = false;
        }
      }
    } catch (err) {
      console.warn("Failed to connect to Redis for BullMQ. Using degraded mode:", err.message);
      isRedisConnected = false;
    }
  }

  if (isRedisConnected && connection) {
    console.log("Redis is available and compatible. Initializing BullMQ Queues...");
    try {
      assignmentQueue = new Queue("assignment-jobs", { connection });
      notificationQueue = new Queue("notification-jobs", { connection });
      reassessmentQueue = new Queue("reassessment-jobs", { connection });

      // Attach error handlers to prevent unhandled EventEmitter errors crashing the process
      assignmentQueue.on("error", (err) => {
        console.error("[BullMQ assignmentQueue] error (non-fatal):", err.message);
        if (!fallbackTimer) { isRedisConnected = false; startInMemoryScheduler(); }
      });
      notificationQueue.on("error", (err) => {
        console.error("[BullMQ notificationQueue] error (non-fatal):", err.message);
      });
      reassessmentQueue.on("error", (err) => {
        console.error("[BullMQ reassessmentQueue] error (non-fatal):", err.message);
      });

      // Set up repeatable schedules based on settings
      await configureRepeatableJobs();
    } catch (queueErr) {
      console.error("Failed to initialize BullMQ queues, falling back to in-memory:", queueErr.message);
      isRedisConnected = false;
      startInMemoryScheduler();
    }
  } else {
    console.log("Redis is unavailable or incompatible. Falling back to in-memory scheduler (DEGRADED mode).");
    startInMemoryScheduler();
  }
}

async function configureRepeatableJobs() {
  if (!assignmentQueue) return;

  try {
    // Clean old repeatable jobs
    const jobs = await assignmentQueue.getRepeatableJobs();
    for (const job of jobs) {
      await assignmentQueue.removeRepeatableByKey(job.key);
    }

    const settings = await AutomationSettings.findOne() || await AutomationSettings.create({});

    // Frequency schedule: daily (midnight) or weekly (Sunday midnight)
    const frequency = settings.AUTO_ASSIGNMENT_FREQUENCY || "daily";
    const cronPattern = frequency === "weekly" ? "0 0 * * 0" : "0 0 * * *"; // Sunday 12am or Daily 12am

    await assignmentQueue.add(
      "scheduled-assignment",
      { source: "scheduler", runType: frequency },
      {
        repeat: { pattern: cronPattern },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
    console.log(`BullMQ repeatable assignment job configured for frequency: ${frequency} (${cronPattern})`);
  } catch (err) {
    console.error("Error configuring repeatable BullMQ jobs:", err.message);
  }
}

export async function updateSchedulerConfig() {
  if (isRedisConnected && assignmentQueue) {
    await configureRepeatableJobs();
  } else {
    startInMemoryScheduler();
  }
}

function startInMemoryScheduler() {
  if (fallbackTimer) {
    clearInterval(fallbackTimer);
    fallbackTimer = null;
  }

  // Fallback to checking settings every 10 minutes, and triggering in-memory runs.
  // In production, daily interval is 24 * 60 * 60 * 1000.
  // For demonstration and test reliability, we run it periodically if automation is enabled.
  fallbackTimer = setInterval(async () => {
    try {
      const settings = await AutomationSettings.findOne();
      if (settings && settings.AUTO_ASSIGNMENTS_ENABLED) {
        console.log("[Fallback Scheduler] Triggering in-memory assignment run...");
        // Run worker logic in-process asynchronously
        runAssignmentEngine({ source: "fallback-scheduler" }).catch(err => {
          console.error("[Fallback Scheduler] Run failed:", err);
        });
      }
    } catch (err) {
      console.error("[Fallback Scheduler] Error checking settings:", err.message);
    }
  }, 10 * 60 * 1000); // 10 minutes
}

export async function triggerManualRun(adminUserId) {
  const jobPayload = { source: "manual-trigger", triggeredBy: adminUserId };
  
  if (isRedisConnected && assignmentQueue) {
    const job = await assignmentQueue.add("manual-assignment", jobPayload, {
      attempts: 3,
      backoff: 5000,
    });
    return { jobId: job.id, status: "queued", type: "BullMQ" };
  } else {
    console.log("[Fallback Scheduler] Starting immediate in-process assignment run...");
    runAssignmentEngine(jobPayload).catch(err => {
      console.error("[Fallback Scheduler] In-process manual run failed:", err);
    });
    return { status: "started", type: "in-process" };
  }
}

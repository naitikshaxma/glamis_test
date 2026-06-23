import { Worker } from "bullmq";
import { getIORedisConnection } from "../db/redis.connect.js";
import { generateAndStoreRecommendations } from "../services/assignmentService.js";
import { AutomationSettings } from "../models/automationSettings.model.js";
import { StudentAssignment } from "../models/studentAssignment.model.js";
import { Notification } from "../models/notification.model.js";
import { getQueueInstances } from "./assignmentScheduler.js";
import { Student } from "../models/users.models.js";

let worker;

export function initReassessmentWorker() {
  const connection = getIORedisConnection();
  if (connection && connection.status !== "end") {
    try {
      worker = new Worker(
        "reassessment-jobs",
        async (job) => {
          const { studentId, userId } = job.data;
          console.log(`[Reassessment Worker] Processing profile updates for student ${studentId}`);

          await executeReassessment(studentId, userId);
        },
        { connection }
      );
      worker.on("failed", (job, err) => {
        console.error(`[Reassessment Worker] Job ${job.id} failed:`, err);
      });
      // Prevent unhandled 'error' event from crashing the process
      worker.on("error", (err) => {
        console.error("[BullMQ ReassessmentWorker] error (non-fatal):", err.message);
      });
      console.log("BullMQ Reassessment Worker initialized.");
    } catch (err) {
      console.error("Failed to initialize BullMQ reassessment worker:", err.message);
    }
  }
}

/**
 * REASSESSMENT ENGINE (Step 12)
 * Recalculate readiness, weak subjects, and auto-queue next assignment.
 */
export async function executeReassessment(studentId, userId) {
  try {
    const settings = await AutomationSettings.findOne() || await AutomationSettings.create({});

    console.log(`[Reassessment Worker] Processing profile updates for student ${studentId}`);

    // 1. Call FastAPI to compute updated readiness, weak subjects, and roadmap
    const { roadmap, assignments } = await generateAndStoreRecommendations(studentId, userId);
    
    console.log(`[Reassessment Engine] readiness recalculated`);
    console.log(`[Reassessment Engine] new roadmap generated`);
    console.log(`[Reassessment Engine] new assignment created`);
    console.log(`[Reassessment Engine] Roadmap regenerated for student ${studentId}. Readiness score: ${roadmap.readinessScore}`);

    // Track progression history in the StudentAssignment or student profile.
    // If auto assignment is enabled and we have fresh recommendations, promote the top recommendation automatically
    if (settings.AUTO_ASSIGNMENTS_ENABLED && assignments.length > 0) {
      // Find top recommendation (sorted by priority or order in roadmap)
      const topRec = assignments[0]; // Already generated as status "recommended"

      if (topRec && topRec.status === "recommended" && topRec.confidence >= 0.85) {
        const expiryDays = settings.DEFAULT_EXPIRY_DAYS || 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        topRec.status = "assigned";
        topRec.expiresAt = expiresAt;
        topRec.assignedAt = new Date();
        await topRec.save();

        // Create Notification
        await Notification.create({
          userId,
          title: "🤖 Next AI Recommended Test Assigned",
          message: `Based on your recent interview performance, you have been assigned ${topRec.assignmentType} next. Deadline: ${expiresAt.toLocaleDateString()}.`,
          type: "assignment",
          link: "/dashboard",
        });

        console.log(`[Reassessment Engine] Auto-promoted assignment ${topRec._id} to status 'assigned' for student ${studentId}`);
      }
    }
  } catch (err) {
    console.error(`[Reassessment Engine] Failure during execution for student ${studentId}:`, err.message);
  }
}

export async function triggerReassessment(studentId, userId) {
  const queues = getQueueInstances();
  if (queues.reassessmentQueue) {
    await queues.reassessmentQueue.add("reassess-profile", { studentId, userId }, {
      attempts: 3,
      backoff: 5000,
    });
    console.log(`[Reassessment Queue] Enqueued reassessment for student ${studentId}`);
  } else {
    console.log(`[Reassessment Queue] (Fallback) Enqueued reassessment for student ${studentId}`);
    console.log(`[Reassessment Fallback] Triggering in-process profile reassessment for student ${studentId}`);
    setTimeout(() => {
      console.log(`[Reassessment Worker] (Fallback) Processing profile updates for student ${studentId}`);
      executeReassessment(studentId, userId).catch(err => {
        console.error("[Reassessment Fallback] executeReassessment failed:", err.message);
      });
    }, 1000);
  }
}

import { Worker } from "bullmq";
import { getIORedisConnection } from "../db/redis.connect.js";
import { StudentAssignment } from "../models/studentAssignment.model.js";
import { Student, User } from "../models/users.models.js";
import { AutomationSettings } from "../models/automationSettings.model.js";
import { AutomationLog } from "../models/automationLog.model.js";
import { FailedAutomationJob } from "../models/failedAutomationJob.model.js";
import { AdminReviewQueue } from "../models/adminReviewQueue.model.js";
import { Notification } from "../models/notification.model.js";
import { callFastAPIRoadmap } from "../services/assignmentService.js";
import { getQueueInstances } from "./assignmentScheduler.js";
import sendMail from "../utils/sendMail.js";
import InterviewInvitationTemplate from "../utils/emailTemplates/interviewInvitation.js";
import { Interview, InterviewQuestion } from "../models/interview.models.js";

let worker;

export function initAssignmentWorker() {
  const connection = getIORedisConnection();
  if (connection && connection.status !== "end") {
    try {
      worker = new Worker(
        "assignment-jobs",
        async (job) => {
          console.log(`[BullMQ Worker] Processing job ${job.id} (${job.name})`);
          await runAssignmentEngine(job.data);
        },
        { connection }
      );
      worker.on("failed", (job, err) => {
        console.error(`[BullMQ Worker] Job ${job.id} failed:`, err);
      });
      // Prevent unhandled 'error' event (e.g. Redis version too old) from crashing
      worker.on("error", (err) => {
        console.error("[BullMQ Worker] error (non-fatal):", err.message);
      });
      console.log("BullMQ Assignment Worker initialized.");
    } catch (err) {
      console.error("Failed to initialize BullMQ worker:", err.message);
    }
  }
}

/**
 * ELIGIBILITY ENGINE (Step 6)
 * Checks if a student is eligible for an automated interview assignment.
 */
export async function checkEligibility(studentId, settings) {
  const student = await Student.findById(studentId).populate("user");
  if (!student || !student.user) {
    return { eligible: false, reason: "Student or User profile not found", confidence: 0 };
  }

  // Check 1: Student Active
  const isActive = student.user.is_email_verified || student.interview_taken.length > 0; // Simple active heuristic
  if (!isActive) {
    return { eligible: false, reason: "Student is not active", confidence: 0 };
  }

  // Check 2: Interview History Exists
  const historyCount = student.interview_taken.length;
  if (historyCount === 0) {
    return { eligible: false, reason: "Student has no previous interview attempts", confidence: 0 };
  }

  // Fetch all assignments of this student
  const assignments = await StudentAssignment.find({ studentId });

  // Cooldown setting
  const cooldownDays = settings.AUTO_ASSIGNMENT_COOLDOWN_DAYS || 7;
  const cooldownLimit = new Date();
  cooldownLimit.setDate(cooldownLimit.getDate() - cooldownDays);

  // Expiry check & Dynamic status transition
  const now = new Date();
  for (const asg of assignments) {
    if (asg.status === "assigned" && asg.expiresAt && asg.expiresAt < now) {
      asg.status = "expired";
      await asg.save();
    }
  }

  // Check 3 & 4: Active assignments or recently completed assignments of same category
  const activeAssignments = assignments.filter(a => ["recommended", "assigned", "in_progress"].includes(a.status));
  const completedAssignments = assignments.filter(a => a.status === "completed" && a.completedAt > cooldownLimit);

  return {
    eligible: true,
    activeAssignments,
    completedAssignments,
    confidence: 1.0,
  };
}

/**
 * LOCAL DETERMINISTIC RULE ENGINE (Step 8)
 * Falls back when LLM usage exceeds limits or FastAPI is offline.
 */
export async function runDeterministicRuleEngine(student, eligibleCheck) {
  // Extract completed interviews
  const completedInterviews = await Interview.find({
    _id: { $in: student.interview_taken },
    is_active: false,
  });

  const subjectAverages = {
    DSA: { sum: 0, count: 0 },
    DBMS: { sum: 0, count: 0 },
    OS: { sum: 0, count: 0 },
    CN: { sum: 0, count: 0 },
    Verbal: { sum: 0, count: 0 },
    HR: { sum: 0, count: 0 },
  };

  // Compile scores from questions
  for (const iv of completedInterviews) {
    const questions = await InterviewQuestion.find({ interview: iv._id });
    if (questions.length === 0) continue;
    const avgScore = questions.reduce((acc, cur) => acc + (cur.overallPerformance || 50), 0) / questions.length;
    
    // Map types
    let category = "DSA";
    const title = (iv.title || "").toLowerCase();
    if (title.includes("dbms")) category = "DBMS";
    else if (title.includes("os")) category = "OS";
    else if (title.includes("cn") || title.includes("network")) category = "CN";
    else if (title.includes("verbal") || title.includes("communication")) category = "Verbal";
    else if (title.includes("hr")) category = "HR";

    if (subjectAverages[category]) {
      subjectAverages[category].sum += avgScore;
      subjectAverages[category].count += 1;
    }
  }

  // Find subject with lowest average or unattempted
  let selectedSubject = "DSA";
  let lowestScore = 100;

  for (const [subj, data] of Object.entries(subjectAverages)) {
    const score = data.count > 0 ? (data.sum / data.count) : 0;
    if (score < lowestScore) {
      lowestScore = score;
      selectedSubject = subj;
    }
  }

  const interviewType = selectedSubject + " Interview";

  // Check category block
  const hasActive = eligibleCheck.activeAssignments.some(a => a.assignmentType === interviewType);
  const hasCompleted = eligibleCheck.completedAssignments.some(a => a.assignmentType === interviewType);
  if (hasActive || hasCompleted) {
    // Pick another subject that doesn't have active assignments
    const subjects = Object.keys(subjectAverages);
    for (const subj of subjects) {
      const type = subj + " Interview";
      const active = eligibleCheck.activeAssignments.some(a => a.assignmentType === type);
      const completed = eligibleCheck.completedAssignments.some(a => a.assignmentType === type);
      if (!active && !completed) {
        selectedSubject = subj;
        lowestScore = subjectAverages[subj].count > 0 ? (subjectAverages[subj].sum / subjectAverages[subj].count) : 0;
        break;
      }
    }
  }

  const finalType = selectedSubject + " Interview";

  // Build recommendation format
  return {
    recommendations: [
      {
        interviewType: finalType,
        priority: lowestScore < 50 ? "Critical" : lowestScore < 70 ? "High" : "Medium",
        rationale: `Rule-based recommendation: Student's average score in ${selectedSubject} is ${lowestScore === 0 ? 'unattempted' : lowestScore.toFixed(1) + '%'}.`,
        confidence: 0.90, // Passes the 0.85 threshold to auto-assign
        estimatedDurationMinutes: 45,
        prerequisiteMet: true,
      }
    ],
    readinessScore: lowestScore || 50,
    weakSubjects: [selectedSubject],
    placementEligible: false,
    generatedBy: "DeterministicRuleEngine",
  };
}

/**
 * MAIN ASSIGNMENT SCHEDULER ENGINE (Step 9)
 */
export async function runAssignmentEngine(jobData = {}) {
  const startTime = Date.now();
  const settings = await AutomationSettings.findOne() || await AutomationSettings.create({});

  const log = new AutomationLog({
    jobName: jobData.source || "automated-assignment",
    status: "running",
    startedAt: new Date(),
  });
  await log.save();

  try {
    const students = await Student.find().populate("user");
    log.processed = students.length;

    let eligibleStudents = [];
    let processedDetails = [];

    // Filter through Eligibility Engine
    for (const student of students) {
      const eligibility = await checkEligibility(student._id, settings);
      if (eligibility.eligible) {
        eligibleStudents.push({ student, check: eligibility });
      } else {
        processedDetails.push({
          studentId: student._id,
          status: "skipped",
          reason: eligibility.reason,
        });
        log.skipped += 1;
      }
    }

    log.eligible = eligibleStudents.length;

    // Apply batch limit
    const batchSize = Math.min(eligibleStudents.length, settings.AUTO_ASSIGNMENT_BATCH_SIZE || 50);
    const studentsToProcess = eligibleStudents.slice(0, batchSize);

    let llmRunCount = 0;

    for (const { student, check } of studentsToProcess) {
      try {
        let roadmap;
        let isLLM = false;

        // Cost Control: Check if we exceeded the LLM run limit
        if (llmRunCount < (settings.MAX_LLM_ASSIGNMENTS_PER_RUN || 250)) {
          try {
            roadmap = await callFastAPIRoadmap(String(student.user._id));
            isLLM = true;
            llmRunCount += 1;
            log.llmAssignments += 1;
            // Rough estimation of token usage: 800 input + 600 output = 1400 tokens per call.
            log.tokenUsageEstimate += 1400;
            log.costEstimate += 1400 * 0.000015; // Rough estimate ($0.015 per 1k)
          } catch (fastApiErr) {
            console.warn(`FastAPI unavailable for user ${student.user._id}, falling back to rule engine:`, fastApiErr.message);
            roadmap = await runDeterministicRuleEngine(student, check);
            log.ruleAssignments += 1;
          }
        } else {
          // Rule Engine fallback
          roadmap = await runDeterministicRuleEngine(student, check);
          log.ruleAssignments += 1;
        }

        // Process Recommendations
        for (const rec of roadmap.recommendations || []) {
          const confidence = rec.confidence ?? 0.90; // Default to high confidence

          // Check category level duplicates
          const alreadyHasSameType = check.activeAssignments.some(a => a.assignmentType === rec.interviewType);
          if (alreadyHasSameType) {
            processedDetails.push({
              studentId: student._id,
              status: "skipped",
              reason: `Duplicate assignment type '${rec.interviewType}' already active`,
            });
            log.skipped += 1;
            continue;
          }

          if (confidence >= 0.85) {
            // STEP 9: Auto Assign (Create StudentAssignment, Notification, log success)
            const expiryDays = settings.DEFAULT_EXPIRY_DAYS || 7;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + expiryDays);

            const asg = await StudentAssignment.create({
              studentId: student._id,
              userId: student.user._id,
              assignmentType: rec.interviewType,
              difficulty: rec.priority === "Critical" ? "Hard" : rec.priority === "High" ? "Hard" : "Medium",
              priority: rec.priority,
              status: "assigned", // Directly assigned, bypassing manual approval
              reasoning: rec.rationale,
              agentSummary: roadmap.agentSummary || "Auto assigned by AI",
              readinessScore: roadmap.readinessScore || 50,
              weakSubjects: roadmap.weakSubjects || [],
              estimatedDurationMinutes: rec.estimatedDurationMinutes || 45,
              prerequisiteMet: rec.prerequisiteMet ?? true,
              expiresAt,
              assignedAt: new Date(),
            });

            // Trigger Notification
            await triggerNotification(student.user._id, {
              title: "🤖 AI Interview Assigned",
              message: `You have been assigned a new ${rec.interviewType} (Priority: ${rec.priority}). Deadline: ${expiresAt.toLocaleDateString()}.`,
              type: "assignment",
              link: "/dashboard",
            });

            processedDetails.push({
              studentId: student._id,
              status: "assigned",
              assignmentId: asg._id,
              type: rec.interviewType,
              isLLM,
            });
            log.assigned += 1;
          } else {
            // Route to Admin Review Queue (Step 7)
            const review = await AdminReviewQueue.create({
              studentId: student._id,
              userId: student.user._id,
              assignmentType: rec.interviewType,
              priority: rec.priority,
              confidence,
              reasoning: rec.rationale,
              agentSummary: roadmap.agentSummary || "Low confidence roadmap",
              readinessScore: roadmap.readinessScore || 50,
              weakSubjects: roadmap.weakSubjects || [],
              estimatedDurationMinutes: rec.estimatedDurationMinutes || 45,
              prerequisiteMet: rec.prerequisiteMet ?? true,
            });

            processedDetails.push({
              studentId: student._id,
              status: "routed_to_review",
              reviewId: review._id,
              type: rec.interviewType,
              confidence,
            });
          }
        }
      } catch (studentErr) {
        // Log individual student failures in DLQ (Step 3)
        await FailedAutomationJob.create({
          studentId: student._id,
          userId: student.user._id,
          jobName: log.jobName,
          failureReason: studentErr.message,
          stackTrace: studentErr.stack || "",
        });

        processedDetails.push({
          studentId: student._id,
          status: "failed",
          error: studentErr.message,
        });
        log.failed += 1;
      }
    }

    log.status = "completed";
    log.completedAt = new Date();
    log.durationMs = Date.now() - startTime;
    log.details = processedDetails;
    await log.save();

    console.log(`[Assignment Scheduler Run Completed] Assigned: ${log.assigned}, Routed to Review/Skipped: ${log.skipped}, Failed: ${log.failed}`);
  } catch (globalErr) {
    log.status = "failed";
    log.completedAt = new Date();
    log.durationMs = Date.now() - startTime;
    log.error = globalErr.message;
    await log.save();
    console.error("[Assignment Scheduler Global Failure]:", globalErr.message);
  }
}

/**
 * Trigger Student Notification Async (Step 4 & Step 6)
 */
async function triggerNotification(userId, data) {
  try {
    // 1. Create in-app Notification record
    await Notification.create({
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      link: data.link,
    });

    // 2. Queue Email Job if BullMQ is running, otherwise send immediately in-process
    const queues = getQueueInstances();
    if (queues.notificationQueue) {
      await queues.notificationQueue.add("send-email", { userId, ...data });
    } else {
      // Inline send
      const user = await User.findById(userId);
      if (user && user.email_id) {
        try {
          await sendMail(
            user.email_id,
            data.title,
            InterviewInvitationTemplate(
              data.title,
              data.type === "assignment" ? "Interview" : "Notification",
              "https://glamis.in/dashboard",
              "ASAP"
            )
          );
        } catch (mailErr) {
          console.warn("In-process fallback email failed:", mailErr.message);
        }
      }
    }
  } catch (err) {
    console.error("Failed to trigger student notification:", err.message);
  }
}

import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Student, User } from "../models/users.models.js";
import {
  generateAndStoreRecommendations,
  approveAssignment,
  rejectAssignment,
  getAssignments,
  getStudentAssignments,
  getAnalytics,
  bulkGenerateRecommendations,
  lazyCreateInterview,
} from "../services/assignmentService.js";
import { AutomationSettings } from "../models/automationSettings.model.js";
import { AutomationLog } from "../models/automationLog.model.js";
import { FailedAutomationJob } from "../models/failedAutomationJob.model.js";
import { AdminReviewQueue } from "../models/adminReviewQueue.model.js";
import { StudentAssignment } from "../models/studentAssignment.model.js";
import { triggerManualRun, getSystemStatus } from "../jobs/assignmentScheduler.js";

// ─── Admin: Generate recommendations for a student ────────────────────────

export const generateRecommendations = async (req, res) => {
  try {
    const { userId, jdMatchScore, targetCompany } = req.body;
    if (!userId) {
      return res.status(400).json(ApiError(400, "userId is required"));
    }

    const user    = await User.findById(userId);
    const student = user ? await Student.findOne({ user: userId }) : null;

    if (!user || !student) {
      return res.status(404).json(ApiError(404, "User or student profile not found"));
    }

    const { roadmap, assignments } = await generateAndStoreRecommendations(
      student._id,
      user._id,
      { jdMatchScore, targetCompany }
    );

    return res.status(200).json(
      new ApiResponse(200, { roadmap, assignments }, `Generated ${assignments.length} recommendation(s) for ${user.name}`)
    );
  } catch (error) {
    console.error("generateRecommendations error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json(ApiError(statusCode, error.message));
  }
};

// ─── Admin: Bulk generate ─────────────────────────────────────────────────

export const bulkGenerate = async (req, res) => {
  try {
    const { userIds, jdMatchScore, targetCompany } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json(ApiError(400, "userIds array is required"));
    }

    const result = await bulkGenerateRecommendations(userIds, { jdMatchScore, targetCompany });

    return res.status(200).json(
      new ApiResponse(200, result, `Bulk generation complete: ${result.results.length} succeeded, ${result.errors.length} failed`)
    );
  } catch (error) {
    console.error("bulkGenerate error:", error);
    return res.status(500).json(ApiError(500, error.message));
  }
};

// ─── Admin: Approve a recommendation ─────────────────────────────────────

export const approve = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    if (!assignmentId) {
      return res.status(400).json(ApiError(400, "assignmentId is required"));
    }

    const result = await approveAssignment(assignmentId, req.user._id);

    return res.status(200).json(
      new ApiResponse(200, result, "Assignment approved and interview created successfully")
    );
  } catch (error) {
    console.error("approve error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json(ApiError(statusCode, error.message));
  }
};

// ─── Admin: Reject a recommendation ──────────────────────────────────────

export const reject = async (req, res) => {
  try {
    const { assignmentId, reason } = req.body;
    if (!assignmentId) {
      return res.status(400).json(ApiError(400, "assignmentId is required"));
    }

    const assignment = await rejectAssignment(assignmentId, req.user._id, reason);

    return res.status(200).json(
      new ApiResponse(200, { assignment }, "Assignment rejected successfully")
    );
  } catch (error) {
    console.error("reject error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json(ApiError(statusCode, error.message));
  }
};

// ─── Admin: List all assignments ──────────────────────────────────────────

export const listAssignments = async (req, res) => {
  try {
    const { status, priority, assignmentType, page, limit } = req.query;
    const result = await getAssignments({
      status, priority, assignmentType,
      page:  parseInt(page)  || 1,
      limit: parseInt(limit) || 20,
    });

    return res.status(200).json(new ApiResponse(200, result, "Assignments fetched successfully"));
  } catch (error) {
    console.error("listAssignments error:", error);
    return res.status(500).json(ApiError(500, error.message));
  }
};

// ─── Admin: Assignments by student ────────────────────────────────────────

export const listByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate("user", "name email_id");
    if (!student) {
      return res.status(404).json(ApiError(404, "Student not found"));
    }

    const result = await getAssignments({ studentId });
    return res.status(200).json(new ApiResponse(200, result, "Student assignments fetched"));
  } catch (error) {
    console.error("listByStudent error:", error);
    return res.status(500).json(ApiError(500, error.message));
  }
};

// ─── Admin: Analytics ─────────────────────────────────────────────────────

export const analytics = async (req, res) => {
  try {
    const data = await getAnalytics();
    return res.status(200).json(new ApiResponse(200, data, "Analytics computed successfully"));
  } catch (error) {
    console.error("analytics error:", error);
    return res.status(500).json(ApiError(500, error.message));
  }
};

// ─── Student: My assignments ──────────────────────────────────────────────

export const myAssignments = async (req, res) => {
  try {
    const assignments = await getStudentAssignments(req.user._id);
    return res.status(200).json(new ApiResponse(200, { assignments }, "Assignments fetched successfully"));
  } catch (error) {
    console.error("myAssignments error:", error);
    return res.status(500).json(ApiError(500, error.message));
  }
};

// ─── Settings CRUD (Step 1) ──────────────────────────────────────────────

export const getSettings = async (req, res) => {
  try {
    let settings = await AutomationSettings.findOne();
    if (!settings) {
      settings = await AutomationSettings.create({});
    }
    return res.status(200).json(new ApiResponse(200, settings, "Settings fetched successfully"));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await AutomationSettings.findOne();
    if (!settings) {
      settings = await AutomationSettings.create({});
    }
    Object.assign(settings, req.body);
    await settings.save();
    return res.status(200).json(new ApiResponse(200, settings, "Settings updated successfully"));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
};

// ─── Trigger Manual Run (Step 5) ──────────────────────────────────────────

export const manualTrigger = async (req, res) => {
  try {
    const result = await triggerManualRun(req.user._id);
    return res.status(200).json(new ApiResponse(200, result, "Automation job triggered successfully"));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
};

// ─── Logs & DLQ (Steps 2 & 3) ─────────────────────────────────────────────

export const getAutomationLogs = async (req, res) => {
  try {
    const logs = await AutomationLog.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(new ApiResponse(200, logs, "Automation logs fetched successfully"));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
};

export const getDLQ = async (req, res) => {
  try {
    const dlq = await FailedAutomationJob.find()
      .populate("studentId", "rollNo branch")
      .populate("userId", "name email_id")
      .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, dlq, "DLQ fetched successfully"));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
};

export const resolveDLQ = async (req, res) => {
  try {
    const { id } = req.body;
    const dlqItem = await FailedAutomationJob.findByIdAndUpdate(id, { resolved: true }, { new: true });
    return res.status(200).json(new ApiResponse(200, dlqItem, "DLQ item resolved successfully"));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
};

// ─── Review Queue (Step 7) ───────────────────────────────────────────────

export const getReviewQueue = async (req, res) => {
  try {
    const queue = await AdminReviewQueue.find({ status: "pending" })
      .populate("studentId", "rollNo branch")
      .populate("userId", "name email_id")
      .sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, queue, "Review queue fetched successfully"));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
};

export const resolveReviewQueue = async (req, res) => {
  try {
    const { id, action, rejectionReason } = req.body;
    const item = await AdminReviewQueue.findById(id);
    if (!item) {
      return res.status(404).json(ApiError(404, "Item not found in review queue"));
    }

    if (action === "approve") {
      item.status = "approved";
      item.reviewedBy = req.user._id;
      await item.save();

      // Create StudentAssignment
      const settings = await AutomationSettings.findOne() || {};
      const expiryDays = settings.DEFAULT_EXPIRY_DAYS || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);

      await StudentAssignment.create({
        studentId: item.studentId,
        userId: item.userId,
        assignmentType: item.assignmentType,
        difficulty: item.difficulty,
        priority: item.priority,
        status: "assigned", // Manually approved, now assigned
        reasoning: item.reasoning,
        agentSummary: item.agentSummary,
        readinessScore: item.readinessScore,
        weakSubjects: item.weakSubjects,
        estimatedDurationMinutes: item.estimatedDurationMinutes,
        prerequisiteMet: item.prerequisiteMet,
        expiresAt,
        assignedAt: new Date(),
      });
    } else {
      item.status = "rejected";
      item.reviewedBy = req.user._id;
      item.rejectionReason = rejectionReason || "";
      await item.save();
    }

    return res.status(200).json(new ApiResponse(200, item, `Item ${action}d successfully`));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
};

// ─── Lazy Start Assignment (Step 10) ─────────────────────────────────────

export const startAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.body;
    if (!assignmentId) {
      return res.status(400).json(ApiError(400, "assignmentId is required"));
    }

    const result = await lazyCreateInterview(assignmentId);
    return res.status(200).json(new ApiResponse(200, result, "Interview started successfully"));
  } catch (error) {
    console.error("startAssignment error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json(ApiError(statusCode, error.message));
  }
};

// ─── Automation Analytics & Dashboard Stats (Step 13 & 14) ──────────────────

export const getAutomationStats = async (req, res) => {
  try {
    const settings = await AutomationSettings.findOne() || {};
    const systemStatus = getSystemStatus();
    
    // Aggregation queries
    const totalAssignments = await StudentAssignment.countDocuments({ recommendedBy: "InterviewAssignmentAgent" });
    const completedAssignments = await StudentAssignment.countDocuments({ recommendedBy: "InterviewAssignmentAgent", status: "completed" });
    const pendingReview = await AdminReviewQueue.countDocuments({ status: "pending" });
    const dlqCount = await FailedAutomationJob.countDocuments({ resolved: false });

    const totalLogs = await AutomationLog.find().sort({ createdAt: -1 }).limit(10);
    const lastRunLog = totalLogs[0] || null;

    // Token estimation totals
    const logs = await AutomationLog.find({ status: "completed" });
    const totalTokens = logs.reduce((acc, log) => acc + (log.tokenUsageEstimate || 0), 0);
    const totalCost = logs.reduce((acc, log) => acc + (log.costEstimate || 0), 0);

    const data = {
      systemStatus,
      redisStatus: systemStatus === "HEALTHY" ? "CONNECTED" : "DISCONNECTED",
      queueStatus: systemStatus === "HEALTHY" ? "ACTIVE" : "INACTIVE",
      totalAssignments,
      completedAssignments,
      pendingReview,
      dlqCount,
      totalTokens,
      totalCost,
      lastRun: lastRunLog ? lastRunLog.completedAt || lastRunLog.startedAt : null,
      nextRun: lastRunLog && systemStatus === "HEALTHY" 
        ? new Date(new Date(lastRunLog.completedAt || lastRunLog.startedAt).getTime() + 24 * 60 * 60 * 1000) 
        : null,
      automationEnabled: settings.AUTO_ASSIGNMENTS_ENABLED || false,
    };

    return res.status(200).json(new ApiResponse(200, data, "Stats fetched successfully"));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
};

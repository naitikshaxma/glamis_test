import mongoose from "mongoose";

/**
 * StudentAssignment — persists AI-generated interview recommendations
 * and tracks their lifecycle from recommendation → assignment → completion.
 *
 * Node.js is the single source of truth for all stored assignments.
 * FastAPI is called only for the initial recommendation; it stores nothing.
 */

const studentAssignmentSchema = new mongoose.Schema(
  {
    // Reference to Student document
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    // Reference to User document (for quick email/name lookup)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Interview type as returned by the Assignment Agent
    assignmentType: {
      type: String,
      required: true,
      enum: [
        "DSA Interview",
        "DBMS Interview",
        "OS Interview",
        "CN Interview",
        "Verbal Interview",
        "HR Interview",
        "Placement Drive",
        "Written Test",
        "Company Mock",
      ],
    },
    // Difficulty level derived from priority / agent output
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    // Priority as returned by the Assignment Agent
    priority: {
      type: String,
      required: true,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
    },
    // Lifecycle status
    status: {
      type: String,
      required: true,
      enum: [
        "recommended", // AI generated but admin hasn't acted yet
        "assigned",    // Admin approved and interview was auto-created
        "in_progress", // Student started the interview
        "completed",   // Student finished the interview
        "expired",     // Deadline passed without completion
        "cancelled",   // Admin rejected the recommendation
      ],
      default: "recommended",
    },
    // Source of the recommendation
    recommendedBy: {
      type: String,
      default: "InterviewAssignmentAgent",
    },
    // Natural-language rationale from the Assignment Agent
    reasoning: {
      type: String,
      default: "",
    },
    // Full agent summary stored for admin review
    agentSummary: {
      type: String,
      default: "",
    },
    // Snapshot of the readiness score at time of recommendation
    readinessScore: {
      type: Number,
      default: 0,
    },
    // Snapshot of weak subjects at time of recommendation
    weakSubjects: {
      type: [String],
      default: [],
    },
    // Estimated duration in minutes from agent output
    estimatedDurationMinutes: {
      type: Number,
      default: 45,
    },
    // Whether the student met prerequisites at the time of recommendation
    prerequisiteMet: {
      type: Boolean,
      default: true,
    },
    // Admin who approved/rejected this assignment
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Rejection reason (if cancelled)
    rejectionReason: {
      type: String,
      default: "",
    },
    // Linked Interview document (auto-created on approval)
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
    },
    // Linked AdminInterview document (auto-created on approval)
    adminInterviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminInterview",
    },
    // Timestamps for key lifecycle events
    assignedAt: { type: Date },
    completedAt: { type: Date },
    expiresAt: { type: Date },

    // JD match score if provided at generation time
    jdMatchScore: { type: Number },
    targetCompany: { type: String },

    // Placement eligibility flag from agent
    placementEligible: { type: Boolean, default: false },
    confidence: { type: Number, default: 0.90 },
  },
  { timestamps: true }
);

// Compound index for efficient per-student queries
studentAssignmentSchema.index({ studentId: 1, status: 1 });
studentAssignmentSchema.index({ userId: 1, status: 1 });
studentAssignmentSchema.index({ status: 1, priority: 1 });

export const StudentAssignment = mongoose.model(
  "StudentAssignment",
  studentAssignmentSchema
);

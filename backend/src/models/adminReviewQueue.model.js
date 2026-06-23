import mongoose from "mongoose";

const adminReviewQueueSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignmentType: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
    },
    confidence: {
      type: Number,
      required: true,
      index: true,
    },
    reasoning: {
      type: String,
      default: "",
    },
    agentSummary: {
      type: String,
      default: "",
    },
    readinessScore: {
      type: Number,
      default: 0,
    },
    weakSubjects: {
      type: [String],
      default: [],
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 45,
    },
    prerequisiteMet: {
      type: Boolean,
      default: true,
    },
    targetCompany: {
      type: String,
      default: "",
    },
    jdMatchScore: {
      type: Number,
    },
    placementEligible: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const AdminReviewQueue = mongoose.model(
  "AdminReviewQueue",
  adminReviewQueueSchema
);

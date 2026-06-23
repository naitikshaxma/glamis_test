import mongoose from "mongoose";

const automationLogSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      required: true,
      index: true,
    },
    processed: {
      type: Number,
      default: 0,
    },
    eligible: {
      type: Number,
      default: 0,
    },
    assigned: {
      type: Number,
      default: 0,
    },
    skipped: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    llmAssignments: {
      type: Number,
      default: 0,
    },
    ruleAssignments: {
      type: Number,
      default: 0,
    },
    tokenUsageEstimate: {
      type: Number,
      default: 0,
    },
    costEstimate: {
      type: Number,
      default: 0, // In USD
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
    },
    error: {
      type: String,
      default: "",
    },
    details: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { timestamps: true }
);

export const AutomationLog = mongoose.model("AutomationLog", automationLogSchema);

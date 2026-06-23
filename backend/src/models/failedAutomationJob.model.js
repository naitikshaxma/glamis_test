import mongoose from "mongoose";

const failedAutomationJobSchema = new mongoose.Schema(
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
    jobName: {
      type: String,
      required: true,
    },
    failureReason: {
      type: String,
      required: true,
    },
    stackTrace: {
      type: String,
      default: "",
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

export const FailedAutomationJob = mongoose.model(
  "FailedAutomationJob",
  failedAutomationJobSchema
);

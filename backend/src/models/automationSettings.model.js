import mongoose from "mongoose";

const automationSettingsSchema = new mongoose.Schema(
  {
    AUTO_ASSIGNMENTS_ENABLED: {
      type: Boolean,
      default: false,
    },
    AUTO_ASSIGNMENT_THRESHOLD: {
      type: Number,
      default: 70, // readiness threshold score
    },
    AUTO_ASSIGNMENT_BATCH_SIZE: {
      type: Number,
      default: 50,
    },
    AUTO_ASSIGNMENT_FREQUENCY: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },
    AUTO_ASSIGNMENT_COOLDOWN_DAYS: {
      type: Number,
      default: 7,
    },
    DEFAULT_EXPIRY_DAYS: {
      type: Number,
      default: 7,
    },
    MAX_ASSIGNMENTS_PER_RUN: {
      type: Number,
      default: 1000,
    },
    MAX_LLM_ASSIGNMENTS_PER_RUN: {
      type: Number,
      default: 250,
    },
    AUTO_NOTIFICATION_ENABLED: {
      type: Boolean,
      default: true,
    },
    AUTO_REASSESSMENT_ENABLED: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Ensures only a single settings document is stored/retrieved
export const AutomationSettings = mongoose.model(
  "AutomationSettings",
  automationSettingsSchema
);

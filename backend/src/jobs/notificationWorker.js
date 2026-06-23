import { Worker } from "bullmq";
import { getIORedisConnection } from "../db/redis.connect.js";
import { User } from "../models/users.models.js";
import sendMail from "../utils/sendMail.js";
import InterviewInvitationTemplate from "../utils/emailTemplates/interviewInvitation.js";

let worker;

export function initNotificationWorker() {
  const connection = getIORedisConnection();
  if (connection && connection.status !== "end") {
    try {
      worker = new Worker(
        "notification-jobs",
        async (job) => {
          const { userId, title, message, type, link } = job.data;
          console.log(`[Notification Worker] Processing job ${job.id} for user ${userId}`);

          const user = await User.findById(userId);
          if (!user || !user.email_id) {
            throw new Error(`User ${userId} not found or has no email address`);
          }

          await sendMail(
            user.email_id,
            title,
            InterviewInvitationTemplate(
              title,
              type === "assignment" ? "Interview" : "System Update",
              link || "https://glamis.in/dashboard",
              "As scheduled by the AI Agent"
            )
          );
        },
        { connection }
      );
      worker.on("failed", (job, err) => {
        console.error(`[Notification Worker] Job ${job.id} failed:`, err);
      });
      // Prevent unhandled 'error' event from crashing the process
      worker.on("error", (err) => {
        console.error("[BullMQ NotificationWorker] error (non-fatal):", err.message);
      });
      console.log("BullMQ Notification Worker initialized.");
    } catch (err) {
      console.error("Failed to initialize BullMQ notification worker:", err.message);
    }
  }
}

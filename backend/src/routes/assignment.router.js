import { Router } from "express";
import isAuthenticated, { isAdmin } from "../middlewares/auth.middleware.js";
import {
  generateRecommendations,
  bulkGenerate,
  approve,
  reject,
  listAssignments,
  listByStudent,
  analytics,
  myAssignments,
  getSettings,
  updateSettings,
  manualTrigger,
  getAutomationLogs,
  getDLQ,
  resolveDLQ,
  getReviewQueue,
  resolveReviewQueue,
  startAssignment,
  getAutomationStats,
} from "../controllers/assignment.controller.js";

const router = Router();

// ── Admin routes (authentication + admin role required) ───────────────────
router.post("/admin/assignments/generate", isAuthenticated, isAdmin, generateRecommendations);
router.post("/admin/assignments/bulk-generate", isAuthenticated, isAdmin, bulkGenerate);
router.post("/admin/assignments/approve",  isAuthenticated, isAdmin, approve);
router.post("/admin/assignments/reject",   isAuthenticated, isAdmin, reject);
router.get("/admin/assignments",           isAuthenticated, isAdmin, listAssignments);
router.get("/admin/assignments/analytics", isAuthenticated, isAdmin, analytics);

// Automation stats & configurations
router.get("/admin/assignments/settings",     isAuthenticated, isAdmin, getSettings);
router.post("/admin/assignments/settings",    isAuthenticated, isAdmin, updateSettings);
router.post("/admin/assignments/trigger",     isAuthenticated, isAdmin, manualTrigger);
router.get("/admin/assignments/logs",        isAuthenticated, isAdmin, getAutomationLogs);
router.get("/admin/assignments/dlq",         isAuthenticated, isAdmin, getDLQ);
router.post("/admin/assignments/dlq/resolve", isAuthenticated, isAdmin, resolveDLQ);
router.get("/admin/assignments/review-queue", isAuthenticated, isAdmin, getReviewQueue);
router.post("/admin/assignments/review-queue/resolve", isAuthenticated, isAdmin, resolveReviewQueue);
router.get("/admin/assignments/stats",        isAuthenticated, isAdmin, getAutomationStats);

router.get("/admin/assignments/:studentId",isAuthenticated, isAdmin, listByStudent);

// ── Student routes (authentication only) ───────────────────────────────────
router.get("/assignments/my", isAuthenticated, myAssignments);
router.post("/assignments/start", isAuthenticated, startAssignment);

export default router;

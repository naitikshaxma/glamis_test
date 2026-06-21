import { Router } from "express";
import {
  getConfig,
  getSpeechToken,
  getIceToken,
  interviewStart,
  interviewAnswer,
  interviewReport,
} from "../controllers/avatar.controller.js";

// Real-time avatar interview: Azure token minting + FastAPI agent proxy.
// Public (like the old standalone avatar app) — these mint short-lived Azure
// tokens / proxy the agent and don't need the GLAMIS user. Namespaced under
// /avatar so they never collide with the text-interview routes (/interview/*).
const router = Router();

router.get("/config", getConfig);
router.get("/speech-token", getSpeechToken);
router.get("/ice-token", getIceToken);
router.post("/interview/start", interviewStart);
router.post("/interview/answer", interviewAnswer);
router.get("/interview/report/:id", interviewReport);

export default router;

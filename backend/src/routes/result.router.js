import { Router } from "express";
import getResult from "../controllers/result.controller.js";
const router = Router();
import isAuthenticated from "../middlewares/auth.middleware.js";
import { RateLimiter15mins } from "../utils/RateLimiter.js";

router.route("/interviewresult").post(RateLimiter15mins, isAuthenticated, getResult);

export default router;
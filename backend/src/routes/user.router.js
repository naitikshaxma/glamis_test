import { Router } from "express";
import { login, logout, refreshAccessToken, signup, verifyEmail, resendOTP, addStudent } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { RateLimiter15mins } from "../utils/RateLimiter.js";

const router = Router()

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/verify-email").post(verifyEmail)
router.route("/resend-otp").post(RateLimiter15mins, resendOTP)
router.route("/add-student").post(addStudent)

// Authenticated Routes:

router.route("/logout").post(isAuthenticated, logout)

export default router;
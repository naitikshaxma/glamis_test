import { Router } from "express";
import { login, logout, refreshAccessToken, signup, verifyEmail, resendOTP, addStudent, verifyUser } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { RateLimiter15mins } from "../utils/RateLimiter.js";

const router = Router()



router.route("/signup").post(RateLimiter15mins,signup)
router.route("/login").post(RateLimiter15mins,login)
router.route("/verifyToken").post(verifyUser)
router.route("/verify-email").post(RateLimiter15mins,verifyEmail)
router.route("/resend-otp").post(RateLimiter15mins, resendOTP)
router.route("/add-student").post(RateLimiter15mins,addStudent)

// Authenticated Routes:

router.route("/logout").post(isAuthenticated, logout)

export default router;
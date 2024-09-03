import { Router } from "express";
import { login, logout, refreshAccessToken, signup, verifyEmail, resendOTP, addStudent, verifyUser, updateStudent } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { RateLimiter15mins } from "../utils/RateLimiter.js";

const router = Router()



router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/verifyToken").post(verifyUser)
router.route("/verify-email").post(verifyEmail)
router.route("/resend-otp").post( resendOTP)
router.route("/add-student").post( addStudent)
router.route("/update-student").post( updateStudent)

// Authenticated Routes:

router.route("/logout").post(isAuthenticated, logout)

export default router;
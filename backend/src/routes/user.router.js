const { Router } = require("express")
const { login, logout, refreshAccessToken, signup, verifyEmail, resendOTP } = require("../controllers/user.controller.js");
const { isAuthenticated }  = require("../middlewares/auth.middleware.js")
const { RateLimiter15mins } = require("../utils/RateLimiter.js")

const router = Router()

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/verify-email").post(verifyEmail)
router.route("/resend-otp").post(RateLimiter15mins, resendOTP)

// Authenticated Routes:

router.route("/logout").post(isAuthenticated, logout)

module.exports = router;
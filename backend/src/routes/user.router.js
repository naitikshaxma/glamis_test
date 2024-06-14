const { Router } = require("express")
const { login, logout, refreshAccessToken, signup, verifyEmail } = require("../controllers/user.controller.js");
const { isAuthenticated }  = require("../middlewares/auth.middleware.js")

const router = Router()

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/verify-email").post(verifyEmail)

// Authenticated Routes:

router.route("/logout").post(isAuthenticated, logout)

module.exports = router;
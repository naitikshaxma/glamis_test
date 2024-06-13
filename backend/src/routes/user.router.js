const { Router } = require("express")
const { login, logout, refreshAccessToken, signup } = require("../controllers/user.controller.js");
const { isAuthenticated }  = require("../middlewares/auth.middleware.js")

const router = Router()

router.route("/signup").post(signup)
router.route("/login").post(login)

// Authenticated Routes:

router.route("/logout").post(isAuthenticated, logout)

module.exports = {router}
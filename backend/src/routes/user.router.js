import { Router } from "express";
import { login, logout, refreshAccessToken, signup, verifyEmail, resendOTP, addStudent, verifyUser, updateStudent,forgotPassword, resetPassword, getUserDataForProfile, updateStudentData, updatePersonalData,feedback, savePhoto } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { RateLimiter15mins } from "../utils/RateLimiter.js";

const router = Router()

import multer from 'multer'

import fs from "fs";

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        const dir = file.fieldname === "resume" ? "public/resumes" : "public/user-photos";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename:(req,file,cb)=>{
        const ext = file.originalname.split('.').pop();
        cb(null,`${req.user._id}_${Date.now()}.${ext}`);
    }
})

const upload = multer({storage});


router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/verifyToken").post(verifyUser)
router.route("/verify-email").post(verifyEmail)
router.route("/resend-otp").post( resendOTP)
router.route("/add-student").post( addStudent)
router.route("/update-student").post( updateStudent)
router.route("/forgot-password").post( forgotPassword)
router.route("/reset-password").post(resetPassword)
router.route("/get-user-data-profile").post(getUserDataForProfile)
router.route("/update-student-data-profile").post(updateStudentData) 
router.route("/update-student-personal-data-profile").post(isAuthenticated, upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "resume", maxCount: 1 }
]), updatePersonalData)
router.route("/feedback").post(feedback)
router.route("/save-photo").post(isAuthenticated,upload.single("image"),savePhoto)

// Authenticated Routes:

router.route("/logout").post(isAuthenticated, logout)

export default router;
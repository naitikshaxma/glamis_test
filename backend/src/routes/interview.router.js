import { Router } from "express";
import {
    generateQuestion, evaluateAnswer, createInterview, saveResultToDb,
    createInterviewByJD,
    generateQuestionForJD,
    getInterviewHeld,
    getPartialDetailsByInterviewId,
    fetchAllInterviews,
    createInterviewByJDAdmin,
    generateQuestionForJDAdmin,
    generateQuestionForWritten,
    evaluateAnswerWritten,
    generateQuestionForSubjectAdmin,
    createInterviewByWrittenAdmin,
    createInterviewByVerbalAdmin,
    generateQuestionForVerbalAdmin,
    generateQuestionForWrittenAdmin,
    generateQuestionforSvarAdmin,
    createInterviewBySvarAdmin,
    evaluateAnswerSvar,
    fetchInterviewForSvar,
    interviewQuestionCount, tabSwitch, continueInterview,
    parsePdf,
    parseSavedResume,
    generateQuestionForResume,
} from '../controllers/interview.controller.js';
import { extractAnswerAudio, handleAudioUpload } from "../middlewares/interview.middleware.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import multer from 'multer';
import fs from 'fs';

const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "public/temp_resumes";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `temp_${req.user ? req.user._id : 'anon'}_${Date.now()}.${ext}`);
    }
});

const uploadResume = multer({ storage: resumeStorage });
// import { RateLimiter1min } from "../utils/RateLimiter.js";

const router = Router()

router.route('/generateQuestion').post( isAuthenticated, generateQuestion);
router.route('/generateQuestionForJD').post( isAuthenticated, generateQuestionForJD);
router.route('/generateQuestionForWritten').post( isAuthenticated, generateQuestionForWritten);
router.route('/evaluateQuestion').post( isAuthenticated, extractAnswerAudio, handleAudioUpload, evaluateAnswer); // removed isAuthenticated middleware for testing purposes
router.route('/evaluateQuestionWritten').post( isAuthenticated, evaluateAnswerWritten);
router.route('/evaluateQuestionSvar').post( isAuthenticated, evaluateAnswerSvar);
router.route('/evaluateQuestion/sendText').post( isAuthenticated, evaluateAnswer);
router.route('/createInterview').post( isAuthenticated, createInterview);
router.route('/createInterviewByJD').post( isAuthenticated, createInterviewByJD);
router.route("/saveResultToDb").post( isAuthenticated, saveResultToDb);
router.route("/getInterviewsHeld").get(isAuthenticated, getInterviewHeld);
router.route("/getPartialDetailsByInterviewId").post(isAuthenticated, getPartialDetailsByInterviewId);
router.route("/fetch").post(isAuthenticated, fetchAllInterviews);
router.route("/fetchInterviewForSvar").post(isAuthenticated, fetchInterviewForSvar);
router.route("/createInterviewByJDAdmin").post(isAuthenticated, createInterviewByJDAdmin);
router.route("/generateQuestionForJDAdmin").post(isAuthenticated, generateQuestionForJDAdmin);
router.route("/generateQuestionForSubjectAdmin").post(isAuthenticated, generateQuestionForSubjectAdmin);
router.route("/generateQuestionForWrittenAdmin").post(isAuthenticated, generateQuestionForWrittenAdmin);
router.route("/createInterviewByWrittenAdmin").post(isAuthenticated, createInterviewByWrittenAdmin);
router.route("/createInterviewByVerbalAdmin").post(isAuthenticated, createInterviewByVerbalAdmin);
router.route("/generateQuestionForVerbalAdmin").post(isAuthenticated, generateQuestionForVerbalAdmin);
router.route("/generateQuestionForSvarAdmin").post(isAuthenticated, generateQuestionforSvarAdmin);
router.route("/createInterviewBySvarAdmin").post(isAuthenticated, createInterviewBySvarAdmin)
router.route("/interviewQuestion/count").post(isAuthenticated, interviewQuestionCount);
router.route("/proc").post(isAuthenticated, tabSwitch);
router.route("/proc/continue").post(isAuthenticated, continueInterview);

router.route("/parse-pdf").post(isAuthenticated, uploadResume.single("resume"), parsePdf);
router.route("/parse-saved-resume").post(isAuthenticated, parseSavedResume);
router.route("/generateQuestionForResume").post(isAuthenticated, generateQuestionForResume);

export default router;


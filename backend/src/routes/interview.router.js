import { Router } from "express";
import {
    generateQuestion, evaluateAnswer, createInterview, saveResultToDb,
    createInterviewByJD,
    generateQuestionForJD,
    getInterviewHeld,
    getPartialDetailsByInterviewId,
    fetchAllInterviews,
    createInterviewByJDAdmin,
    generateQuestionForJDAdmin
} from '../controllers/interview.controller.js';
import { extractAnswerAudio, handleAudioUpload } from "../middlewares/interview.middleware.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { RateLimiter1min } from "../utils/RateLimiter.js";

const router = Router()

router.route('/generateQuestion').post(RateLimiter1min, isAuthenticated, generateQuestion);
router.route('/generateQuestionForJD').post(RateLimiter1min, isAuthenticated, generateQuestionForJD);
router.route('/evaluateQuestion').post(RateLimiter1min, isAuthenticated, extractAnswerAudio, handleAudioUpload, evaluateAnswer); // removed isAuthenticated middleware for testing purposes
router.route('/createInterview').post(RateLimiter1min, isAuthenticated, createInterview);
router.route('/createInterviewByJD').post(RateLimiter1min, isAuthenticated, createInterviewByJD);
router.route("/saveResultToDb").post(RateLimiter1min, isAuthenticated, saveResultToDb);
router.route("/getInterviewsHeld").get(isAuthenticated, getInterviewHeld);
router.route("/getPartialDetailsByInterviewId").post(isAuthenticated, getPartialDetailsByInterviewId);
router.route("/fetch").post(isAuthenticated, fetchAllInterviews)
router.route("/createInterviewByJDAdmin").post(createInterviewByJDAdmin)
router.route("/generateQuestionForJDAdmin").post(isAuthenticated, generateQuestionForJDAdmin)

export default router;


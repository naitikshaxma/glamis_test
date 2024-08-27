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
    createInterviewByWritten
} from '../controllers/interview.controller.js';
import { extractAnswerAudio, handleAudioUpload } from "../middlewares/interview.middleware.js";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { RateLimiter1min } from "../utils/RateLimiter.js";

const router = Router()

router.route('/generateQuestion').post(RateLimiter1min, isAuthenticated, generateQuestion);
router.route('/generateQuestionForJD').post(RateLimiter1min, isAuthenticated, generateQuestionForJD);
router.route('/generateQuestionForWritten').post(RateLimiter1min, isAuthenticated, generateQuestionForWritten);
router.route('/evaluateQuestion').post(RateLimiter1min, isAuthenticated, extractAnswerAudio, handleAudioUpload, evaluateAnswer); // removed isAuthenticated middleware for testing purposes
router.route('/evaluateQuestionWritten').post(RateLimiter1min, isAuthenticated, evaluateAnswerWritten);
router.route('/evaluateQuestion/sendText').post(RateLimiter1min, isAuthenticated, evaluateAnswer);
router.route('/createInterview').post(RateLimiter1min, isAuthenticated, createInterview);
router.route('/createInterviewByJD').post(RateLimiter1min, isAuthenticated, createInterviewByJD);
router.route("/saveResultToDb").post(RateLimiter1min, isAuthenticated, saveResultToDb);
router.route("/getInterviewsHeld").get(isAuthenticated, getInterviewHeld);
router.route("/getPartialDetailsByInterviewId").post(isAuthenticated, getPartialDetailsByInterviewId);
router.route("/fetch").post(isAuthenticated, fetchAllInterviews);
router.route("/createInterviewByJDAdmin").post(createInterviewByJDAdmin);
router.route("/generateQuestionForJDAdmin").post(isAuthenticated, generateQuestionForJDAdmin);
router.route("/generateQuestionForSubjectAdmin").post(isAuthenticated, generateQuestionForSubjectAdmin);
router.route("/createInterviewByWrittenAdmin").post(isAuthenticated, createInterviewByWritten);

export default router;


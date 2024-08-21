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

const interviewRouter = Router()

interviewRouter.route('/generateQuestion').post(RateLimiter1min, isAuthenticated, generateQuestion);
interviewRouter.route('/generateQuestionForJD').post(RateLimiter1min, isAuthenticated, generateQuestionForJD);
interviewRouter.route('/evaluateQuestion').post(RateLimiter1min, isAuthenticated, extractAnswerAudio, handleAudioUpload, evaluateAnswer); // removed isAuthenticated middleware for testing purposes
interviewRouter.route('/createInterview').post(RateLimiter1min, isAuthenticated, createInterview);
interviewRouter.route('/createInterviewByJD').post(RateLimiter1min, isAuthenticated, createInterviewByJD);
interviewRouter.route("/saveResultToDb").post(RateLimiter1min, isAuthenticated, saveResultToDb);
interviewRouter.route("/getInterviewsHeld").get(isAuthenticated, getInterviewHeld);
interviewRouter.route("/getPartialDetailsByInterviewId").post(isAuthenticated, getPartialDetailsByInterviewId);
interviewRouter.route("/fetch").post(isAuthenticated, fetchAllInterviews)
interviewRouter.route("/createInterviewByJDAdmin").post(isAuthenticated, createInterviewByJDAdmin)
interviewRouter.route("/generateQuestionForJDAdmin").post(isAuthenticated, generateQuestionForJDAdmin)

export default interviewRouter;


import { Router } from "express";
import {
    generateQuestion, evaluateAnswer
} from '../controllers/interview.controller.js';
import { extractAnswerAudio, handleAudioUpload } from "../middlewares/interview.middleware.js";
// import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = Router()

// router.route('/generateQuestion').post(isAuthenticated, generateQuestion);
router.route('/generateQuestion').post(generateQuestion); // removed isAuthenticated middleware for testing purposes
// router.route('/evaluateQuestion').post(isAuthenticated, evaluateQuestion);
router.route('/evaluateQuestion').post(extractAnswerAudio, handleAudioUpload, evaluateAnswer); // removed isAuthenticated middleware for testing purposes

export default router;


import router from 'express';
import interviewController from '../controllers/interview.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

router.post('/start', isAuthenticated, interviewController.startInterview);
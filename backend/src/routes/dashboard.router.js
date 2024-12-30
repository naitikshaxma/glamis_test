import { Router } from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import {svarDashboard, writtenDashboard} from "../controllers/dashboard.controller.js";


const router = Router()

router.get("/svar", isAuthenticated, svarDashboard);
router.get("/written", isAuthenticated, writtenDashboard);


export default router;


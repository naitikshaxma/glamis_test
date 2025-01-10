import {Router} from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import {
  companyDashboard,
  subjectDashboard,
  svarDashboard,
  writtenDashboard,
  verbalDashboard
} from "../controllers/dashboard.controller.js";


const router = Router()

router.get("/svar", isAuthenticated, svarDashboard);
router.get("/written", isAuthenticated, writtenDashboard);
router.get("/company", isAuthenticated, companyDashboard);
router.get("/subject", isAuthenticated, subjectDashboard);
router.get("/verbal", isAuthenticated, verbalDashboard);

export default router;


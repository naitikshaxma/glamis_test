import {Router} from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import {
  companyDashboard,
  subjectDashboard,
  svarDashboard,
  writtenDashboard,
  verbalDashboard,
  home,
  homeStats
} from "../controllers/dashboard.controller.js";


const router = Router()

router.get("/svar", isAuthenticated, svarDashboard);
router.get("/written", isAuthenticated, writtenDashboard);
router.get("/company", isAuthenticated, companyDashboard);
router.get("/subject", isAuthenticated, subjectDashboard);
router.get("/verbal", isAuthenticated, verbalDashboard);
router.get('/', isAuthenticated, home);
router.get('/stats', isAuthenticated, homeStats);

export default router;


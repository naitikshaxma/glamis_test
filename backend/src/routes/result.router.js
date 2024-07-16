import { Router } from "express";
import getResult from "../controllers/result.controller.js";
const router = Router();

router.route("/interviewresult").post(getResult);

export default router;
import { Router } from "express";
import { createCompanyInterview, createSubjectInterview, fetchAdminInterviewbyinterviewId } from "../controllers/admin.controller.js";

const router = Router();

router.post("/interview/company/create", createCompanyInterview);
router.post("/interview/subject/create", createSubjectInterview);
router.post("/interview/fetch", fetchAdminInterviewbyinterviewId);

export default router;
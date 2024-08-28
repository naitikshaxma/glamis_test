import { Router } from "express";
import { createCompanyInterview, createSubjectInterview,createVerbalInterview, fetchAdminInterviewbyinterviewId, createWrittenInterview } from "../controllers/admin.controller.js";

const router = Router();

router.post("/interview/company/create", createCompanyInterview);
router.post("/interview/subject/create", createSubjectInterview);
router.post("/interview/written/create", createWrittenInterview);
router.post("/interview/fetch", fetchAdminInterviewbyinterviewId);
router.post("/interview/verbal/create", createVerbalInterview);

export default router;
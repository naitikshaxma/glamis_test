import {Router} from "express";
import {
  createCompanyInterview,
  createSubjectInterview,
  createVerbalInterview,
  fetchAdminInterviewbyinterviewId,
  createWrittenInterview,
  fetchInterviewStatusCount,
  fetchInterviewDetails,
  downloadAttendance,
  createSvarInterview,
  fetchInterviewByID
} from "../controllers/admin.controller.js";


const router = Router();

router.post("/interview/company/create", createCompanyInterview);
router.post("/interview/subject/create", createSubjectInterview);
router.post("/interview/written/create", createWrittenInterview);
router.post("/interview/svar/create", createSvarInterview);
router.post("/interview/verbal/create", createVerbalInterview);
router.post("/interview/fetch", fetchAdminInterviewbyinterviewId);
router.post("/interview/fetchInterviewStatusCount", fetchInterviewStatusCount);
router.post("/interview/fetchInterviewDetails", fetchInterviewDetails);
router.get("/interview/downloadAttendance", downloadAttendance);
router.post("/interview/fetchSvarInterviewById", fetchInterviewByID)

export default router;

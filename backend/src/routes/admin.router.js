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
import updateFeedback from "../middlewares/updateFeedback.js";


const router = Router();

router.post("/interview/company/create",updateFeedback, createCompanyInterview);
router.post("/interview/subject/create",updateFeedback, createSubjectInterview);
router.post("/interview/written/create",updateFeedback, createWrittenInterview);
router.post("/interview/svar/create", updateFeedback, createSvarInterview);
router.post("/interview/verbal/create",updateFeedback, createVerbalInterview);
router.post("/interview/fetch", fetchAdminInterviewbyinterviewId);
router.post("/interview/fetchInterviewStatusCount", fetchInterviewStatusCount);
router.post("/interview/fetchInterviewDetails", fetchInterviewDetails);
router.get("/interview/downloadAttendance", downloadAttendance);
router.post("/interview/fetchSvarInterviewById", fetchInterviewByID)

export default router;

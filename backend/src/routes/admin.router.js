import { Router } from "express";
import { createCompanyInterview } from "../controllers/admin.controller.js";

const router = Router();

router.post("/interview/company/create", createCompanyInterview);

export default router;
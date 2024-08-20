import { Router } from "express";
import { createCompanyInterview } from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter.post("/interview/company/create", createCompanyInterview);

export default adminRouter;
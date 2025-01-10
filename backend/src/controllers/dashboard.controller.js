import {Student} from '../models/users.models.js';
import {CompanyPipeline, SubjectPipeline, SvarPipeline, WrittenPipeline} from "../pipelines/dashboard.pipelines.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const svarDashboard = async (req, res) => {
  const user = req.user;
  const data = await Student.aggregate(SvarPipeline(user));
  res.json(data);
}

export const writtenDashboard = async (req, res) => {
  const user = req.user;
  const data = await Student.aggregate(WrittenPipeline(user));
  res.json(data);
}

export const companyDashboard = asyncHandler(async (req,res)=>{
  const user = req.user;
  const result = await Student.aggregate(CompanyPipeline(user))
  return res.status(200).json(new ApiResponse(200, result, "Company Interview fetched successfully"));
})

export const subjectDashboard = asyncHandler(async (req,res)=>{
  const user = req.user;
  const result = await Student.aggregate(SubjectPipeline(user));
  return res.status(200).json(new ApiResponse(200, result, "Subject Interview fetched successfully"));
})
import {Student} from '../models/users.models.js';
import {
  CompanyPipeline,
  SubjectPipeline,
  SvarPipeline,
  WrittenPipeline,
  VerbalPipeline
} from "../pipelines/dashboard.pipelines.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// --------------- DASHBOARDS Start -----------------
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

export const verbalDashboard = async (req, res) => {
  const user = req.user;
  const data = await Student.aggregate(VerbalPipeline(user));
  res.json(data);
}

export const companyDashboard = asyncHandler(async (req,res)=>{
  const user = req.user;
  const result = await Student.aggregate(CompanyPipeline(user))
  return res.json(result);
})

export const subjectDashboard = asyncHandler(async (req,res)=>{
  const user = req.user;
  const result = await Student.aggregate(SubjectPipeline(user));
  return res.status(200).json(new ApiResponse(200, result, "Subject Interview fetched successfully"));
})

// --------------- DASHBOARDS End -----------------

export const home = async (req, res) => {
  const user = req.user;

  const stage = [{
      $group: {
        _id: null,
        OverallPerformance: {$avg: "$OverallPerformance"}
      }
    }]

  const data = {
    Svar: (await Student.aggregate(SvarPipeline(user).concat(stage)))[0]?.OverallPerformance,
    Written: (await Student.aggregate(WrittenPipeline(user).concat(stage)))[0]?.OverallPerformance,
    Verbal: (await Student.aggregate(VerbalPipeline(user).concat(stage)))[0]?.OverallPerformance,
    Company: (await Student.aggregate(CompanyPipeline(user).concat(stage)))[0]?.OverallPerformance,
    Subject: (await Student.aggregate(SubjectPipeline(user).concat(stage)))[0]?.OverallPerformance,
  }
  res.json(data);
}

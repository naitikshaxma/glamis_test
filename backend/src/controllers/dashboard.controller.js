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
export const svarDashboard = asyncHandler(async (req, res) => {
  const user = req.user;
  const data = await Student.aggregate(SvarPipeline(user));
  res.json(data);
})

export const writtenDashboard = asyncHandler(async (req, res) => {
  const user = req.user;
  const data = await Student.aggregate(WrittenPipeline(user));
  res.json(data);
})

export const verbalDashboard = asyncHandler(async (req, res) => {
  const user = req.user;
  const data = await Student.aggregate(VerbalPipeline(user));
  res.json(data);
})

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

export const home = asyncHandler(async (req, res) => {
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
})

export const homeStats = asyncHandler(async (req, res) => {
  const user = req.user;

  // Get completed and in-progress interview counts
  const statsResult = await Student.aggregate([
    { $match: { user: user._id } },
    {
      $lookup: {
        from: "interviews",
        localField: "interview_taken",
        foreignField: "_id",
        as: "interviews"
      }
    },
    { $unwind: { path: "$interviews", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: null,
        completed: {
          $sum: { $cond: [{ $eq: ["$interviews.is_active", false] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ["$interviews.is_active", true] }, 1, 0] }
        }
      }
    }
  ]);

  const completed = statsResult[0]?.completed || 0;
  const inProgress = statsResult[0]?.inProgress || 0;

  // Get activity for current week (interviews completed per day of week)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const activityResult = await Student.aggregate([
    { $match: { user: user._id } },
    {
      $lookup: {
        from: "interviews",
        localField: "interview_taken",
        foreignField: "_id",
        as: "interviews"
      }
    },
    { $unwind: { path: "$interviews", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        "interviews.is_active": false,
        "interviews.createdAt": { $gte: startOfWeek, $lt: endOfWeek }
      }
    },
    {
      $group: {
        _id: { $dayOfWeek: "$interviews.createdAt" }, // 1=Sun, 2=Mon, ..., 7=Sat
        count: { $sum: 1 }
      }
    }
  ]);

  // Map to Mon-Sun format (dayOfWeek: 1=Sun -> index 6, 2=Mon -> index 0, etc.)
  const dayNames = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
  const activity = dayNames.map((day, i) => {
    const mongoDay = i === 6 ? 1 : i + 2; // Convert index to MongoDB dayOfWeek
    const found = activityResult.find(a => a._id === mongoDay);
    return { day, count: found?.count || 0 };
  });

  res.json({
    completed,
    inProgress,
    activity
  });
})


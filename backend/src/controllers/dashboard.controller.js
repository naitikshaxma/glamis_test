import {Student} from '../models/users.models.js';
import {SvarPipeline, WrittenPipeline} from "../pipelines/dashboard.pipelines.js";

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

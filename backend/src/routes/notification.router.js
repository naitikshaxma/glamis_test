import { Router } from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { Notification } from "../models/notification.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

// Fetch notifications for the logged in user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res
      .status(200)
      .json(new ApiResponse(200, { notifications }, "Notifications fetched successfully"));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
});

// Mark notification as read
router.post("/:id/read", isAuthenticated, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json(ApiError(404, "Notification not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { notification }, "Notification marked as read"));
  } catch (error) {
    return res.status(500).json(ApiError(500, error.message));
  }
});

export default router;

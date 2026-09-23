import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
export const listNotifications = asyncHandler(async (req, res) =>
  res.json({
    items: await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
  }),
);
export const markRead = asyncHandler(async (req, res) =>
  res.json({
    item: await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true },
    ),
  }),
);

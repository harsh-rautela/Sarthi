import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getProfile = asyncHandler(async (req, res) =>
  res.json({ profile: req.user.profile || {} }),
);
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = [
    "age",
    "gender",
    "state",
    "district",
    "occupation",
    "annualIncome",
    "education",
    "socialCategory",
    "ruralUrban",
    "disability",
    "farmer",
    "employmentStatus",
    "maritalStatus",
    "minority",
    "bplCard",
    "student",
  ];
  const profile = {};
  for (const key of allowed) if (key in req.body) profile[key] = req.body[key];
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { profile } },
    { new: true },
  ).select("-password");
  res.json({ profile: user.profile });
});

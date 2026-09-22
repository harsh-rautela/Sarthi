import Bookmark from '../models/Bookmark.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listBookmarks = asyncHandler(async (req, res) => {
  const items = await Bookmark.find({ user: req.user._id }).populate('scheme').sort({ createdAt: -1 });
  res.json({ items });
});
export const addBookmark = asyncHandler(async (req, res) => {
  const item = await Bookmark.findOneAndUpdate({ user: req.user._id, scheme: req.params.schemeId }, { user: req.user._id, scheme: req.params.schemeId }, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.status(201).json({ item });
});
export const removeBookmark = asyncHandler(async (req, res) => {
  await Bookmark.deleteOne({ user: req.user._id, scheme: req.params.schemeId });
  res.json({ message: 'Bookmark removed' });
});

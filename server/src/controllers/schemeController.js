import Scheme from '../models/Scheme.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listSchemes = asyncHandler(async (req, res) => {
  const { q, category, level, state, page = 1, limit = 12 } = req.query;
  const filter = { active: true, verified: true };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (state) filter.$or = [{ applicableStates: state }, { applicableStates: { $size: 0 } }, { level: 'Central' }];
  if (q) filter.$text = { $search: q };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Scheme.find(filter).sort(q ? { score: { $meta: 'textScore' } } : { updatedAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Scheme.countDocuments(filter)
  ]);
  
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

export const getScheme = asyncHandler(async (req, res) => {
  const scheme = await Scheme.findOne({ $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }] });
  if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
  res.json({ scheme });
});

export const createScheme = asyncHandler(async (req, res) => {
  const scheme = await Scheme.create(req.body);
  res.status(201).json({ scheme });
});

export const updateScheme = asyncHandler(async (req, res) => {
  const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
  res.json({ scheme });
});

export const deleteScheme = asyncHandler(async (req, res) => {
  const scheme = await Scheme.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
  if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
  res.json({ message: 'Scheme archived' });
});

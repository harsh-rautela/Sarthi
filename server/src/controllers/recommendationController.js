import { asyncHandler } from '../utils/asyncHandler.js';
import {
  recommendForProfile,
  simulateRecommendations,
  getProfileGapInsights
} from '../services/recommendationService.js';
import Scheme from '../models/Scheme.js';
import { evaluateScheme } from '../services/eligibilityService.js';

export const recommendations = asyncHandler(async (req, res) => {
  const options = {
    limit: req.query.limit ? Number(req.query.limit) : 50,
    includeIneligible: req.query.includeIneligible === 'true',
    category: req.query.category,
    status: req.query.status,
    minScore: req.query.minScore ? Number(req.query.minScore) : undefined,
    search: req.query.search,
    level: req.query.level,
    sortBy: req.query.sortBy || 'matchScore'
  };

  const result = await recommendForProfile(req.user?.profile || {}, options);
  res.json({
    recommendations: result.recommendations,
    stats: result.stats
  });
});

export const simulate = asyncHandler(async (req, res) => {
  const simulatedProfile = req.body.profile || {};
  const savedProfile = req.user?.profile || {};
  const options = req.body.options || {};

  const result = await simulateRecommendations(simulatedProfile, savedProfile, options);
  res.json({
    recommendations: result.recommendations,
    stats: result.stats,
    simulationStats: result.simulationStats
  });
});

export const insights = asyncHandler(async (req, res) => {
  const data = await getProfileGapInsights(req.user?.profile || {});
  res.json(data);
});

export const checkEligibility = asyncHandler(async (req, res) => {
  const scheme = await Scheme.findById(req.body.schemeId).lean();
  if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
  const evaluation = evaluateScheme(req.body.profile || req.user?.profile || {}, scheme);
  res.json({ scheme, evaluation });
});

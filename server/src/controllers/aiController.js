import { asyncHandler } from '../utils/asyncHandler.js';
import { answerSchemeQuestion } from '../services/aiService.js';

export const chat = asyncHandler(async (req, res) => {
  const { question, history, apiKey, profile } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ message: 'Question string is required' });
  }

  const userProfile = profile || req.user?.profile || {};
  const response = await answerSchemeQuestion({
    question,
    profile: userProfile,
    history: Array.isArray(history) ? history : [],
    apiKey: apiKey || req.headers['x-groq-key'] || ''
  });

  res.json(response);
});

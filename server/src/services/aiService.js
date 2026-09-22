import { schemeAssistantGraph } from '../ai/schemeAssistantGraph.js';

export async function answerSchemeQuestion({ question, profile, history, apiKey }) {
  const result = await schemeAssistantGraph.invoke({
    question,
    profile: profile || {},
    history: history || [],
    customApiKey: apiKey || ''
  });

  return {
    answer: result.answer,
    recommendations: result.recommendations,
    mode: result.mode,
    modelUsed: result.modelUsed
  };
}

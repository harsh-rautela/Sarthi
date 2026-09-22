import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import Scheme from '../models/Scheme.js';
import { evaluateScheme } from '../services/eligibilityService.js';
import { recommendForProfile } from '../services/recommendationService.js';

// Define the LangGraph state schema
export const AssistantState = Annotation.Root({
  question: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ''
  }),
  profile: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ({})
  }),
  customApiKey: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ''
  }),
  history: Annotation({
    reducer: (x, y) => (Array.isArray(y) ? y : x),
    default: () => []
  }),
  retrievedSchemes: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => []
  }),
  groundedFacts: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => []
  }),
  answer: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => ''
  }),
  recommendations: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => []
  }),
  mode: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 'deterministic-rule-engine'
  }),
  modelUsed: Annotation({
    reducer: (x, y) => y ?? x,
    default: () => 'none'
  })
});

// Node 1: Retriever Node
// Finds relevant schemes based on question keywords and user's profile
async function retrieverNode(state) {
  const q = (state.question || '').toLowerCase();
  const profile = state.profile || {};

  // Extract topic cues from question
  const topicKeywords = {
    agriculture: ['farm', 'farmer', 'crop', 'kisan', 'agriculture', 'fertilizer', 'sowing', 'patwari', 'pm-kisan', 'land'],
    education: ['student', 'scholarship', 'college', 'school', 'degree', 'study', 'education', 'merit', 'hostel', 'tuition'],
    healthcare: ['health', 'hospital', 'medical', 'treatment', 'ayushman', 'pm-jay', 'illness', 'doctor', 'insurance', 'arogya'],
    msme: ['business', 'shop', 'vendor', 'loan', 'credit', 'mudra', 'svanidhi', 'startup', 'entrepreneur', 'self-employed', 'micro'],
    housing: ['house', 'housing', 'home', 'awas', 'pucca', 'pmay', 'construction', 'shelter'],
    women: ['women', 'woman', 'girl', 'female', 'kanya', 'ladli', 'mother', 'maternity', 'behna', 'daughter'],
    disability: ['disability', 'disabled', 'pwd', 'handicapped', 'aid', 'appliance', 'tricycle', 'wheelchair', 'blind'],
    senior: ['senior', 'elderly', 'old', 'pension', 'retire', 'agnoaps', '60']
  };

  const detectedCategories = [];
  for (const [cat, words] of Object.entries(topicKeywords)) {
    if (words.some(w => q.includes(w))) {
      detectedCategories.push(cat);
    }
  }

  // Fetch candidate schemes from database
  let candidateSchemes = [];
  if (detectedCategories.length > 0) {
    const regexList = detectedCategories.map(c => new RegExp(c, 'i'));
    candidateSchemes = await Scheme.find({
      active: true,
      verified: true,
      $or: [
        { category: { $in: regexList } },
        { name: { $regex: q.split(' ').slice(0, 3).join('|'), $options: 'i' } }
      ]
    }).limit(15).lean();
  }

  // If specific query didn't match or question is broad, get top recommendations for profile
  const recResult = await recommendForProfile(profile, { limit: 10, includeIneligible: true });
  const recSchemes = recResult.recommendations.map(r => r.scheme);

  // Merge unique schemes
  const schemeMap = new Map();
  candidateSchemes.forEach(s => schemeMap.set(String(s._id), s));
  recSchemes.forEach(s => schemeMap.set(String(s._id), s));

  // If still empty, fetch first 10 active schemes
  if (schemeMap.size === 0) {
    const defaults = await Scheme.find({ active: true, verified: true }).limit(10).lean();
    defaults.forEach(s => schemeMap.set(String(s._id), s));
  }

  return {
    retrievedSchemes: Array.from(schemeMap.values())
  };
}

// Node 2: Evaluator Node
// Evaluates deterministic rules for all retrieved schemes against user profile
async function evaluatorNode(state) {
  const schemes = state.retrievedSchemes || [];
  const profile = state.profile || {};

  const groundedFacts = [];
  const recommendations = [];

  for (const scheme of schemes) {
    const evaluation = evaluateScheme(profile, scheme);

    const fact = {
      id: scheme._id,
      name: scheme.name,
      slug: scheme.slug,
      category: scheme.category,
      ministry: scheme.ministry,
      level: scheme.level,
      applicableStates: scheme.applicableStates || [],
      status: evaluation.status,
      matchScore: evaluation.matchScore,
      requirementSummary: evaluation.requirementSummary,
      passedChecks: evaluation.passedChecks?.map(c => `${c.label}: ${c.actual} meets required ${c.required}`) || [],
      missingChecks: evaluation.missingChecks?.map(c => `${c.label} (Required: ${c.required})`) || [],
      failedChecks: evaluation.failedChecks?.map(c => `${c.label}: Your ${c.actual} does not meet required ${c.required}`) || [],
      criticalFailureReasons: evaluation.criticalFailureReasons || [],
      benefits: scheme.benefits || [],
      documentsRequired: scheme.documentsRequired || [],
      applicationProcess: scheme.applicationProcess || [],
      officialUrl: scheme.officialUrl
    };

    groundedFacts.push(fact);

    recommendations.push({
      _id: scheme._id,
      name: scheme.name,
      slug: scheme.slug,
      category: scheme.category,
      level: scheme.level,
      status: evaluation.status,
      matchScore: evaluation.matchScore,
      requirementSummary: evaluation.requirementSummary,
      benefits: (scheme.benefits || []).slice(0, 2),
      officialUrl: scheme.officialUrl
    });
  }

  // Sort recommendations: eligible first, then needs_verification, then not_eligible
  const order = { eligible: 0, needs_verification: 1, not_eligible: 2 };
  recommendations.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3) || b.matchScore - a.matchScore);

  return {
    groundedFacts,
    recommendations: recommendations.slice(0, 5)
  };
}

// Deterministic rule-based synthesizer fallback
function generateDeterministicAnswer(question, profile, groundedFacts) {
  const eligible = groundedFacts.filter(f => f.status === 'eligible');
  const needsVerification = groundedFacts.filter(f => f.status === 'needs_verification');
  const disqualified = groundedFacts.filter(f => f.status === 'not_eligible');

  let text = `### Scheme Eligibility & Information Report\n\n`;

  const citizenSummary = [];
  if (profile.age) citizenSummary.push(`Age: ${profile.age}`);
  if (profile.occupation) citizenSummary.push(`Occupation: ${profile.occupation}`);
  if (profile.state) citizenSummary.push(`State: ${profile.state}`);
  if (profile.annualIncome) citizenSummary.push(`Income: ₹${Number(profile.annualIncome).toLocaleString('en-IN')}`);
  if (profile.socialCategory) citizenSummary.push(`Category: ${profile.socialCategory}`);

  if (citizenSummary.length) {
    text += `**Evaluated Citizen Profile:** ${citizenSummary.join(' | ')}\n\n`;
  }

  if (eligible.length > 0) {
    text += `#### ✅ 100% Eligible Schemes Ready for Application (${eligible.length})\n\n`;
    for (const item of eligible.slice(0, 3)) {
      text += `**${item.name}** (${item.category} · ${item.level})\n`;
      text += `- **Why Eligible:** ${item.requirementSummary}\n`;
      if (item.benefits?.length) {
        text += `- **Key Benefits:** ${item.benefits[0]}\n`;
      }
      if (item.documentsRequired?.length) {
        text += `- **Documents to Keep Ready:** ${item.documentsRequired.slice(0, 3).join(', ')}\n`;
      }
      if (item.officialUrl) {
        text += `- **Official Portal:** [Apply at ${item.name}](${item.officialUrl})\n`;
      }
      text += `\n`;
    }
  }

  if (needsVerification.length > 0) {
    text += `#### ⚠️ Potential Schemes Needing Profile Verification (${needsVerification.length})\n\n`;
    for (const item of needsVerification.slice(0, 3)) {
      text += `**${item.name}** (${item.category})\n`;
      text += `- **Action Needed:** ${item.requirementSummary}\n`;
      if (item.missingChecks?.length) {
        text += `- **Missing Criteria:** Complete **${item.missingChecks.join(', ')}** in your profile to verify.\n`;
      }
      text += `\n`;
    }
  }

  if (eligible.length === 0 && needsVerification.length === 0 && disqualified.length > 0) {
    text += `#### ℹ️ Eligibility Findings\n\n`;
    for (const item of disqualified.slice(0, 2)) {
      text += `**${item.name}**: Not eligible based on current criteria.\n`;
      if (item.criticalFailureReasons?.length) {
        text += `- Reason: ${item.criticalFailureReasons.join('; ')}\n`;
      }
      text += `\n`;
    }
    text += `*Tip: Consider updating your profile or exploring other categories on the portal.*\n\n`;
  }

  text += `> [!NOTE]\n> *Disclaimer: Deterministic rule verification provides initial screening. Final eligibility and financial disbursements are determined solely by the concerned government ministry upon document scrutiny.*`;

  return text;
}

// Node 3: Generator Node
// Uses Groq LLM if key is present; otherwise falls back to deterministic rule engine
async function generatorNode(state) {
  const apiKey = state.customApiKey || process.env.GROQ_API_KEY || process.env.GOOGLE_API_KEY;
  console.log(apiKey)
  const groundedFacts = state.groundedFacts || [];
  const profile = state.profile || {};
  const question = state.question;
  const history = state.history || [];

  // If no API key is available or ENABLE_AI is disabled and no custom key provided
  const hasGroq = Boolean(state.customApiKey || process.env.GROQ_API_KEY);
  const hasGoogle = Boolean(!hasGroq && process.env.GOOGLE_API_KEY);

  if (!apiKey || (process.env.ENABLE_AI !== 'true' && !state.customApiKey && !process.env.GROQ_API_KEY)) {
    const answer = generateDeterministicAnswer(question, profile, groundedFacts);
    return {
      answer,
      mode: 'deterministic-rule-engine',
      modelUsed: 'rule-engine-v2'
    };
  }

  try {
    let llm;
    let modelName = '';

    if (hasGroq) {
      const { ChatGroq } = await import('@langchain/groq');
      const key = state.customApiKey || process.env.GROQ_API_KEY;
      modelName = "openai/gpt-oss-120b";
      llm = new ChatGroq({
        apiKey: key,
        model: modelName,
        temperature: 0.2
      });
    } else if (hasGoogle) {
      const { ChatGoogleGenerativeAI } = await import('@langchain/google-genai');
      modelName = 'gemini-1.5-flash';
      llm = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
        model: modelName,
        temperature: 0.2
      });
    }

    const systemPrompt = `You are "SchemeSathi AI", an intelligent, empathetic, and highly accurate government scheme assistant.
Your job is to answer the citizen's question strictly using the provided verified government scheme facts and deterministic rule evaluation results.

STRICT CONSTRAINTS:
1. Zero Hallucination: Never invent or assume eligibility criteria, documents, or benefit amounts not present in the verified facts below.
2. Rule Grounding: If a scheme is marked 'eligible', confirm it clearly with reasons. If marked 'needs_verification', tell the citizen exactly which profile details are missing. If 'not_eligible', state the precise criteria that disqualified them empathetically.
3. Clarity & Structure: Use clear markdown with bold headings, bullet points, and hyperlinks for official portals.
4. Mandatory Disclaimer: Always remind the citizen that final eligibility is decided by the respective government department upon official document verification.

CITIZEN PROFILE:
${JSON.stringify(profile, null, 2)}

VERIFIED SCHEME FACTS & EVALUATION RESULTS:
${JSON.stringify(groundedFacts.slice(0, 8), null, 2)}
`;

    const messages = [new SystemMessage(systemPrompt)];

    // Append conversation history if provided
    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.role === 'user') {
          messages.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          messages.push(new AIMessage(msg.content));
        }
      }
    }

    messages.push(new HumanMessage(question));

    const response = await llm.invoke(messages);

    return {
      answer: String(response.content),
      mode: 'langgraph-llm',
      modelUsed: modelName
    };
  } catch (err) {
    console.error('Groq / LLM error, falling back to deterministic synthesizer:', err);
    const answer = generateDeterministicAnswer(question, profile, groundedFacts);
    return {
      answer: `${answer}\n\n*(Note: LLM inference encountered an issue: ${err.message || 'Check API key'}; deterministic verification results provided above.)*`,
      mode: 'deterministic-fallback',
      modelUsed: 'rule-engine-v2'
    };
  }
}

// Build and compile the LangGraph workflow
const workflow = new StateGraph(AssistantState)
  .addNode('retriever', retrieverNode)
  .addNode('evaluator', evaluatorNode)
  .addNode('generator', generatorNode)
  .addEdge(START, 'retriever')
  .addEdge('retriever', 'evaluator')
  .addEdge('evaluator', 'generator')
  .addEdge('generator', END);

export const schemeAssistantGraph = workflow.compile();


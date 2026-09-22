import mongoose from 'mongoose';
import { answerSchemeQuestion } from './services/aiService.js';
import User from './models/User.js';

async function testAssistant() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gov_scheme_portal';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB. Testing Scheme Assistant with LangGraph...\n');

  // Test with Farmer profile
  const farmer = await User.findOne({ email: 'farmer@schemesathi.local' }).lean();
  console.log(`[Test 1] Testing with Farmer profile: ${farmer.name}`);

  const q1 = "What agricultural financial aid or subsidies am I eligible for in Madhya Pradesh?";
  console.log(`Question: "${q1}"`);

  const res1 = await answerSchemeQuestion({
    question: q1,
    profile: farmer.profile
  });

  console.log('\nResponse Mode:', res1.mode);
  console.log('Model Used:', res1.modelUsed);
  console.log('Recommended Schemes count:', res1.recommendations?.length);
  console.log('Top scheme returned:', res1.recommendations?.[0]?.name);
  console.log('\n--- Answer Preview ---');
  console.log(res1.answer.slice(0, 350) + '...\n');

  if (!res1.answer || res1.recommendations.length === 0) {
    throw new Error('Test 1 failed: Expected answer and recommendations');
  }

  // Test with Student profile
  const student = await User.findOne({ email: 'demo@schemesathi.local' }).lean();
  console.log(`\n[Test 2] Testing with Student profile: ${student.name}`);
  const q2 = "Which scholarships can I apply for right now?";
  console.log(`Question: "${q2}"`);

  const res2 = await answerSchemeQuestion({
    question: q2,
    profile: student.profile
  });

  console.log('Response Mode:', res2.mode);
  console.log('Top scheme returned:', res2.recommendations?.[0]?.name);
  console.log('Top scheme status:', res2.recommendations?.[0]?.status);

  if (res2.recommendations?.[0]?.status !== 'eligible') {
    throw new Error('Test 2 failed: Expected student eligible scholarships');
  }

  console.log('\n>>> ALL AI ASSISTANT LANGGRAPH TESTS PASSED! <<<\n');
  await mongoose.disconnect();
}

testAssistant().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});


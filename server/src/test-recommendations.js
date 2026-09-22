import mongoose from 'mongoose';
import User from './models/User.js';
import Scheme from './models/Scheme.js';
import { evaluateScheme } from './services/eligibilityService.js';
import {
  recommendForProfile,
  simulateRecommendations,
  getProfileGapInsights
} from './services/recommendationService.js';

async function runTests() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gov_scheme_portal';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB. Running verification tests...\n');

  // Test 1: Verify users exist
  const users = await User.find({}).lean();
  console.log(`[Test 1] Found ${users.length} users in database.`);
  if (users.length < 5) throw new Error('Expected at least 5 seeded users.');

  // Test 2: Verify schemes exist
  const schemes = await Scheme.find({}).lean();
  console.log(`[Test 2] Found ${schemes.length} schemes in database.`);
  if (schemes.length < 20) throw new Error('Expected at least 20 seeded schemes.');

  // Test 3: Test Farmer Persona
  const farmer = users.find(u => u.email === 'farmer@schemesathi.local');
  console.log(`\n[Test 3] Testing Farmer Persona: ${farmer.name}`);
  const farmerRecs = await recommendForProfile(farmer.profile, { limit: 10 });
  const pmKisan = farmerRecs.recommendations.find(r => r.scheme.slug === 'pm-kisan-samman-nidhi');
  console.log(' - PM-KISAN evaluation status for farmer:', pmKisan?.evaluation?.status);
  console.log(' - PM-KISAN match score:', pmKisan?.compositeScore);
  console.log(' - Requirement summary:', pmKisan?.evaluation?.requirementSummary);
  if (pmKisan?.evaluation?.status !== 'eligible') {
    throw new Error('Farmer should be eligible for PM-KISAN');
  }

  // Test 4: Test Student Persona (Priya Sharma)
  const student = users.find(u => u.email === 'demo@schemesathi.local');
  console.log(`\n[Test 4] Testing Student Persona: ${student.name}`);
  const studentRecs = await recommendForProfile(student.profile, { limit: 10 });
  const postMatric = studentRecs.recommendations.find(r => r.scheme.slug === 'post-matric-scholarship-sc-st');
  console.log(' - Post-Matric SC/ST status for student:', postMatric?.evaluation?.status);
  console.log(' - Post-Matric SC/ST score:', postMatric?.compositeScore);
  if (postMatric?.evaluation?.status !== 'eligible') {
    throw new Error('SC Student should be eligible for Post-Matric Scholarship for SC/ST');
  }

  // Test 5: Test Ineligibility & Explainability
  // Student should NOT be eligible for PM-KISAN because farmer status is false
  const farmerScheme = schemes.find(s => s.slug === 'pm-kisan-samman-nidhi');
  const studentFarmerEval = evaluateScheme(student.profile, farmerScheme);
  console.log(`\n[Test 5] Ineligibility check: Student for PM-KISAN:`);
  console.log(' - Status:', studentFarmerEval.status);
  console.log(' - Failed checks count:', studentFarmerEval.failedCount);
  console.log(' - Critical failure reasons:', studentFarmerEval.criticalFailureReasons);
  if (studentFarmerEval.status !== 'not_eligible') {
    throw new Error('Non-farmer student should NOT be eligible for PM-KISAN');
  }
  if (!studentFarmerEval.criticalFailureReasons.length) {
    throw new Error('Expected criticalFailureReasons for disqualified scheme');
  }

  // Test 6: Profile Gap Insights
  console.log('\n[Test 6] Testing Profile Gap Insights:');
  const incompleteProfile = { age: 25, gender: 'Male' }; // Missing income, state, occupation, etc.
  const insights = await getProfileGapInsights(incompleteProfile);
  console.log(' - Profile completeness:', insights.profileCompleteness + '%');
  console.log(' - High impact missing fields count:', insights.highImpactFields.length);
  console.log(' - Top impactful field:', insights.highImpactFields[0]?.label, `(${insights.highImpactFields[0]?.schemesWaitingCount} schemes waiting)`);
  if (!insights.highImpactFields.length) {
    throw new Error('Expected highImpactFields for incomplete profile');
  }

  // Test 7: What-If Simulation
  console.log('\n[Test 7] Testing What-If Simulation:');
  const simulated = { ...student.profile, state: 'Madhya Pradesh', occupation: 'Farmer', farmer: true };
  const simResult = await simulateRecommendations(simulated, student.profile);
  console.log(' - Baseline eligible count:', studentRecs.stats.eligibleCount);
  console.log(' - Simulated eligible count:', simResult.simulationStats.totalEligible);
  console.log(' - Newly unlocked schemes count:', simResult.simulationStats.newlyEligibleCount);
  console.log(' - Sample newly unlocked:', simResult.simulationStats.newlyEligibleSchemes.map(s => s.name).slice(0, 3));
  if (simResult.simulationStats.newlyEligibleCount <= 0) {
    throw new Error('Expected newly eligible schemes when switching profile to MP Farmer');
  }

  // Test 8: Filter options (category, status, level)
  console.log('\n[Test 8] Testing Query Filters:');
  const agriOnly = await recommendForProfile(farmer.profile, { category: 'Agriculture' });
  console.log(' - Filtered by Agriculture count:', agriOnly.recommendations.length);
  const allAgri = agriOnly.recommendations.every(r => r.scheme.category === 'Agriculture');
  if (!allAgri) throw new Error('Category filter failed: non-agriculture schemes returned');

  const centralOnly = await recommendForProfile(farmer.profile, { level: 'Central' });
  console.log(' - Filtered by Central count:', centralOnly.recommendations.length);
  const allCentral = centralOnly.recommendations.every(r => r.scheme.level === 'Central');
  if (!allCentral) throw new Error('Level filter failed: non-central schemes returned');

  console.log('\n>>> ALL 8 BACKEND RECOMMENDATION & ELIGIBILITY TESTS PASSED! <<<\n');
  await mongoose.disconnect();
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});


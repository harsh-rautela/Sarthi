import Scheme from '../models/Scheme.js';
import { evaluateScheme } from './eligibilityService.js';

// Calculate demographic and category affinity boost (0 to 15 points)
function calculateAffinityBoost(profile = {}, scheme = {}) {
  let boost = 0;
  const category = (scheme.category || '').toLowerCase();
  const occ = (profile.occupation || '').toLowerCase();
  const gender = (profile.gender || '').toLowerCase();
  const age = Number(profile.age);

  // Occupation Affinity
  if (occ === 'student') {
    if (category.includes('education') || category.includes('skill')) boost += 8;
  } else if (occ === 'farmer' || profile.farmer) {
    if (category.includes('agriculture') || category.includes('rural')) boost += 10;
  } else if (['entrepreneur', 'business owner', 'self-employed'].includes(occ)) {
    if (category.includes('entrepreneurship') || category.includes('msme') || category.includes('employment')) boost += 8;
  } else if (['unemployed', 'job seeker'].includes(occ) || profile.employmentStatus === 'Job Seeker') {
    if (category.includes('employment') || category.includes('skill')) boost += 8;
  }

  // Gender Affinity
  if (gender === 'female' && (category.includes('women') || scheme.name?.toLowerCase().includes('mahila') || scheme.name?.toLowerCase().includes('behna') || scheme.name?.toLowerCase().includes('ladli') || scheme.name?.toLowerCase().includes('kanya'))) {
    boost += 7;
  }

  // Disability Affinity
  if (profile.disability && (category.includes('disability') || scheme.eligibility?.disabilityRequired)) {
    boost += 10;
  }

  // Senior Citizen Affinity
  if (age >= 60 && (category.includes('senior') || category.includes('pension') || category.includes('healthcare'))) {
    boost += 7;
  }

  // Geographic Local Relevance (State schemes that match the citizen's own state)
  if (scheme.level === 'State' && profile.state) {
    const states = scheme.eligibility?.states || scheme.applicableStates || [];
    if (states.some(s => s.toLowerCase() === profile.state.toLowerCase())) {
      boost += 6;
    }
  }

  return Math.min(15, boost);
}

// Compute Profile Gap Insights across all schemes
export async function getProfileGapInsights(profile = {}) {
  const allSchemes = await Scheme.find({ active: true, verified: true }).lean();
  const fieldImpactMap = {};
  const fieldLabels = {
    annualIncome: 'Annual Family Income',
    age: 'Age',
    state: 'State / UT',
    occupation: 'Occupation',
    education: 'Education Qualification',
    socialCategory: 'Social Category (Caste/Quota)',
    ruralUrban: 'Area (Rural / Urban)',
    gender: 'Gender',
    employmentStatus: 'Employment Status',
    disability: 'Disability Status (PwD)',
    farmer: 'Farmer Status',
    maritalStatus: 'Marital Status',
    minority: 'Minority Status',
    bplCard: 'BPL / Low Income Card'
  };

  let totalNeedsVerification = 0;
  let totalEligible = 0;

  for (const scheme of allSchemes) {
    const ev = evaluateScheme(profile, scheme);
    if (ev.status === 'eligible') {
      totalEligible++;
    } else if (ev.status === 'needs_verification') {
      totalNeedsVerification++;
      for (const missing of ev.missingChecks) {
        const f = missing.field;
        if (!fieldImpactMap[f]) {
          fieldImpactMap[f] = {
            field: f,
            label: fieldLabels[f] || missing.label || f,
            schemesWaitingCount: 0,
            sampleSchemes: []
          };
        }
        fieldImpactMap[f].schemesWaitingCount++;
        if (fieldImpactMap[f].sampleSchemes.length < 3) {
          fieldImpactMap[f].sampleSchemes.push(scheme.name);
        }
      }
    }
  }

  const highImpactFields = Object.values(fieldImpactMap)
    .sort((a, b) => b.schemesWaitingCount - a.schemesWaitingCount);

  // Profile completeness calculation
  const trackedFields = ['age', 'gender', 'state', 'occupation', 'annualIncome', 'education', 'socialCategory', 'ruralUrban'];
  const completedFields = trackedFields.filter(f => profile[f] != null && profile[f] !== '');
  const profileCompleteness = Math.round((completedFields.length / trackedFields.length) * 100);

  return {
    profileCompleteness,
    completedCount: completedFields.length,
    totalTrackedFields: trackedFields.length,
    totalSchemes: allSchemes.length,
    totalEligible,
    totalNeedsVerification,
    highImpactFields,
    summary: highImpactFields.length > 0
      ? `Completing ${highImpactFields[0].label} could help verify up to ${highImpactFields[0].schemesWaitingCount} more schemes.`
      : 'Your profile has all essential criteria covered.'
  };
}

// Core multi-factor recommendation engine
export async function recommendForProfile(profile = {}, options = {}) {
  const {
    limit = 50,
    includeIneligible = false,
    category,
    status,
    minScore,
    search,
    level,
    sortBy = 'matchScore'
  } = options;

  const schemes = await Scheme.find({ active: true, verified: true }).limit(500).lean();

  let eligibleCount = 0;
  let needsVerificationCount = 0;
  let notEligibleCount = 0;
  const categoryCounts = {};

  const evaluated = schemes.map(scheme => {
    const evaluation = evaluateScheme(profile, scheme);
    const affinityBoost = calculateAffinityBoost(profile, scheme);

    // Compute compositeScore:
    // Eligible: 85-100 base + affinity, capped at 100
    // Needs Verification: 55-84 base + affinity, capped at 85
    // Not Eligible: capped at 40
    let compositeScore = evaluation.matchScore;
    if (evaluation.status === 'eligible') {
      compositeScore = Math.min(100, evaluation.matchScore + Math.round(affinityBoost * 0.7));
    } else if (evaluation.status === 'needs_verification') {
      compositeScore = Math.min(84, evaluation.matchScore + Math.round(affinityBoost * 0.5));
    } else {
      compositeScore = Math.min(40, evaluation.matchScore);
    }

    // Tally stats
    if (evaluation.status === 'eligible') {
      eligibleCount++;
      const cat = scheme.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    } else if (evaluation.status === 'needs_verification') {
      needsVerificationCount++;
    } else {
      notEligibleCount++;
    }

    return {
      scheme,
      evaluation,
      compositeScore,
      affinityBoost
    };
  });

  // Filter based on criteria
  let filtered = evaluated;

  // Filter by includeIneligible / status
  if (status && status !== 'all') {
    filtered = filtered.filter(item => item.evaluation.status === status);
  } else if (!includeIneligible) {
    filtered = filtered.filter(item => item.evaluation.status !== 'not_eligible');
  }

  // Filter by category
  if (category && category !== 'all') {
    const catLower = category.toLowerCase();
    filtered = filtered.filter(item => (item.scheme.category || '').toLowerCase() === catLower);
  }

  // Filter by level (Central / State)
  if (level && level !== 'all') {
    const lvlLower = level.toLowerCase();
    filtered = filtered.filter(item => (item.scheme.level || '').toLowerCase() === lvlLower);
  }

  // Filter by minScore
  if (minScore != null && !isNaN(minScore)) {
    const threshold = Number(minScore);
    filtered = filtered.filter(item => item.compositeScore >= threshold);
  }

  // Filter by search query
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(item =>
      (item.scheme.name || '').toLowerCase().includes(q) ||
      (item.scheme.description || '').toLowerCase().includes(q) ||
      (item.scheme.category || '').toLowerCase().includes(q) ||
      (item.scheme.ministry || '').toLowerCase().includes(q)
    );
  }

  // Sort results
  const priorityOrder = { eligible: 0, needs_verification: 1, not_eligible: 2 };

  filtered.sort((a, b) => {
    if (sortBy === 'name') {
      return (a.scheme.name || '').localeCompare(b.scheme.name || '');
    }
    if (sortBy === 'category') {
      return (a.scheme.category || '').localeCompare(b.scheme.category || '');
    }
    if (sortBy === 'status') {
      return priorityOrder[a.evaluation.status] - priorityOrder[b.evaluation.status] ||
        b.compositeScore - a.compositeScore;
    }
    // Default: 'matchScore' (status tiering + compositeScore)
    const pDiff = priorityOrder[a.evaluation.status] - priorityOrder[b.evaluation.status];
    if (pDiff !== 0) return pDiff;
    return b.compositeScore - a.compositeScore || (a.scheme.name || '').localeCompare(b.scheme.name || '');
  });

  const sliced = filtered.slice(0, limit);

  return {
    recommendations: sliced,
    stats: {
      total: schemes.length,
      matchingCount: filtered.length,
      eligibleCount,
      needsVerificationCount,
      notEligibleCount,
      categoryCounts
    }
  };
}

// What-If Simulation
export async function simulateRecommendations(simulatedProfile = {}, savedProfile = {}, options = {}) {
  // Compute results for simulated profile
  const simResult = await recommendForProfile(simulatedProfile, { ...options, limit: 100, includeIneligible: true });

  // Compute baseline for saved profile if available
  let baselineEligibleIds = new Set();
  if (savedProfile && Object.keys(savedProfile).length > 0) {
    const baseResult = await recommendForProfile(savedProfile, { limit: 100, includeIneligible: true });
    baselineEligibleIds = new Set(
      baseResult.recommendations
        .filter(r => r.evaluation.status === 'eligible')
        .map(r => String(r.scheme._id))
    );
  }

  // Identify newly eligible schemes
  const newlyEligibleSchemes = simResult.recommendations.filter(r =>
    r.evaluation.status === 'eligible' && !baselineEligibleIds.has(String(r.scheme._id))
  );

  return {
    recommendations: simResult.recommendations,
    stats: simResult.stats,
    simulationStats: {
      totalEligible: simResult.stats.eligibleCount,
      totalNeedsVerification: simResult.stats.needsVerificationCount,
      newlyEligibleCount: newlyEligibleSchemes.length,
      newlyEligibleSchemes: newlyEligibleSchemes.map(r => ({
        _id: r.scheme._id,
        name: r.scheme.name,
        category: r.scheme.category,
        slug: r.scheme.slug
      }))
    }
  };
}

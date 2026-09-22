const normal = value => String(value ?? '').trim().toLowerCase();
const inList = (value, list = []) => {
  if (!list || !list.length) return true;
  const val = normal(value);
  if (!val) return false;
  return list.some(item => normal(item) === val);
};

export function evaluateScheme(profile = {}, scheme = {}) {
  const e = scheme.eligibility || {};
  const checks = [];
  const criticalFailureReasons = [];
  const actionableRecommendations = [];

  const addCheck = ({ field, label, required, actual, pass, missing = false, failureReason = '' }) => {
    const isPass = missing ? null : Boolean(pass);
    const checkObj = {
      field,
      label,
      required: String(required),
      actual: actual != null && actual !== '' ? String(actual) : 'Not provided',
      pass: isPass
    };
    checks.push(checkObj);

    if (isPass === false && failureReason) {
      criticalFailureReasons.push(failureReason);
    }
  };

  // 1. Age Range
  if (e.age?.min != null || e.age?.max != null) {
    const min = e.age.min;
    const max = e.age.max;
    const reqStr = min != null && max != null ? `${min}–${max} years` : min != null ? `Min ${min} years` : `Max ${max} years`;
    const missing = profile.age == null || profile.age === '';
    let pass = false;
    let failReason = '';
    if (!missing) {
      const ageNum = Number(profile.age);
      pass = (min == null || ageNum >= min) && (max == null || ageNum <= max);
      if (!pass) {
        failReason = `Age: Your age (${ageNum}) is outside the required range (${reqStr}).`;
      }
    }
    addCheck({
      field: 'age',
      label: 'Age',
      required: reqStr,
      actual: profile.age != null && profile.age !== '' ? `${profile.age} years` : null,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 2. Annual Income
  if (e.income?.min != null || e.income?.max != null) {
    const min = e.income.min;
    const max = e.income.max;
    const reqStr = min != null && max != null ? `₹${min.toLocaleString('en-IN')}–₹${max.toLocaleString('en-IN')}` : max != null ? `Up to ₹${max.toLocaleString('en-IN')}` : `Min ₹${min.toLocaleString('en-IN')}`;
    const missing = profile.annualIncome == null || profile.annualIncome === '';
    let pass = false;
    let failReason = '';
    if (!missing) {
      const incomeNum = Number(profile.annualIncome);
      pass = (min == null || incomeNum >= min) && (max == null || incomeNum <= max);
      if (!pass) {
        failReason = incomeNum > max
          ? `Annual Income: Your income (₹${incomeNum.toLocaleString('en-IN')}) exceeds the ceiling of ₹${max.toLocaleString('en-IN')}.`
          : `Annual Income: Your income is below the minimum threshold of ₹${min.toLocaleString('en-IN')}.`;
      }
    }
    addCheck({
      field: 'annualIncome',
      label: 'Annual Income',
      required: reqStr,
      actual: profile.annualIncome != null && profile.annualIncome !== '' ? `₹${Number(profile.annualIncome).toLocaleString('en-IN')}` : null,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 3. Gender
  if (e.genders?.length) {
    const missing = !profile.gender;
    const pass = !missing && inList(profile.gender, e.genders);
    const failReason = !missing && !pass ? `Gender: Available exclusively for ${e.genders.join('/')} applicants.` : '';
    addCheck({
      field: 'gender',
      label: 'Gender',
      required: e.genders.join(', '),
      actual: profile.gender,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 4. State / Geographic Applicability
  // Check e.states or scheme.applicableStates if scheme is State-level
  const applicableStates = (e.states?.length ? e.states : (scheme.level === 'State' && scheme.applicableStates?.length ? scheme.applicableStates : []));
  if (applicableStates.length) {
    const missing = !profile.state;
    const pass = !missing && inList(profile.state, applicableStates);
    const failReason = !missing && !pass ? `State: Available only in ${applicableStates.join(', ')} (your state: ${profile.state}).` : '';
    addCheck({
      field: 'state',
      label: 'State / UT',
      required: applicableStates.join(', '),
      actual: profile.state,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 5. District Applicability
  if (e.districts?.length) {
    const missing = !profile.district;
    const pass = !missing && inList(profile.district, e.districts);
    const failReason = !missing && !pass ? `District: Limited to ${e.districts.join(', ')} districts.` : '';
    addCheck({
      field: 'district',
      label: 'District',
      required: e.districts.join(', '),
      actual: profile.district,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 6. Occupation
  if (e.occupations?.length) {
    const missing = !profile.occupation;
    // Check direct occupation match, or if scheme accepts Student and profile.student is true
    let pass = !missing && inList(profile.occupation, e.occupations);
    if (!pass && profile.student && inList('Student', e.occupations)) {
      pass = true;
    }
    const failReason = !missing && !pass ? `Occupation: Requires ${e.occupations.join(', ')}.` : '';
    addCheck({
      field: 'occupation',
      label: 'Occupation',
      required: e.occupations.join(', '),
      actual: profile.occupation,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 7. Education Level
  if (e.education?.length) {
    const missing = !profile.education;
    const pass = !missing && inList(profile.education, e.education);
    const failReason = !missing && !pass ? `Education: Requires qualification level: ${e.education.join(', ')}.` : '';
    addCheck({
      field: 'education',
      label: 'Education',
      required: e.education.join(', '),
      actual: profile.education,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 8. Social Category (Caste / Quota: General, OBC, SC, ST, EWS)
  if (e.socialCategories?.length) {
    const missing = !profile.socialCategory;
    const pass = !missing && inList(profile.socialCategory, e.socialCategories);
    const failReason = !missing && !pass ? `Social Category: Reserved for ${e.socialCategories.join(', ')}.` : '';
    addCheck({
      field: 'socialCategory',
      label: 'Social Category',
      required: e.socialCategories.join(', '),
      actual: profile.socialCategory,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 9. Rural / Urban
  if (e.ruralUrban?.length) {
    const missing = !profile.ruralUrban;
    const pass = !missing && inList(profile.ruralUrban, e.ruralUrban);
    const failReason = !missing && !pass ? `Area: Available for ${e.ruralUrban.join('/')} residents.` : '';
    addCheck({
      field: 'ruralUrban',
      label: 'Area Type',
      required: e.ruralUrban.join(', '),
      actual: profile.ruralUrban,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 10. Employment Status
  if (e.employmentStatuses?.length) {
    const missing = !profile.employmentStatus;
    const pass = !missing && inList(profile.employmentStatus, e.employmentStatuses);
    const failReason = !missing && !pass ? `Employment Status: Requires ${e.employmentStatuses.join(', ')}.` : '';
    addCheck({
      field: 'employmentStatus',
      label: 'Employment Status',
      required: e.employmentStatuses.join(', '),
      actual: profile.employmentStatus,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 11. Disability
  if (e.disabilityRequired) {
    const missing = profile.disability == null;
    const pass = profile.disability === true;
    const failReason = !missing && !pass ? 'Disability: Reserved for Persons with Disabilities (PwD).' : '';
    addCheck({
      field: 'disability',
      label: 'Disability Status',
      required: 'Required (PwD)',
      actual: profile.disability ? 'Yes' : 'No',
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 12. Farmer Status
  if (e.farmerRequired) {
    const missing = profile.farmer == null && !profile.occupation;
    const isFarmer = profile.farmer === true || normal(profile.occupation) === 'farmer';
    const pass = isFarmer;
    const failReason = !missing && !pass ? 'Farmer Status: Reserved for agricultural landholders / active farmers.' : '';
    addCheck({
      field: 'farmer',
      label: 'Farmer Status',
      required: 'Required',
      actual: isFarmer ? 'Yes' : 'No',
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 13. Marital Status
  if (e.maritalStatuses?.length) {
    const missing = !profile.maritalStatus;
    const pass = !missing && inList(profile.maritalStatus, e.maritalStatuses);
    const failReason = !missing && !pass ? `Marital Status: Limited to ${e.maritalStatuses.join(', ')}.` : '';
    addCheck({
      field: 'maritalStatus',
      label: 'Marital Status',
      required: e.maritalStatuses.join(', '),
      actual: profile.maritalStatus,
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 14. Minority Status
  if (e.minorityRequired) {
    const missing = profile.minority == null;
    const pass = profile.minority === true;
    const failReason = !missing && !pass ? 'Minority Status: Reserved for recognized religious or linguistic minorities.' : '';
    addCheck({
      field: 'minority',
      label: 'Minority Status',
      required: 'Required',
      actual: profile.minority ? 'Yes' : 'No',
      pass,
      missing,
      failureReason: failReason
    });
  }

  // 15. BPL (Below Poverty Line) / Ration Card
  if (e.bplRequired) {
    const missing = profile.bplCard == null && profile.annualIncome == null;
    const pass = profile.bplCard === true || (profile.annualIncome != null && Number(profile.annualIncome) <= 120000);
    const failReason = !missing && !pass ? 'BPL / Low Income: Requires BPL cardholder or low-income certification.' : '';
    addCheck({
      field: 'bplCard',
      label: 'BPL / Low Income Status',
      required: 'Required (BPL/AAY)',
      actual: profile.bplCard ? 'Yes (BPL)' : 'No',
      pass,
      missing,
      failureReason: failReason
    });
  }

  // Breakdown categorization
  const passedChecks = checks.filter(c => c.pass === true);
  const failedChecks = checks.filter(c => c.pass === false);
  const missingChecks = checks.filter(c => c.pass === null);
  const known = checks.filter(c => c.pass !== null).length;

  // Determine definitive legal status
  let status = 'eligible';
  if (failedChecks.length > 0) {
    status = 'not_eligible';
  } else if (missingChecks.length > 0) {
    status = 'needs_verification';
  } else {
    status = 'eligible';
  }

  // Compute explainable match score (0 - 100)
  let matchScore = 100;
  if (checks.length > 0) {
    if (status === 'eligible') {
      // 90 to 100 based on number of validated checks
      matchScore = Math.min(100, 90 + Math.min(10, checks.length * 2));
    } else if (status === 'needs_verification') {
      // Fraction of passed vs (passed + missing), scaled to 55 - 84
      const ratio = passedChecks.length / checks.length;
      matchScore = Math.round(55 + ratio * 29);
    } else {
      // Not eligible: if only 1 check failed out of many, give partial credit (15-35), else low
      const passRatio = passedChecks.length / checks.length;
      matchScore = Math.max(5, Math.round(passRatio * 35));
    }
  }

  // Generate clear requirement summary
  let requirementSummary = '';
  if (status === 'eligible') {
    requirementSummary = checks.length === 0
      ? 'Universal scheme — all citizens eligible'
      : `100% Eligible — all ${passedChecks.length} criteria satisfied`;
  } else if (status === 'needs_verification') {
    const missingLabels = missingChecks.map(c => c.label).join(', ');
    requirementSummary = `Requires ${missingChecks.length} more profile ${missingChecks.length === 1 ? 'detail' : 'details'}: ${missingLabels}`;
  } else {
    const failedLabels = failedChecks.map(c => c.label).join(', ');
    requirementSummary = `Disqualified by ${failedChecks.length} ${failedChecks.length === 1 ? 'criterion' : 'criteria'}: ${failedLabels}`;
  }

  // Actionable recommendations
  if (missingChecks.length > 0) {
    actionableRecommendations.push(
      `Complete ${missingChecks.map(c => c.label).slice(0, 3).join(', ')} in your profile to instantly verify eligibility.`
    );
  }
  if (status === 'eligible') {
    if (scheme.documentsRequired?.length) {
      actionableRecommendations.push(
        `Prepare key documents for application: ${scheme.documentsRequired.slice(0, 3).join(', ')}.`
      );
    } else {
      actionableRecommendations.push('Check the official portal to begin your direct application.');
    }
  }
  if (status === 'not_eligible') {
    if (failedChecks.some(c => c.field === 'state')) {
      actionableRecommendations.push('Look for equivalent state-specific welfare programs in your home state.');
    }
    if (failedChecks.some(c => c.field === 'annualIncome')) {
      actionableRecommendations.push('Explore central schemes that do not impose household income ceilings.');
    }
  }

  return {
    status,
    matchScore,
    checks,
    passedChecks,
    failedChecks,
    missingChecks,
    passedCount: passedChecks.length,
    failedCount: failedChecks.length,
    missingCount: missingChecks.length,
    knownChecks: known,
    criticalFailureReasons,
    requirementSummary,
    actionableRecommendations
  };
}

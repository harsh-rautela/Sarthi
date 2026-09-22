import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Scheme from './models/Scheme.js';

const schemes = [
  // 1. PM-KISAN
  {
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    slug: 'pm-kisan-samman-nidhi',
    description: 'Central government income support scheme providing ₹6,000 per year in three equal installments to all landholding farmer families across India.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    department: 'Department of Agriculture and Farmers Welfare',
    category: 'Agriculture',
    level: 'Central',
    applicableStates: [],
    benefits: [
      '₹6,000 annual direct income support in three equal installments of ₹2,000',
      '100% centrally funded Direct Benefit Transfer (DBT) directly into Aadhaar-seeded bank accounts',
      'Provides financial cushion for purchasing high-grade seeds, fertilizers, and farm inputs'
    ],
    documentsRequired: [
      'Aadhaar Card of the applicant',
      'Land ownership records (Khasra / Khatauni / RoR)',
      'Aadhaar-seeded active bank account passbook',
      'Valid mobile number linked with Aadhaar'
    ],
    applicationProcess: [
      'Visit the official PM-KISAN portal (pmkisan.gov.in) or nearest CSC center',
      'Click on "New Farmer Registration" and enter Aadhaar number & state',
      'Fill landholding and village details as recorded in revenue documents',
      'Submit the application; verification is completed by State Nodal Revenue Officers'
    ],
    eligibility: {
      age: { min: 18 },
      farmerRequired: true,
      occupations: ['Farmer']
    },
    officialUrl: 'https://pmkisan.gov.in/',
    sourceUrl: 'https://pmkisan.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 2. PMFBY
  {
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    slug: 'pm-fasal-bima-yojana',
    description: 'Comprehensive crop insurance coverage against non-preventable natural risks from pre-sowing to post-harvest stages for notified crops.',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    department: 'Department of Agriculture and Farmers Welfare',
    category: 'Agriculture',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'Very low farmer share of premium: max 2% for Kharif crops, 1.5% for Rabi crops, and 5% for annual commercial/horticultural crops',
      'Comprehensive risk cover for localized calamities, prevented sowing, and post-harvest losses due to cyclonic/unseasonal rains',
      'Fast automated claim settlements powered by satellite imagery and remote sensing'
    ],
    documentsRequired: [
      'Land revenue passbook / Patta / Tenancy agreement',
      'Sowing certificate issued by village revenue officer or Patwari',
      'Aadhaar Card',
      'Bank passbook showing IFSC code'
    ],
    applicationProcess: [
      'Enroll through your bank branch if you have an active Kisan Credit Card (KCC)',
      'Non-loanee farmers can register on pmfby.gov.in or through village Common Service Centers (CSC)',
      'Submit crop details and pay the minimal farmer premium before seasonal cutoff dates'
    ],
    eligibility: {
      age: { min: 18 },
      farmerRequired: true,
      occupations: ['Farmer']
    },
    officialUrl: 'https://pmfby.gov.in/',
    sourceUrl: 'https://pmfby.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 3. Mukhyamantri Kisan Kalyan Yojana (MP)
  {
    name: 'Mukhyamantri Kisan Kalyan Yojana (Madhya Pradesh)',
    slug: 'mp-mukhyamantri-kisan-kalyan-yojana',
    description: 'State government top-up assistance of ₹4,000 per year for PM-KISAN beneficiary farmers registered in Madhya Pradesh.',
    ministry: 'Department of Farmer Welfare and Agriculture Development, MP',
    department: 'Revenue Department MP',
    category: 'Agriculture',
    level: 'State',
    applicableStates: ['Madhya Pradesh'],
    benefits: [
      'Additional ₹4,000 per year transferred in two equal installments of ₹2,000',
      'Combined with PM-KISAN, eligible farmers in MP receive a total of ₹10,000 annually',
      'Direct Benefit Transfer without any intermediary commission'
    ],
    documentsRequired: [
      'Samagra Member ID and Family ID',
      'Aadhaar Card',
      'MP Land Revenue Record / B-1 Khasra copy',
      'PM-KISAN Beneficiary Registration ID'
    ],
    applicationProcess: [
      'Contact your local area Patwari or Gram Panchayat secretary',
      'Apply online on the SAARA MP portal (saara.mp.gov.in)',
      'Verification conducted by Tahsildar followed by direct fund release'
    ],
    eligibility: {
      age: { min: 18 },
      states: ['Madhya Pradesh'],
      farmerRequired: true,
      occupations: ['Farmer']
    },
    officialUrl: 'https://saara.mp.gov.in/',
    sourceUrl: 'https://saara.mp.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 4. Rythu Bharosa / Rythu Bandhu (Telangana)
  {
    name: 'Rythu Bharosa Investment Support Scheme (Telangana)',
    slug: 'telangana-rythu-bharosa',
    description: 'Flagship financial investment support scheme for agriculture and horticulture farmers in Telangana offering ₹10,000+ per acre annually.',
    ministry: 'Department of Agriculture & Cooperation, Telangana',
    department: 'Telangana Agriculture Commission',
    category: 'Agriculture',
    level: 'State',
    applicableStates: ['Telangana'],
    benefits: [
      'Direct investment grant of ₹10,000 per acre per year (split into two crop seasons)',
      'Covers procurement of fertilizers, seeds, pesticides, and field labor',
      'No repayment obligation — pure agricultural grant assistance'
    ],
    documentsRequired: [
      'Dharani Pattadar Passbook',
      'Aadhaar Card',
      'Bank account details linked to Dharani portal',
      'Active mobile number'
    ],
    applicationProcess: [
      'Beneficiary list generated automatically from verified land records on Dharani portal',
      'New land buyers can submit their Pattadar passbook details to the local Agriculture Extension Officer (AEO)',
      'Funds are credited directly to the verified bank account before sowing seasons'
    ],
    eligibility: {
      age: { min: 18 },
      states: ['Telangana'],
      farmerRequired: true,
      occupations: ['Farmer']
    },
    officialUrl: 'https://rythubandhu.telangana.gov.in/',
    sourceUrl: 'https://rythubandhu.telangana.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 5. Ayushman Bharat PM-JAY
  {
    name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    slug: 'ayushman-bharat-pm-jay',
    description: 'The world\'s largest government-funded health assurance scheme providing ₹5 Lakh per family per year for secondary and tertiary care hospitalization.',
    ministry: 'Ministry of Health and Family Welfare',
    department: 'National Health Authority (NHA)',
    category: 'Healthcare',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'Cashless hospital coverage of up to ₹5,00,000 per family per year',
      'Covers up to 3 days of pre-hospitalization and 15 days of post-hospitalization expenses including diagnostic tests and medications',
      'Accepted across 28,000+ empaneled public and private hospitals across India without geographic restrictions'
    ],
    documentsRequired: [
      'Aadhaar Card or Government Photo Identity Card',
      'Ration Card / BPL card / NFSA verification letter',
      'Proof of family relationship (if applying for dependents)'
    ],
    applicationProcess: [
      'Verify family entitlement on beneficiary.nha.gov.in or via the Ayushman App',
      'Visit any empaneled hospital and meet the Ayushman Mitra helpdesk',
      'Complete biometric e-KYC and receive the Golden Ayushman Card instantly'
    ],
    eligibility: {
      income: { max: 250000 },
      bplRequired: true
    },
    officialUrl: 'https://pmjay.gov.in/',
    sourceUrl: 'https://pmjay.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 6. Mahatma Jyotirao Phule Jan Arogya Yojana (Maharashtra)
  {
    name: 'Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)',
    slug: 'maharashtra-mjpjay-health',
    description: 'Universal state health insurance scheme in Maharashtra providing quality cashless inpatient medical treatment to vulnerable families.',
    ministry: 'Public Health Department, Government of Maharashtra',
    department: 'State Health Assurance Society',
    category: 'Healthcare',
    level: 'State',
    applicableStates: ['Maharashtra'],
    benefits: [
      'Cashless hospitalization benefit up to ₹5,00,000 per family per policy year',
      'Includes 996 medical procedures and surgeries across 30 specialized medical fields',
      'Covers consultation, diagnostics, ICU bed charges, implants, and medicines'
    ],
    documentsRequired: [
      'Yellow or Orange Ration Card issued by Government of Maharashtra',
      'Aadhaar Card or Voter ID Card',
      'Medical referral letter or diagnosis report from attending doctor'
    ],
    applicationProcess: [
      'Approach the "Arogyamitra" kiosk at any empaneled district hospital or private medical center in Maharashtra',
      'Submit valid ration card and biometric identity',
      'Hospital coordinates e-preauthorization with insurance society'
    ],
    eligibility: {
      states: ['Maharashtra'],
      income: { max: 150000 }
    },
    officialUrl: 'https://www.jeevandayee.gov.in/',
    sourceUrl: 'https://www.jeevandayee.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 7. National Merit Scholarship
  {
    name: 'National Merit Scholarship for Higher Education',
    slug: 'national-merit-scholarship-higher-education',
    description: 'Central sector scholarship scheme for college and university students to support meritorious students from low-income families during graduation and post-graduation.',
    ministry: 'Ministry of Education',
    department: 'Department of Higher Education',
    category: 'Education',
    level: 'Central',
    applicableStates: [],
    benefits: [
      '₹12,000 per annum at Undergraduate level for the first 3 years of college',
      '₹20,000 per annum at Postgraduate level',
      'Credited directly to the student\'s verified bank account through DBT'
    ],
    documentsRequired: [
      'Class 12th marksheet (scoring above 80th percentile of respective State Board)',
      'Income Certificate issued by competent revenue authority (below ₹4.5 Lakhs)',
      'College Bonafide Certificate / Admission Fee Receipt',
      'Student\'s personal bank account passbook with IFSC code'
    ],
    applicationProcess: [
      'Register on the National Scholarship Portal (scholarships.gov.in)',
      'Select "Central Sector Scheme of Scholarship for College and University Students"',
      'Submit academic scores and institutional AISHE code',
      'Application verified by the college verification officer followed by State Nodal Officer'
    ],
    eligibility: {
      age: { min: 17, max: 28 },
      income: { max: 450000 },
      occupations: ['Student'],
      education: ['Undergraduate', 'Postgraduate']
    },
    officialUrl: 'https://scholarships.gov.in/',
    sourceUrl: 'https://scholarships.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 8. Post-Matric Scholarship for SC/ST
  {
    name: 'Post-Matric Scholarship Scheme for SC and ST Students',
    slug: 'post-matric-scholarship-sc-st',
    description: 'Centrally sponsored scholarship scheme covering compulsory non-refundable fees and monthly maintenance allowances for SC/ST students pursuing post-matric education.',
    ministry: 'Ministry of Social Justice and Empowerment',
    department: 'Department of Social Justice',
    category: 'Education',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'Complete tuition fee waiver and reimbursement of non-refundable college fees',
      'Monthly maintenance allowance ranging from ₹4,000 to ₹13,500 per year depending on course category',
      'Additional book grants and study tour allowances for technical/professional degrees'
    ],
    documentsRequired: [
      'Valid Caste Certificate (SC/ST) issued by competent Tehsildar/SDM',
      'Income Certificate showing annual family income up to ₹2,50,000',
      'Previous educational marksheet and current college fee receipt',
      'Aadhaar card seeded with bank account'
    ],
    applicationProcess: [
      'Apply online on your state scholarship portal or the central NSP portal',
      'Upload digital caste certificate, income proof, and marksheet',
      'College scholarship committee verifies documents; scholarship credited via PFMS'
    ],
    eligibility: {
      age: { min: 16, max: 35 },
      income: { max: 250000 },
      socialCategories: ['SC', 'ST'],
      occupations: ['Student'],
      education: ['Undergraduate', 'Postgraduate', 'Diploma']
    },
    officialUrl: 'https://scholarships.gov.in/',
    sourceUrl: 'https://scholarships.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 9. NMMSS
  {
    name: 'National Means-cum-Merit Scholarship Scheme (NMMSS)',
    slug: 'national-means-cum-merit-scholarship-school',
    description: 'School scholarship scheme intended to prevent dropouts at class 8 and encourage economically weaker students to continue study through secondary stage.',
    ministry: 'Ministry of Education',
    department: 'Department of School Education & Literacy',
    category: 'Education',
    level: 'Central',
    applicableStates: [],
    benefits: [
      '₹12,000 per annum (₹1,000 per month) provided from Class 9 to Class 12',
      'Direct transfer to student\'s account in State Bank of India or nationalized bank',
      'Renewable every year upon scoring minimum 55% marks'
    ],
    documentsRequired: [
      'Class 7/8 marksheet with minimum 55% aggregate (50% for SC/ST)',
      'Parental Income Certificate below ₹3,50,000 per annum',
      'NMMSS Competitive Selection Examination scorecard',
      'Aadhaar card'
    ],
    applicationProcess: [
      'Appear for the State-level NMMSS selection test conducted during Class 8',
      'Selected candidates register on National Scholarship Portal (scholarships.gov.in)',
      'School principal verifies registration on NSP for direct benefit transfer'
    ],
    eligibility: {
      age: { min: 12, max: 18 },
      income: { max: 350000 },
      occupations: ['Student'],
      education: ['School']
    },
    officialUrl: 'https://scholarships.gov.in/',
    sourceUrl: 'https://scholarships.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 10. Kanyashree Prakalpa (West Bengal)
  {
    name: 'Kanyashree Prakalpa (West Bengal)',
    slug: 'west-bengal-kanyashree-prakalpa',
    description: 'State government conditional cash transfer initiative in West Bengal to upgrade the status of girls and prevent early child marriage.',
    ministry: 'Department of Women & Child Development and Social Welfare, WB',
    department: 'Kanyashree Project Directorate',
    category: 'Education',
    level: 'State',
    applicableStates: ['West Bengal'],
    benefits: [
      'K1: Annual scholarship of ₹1,000 to female students aged 13-18 enrolled in classes 8-12',
      'K2: One-time grant of ₹25,000 upon turning 18, conditional on staying unmarried and enrolled in higher education or vocational course'
    ],
    documentsRequired: [
      'Birth Certificate issued by municipal authority / Gram Panchayat',
      'Declaration of unmarried status certified by parent / guardian',
      'Proof of schooling / college enrollment in West Bengal',
      'Student\'s bank passbook in their own name'
    ],
    applicationProcess: [
      'Collect Form K1 or K2 from the school headmaster or college principal',
      'Institution reviews, stamps, and uploads application to wb.kanyashree.gov.in',
      'Direct benefit transfer credited through District Magistrate portal'
    ],
    eligibility: {
      age: { min: 13, max: 19 },
      genders: ['Female'],
      states: ['West Bengal'],
      occupations: ['Student'],
      maritalStatuses: ['Single']
    },
    officialUrl: 'https://www.wbkanyashree.gov.in/',
    sourceUrl: 'https://www.wbkanyashree.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 11. Delhi Ladli Scheme
  {
    name: 'Delhi Ladli Scheme',
    slug: 'delhi-ladli-scheme',
    description: 'Government of NCT of Delhi financial scheme to empower girl children by creating deposits at major institutional education milestones.',
    ministry: 'Department of Women & Child Development, Delhi',
    department: 'Delhi Ladli Cell',
    category: 'Education',
    level: 'State',
    applicableStates: ['Delhi'],
    benefits: [
      'Staged financial assistance of ₹5,000 - ₹11,000 deposited at birth, Class 1, 6, 9, 10, and 12',
      'Accrued corpus reaches up to ₹1,00,000+ upon the girl attaining 18 years and passing Class 10',
      'Secures funds for higher education and vocational skill development'
    ],
    documentsRequired: [
      'Proof of residence in Delhi for at least 3 years',
      'Annual family income certificate below ₹1,00,000',
      'Birth certificate of the girl child',
      'School admission receipt from recognized Delhi school'
    ],
    applicationProcess: [
      'Obtain application form from the school principal or district WCD office',
      'Submit attested documents through the school administration',
      'State Bank of India issues insurance/fixed deposit bond certificate'
    ],
    eligibility: {
      age: { min: 0, max: 21 },
      genders: ['Female'],
      states: ['Delhi'],
      income: { max: 100000 }
    },
    officialUrl: 'http://wcd.delhi.gov.in/',
    sourceUrl: 'http://wcd.delhi.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 12. Tamil Nadu Pudhumai Penn
  {
    name: 'Pudhumai Penn Higher Education Scheme (Tamil Nadu)',
    slug: 'tamil-nadu-pudhumai-penn-scheme',
    description: 'Tamil Nadu state initiative providing ₹1,000 per month to female students who studied from Class 6 to 12 in government schools to pursue higher degrees.',
    ministry: 'Social Welfare and Women Empowerment Department, TN',
    department: 'Directorate of Social Welfare',
    category: 'Education',
    level: 'State',
    applicableStates: ['Tamil Nadu'],
    benefits: [
      '₹1,000 per month credited directly to the student\'s bank account throughout their degree/diploma program',
      'Ensures zero financial barriers for girls entering engineering, arts, science, and medical colleges'
    ],
    documentsRequired: [
      'Bonafide study certificate verifying schooling from 6th to 12th in TN government schools',
      'Current college admission allotment order / ID card',
      'Aadhaar Card',
      'Student bank account details'
    ],
    applicationProcess: [
      'Apply online through the dedicated college nodal officer on penkalvi.tn.gov.in',
      'Verification completed against EMIS school database records',
      'Monthly payment released on the 1st of every month via DBT'
    ],
    eligibility: {
      age: { min: 17, max: 26 },
      genders: ['Female'],
      states: ['Tamil Nadu'],
      education: ['Undergraduate', 'Diploma'],
      occupations: ['Student']
    },
    officialUrl: 'https://penkalvi.tn.gov.in/',
    sourceUrl: 'https://penkalvi.tn.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 13. PM SVANidhi
  {
    name: 'PM SVANidhi (Micro-credit for Street Vendors)',
    slug: 'pm-svanidhi-street-vendors',
    description: 'Special micro-credit facility empowering urban street vendors with collateral-free working capital loans and digital transaction cashback incentives.',
    ministry: 'Ministry of Housing and Urban Affairs',
    department: 'Urban Livelihoods Division',
    category: 'MSME',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'First tranche working capital loan of ₹10,000 without any collateral or processing fee',
      'Second tranche up to ₹20,000 and third tranche up to ₹50,000 on timely repayments',
      '7% interest subsidy credited directly to bank account quarterly',
      'Digital transaction cashback up to ₹1,200 per year (₹100/month)'
    ],
    documentsRequired: [
      'Certificate of Vending or Identity Card issued by Urban Local Body (ULB)',
      'Letter of Recommendation (LoR) from Town Vending Committee (TVC)',
      'Aadhaar Card',
      'Bank passbook or statement'
    ],
    applicationProcess: [
      'Apply online on pmsvanidhi.mohua.gov.in or visit a nearby CSC center',
      'Select preferred lending partner bank or NBFC',
      'Urban Local Body validates vending status and loan is sanctioned within 7 working days'
    ],
    eligibility: {
      age: { min: 18 },
      ruralUrban: ['Urban'],
      occupations: ['Self-employed', 'Entrepreneur', 'Business Owner']
    },
    officialUrl: 'https://pmsvanidhi.mohua.gov.in/',
    sourceUrl: 'https://pmsvanidhi.mohua.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 14. PM MUDRA Yojana
  {
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    slug: 'pm-mudra-yojana-loans',
    description: 'Collateral-free micro loans up to ₹10 Lakhs for non-corporate, non-farm small and micro enterprises across manufacturing, trading, and service sectors.',
    ministry: 'Ministry of Finance',
    department: 'Department of Financial Services',
    category: 'Entrepreneurship',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'Shishu loan: Loans up to ₹50,000 for early-stage or tiny startups with zero processing fees',
      'Kishore loan: Loans from ₹50,000 to ₹5,00,000 for expanding equipment and working inventory',
      'Tarun loan: Loans from ₹5,00,000 to ₹10,00,000 for established small businesses',
      'MUDRA Debit Card provided for immediate working capital withdrawals'
    ],
    documentsRequired: [
      'Identity and address proof (Aadhaar / Voter ID / Driving License)',
      'Proof of business establishment / Udyam Registration Certificate',
      'Quotations of machinery or inventory to be purchased',
      'Past 6 months bank statement'
    ],
    applicationProcess: [
      'Submit loan application to any commercial bank, regional rural bank, or micro-finance institution',
      'Or apply digitally on the unified portal (udyamimitra.in)',
      'Bank assesses credit viability and releases sanction letter without collateral'
    ],
    eligibility: {
      age: { min: 18, max: 65 },
      occupations: ['Self-employed', 'Entrepreneur', 'Business Owner']
    },
    officialUrl: 'https://www.mudra.org.in/',
    sourceUrl: 'https://www.mudra.org.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 15. Stand-Up India
  {
    name: 'Stand-Up India Scheme for Women and SC/ST Entrepreneurs',
    slug: 'stand-up-india-women-sc-st',
    description: 'Bank credit facilitation between ₹10 Lakh and ₹1 Crore for greenfield enterprises set up by at least one SC/ST or woman entrepreneur.',
    ministry: 'Ministry of Finance',
    department: 'Department of Financial Services',
    category: 'Entrepreneurship',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'Composite loan (term loan and working capital) between ₹10 Lakh and ₹100 Lakh',
      'Covers up to 85% of total project cost for greenfield enterprises',
      'Credit guarantee support through NCGTC minimizing collateral friction'
    ],
    documentsRequired: [
      'Caste Certificate (for SC/ST) or proof of female enterprise majority ownership (>51%)',
      'Comprehensive Project Report (DPR) detailing financials and business plan',
      'Aadhaar / PAN card',
      'Pollution board clearance or shop & establishment license'
    ],
    applicationProcess: [
      'Register on the Stand-Up Mitra portal (standupmitra.in)',
      'Opt for handholding support if needed for DPR preparation and training',
      'Application routed to designated scheduled commercial bank branch for credit assessment'
    ],
    eligibility: {
      age: { min: 18 },
      genders: ['Female'],
      socialCategories: ['SC', 'ST', 'General', 'OBC', 'EWS'],
      occupations: ['Entrepreneur', 'Business Owner', 'Self-employed']
    },
    officialUrl: 'https://www.standupmitra.in/',
    sourceUrl: 'https://www.standupmitra.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 16. Ladli Behna Yojana (MP)
  {
    name: 'Mukhyamantri Ladli Behna Yojana (Madhya Pradesh)',
    slug: 'mp-ladli-behna-yojana',
    description: 'Direct financial assistance program for women in Madhya Pradesh to foster economic self-reliance and nutrition security.',
    ministry: 'Department of Women & Child Development, MP',
    department: 'Directorate of Women Empowerment',
    category: 'Women & Child',
    level: 'State',
    applicableStates: ['Madhya Pradesh'],
    benefits: [
      'Direct cash transfer of ₹1,250 per month into the beneficiary woman\'s own bank account',
      'Annual financial aid totaling ₹15,000',
      'Direct Benefit Transfer without paperwork deductions'
    ],
    documentsRequired: [
      'Samagra Member ID and Family ID',
      'Aadhaar Card linked to active bank account with DBT enabled',
      'Self-declaration of family income below ₹2.5 Lakhs and not paying income tax'
    ],
    applicationProcess: [
      'Visit registration camp organized in your village Gram Panchayat or urban ward',
      'Operator enters Samagra ID, captures live biometric photo, and verifies Aadhaar DBT link',
      'Beneficiary receives SMS confirmation and monthly payment arrives on the 10th of every month'
    ],
    eligibility: {
      age: { min: 21, max: 60 },
      genders: ['Female'],
      states: ['Madhya Pradesh'],
      income: { max: 250000 }
    },
    officialUrl: 'https://cmladlibahna.mp.gov.in/',
    sourceUrl: 'https://cmladlibahna.mp.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 17. Sukanya Samriddhi Yojana
  {
    name: 'Sukanya Samriddhi Yojana (SSY)',
    slug: 'sukanya-samriddhi-yojana',
    description: 'Small savings deposit scheme dedicated to the girl child offering the highest sovereign interest rate and complete triple-tax exemption.',
    ministry: 'Ministry of Finance',
    department: 'Department of Economic Affairs',
    category: 'Women & Child',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'High government-mandated compound interest rate (8.2% per annum)',
      'Triple tax benefit: exemption under Section 80C on deposits, accrued interest, and maturity amount',
      'Permits 50% partial withdrawal after girl child turns 18 for university higher education'
    ],
    documentsRequired: [
      'Birth certificate of the girl child issued by municipal registrar',
      'Identity and address proof of the guardian (Aadhaar / Passport / Voter ID)',
      'Passport-size photographs of girl child and guardian'
    ],
    applicationProcess: [
      'Visit any post office or authorized commercial bank branch (SBI, PNB, BoB, etc.)',
      'Fill Account Opening Form (SSY-1) and deposit minimum ₹250 initial amount',
      'Bank issues Sukanya Samriddhi Passbook with account number'
    ],
    eligibility: {
      age: { min: 0, max: 10 },
      genders: ['Female']
    },
    officialUrl: 'https://www.indiapost.gov.in/',
    sourceUrl: 'https://www.indiapost.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 18. PMAY-U
  {
    name: 'Pradhan Mantri Awas Yojana - Urban (PMAY-U)',
    slug: 'pm-awas-yojana-urban',
    description: 'Flagship urban mission ensuring all-weather pucca houses to eligible urban families across EWS, LIG, and MIG income tiers.',
    ministry: 'Ministry of Housing and Urban Affairs',
    department: 'Housing for All Mission Directorate',
    category: 'Housing',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'Up to ₹2.67 Lakh upfront interest subsidy on home loans under Credit Linked Subsidy Scheme (CLSS)',
      'Direct central grant of ₹1.5 Lakh per house for Beneficiary-Led Construction (BLC)',
      'Complete civic infrastructure: water supply, sanitation, electricity, and LPG connection'
    ],
    documentsRequired: [
      'Aadhaar card of all family members',
      'Income Certificate / ITR / Salary slip',
      'Affidavit affirming that the family does not own a pucca house anywhere in India',
      'Land revenue title or municipal property tax receipt (for construction component)'
    ],
    applicationProcess: [
      'Apply online through the PMAY-MIS portal (pmaymis.gov.in) or via municipal CSC centers',
      'Municipal corporation conducts field inspection and geo-tagging of the plot',
      'Subsidy credited directly into beneficiary\'s home loan account or bank account in stages'
    ],
    eligibility: {
      age: { min: 18 },
      ruralUrban: ['Urban'],
      income: { max: 600000 }
    },
    officialUrl: 'https://pmaymis.gov.in/',
    sourceUrl: 'https://pmaymis.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 19. PMAY-G
  {
    name: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    slug: 'pm-awas-yojana-gramin',
    description: 'Rural housing mission providing financial grant assistance to homeless and kutcha-house dwelling rural families for pucca home construction.',
    ministry: 'Ministry of Rural Development',
    department: 'Rural Housing Division',
    category: 'Housing',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'Direct financial grant of ₹1,20,000 in plains and ₹1,30,000 in hilly/difficult/northeast states',
      'Additional 90 to 95 days of unskilled labor wages under MGNREGS (approx ₹20,000 - ₹25,000)',
      'Additional ₹12,000 financial aid for construction of toilet under Swachh Bharat Mission (SBM)'
    ],
    documentsRequired: [
      'SECC 2011 / Awaas+ verified beneficiary identifier',
      'Aadhaar Card',
      'MGNREGA Job Card',
      'Bank account passbook with IFSC code'
    ],
    applicationProcess: [
      'Gram Sabha reviews and finalizes the beneficiary priority list based on deprivation scores',
      'Block development officer registers beneficiary on the AwaasSoft portal',
      'Geo-tagged photos taken at foundation, lintel, and roof stages release funds automatically in tranches'
    ],
    eligibility: {
      age: { min: 18 },
      ruralUrban: ['Rural'],
      income: { max: 200000 }
    },
    officialUrl: 'https://pmayg.nic.in/',
    sourceUrl: 'https://pmayg.nic.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 20. NAPS
  {
    name: 'National Apprenticeship Promotion Scheme (NAPS)',
    slug: 'national-apprenticeship-promotion-scheme',
    description: 'Skill development scheme offering structured on-the-job training with government stipend reimbursement to build technical skills in young youth.',
    ministry: 'Ministry of Skill Development and Entrepreneurship',
    department: 'Directorate General of Training',
    category: 'Skill Development',
    level: 'Central',
    applicableStates: [],
    benefits: [
      '25% of prescribed monthly stipend up to ₹1,500 per month reimbursed by government to employer',
      'Direct industry work experience in leading manufacturing and service enterprises',
      'National Apprenticeship Certificate (NAC) recognized across public and private sectors'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Educational marksheets (10th / 12th / ITI / Diploma / Degree)',
      'Active bank account details',
      'Curriculum Vitae / Resume'
    ],
    applicationProcess: [
      'Register candidate profile on the Apprenticeship portal (apprenticeshipindia.gov.in)',
      'Browse through verified apprenticeship vacancies by sector and location',
      'Apply online; upon selection, sign tripartite digital apprenticeship contract'
    ],
    eligibility: {
      age: { min: 18, max: 35 },
      occupations: ['Student', 'Unemployed', 'Job Seeker'],
      education: ['School', 'Diploma', 'Undergraduate']
    },
    officialUrl: 'https://www.apprenticeshipindia.gov.in/',
    sourceUrl: 'https://www.apprenticeshipindia.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 21. Yuva Sambal Yojana (Rajasthan)
  {
    name: 'Mukhyamantri Yuva Sambal Yojana (Rajasthan)',
    slug: 'rajasthan-yuva-sambal-yojana',
    description: 'Unemployment allowance and skill development scheme providing monthly monetary aid to educated unemployed graduate youth in Rajasthan.',
    ministry: 'Department of Skill, Employment and Entrepreneurship, Rajasthan',
    department: 'Directorate of Employment',
    category: 'Employment',
    level: 'State',
    applicableStates: ['Rajasthan'],
    benefits: [
      'Monthly unemployment allowance of ₹4,000 for male graduate youth',
      'Monthly allowance of ₹4,500 for female, transgender, and differently-abled graduate youth',
      'Maximum allowance duration of 2 years coupled with 4 hours daily internship at government departments'
    ],
    documentsRequired: [
      'Jan Aadhaar Card / Rajasthan Domicile Certificate',
      'Graduation degree or final marksheet from recognized university',
      'Annual family income certificate below ₹2,00,000',
      'Registration with local district employment exchange'
    ],
    applicationProcess: [
      'Register on the Rajasthan Employment Portal (rojgar.rajasthan.gov.in)',
      'Upload Jan Aadhaar, degree certificate, and tehsildar income verification',
      'Complete skill training or 4-hour daily department internship to unlock monthly stipend'
    ],
    eligibility: {
      age: { min: 21, max: 35 },
      states: ['Rajasthan'],
      employmentStatuses: ['Unemployed', 'Job Seeker'],
      education: ['Undergraduate', 'Postgraduate'],
      income: { max: 200000 }
    },
    officialUrl: 'https://rojgar.rajasthan.gov.in/',
    sourceUrl: 'https://rojgar.rajasthan.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 22. IGNOAPS
  {
    name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
    slug: 'ign-old-age-pension-scheme',
    description: 'National social assistance welfare scheme providing non-contributory monthly pensions to senior citizens living below the poverty line.',
    ministry: 'Ministry of Rural Development',
    department: 'National Social Assistance Programme (NSAP) Division',
    category: 'Social Welfare',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'Monthly pension of ₹200 to ₹500 from central funds, topped up by states to ₹1,000 - ₹2,500 per month',
      'Enhanced central allowance to ₹500/month upon crossing 80 years of age',
      'Direct Benefit Transfer straight into post office or bank savings accounts'
    ],
    documentsRequired: [
      'Proof of age: Aadhaar Card / Voter ID / Birth Certificate confirming 60+ years',
      'BPL Ration Card or SECC BPL list certificate',
      'Bank or Post Office savings account passbook'
    ],
    applicationProcess: [
      'Submit application at the local Block Development Office (BDO) or District Social Welfare Officer',
      'Or submit online on the NSAP portal (nsap.nic.in)',
      'Panchayat or Municipal committee conducts spot verification of living standards'
    ],
    eligibility: {
      age: { min: 60 },
      income: { max: 120000 },
      bplRequired: true
    },
    officialUrl: 'https://nsap.nic.in/',
    sourceUrl: 'https://nsap.nic.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 23. ADIP Scheme
  {
    name: 'Assistance to Disabled Persons for Purchase/Fitting of Aids (ADIP)',
    slug: 'adip-disability-aids-scheme',
    description: 'Centrally sponsored program to provide durable, modern, and standard assistive aids and appliances to needy persons with disabilities.',
    ministry: 'Ministry of Social Justice and Empowerment',
    department: 'Department of Empowerment of Persons with Disabilities',
    category: 'Disability',
    level: 'Central',
    applicableStates: [],
    benefits: [
      '100% free supply of aids and appliances for beneficiaries with monthly income up to ₹15,000',
      '50% aid subsidy for monthly income between ₹15,001 and ₹20,000',
      'Covers motorized tricycles, smart canes, digital hearing aids, braille slates, and customized prosthetics'
    ],
    documentsRequired: [
      'Unique Disability ID (UDID) Card or Disability Certificate showing 40% or above disability',
      'Income Certificate issued by Revenue Authority',
      'Aadhaar Card',
      'Doctor\'s prescription / recommendation for specific assistive device'
    ],
    applicationProcess: [
      'Attend assessment camp organized by ALIMCO or District Disability Rehabilitation Center (DDRC)',
      'Or apply online on the ADIP portal (adip.disabilityaffairs.gov.in)',
      'Undergo medical fitting and receive the specialized assistive device free of cost'
    ],
    eligibility: {
      disabilityRequired: true,
      income: { max: 240000 }
    },
    officialUrl: 'https://adip.disabilityaffairs.gov.in/',
    sourceUrl: 'https://adip.disabilityaffairs.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  },

  // 24. DAY-NRLM
  {
    name: 'Deendayal Antyodaya Yojana - NRLM',
    slug: 'day-nrlm-women-livelihoods',
    description: 'Poverty alleviation program fostering self-help groups (SHGs) and micro-enterprises to empower rural women through community institution building.',
    ministry: 'Ministry of Rural Development',
    department: 'Rural Livelihoods Division',
    category: 'Women & Child',
    level: 'Central',
    applicableStates: [],
    benefits: [
      'Revolving Fund (RF) of ₹20,000 - ₹30,000 per eligible Self-Help Group (SHG)',
      'Community Investment Support Fund (CIF) up to ₹1,50,000 per SHG to finance micro-business ventures',
      'Collateral-free bank loans up to ₹10–20 Lakhs with 7% interest subvention for timely payments'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'SHG Membership Passbook / Resolution',
      'Joint savings bank account details of the SHG',
      'Village residence certificate'
    ],
    applicationProcess: [
      'Join an active women Self-Help Group (SHG) facilitated by the Gram Panchayat Community Resource Person',
      'Participate in regular thrift savings and internal lending for 6 months (Panchasutra practices)',
      'Panchayat federation sanctions credit linkage and provides market access'
    ],
    eligibility: {
      age: { min: 18, max: 65 },
      genders: ['Female'],
      ruralUrban: ['Rural'],
      income: { max: 200000 }
    },
    officialUrl: 'https://aajeevika.gov.in/',
    sourceUrl: 'https://aajeevika.gov.in/',
    sourceType: 'official-page',
    verified: true,
    active: true,
    lastVerifiedAt: new Date()
  }
];

// Persona profiles
const demoCitizen = {
  name: 'Priya Sharma (Student)',
  email: 'demo@schemesathi.local',
  role: 'citizen',
  profile: {
    age: 21,
    gender: 'Female',
    state: 'Delhi',
    district: 'New Delhi',
    occupation: 'Student',
    annualIncome: 180000,
    education: 'Undergraduate',
    socialCategory: 'SC',
    ruralUrban: 'Urban',
    disability: false,
    farmer: false,
    employmentStatus: 'Student',
    maritalStatus: 'Single',
    minority: false,
    bplCard: false,
    student: true
  }
};

const farmerCitizen = {
  name: 'Ramesh Patel (Farmer)',
  email: 'farmer@schemesathi.local',
  role: 'citizen',
  profile: {
    age: 42,
    gender: 'Male',
    state: 'Madhya Pradesh',
    district: 'Sehore',
    occupation: 'Farmer',
    annualIncome: 120000,
    education: 'School',
    socialCategory: 'OBC',
    ruralUrban: 'Rural',
    disability: false,
    farmer: true,
    employmentStatus: 'Self-employed',
    maritalStatus: 'Married',
    minority: false,
    bplCard: false,
    student: false
  }
};

const entrepreneurCitizen = {
  name: 'Sunita Deshmukh (Entrepreneur)',
  email: 'entrepreneur@schemesathi.local',
  role: 'citizen',
  profile: {
    age: 34,
    gender: 'Female',
    state: 'Maharashtra',
    district: 'Pune',
    occupation: 'Entrepreneur',
    annualIncome: 450000,
    education: 'Undergraduate',
    socialCategory: 'General',
    ruralUrban: 'Urban',
    disability: false,
    farmer: false,
    employmentStatus: 'Self-employed',
    maritalStatus: 'Married',
    minority: false,
    bplCard: false,
    student: false
  }
};

const seniorCitizen = {
  name: 'Ram Charan (Senior Citizen)',
  email: 'senior@schemesathi.local',
  role: 'citizen',
  profile: {
    age: 67,
    gender: 'Male',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    occupation: 'Unemployed',
    annualIncome: 60000,
    education: 'School',
    socialCategory: 'SC',
    ruralUrban: 'Rural',
    disability: false,
    farmer: false,
    employmentStatus: 'Unemployed',
    maritalStatus: 'Widowed',
    minority: false,
    bplCard: true,
    student: false
  }
};

const pwdCitizen = {
  name: 'Amit Verma (PwD Job Seeker)',
  email: 'pwd@schemesathi.local',
  role: 'citizen',
  profile: {
    age: 24,
    gender: 'Male',
    state: 'Haryana',
    district: 'Gurugram',
    occupation: 'Job Seeker',
    annualIncome: 150000,
    education: 'Undergraduate',
    socialCategory: 'OBC',
    ruralUrban: 'Urban',
    disability: true,
    farmer: false,
    employmentStatus: 'Job Seeker',
    maritalStatus: 'Single',
    minority: false,
    bplCard: false,
    student: false
  }
};

async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gov_scheme_portal';
  console.log(`Connecting to MongoDB at ${mongoUri}...`);
  await mongoose.connect(mongoUri);

  // Clear schemes and seed 24+ schemes
  await Scheme.deleteMany({});
  const insertedSchemes = await Scheme.insertMany(schemes);
  console.log(`Successfully seeded ${insertedSchemes.length} schemes.`);

  // Passwords
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const demoPassword = await bcrypt.hash('Demo@123', 12);

  // Admin user
  await User.findOneAndUpdate(
    { email: 'admin@schemesathi.local' },
    { name: 'Portal Admin', email: 'admin@schemesathi.local', password: adminPassword, role: 'admin' },
    { upsert: true, new: true }
  );

  // Diverse test personas
  const personas = [demoCitizen, farmerCitizen, entrepreneurCitizen, seniorCitizen, pwdCitizen];
  for (const p of personas) {
    await User.findOneAndUpdate(
      { email: p.email },
      { name: p.name, email: p.email, password: demoPassword, role: p.role, profile: p.profile },
      { upsert: true, new: true }
    );
  }

  console.log('Seeded 5 diverse test personas (password: Demo@123):');
  console.log(' - demo@schemesathi.local (Student / Female / Delhi / SC)');
  console.log(' - farmer@schemesathi.local (Farmer / Male / MP / Rural)');
  console.log(' - entrepreneur@schemesathi.local (Woman Entrepreneur / Maharashtra)');
  console.log(' - senior@schemesathi.local (Senior Citizen / BPL / UP)');
  console.log(' - pwd@schemesathi.local (Person with Disability / Job Seeker / Haryana)');

  await mongoose.disconnect();
  console.log('Seed completed successfully.');
}

seedDatabase().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});

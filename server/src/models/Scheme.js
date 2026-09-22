import mongoose from 'mongoose';

const rangeSchema = new mongoose.Schema({ min: Number, max: Number }, { _id: false });
const eligibilitySchema = new mongoose.Schema({
  age: rangeSchema,
  income: rangeSchema,
  genders: [String],
  states: [String],
  occupations: [String],
  education: [String],
  socialCategories: [String],
  ruralUrban: [String],
  disabilityRequired: { type: Boolean, default: false },
  farmerRequired: { type: Boolean, default: false },
  employmentStatuses: [String],
  maritalStatuses: [String],
  minorityRequired: { type: Boolean, default: false },
  bplRequired: { type: Boolean, default: false },
  districts: [String],
  additionalRules: [String]
}, { _id: false, strict: false });

const schemeSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  ministry: String,
  department: String,
  category: { type: String, required: true, index: true },
  level: { type: String, enum: ['Central', 'State'], default: 'Central' },
  applicableStates: [String],
  benefits: [String],
  documentsRequired: [String],
  applicationProcess: [String],
  eligibility: { type: eligibilitySchema, default: {} },
  officialUrl: String,
  sourceUrl: String,
  sourceType: { type: String, enum: ['official-page', 'official-pdf', 'manual'], default: 'manual' },
  verified: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  lastVerifiedAt: Date
}, { timestamps: true });

schemeSchema.index({ name: 'text', description: 'text', category: 'text', ministry: 'text' });
export default mongoose.model('Scheme', schemeSchema);

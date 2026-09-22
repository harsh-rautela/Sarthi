import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  age: Number,
  gender: String,
  state: String,
  district: String,
  occupation: String,
  annualIncome: Number,
  education: String,
  socialCategory: String,
  ruralUrban: String,
  disability: { type: Boolean, default: false },
  farmer: { type: Boolean, default: false },
  employmentStatus: String,
  maritalStatus: String,
  minority: { type: Boolean, default: false },
  bplCard: { type: Boolean, default: false },
  student: { type: Boolean, default: false }
}, { _id: false, strict: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
  profile: { type: profileSchema, default: {} }
}, { timestamps: true });

export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';
const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true }
}, { timestamps: true });
bookmarkSchema.index({ user: 1, scheme: 1 }, { unique: true });
export default mongoose.model('Bookmark', bookmarkSchema);

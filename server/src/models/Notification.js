import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['new_scheme', 'scheme_update', 'general'], default: 'general' },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });
export default mongoose.model('Notification', notificationSchema);

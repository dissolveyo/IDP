import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Application', applicationSchema);
import mongoose from 'mongoose';

const userDeviceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mobile', 'desktop', 'tablet'],
    required: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  location: String,
  browser: String,
  os: String
}, {
  timestamps: true
});

// Create index for faster queries
userDeviceSchema.index({ userId: 1 });

export const UserDevice = mongoose.model('UserDevice', userDeviceSchema); 
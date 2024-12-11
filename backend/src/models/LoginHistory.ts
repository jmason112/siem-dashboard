import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  success: {
    type: Boolean,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  location: String,
  device: {
    type: String,
    required: true
  },
  browser: {
    type: String,
    required: true
  }
});

// Create index for faster queries
loginHistorySchema.index({ userId: 1, timestamp: -1 });

export const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema); 
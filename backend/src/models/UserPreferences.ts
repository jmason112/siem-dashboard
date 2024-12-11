import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    ref: 'User'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  language: {
    type: String,
    enum: ['en', 'es', 'fr', 'de', 'ja'],
    default: 'en'
  },
  notifications: {
    channels: [{
      type: String,
      enum: ['email', 'sms', 'push', 'in_app']
    }],
    alerts: { type: Boolean, default: true },
    updates: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  fontSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  contrast: {
    type: String,
    enum: ['normal', 'high'],
    default: 'normal'
  },
  layout: {
    type: String,
    enum: ['compact', 'comfortable', 'spacious'],
    default: 'comfortable'
  },
  reducedMotion: {
    type: Boolean,
    default: false
  },
  screenReader: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema); 
import { z } from 'zod';

export const languageSchema = z.enum(['en', 'es', 'fr', 'de', 'ja']);
export type Language = z.infer<typeof languageSchema>;

export const themeSchema = z.enum(['light', 'dark', 'system']);
export type Theme = z.infer<typeof themeSchema>;

export const notificationChannelSchema = z.enum(['email', 'sms', 'push', 'in_app']);
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;

export const fontSizeSchema = z.enum(['small', 'medium', 'large']);
export type FontSize = z.infer<typeof fontSizeSchema>;

export const contrastSchema = z.enum(['normal', 'high']);
export type Contrast = z.infer<typeof contrastSchema>;

export const layoutSchema = z.enum(['compact', 'comfortable', 'spacious']);
export type Layout = z.infer<typeof layoutSchema>;

export type UserPreferences = {
  theme: Theme;
  language: Language;
  notifications: {
    channels: NotificationChannel[];
    alerts: boolean;
    updates: boolean;
    marketing: boolean;
  };
  timezone: string;
  fontSize: FontSize;
  contrast: Contrast;
  layout: Layout;
  reducedMotion: boolean;
  screenReader: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  twoFactorEnabled: boolean;
};

export type ConnectedDevice = {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  lastActive: Date;
  location?: string;
  browser?: string;
  os?: string;
};

export type LoginHistory = {
  id: string;
  timestamp: Date;
  success: boolean;
  ip: string;
  location?: string;
  device: string;
  browser: string;
};
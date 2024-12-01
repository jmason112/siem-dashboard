import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserPreferences,
  UserProfile,
  ConnectedDevice,
  LoginHistory,
} from '../types/settings';

interface SettingsState {
  preferences: UserPreferences;
  profile: UserProfile;
  devices: ConnectedDevice[];
  loginHistory: LoginHistory[];
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  removeDevice: (deviceId: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      preferences: {
        theme: 'system',
        language: 'en',
        notifications: {
          channels: ['email', 'in_app'],
          alerts: true,
          updates: true,
          marketing: false,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        fontSize: 'medium',
        contrast: 'normal',
        layout: 'comfortable',
        reducedMotion: false,
        screenReader: false,
      },
      profile: {
        id: '1',
        email: 'user@example.com',
        name: 'John Doe',
        twoFactorEnabled: false,
      },
      devices: [
        {
          id: '1',
          name: 'Chrome on Windows',
          type: 'desktop',
          lastActive: new Date(),
          location: 'New York, USA',
          browser: 'Chrome',
          os: 'Windows',
        },
      ],
      loginHistory: [
        {
          id: '1',
          timestamp: new Date(),
          success: true,
          ip: '192.168.1.1',
          location: 'New York, USA',
          device: 'Desktop',
          browser: 'Chrome',
        },
      ],
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),
      updateProfile: (newProfile) =>
        set((state) => ({
          profile: { ...state.profile, ...newProfile },
        })),
      removeDevice: (deviceId) =>
        set((state) => ({
          devices: state.devices.filter((device) => device.id !== deviceId),
        })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
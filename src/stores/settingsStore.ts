import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserPreferences,
  UserProfile,
  ConnectedDevice,
  LoginHistory,
} from '../types/settings';
import { useAuth } from '../lib/auth';

interface SettingsState {
  preferences: UserPreferences;
  profile: UserProfile | null;
  devices: ConnectedDevice[];
  loginHistory: LoginHistory[];
  isLoading: boolean;
  error: string | null;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateProfile: (profile: Partial<Omit<UserProfile, 'id'>>) => Promise<void>;
  removeDevice: (deviceId: string) => Promise<void>;
  fetchUserSettings: () => Promise<void>;
  setError: (error: string | null) => void;
}

const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
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
      profile: null,
      devices: [],
      loginHistory: [],
      isLoading: false,
      error: null,

      setError: (error) => set({ error }),

      fetchUserSettings: async () => {
        const user = useAuth.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          const [prefsRes, devicesRes, historyRes] = await Promise.all([
            fetch(`${API_BASE_URL}/settings/preferences`, {
              headers: getAuthHeaders(),
            }),
            fetch(`${API_BASE_URL}/settings/devices`, {
              headers: getAuthHeaders(),
            }),
            fetch(`${API_BASE_URL}/settings/login-history`, {
              headers: getAuthHeaders(),
            })
          ]);

          if (!prefsRes.ok || !devicesRes.ok || !historyRes.ok) {
            throw new Error('Failed to fetch settings');
          }

          const [preferences, devices, loginHistory] = await Promise.all([
            prefsRes.json(),
            devicesRes.json(),
            historyRes.json()
          ]);

          set({
            preferences: { ...get().preferences, ...preferences },
            devices,
            loginHistory,
            profile: {
              id: user.id,
              email: user.email,
              name: user.name,
              twoFactorEnabled: user.twoFactorEnabled || false,
              avatar: user.avatar,
              phone: user.phone
            }
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
          set({ isLoading: false });
        }
      },

      updatePreferences: async (newPreferences) => {
        const user = useAuth.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/settings/preferences`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(newPreferences),
          });

          if (!response.ok) {
            throw new Error('Failed to update preferences');
          }

          const updatedPreferences = await response.json();
          set((state) => ({
            preferences: { ...state.preferences, ...updatedPreferences },
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (newProfile) => {
        const user = useAuth.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/settings/profile`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(newProfile),
          });

          if (!response.ok) {
            throw new Error('Failed to update profile');
          }

          const updatedProfile = await response.json();
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...updatedProfile } : updatedProfile,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeDevice: async (deviceId) => {
        const user = useAuth.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/settings/devices/${deviceId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to remove device');
          }

          set((state) => ({
            devices: state.devices.filter((device) => device.id !== deviceId),
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
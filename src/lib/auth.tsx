import { create } from "zustand";
import { api } from "./api";

interface User {
  id: string;
  name: string;
  email: string;
  twoFactorEnabled?: boolean;
  avatar?: string;
  phone?: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  checkAuth: async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const response = await api.auth.me();
        const userData = response.data.user;
        set({ user: userData });
        localStorage.setItem("userId", userData.id);
      }
    } catch (error) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("userId");
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ error: null });
      const response = await api.auth.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("userId", user.id);
      set({ user });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to sign in";
      set({ error: errorMsg });
      throw error;
    }
  },

  signUp: async (name: string, email: string, password: string) => {
    try {
      set({ error: null });
      const response = await api.auth.register({ name, email, password });
      const { token, user } = response.data;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("userId", user.id);
      set({ user });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to sign up";
      set({ error: errorMsg });
      throw error;
    }
  },

  signOut: async () => {
    try {
      await api.auth.logout();
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("userId");
      set({ user: null });
    }
  },
}));

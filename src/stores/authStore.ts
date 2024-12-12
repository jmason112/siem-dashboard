import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const getAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('token'),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  clearToken: () => {
    localStorage.removeItem('token');
    set({ token: null });
  },
})); 
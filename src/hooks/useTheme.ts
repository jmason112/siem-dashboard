import { create } from 'zustand';

type ThemeStore = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const useTheme = create<ThemeStore>((set) => ({
  theme: 'light',
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark');
      return { theme: newTheme };
    }),
}));
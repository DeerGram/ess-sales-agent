import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface EmberState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useEmberStore = create<EmberState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}));

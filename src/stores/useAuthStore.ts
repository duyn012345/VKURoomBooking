import type { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { Profile } from '../types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  updateProfile: (updated: Partial<Profile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  updateProfile: (updated) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updated } : null,
    })),
  logout: () => set({ user: null, profile: null }),
}));
import { create } from 'zustand';

import { getCurrentUser, login, logout } from '@/services/authService';
import type { AuthState, LoginCredentials } from '@/types/auth';

interface AuthStore extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<boolean>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  signIn: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await login(credentials);
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '登录失败，请稍后重试',
      });
      return false;
    }
  },
  signOut: async () => {
    set({ isLoading: true });
    await logout();
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },
  restoreSession: async () => {
    set({ isLoading: true });
    const user = await getCurrentUser();
    set({ user, isAuthenticated: user !== null, isLoading: false });
  },
  clearError: () => set({ error: null }),
}));

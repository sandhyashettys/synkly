import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/lib/api';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'super_admin' | 'client_admin' | 'staff' | 'viewer';
  companyId?: string;
  companyName?: string;
  avatar?: string;
  plan?: string;
  preferences?: {
    language: string;
    timezone: string;
    currency: string;
    theme: string;
  };
}

interface AuthState {
  user:         User | null;
  token:        string | null;
  refreshToken: string | null;
  isLoading:    boolean;
  isAuthenticated: boolean;

  login:   (email: string, password: string) => Promise<User>;
  logout:  () => void;
  setUser: (user: User) => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      refreshToken:    null,
      isLoading:       false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          localStorage.setItem('synkly_token', data.token);
          localStorage.setItem('synkly_refresh_token', data.refreshToken);
          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return data.user;
        } catch (error: any) {
          set({ isLoading: false });
          throw new Error(error.response?.data?.message || 'Login failed');
        }
      },

      logout: () => {
        localStorage.removeItem('synkly_token');
        localStorage.removeItem('synkly_refresh_token');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      setUser: (user) => set({ user }),

      fetchMe: async () => {
        try {
          const { data } = await authApi.me();
          set({ user: data.user, isAuthenticated: true });
        } catch (_) {
          get().logout();
        }
      },
    }),
    {
      name: 'synkly_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

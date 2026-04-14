import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { removeAuthToken, removeAuthTokenAdmin } from '@/utils/localStorage.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthSuccess: false,
      authUser: null,

      setAuthUser: (payload) => set({
        isAuthSuccess: payload.isAuthSuccess,
        authUser: payload.data
      }),

      logout: () => {
        removeAuthToken();
        removeAuthTokenAdmin();
        set({
          isAuthSuccess: false,
          authUser: null
        });
      },

      getAuthUser: () => get().authUser,
      isAuthenticated: () => get().isAuthSuccess,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthSuccess: state.isAuthSuccess,
        authUser: state.authUser
      }),
    }
  )
)
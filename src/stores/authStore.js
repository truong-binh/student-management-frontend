import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      isAuthAdminSuccess: false,
      authAdmin: {
        x_name: ''
      },
      
      // Actions
      setAuthAdmin: (payload) => set({
        isAuthAdminSuccess: payload.isAuthAdminSuccess,
        authAdmin: payload.data
      }),
      
      logout: () => set({
        isAuthAdminSuccess: false,
        authAdmin: {
          x_name: ''
        }
      }),
      
      // Getters
      getAuthAdmin: () => get().authAdmin,
      isAuthenticated: () => get().isAuthAdminSuccess,
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({ 
        isAuthAdminSuccess: state.isAuthAdminSuccess,
        authAdmin: state.authAdmin 
      }), // only persist these fields
    }
  )
) 
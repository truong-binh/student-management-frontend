import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../api/auth'

export const useAuth = () => {
  const { setAuthAdmin, logout, isAuthenticated, getAuthAdmin } = useAuthStore()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data, variables, context) => {
      setAuthAdmin({
        isAuthAdminSuccess: true,
        data: data.user || data
      })
      // Call custom onSuccess if provided
      if (context?.onSuccess) {
        context.onSuccess(data)
      }
    },
    onError: (error, variables, context) => {
      console.error('Login failed:', error)
      // Call custom onError if provided
      if (context?.onError) {
        context.onError(error)
      }
    }
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout()
    },
    onError: (error) => {
      console.error('Logout failed:', error)
      // Still logout locally even if API call fails
      logout()
    }
  })

  // Check auth status
  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: authApi.checkAuth,
    enabled: isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    // State
    isAuthenticated: isAuthenticated(),
    user: getAuthAdmin(),
    
    // Actions
    login: (data, options = {}) => loginMutation.mutate(data, options),
    logout: logoutMutation.mutate,
    
    // Loading states
    isLoginLoading: loginMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    
    // Error states
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    
    // Auth check
    authQuery,
  }
} 
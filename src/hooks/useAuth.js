import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../api/user/auth'
import { setAuthToken } from '@/utils/localStorage.js'

export const useAuth = () => {
  const { setAuthUser, logout, isAuthenticated, getAuthUser } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const res = await authApi.login(data);
      if (!res.success) throw res;
      return res;
    },
    onSuccess: (res, variables, context) => {
      if (res.data?.token) {
        setAuthToken(res.data.token);
      }
      setAuthUser({
        isAuthSuccess: true,
        data: res.data.user
      })
      if (context?.onSuccess) context.onSuccess(res)
    },
    onError: (error, variables, context) => {
      if (context?.onError) context.onError(error)
    }
  })

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const res = await authApi.register(data);
      if (!res.success) throw res;
      return res;
    },
    onSuccess: (res, variables, context) => {
      if (context?.onSuccess) context.onSuccess(res)
    },
    onError: (error, variables, context) => {
      if (context?.onError) context.onError(error)
    }
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout()
    },
    onError: () => {
      logout()
    }
  })


  const forgotPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const res = await authApi.forgotPassword(data);
      if (!res.success) throw res;
      return res;
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const res = await authApi.resetPassword(data);
      if (!res.success) throw res;
      return res;
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const res = await authApi.changePassword(data);
      if (!res.success) throw res;
      return res;
    }
  });

  return {
    isAuthenticated: isAuthenticated(),
    user: getAuthUser(),
    login: (data, options = {}) => loginMutation.mutate(data, options),
    register: (data, options = {}) => registerMutation.mutate(data, options),
    logout: () => logoutMutation.mutateAsync(),
    forgotPassword: (data, options = {}) => forgotPasswordMutation.mutate(data, options),
    resetPassword: (data, options = {}) => resetPasswordMutation.mutate(data, options),
    changePassword: (data, options = {}) => changePasswordMutation.mutate(data, options),
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    isChangePasswordLoading: changePasswordMutation.isPending,
  };
}
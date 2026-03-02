import { apiAxios } from "@/api/rootApi.js";

export const authApi = {
  register: async (data) => {
    return await apiAxios({
      method: "post",
      url: "/api/auth/register",
      data,
    });
  },

  verifyEmail: async (token) => {
    return await apiAxios({
      method: "get",
      url: "/api/auth/verify-email",
      params: { token }
    });
  },

  login: async (data) => {
    return await apiAxios({
      method: "post",
      url: "/api/auth/login",
      data,
    });
  },

  getMe: async () => {
    return await apiAxios({
      method: "get",
      url: "/api/auth/me",
    });
  },

  logout: async () => {
    return await apiAxios({
      method: "post",
      url: "/api/auth/logout",
    });
  },
  forgotPassword: async (data) => {
    return await apiAxios({
      method: "post",
      url: "/api/auth/forgot-password",
      data,
    });
  },
  resetPassword: async (data) => {
    return await apiAxios({
      method: "post",
      url: "/api/auth/reset-password",
      data,
    });
  },
  changePassword: async (data) => {
    return await apiAxios({
      method: "post",
      url: "/api/auth/change-password",
      data,
    });
  },
};

export const login = authApi.login;
export const register = authApi.register;
export const verifyEmail = authApi.verifyEmail;
export const getMe = authApi.getMe;

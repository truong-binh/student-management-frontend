import { apiAdminAxios } from "@/api/rootApi.js";

export const authApi = {
  // Get current user
  getMe: async (data = {}) => {
    const response = await apiAdminAxios({
      method: "get",
      url: "/admin/auth/me",
      data,
    });
    return response.data;
  },

  // Login
  login: async (data) => {
    const response = await apiAdminAxios({
      method: "post",
      url: "/admin/auth/login",
      data,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiAdminAxios({
      method: "post",
      url: "/admin/auth/logout",
    });
    return response.data;
  },

  // Check auth status (alias for getMe)
  checkAuth: async () => {
    const response = await apiAdminAxios({
      method: "get",
      url: "/admin/auth/me",
    });
    return response.data;
  },
};

// Legacy exports for backward compatibility
export const getMe = authApi.getMe;
export const login = authApi.login;
export const logout = authApi.logout;

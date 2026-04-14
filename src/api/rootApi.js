import axios from "axios";
import { getAuthToken, getAuthTokenAdmin } from "@/utils/localStorage.js";
import { useAuthStore } from "@/stores/authStore";

const baseUrl = import.meta.env.VITE_API_URL;

const formatError = (error) => {
  if (error.response && error.response.data) {
    return error.response.data;
  }

  return {
    status: error.response?.status || 500,
    success: false,
    message: error.message || "Lỗi kết nối máy chủ",
    error: {
      type: "CONNECTION_ERROR",
      details: "Không thể kết nối đến hệ thống. Vui lòng kiểm tra lại đường truyền.",
    }
  };
};

export const apiAxios = axios.create({
  withCredentials: true,
  baseURL: `${baseUrl}`,
  headers: {
    'Content-Type': 'application/json',
  }
});

apiAxios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error)
}
);

apiAxios.interceptors.response.use(function (response) {
  return response.data;
}, function (error) {
  if (error.response?.status === 401) {
    useAuthStore.getState().logout();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
  return Promise.resolve(formatError(error));
});

export const apiAdminAxios = axios.create({
  withCredentials: true,
  baseURL: `${baseUrl}`,
  headers: {
    'Content-Type': 'application/json',
  }
});

apiAdminAxios.interceptors.request.use((config) => {
  const tokenAdmin = getAuthTokenAdmin();
  if (tokenAdmin) {
    config.headers.Authorization = `Bearer ${tokenAdmin}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error)
}
);

apiAdminAxios.interceptors.response.use(function (response) {
  return response.data;
}, function (error) {
  if (error.response?.status === 401) {
    useAuthStore.getState().logout();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }
  return Promise.resolve(formatError(error));
});

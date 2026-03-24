import axios from "axios";
import { getAuthToken, getAuthTokenAdmin } from "@/utils/localStorage.js";

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

apiAxios.interceptors.request.use((request) => {
  const token = getAuthToken();
  request.headers.Authorization = token ? `Bearer ${token}` : "";
  return request
}, (error) => {
  return Promise.reject(error)
}
);

apiAxios.interceptors.response.use(function (response) {
  return response.data;
}, function (error) {
  return Promise.resolve(formatError(error));
});

export const apiAdminAxios = axios.create({
  withCredentials: true,
  baseURL: `${baseUrl}`,
  headers: {
    'Content-Type': 'application/json',
  }
});

apiAdminAxios.interceptors.request.use((request) => {
  const tokenAdmin = getAuthTokenAdmin();
  request.headers.Authorization = tokenAdmin ? `Bearer ${tokenAdmin}` : "";
  return request
}, (error) => {
  return Promise.reject(error)
}
);

apiAdminAxios.interceptors.response.use(function (response) {
  return response.data;
}, function (error) {
  return Promise.resolve(formatError(error));
});

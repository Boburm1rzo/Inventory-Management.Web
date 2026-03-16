import axios from "axios";
import { getToken, removeToken } from "../utils/token";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — token qo'shish
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — xato handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 — token muddati o'tgan yoki invalid
    if (error.response?.status === 401) {
      removeToken();
      const isLoginPage = window.location.pathname.includes("/login");
      const isAuthMe = error.config?.url?.includes("/auth/me");

      if (!isLoginPage && !isAuthMe) {
        window.location.href = "/login";
      }
    }

    // Backend dan kelgan xato message ni olish
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;

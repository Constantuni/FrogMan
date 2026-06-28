// frontend/src/api/axios.ts
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 1. Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 2. Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const isUnauthorized = error.response && error.response.status === 401;
    
    // Check if the request was made to the login endpoint
    const isLoginRequest = error.config && error.config.url?.includes('/api/auth/login');

    // Only force logout/redirect if it's a 401 AND it wasn't a login attempt
    if (isUnauthorized && !isLoginRequest) {
      useAuthStore.getState().logout();
      window.location.href = '/login'; 
    }
    
    // Always reject the promise so the component's catch block can run
    return Promise.reject(error);
  }
);

export default axiosInstance;
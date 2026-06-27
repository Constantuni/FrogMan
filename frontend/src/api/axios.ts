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
    if (error.response && error.response.status === 401) {
      // The token is likely expired or invalid. 
      // 1. Clear the zustand state (which also clears localStorage due to persist)
      useAuthStore.getState().logout();
      
      // 2. Force a redirect to the login page.
      // We use window.location here because we are outside the React Router context.
      window.location.href = '/login'; 
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
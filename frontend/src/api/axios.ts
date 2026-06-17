import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosInstance = axios.create({
  // baseURL: "https://localhost:7212",
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosInstance;
// frontend/src/api/auth.ts
import axiosInstance from "./axios";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/auth";

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>("/api/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await axiosInstance.post<AuthResponse>("/api/auth/register", payload);
  return response.data;
}
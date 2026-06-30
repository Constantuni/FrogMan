// frontend/src/api/errorHelper.ts
import type { ApiErrorResponse } from "../types/auth"; // Adjust import path if needed

export const parseApiError = (err: any) => {
  // Axios's generic error string (e.g., "Network Error" or 500 server crash)
  const fallbackError = err.message || "An unexpected error occurred.";
  
  // If the backend didn't send a response body (e.g., CORS error, server down)
  if (!err.response?.data) {
    return { title: fallbackError, fieldErrors: {} };
  }

  const data = err.response.data as ApiErrorResponse;
  const fieldErrors: Record<string, string[]> = {};

  // Normalize backend validation dictionary keys ("Username" -> "username")
  if (data.errors) {
    for (const key in data.errors) {
      fieldErrors[key.toLowerCase()] = data.errors[key];
    }
  }

  // The hierarchy of fallback messages:
  // 1. Try 'detail' (e.g., "Email is already in use.")
  // 2. Try 'title' (e.g., "One or more validation errors occurred.")
  // 3. Fallback to generic Axios error
  const title = data.detail || data.title || fallbackError;

  return {
    title,
    fieldErrors,
  };
};
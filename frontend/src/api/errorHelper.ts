// frontend/src/api/errorHelper.ts
import type { ApiErrorResponse } from "../types/auth";

export const parseApiError = (err: any) => {
  // Axios's generic error string (e.g., "Request failed with status code 409")
  const fallbackError = err.message || "An unexpected error occurred.";
  
  if (!err.response?.data) {
    return { title: fallbackError, fieldErrors: {} };
  }

  const data = err.response.data as ApiErrorResponse;
  const fieldErrors: Record<string, string[]> = {};

  if (data.errors) {
    for (const key in data.errors) {
      fieldErrors[key.toLowerCase()] = data.errors[key];
    }
  }

  // The hierarchy of fallback messages:
  // 1. Try the simple {"message": "..."} format
  // 2. Try the Problem Details {"title": "..."} format
  // 3. Fallback to the generic Axios error
  const title = data.message || data.title || fallbackError;

  return {
    title,
    fieldErrors,
  };
};
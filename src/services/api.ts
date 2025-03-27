
/**
 * Base API configuration and utilities
 */
import { toast } from "@/components/ui/use-toast";

// API base URL from environment
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Default headers
const defaultHeaders = {
  "Content-Type": "application/json",
};

// Helper for handling API errors
export const handleApiError = (error: unknown) => {
  console.error("API Error:", error);
  
  let message = "An unexpected error occurred";
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }
  
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
  
  return { error: message };
};

// Generic fetch wrapper with error handling
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Combine default and custom headers
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };

    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-success responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.status} ${response.statusText}`
      );
    }

    // Parse response
    const data = await response.json();
    return data as T;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

// Convenience methods for common HTTP methods
export const apiService = {
  get: <T>(endpoint: string, options: RequestInit = {}) => 
    apiFetch<T>(endpoint, { ...options, method: "GET" }),
    
  post: <T>(endpoint: string, data: unknown, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  put: <T>(endpoint: string, data: unknown, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),
    
  delete: <T>(endpoint: string, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

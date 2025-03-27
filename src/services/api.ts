
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

// Extended RequestInit type to include onUploadProgress
interface ExtendedRequestInit extends RequestInit {
  onUploadProgress?: (progressEvent: { loaded: number; total: number }) => void;
}

// Generic fetch wrapper with error handling
export async function apiFetch<T>(
  endpoint: string,
  options: ExtendedRequestInit = {}
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
    
    // Remove custom options before passing to fetch
    const { onUploadProgress, ...fetchOptions } = options;

    // If this is a file upload with progress tracking and FormData body
    if (onUploadProgress && options.body instanceof FormData) {
      // Use XMLHttpRequest for upload progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);
        
        // Add headers
        Object.keys(headers).forEach(key => {
          xhr.setRequestHeader(key, headers[key]);
        });
        
        // Track upload progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onUploadProgress) {
            onUploadProgress({
              loaded: event.loaded,
              total: event.total
            });
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data as T);
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || `API error: ${xhr.status}`));
            } catch (e) {
              reject(new Error(`API error: ${xhr.status}`));
            }
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(options.body as FormData);
      });
    }
    
    // Standard fetch for non-progress tracking requests
    const response = await fetch(url, {
      ...fetchOptions,
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
  get: <T>(endpoint: string, options: ExtendedRequestInit = {}) => 
    apiFetch<T>(endpoint, { ...options, method: "GET" }),
    
  post: <T>(endpoint: string, data: unknown, options: ExtendedRequestInit = {}) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: typeof data === "string" || data instanceof FormData 
        ? data 
        : JSON.stringify(data),
    }),
    
  put: <T>(endpoint: string, data: unknown, options: ExtendedRequestInit = {}) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: typeof data === "string" || data instanceof FormData 
        ? data 
        : JSON.stringify(data),
    }),
    
  delete: <T>(endpoint: string, options: ExtendedRequestInit = {}) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};

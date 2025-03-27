
import { apiService } from "./api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  bio: string;
  avatarUrl?: string;
  storageUsed: number; // percentage
  createdAt: string;
  updatedAt: string;
}

export interface UserStorage {
  totalSize: number; // in bytes
  usedSize: number; // in bytes
  audioFiles: {
    count: number;
    size: number; // in bytes
  };
  images: {
    count: number;
    size: number; // in bytes
  };
}

// Mock user data
const MOCK_USER: UserProfile = {
  id: "user-123",
  name: "John Doe",
  email: "john.doe@example.com",
  username: "johndoe",
  bio: "Music enthusiast and content creator",
  avatarUrl: "/placeholder.svg",
  storageUsed: 28, // percentage
  createdAt: "2023-01-15T12:00:00Z",
  updatedAt: "2023-05-25T15:30:00Z",
};

// Mock storage data
const MOCK_STORAGE: UserStorage = {
  totalSize: 5 * 1024 * 1024 * 1024, // 5GB in bytes
  usedSize: 1.4 * 1024 * 1024 * 1024, // 1.4GB in bytes
  audioFiles: {
    count: 45,
    size: 3.2 * 1024 * 1024 * 1024, // 3.2GB in bytes
  },
  images: {
    count: 62,
    size: 0.8 * 1024 * 1024 * 1024, // 0.8GB in bytes
  },
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  username: string;
  password: string;
}

export const userService = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<{ user: UserProfile; token: string } | null> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Mock login, always succeeds with test credentials
        // In a real app, would validate against correct credentials
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Return mock user data and token
        return {
          user: MOCK_USER,
          token: "mock-jwt-token-xxx-yyy-zzz",
        };
      }
      
      // Actual API implementation
      return await apiService.post<{ user: UserProfile; token: string }>('/auth/login', credentials);
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },
  
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<{ user: UserProfile; token: string } | null> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Mock registration, always succeeds
        // In a real app, would check for existing emails, etc.
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return mocked user with the provided data
        const newUser: UserProfile = {
          ...MOCK_USER,
          name: data.name,
          email: data.email,
          username: data.username,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return {
          user: newUser,
          token: "mock-jwt-token-xxx-yyy-zzz",
        };
      }
      
      // Actual API implementation
      return await apiService.post<{ user: UserProfile; token: string }>('/auth/register', data);
    } catch (error) {
      console.error("Registration error:", error);
      return null;
    }
  },
  
  /**
   * Get the current user's profile
   */
  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return MOCK_USER;
      }
      
      // Actual API implementation
      return await apiService.get<UserProfile>('/user/profile');
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },
  
  /**
   * Update the current user's profile
   */
  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile | null> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Return updated user
        return {
          ...MOCK_USER,
          ...data,
          updatedAt: new Date().toISOString(),
        };
      }
      
      // Actual API implementation
      return await apiService.put<UserProfile>('/user/profile', data);
    } catch (error) {
      console.error("Error updating user profile:", error);
      return null;
    }
  },
  
  /**
   * Get the current user's storage information
   */
  getStorageInfo: async (): Promise<UserStorage | null> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return MOCK_STORAGE;
      }
      
      // Actual API implementation
      return await apiService.get<UserStorage>('/user/storage');
    } catch (error) {
      console.error("Error fetching storage info:", error);
      return null;
    }
  },
  
  /**
   * Change user password
   */
  changePassword: async (
    currentPassword: string, 
    newPassword: string
  ): Promise<boolean> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulate success
        return true;
      }
      
      // Actual API implementation
      await apiService.post('/user/change-password', {
        currentPassword,
        newPassword,
      });
      
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  },
  
  /**
   * Log out the current user
   */
  logout: async (): Promise<boolean> => {
    try {
      // Remove token from localStorage
      localStorage.removeItem("auth_token");
      
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        return true;
      }
      
      // Actual API implementation - may or may not be needed depending on auth strategy
      await apiService.post('/auth/logout', {});
      return true;
    } catch (error) {
      console.error("Error logging out:", error);
      return false;
    }
  }
};

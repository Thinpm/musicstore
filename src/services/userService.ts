
import { supabase } from "@/lib/supabase";
import { apiService } from "./api";
import { Tables } from "@/types/supabase";

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

// Helper to transform Supabase user data to our UserProfile format
const transformUserData = (userData: Tables<'users'>): UserProfile => {
  return {
    id: userData.id,
    name: userData.name || "Unknown User",
    email: userData.email,
    username: userData.email.split('@')[0], // Using email prefix as username
    bio: "", // This could be added to the users table if needed
    avatarUrl: userData.avatar_url || "/placeholder.svg",
    storageUsed: 0, // We'll calculate this in the getStorageInfo method
    createdAt: userData.created_at,
    updatedAt: userData.updated_at || userData.created_at,
  };
};

export const userService = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<{ user: UserProfile; token: string } | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw new Error(error.message);
      
      if (!data.user) throw new Error("No user returned from login");
      
      // Get user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (userError) throw new Error(userError.message);
      
      return {
        user: transformUserData(userData),
        token: data.session!.access_token
      };
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
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw new Error(authError.message);
      
      if (!authData.user) throw new Error("No user returned from registration");
      
      // Create user profile in our users table
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: data.email,
            name: data.name,
            avatar_url: null,
          }
        ])
        .select()
        .single();
        
      if (profileError) throw new Error(profileError.message);
      
      return {
        user: transformUserData(userData),
        token: authData.session!.access_token
      };
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
      // Get current session
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) return null;
      
      // Get user profile from our users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.session.user.id)
        .single();
        
      if (error) throw new Error(error.message);
      
      return transformUserData(userData);
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
      // Get current user ID
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) throw new Error("User not authenticated");
      
      const userId = session.session.user.id;
      
      // Update user profile
      const { data: userData, error } = await supabase
        .from('users')
        .update({
          name: data.name,
          avatar_url: data.avatarUrl,
          // Add other fields as needed
        })
        .eq('id', userId)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      
      return transformUserData(userData);
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
      // Get current session
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) throw new Error("User not authenticated");
      
      const userId = session.session.user.id;
      
      // Get user's songs count and calculate size
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', userId);
        
      if (songsError) throw new Error(songsError.message);
      
      // This is an estimation - in a real app you would store the file size in the songs table
      const songsTotalSize = songsData.length * 5 * 1024 * 1024; // Assuming average 5MB per song
      
      // For this example, we'll assume all files in storage are either audio or images
      // In a real application, you might want to query actual storage usage from Supabase storage
      
      // Placeholder values for image counts - in a real app, query this from a separate table
      const imagesCount = 10;
      const imagesTotalSize = imagesCount * 500 * 1024; // Assuming average 500KB per image
      
      // Calculate total usage
      const totalSize = 5 * 1024 * 1024 * 1024; // 5GB quota
      const usedSize = songsTotalSize + imagesTotalSize;
      
      return {
        totalSize,
        usedSize,
        audioFiles: {
          count: songsData.length,
          size: songsTotalSize,
        },
        images: {
          count: imagesCount,
          size: imagesTotalSize,
        }
      };
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
      // Get current user email
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) throw new Error("User not authenticated");
      
      // First verify current password by trying to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: session.session.user.email!,
        password: currentPassword,
      });
      
      if (verifyError) throw new Error("Current password is incorrect");
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw new Error(error.message);
      
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
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) throw new Error(error.message);
      
      // Remove token from localStorage
      localStorage.removeItem("auth_token");
      
      return true;
    } catch (error) {
      console.error("Error logging out:", error);
      return false;
    }
  }
};

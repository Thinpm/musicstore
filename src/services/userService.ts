
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
      
      // Get user profile data - make sure to handle the case where multiple rows could exist
      const { data: usersData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .limit(1);
        
      if (userError) throw new Error(userError.message);
      if (!usersData || usersData.length === 0) throw new Error("User profile not found");
      
      // Take the first user profile from the results
      const userData = usersData[0];
      
      return {
        user: transformUserData(userData),
        token: data.session!.access_token
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
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
      
      // Check if email confirmation is required
      if (!authData.session) {
        // If email confirmation is required, we won't have a session yet
        // We'll need to inform the user to check their email
        throw new Error("Please check your email to confirm your account before logging in");
      }
      
      // Wait a moment to ensure the session is properly established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the current user with the latest session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw new Error(sessionError.message);
      if (!sessionData.session) throw new Error("Session not established");
      
      // Now get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        throw new Error("Failed to get authenticated user details");
      }
      
      // Now that we have a confirmed authenticated session, we can insert into the users table
      // The RLS policy will be satisfied because auth.uid() is now available
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .upsert([
          {
            id: userData.user.id,
            email: data.email,
            name: data.name,
            avatar_url: null,
          }
        ])
        .select()
        .limit(1);
        
      if (profileError) {
        console.error("Profile creation error:", profileError);
        
        // If we failed to create the profile but auth was successful,
        // we should still log the user out to clean up the auth state
        await supabase.auth.signOut();
        
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }
      
      if (!profileData || profileData.length === 0) {
        await supabase.auth.signOut();
        throw new Error("Failed to retrieve created user profile");
      }
      
      return {
        user: transformUserData(profileData[0]),
        token: sessionData.session.access_token
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  
  /**
   * Get the current user's profile
   */
  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw new Error(sessionError.message);
      if (!sessionData.session) return null;
      
      // Get user profile from our users table - handle potential multiple rows
      const { data: usersData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .limit(1);
        
      if (userError) throw new Error(userError.message);
      if (!usersData || usersData.length === 0) return null;
      
      // Return first matching user
      return transformUserData(usersData[0]);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
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

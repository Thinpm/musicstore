
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UserProfile, LoginCredentials, RegisterData } from "@/services/userService";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => userService.getCurrentUser(),
    retry: false, // Don't retry on error (e.g., unauthorized)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}

export function useStorageInfo() {
  return useQuery({
    queryKey: ['user', 'storage'],
    queryFn: () => userService.getStorageInfo(),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      return userService.login(credentials);
    },
    onSuccess: (data) => {
      if (data) {
        // Save auth token
        localStorage.setItem("auth_token", data.token);
        
        // Update user data in cache
        queryClient.setQueryData(['user'], data.user);
        
        // Navigate to dashboard
        navigate("/");
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.name}!`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (data: RegisterData) => {
      return userService.register(data);
    },
    onSuccess: (data) => {
      if (data) {
        // Save auth token
        localStorage.setItem("auth_token", data.token);
        
        // Update user data in cache
        queryClient.setQueryData(['user'], data.user);
        
        // Navigate to dashboard
        navigate("/");
        
        toast({
          title: "Registration successful",
          description: `Welcome, ${data.user.name}!`,
        });
      }
    },
    onError: (error) => {
      // Handle email confirmation required message separately
      if (error instanceof Error && 
          error.message.includes('check your email')) {
        toast({
          title: "Email confirmation required",
          description: error.message,
          variant: "default",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error instanceof Error ? error.message : "Could not create account",
          variant: "destructive",
        });
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: () => {
      return userService.logout();
    },
    onSuccess: () => {
      // Clear auth token
      localStorage.removeItem("auth_token");
      
      // Clear user data from cache
      queryClient.clear();
      
      // Navigate to login
      navigate("/login");
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<UserProfile>) => {
      return userService.updateProfile(data);
    },
    onSuccess: (data) => {
      if (data) {
        // Update user data in cache
        queryClient.setQueryData(['user'], data);
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update profile",
        variant: "destructive",
      });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({currentPassword, newPassword}: {currentPassword: string, newPassword: string}) => {
      return userService.changePassword(currentPassword, newPassword);
    },
    onSuccess: (success) => {
      if (success) {
        toast({
          title: "Password changed",
          description: "Your password has been updated successfully",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Password change failed",
        description: error instanceof Error ? error.message : "Could not update password",
        variant: "destructive",
      });
    },
  });
}

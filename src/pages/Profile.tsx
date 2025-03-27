
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  HardDrive, 
  Upload, 
  Edit, 
  Save,
  Loader2
} from "lucide-react";
import { useCurrentUser, useStorageInfo, useUpdateProfile } from "@/hooks/useUser";
import { formatBytes } from "@/lib/utils";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: storage, isLoading: isStorageLoading } = useStorageInfo();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
  });
  
  // Update profile mutation
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // When user data is loaded, update the form data
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
      });
    }
  }, [user]);

  const handleSaveProfile = () => {
    updateProfile(formData, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-medium mb-2">User profile not found</h2>
        <p className="text-muted-foreground mb-6">Please log in to view your profile</p>
        <Button>Log In</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center">
            <HardDrive className="h-4 w-4 mr-2" /> Storage
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </div>
              <Button 
                variant={isEditing ? "default" : "outline"} 
                size="sm"
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatarUrl || "/placeholder.svg"} alt="Profile Picture" />
                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background shadow-md"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <div className="text-muted-foreground">@{user.username}</div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                    <Badge variant="outline">Free Plan</Badge>
                    <Badge variant="secondary">10 Playlists</Badge>
                    <Badge variant="secondary">45 Uploads</Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0">
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date(user.updatedAt).toLocaleDateString()}
              </div>
              {isEditing && (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="storage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Management</CardTitle>
              <CardDescription>
                View and manage your storage usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isStorageLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : storage ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Storage Used</span>
                      <span className="text-sm">
                        {Math.round((storage.usedSize / storage.totalSize) * 100)}% of {formatBytes(storage.totalSize)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent rounded-full" 
                        style={{ width: `${(storage.usedSize / storage.totalSize) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Free plan: {formatBytes(storage.totalSize)} storage limit
                    </p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="border border-muted">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Audio Files</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{formatBytes(storage.audioFiles.size)}</div>
                        <p className="text-xs text-muted-foreground">{storage.audioFiles.count} files</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border border-muted">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{formatBytes(storage.images.size)}</div>
                        <p className="text-xs text-muted-foreground">{storage.images.count} files</p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Unable to load storage information
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Upgrade Storage</h4>
                  <p className="text-sm text-muted-foreground">
                    Get more storage with a premium plan
                  </p>
                </div>
                <Button>Upgrade Plan</Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="flex items-center">
                <Upload className="h-4 w-4 mr-2" /> Upload Files
              </Button>
              <Button variant="outline" className="text-destructive">
                Clear Unused Files
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;

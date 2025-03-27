
import { useState } from "react";
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
  Settings, 
  Bell, 
  Shield, 
  HardDrive, 
  Upload, 
  Edit, 
  Save,
  Check
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    username: "johndoe",
    bio: "Music enthusiast and content creator",
    storageUsed: 28, // percentage
    notifications: {
      email: true,
      push: false,
      newComments: true,
      newShares: false,
    },
    privacy: {
      profilePublic: true,
      showActivityHistory: true,
      allowSharing: true,
    },
  });
  const { toast } = useToast();

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };

  const handleChange = (field: string, value: string) => {
    setUser({ ...user, [field]: value });
  };

  const handleToggle = (section: string, field: string, value: boolean) => {
    setUser({
      ...user,
      [section]: {
        ...user[section as keyof typeof user],
        [field]: value,
      },
    });
  };

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
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" /> Privacy
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
              >
                {isEditing ? (
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
                    <AvatarImage src="/placeholder.svg" alt="Profile Picture" />
                    <AvatarFallback>JD</AvatarFallback>
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
                    value={user.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={user.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    value={user.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0">
              <div className="text-sm text-muted-foreground">
                Last updated: May 25, 2023
              </div>
              {isEditing && (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications by email
                    </p>
                  </div>
                  <Switch 
                    checked={user.notifications.email}
                    onCheckedChange={(checked) => 
                      handleToggle("notifications", "email", checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications on this device
                    </p>
                  </div>
                  <Switch 
                    checked={user.notifications.push}
                    onCheckedChange={(checked) => 
                      handleToggle("notifications", "push", checked)
                    }
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Activity Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">New Comments</h5>
                    <p className="text-xs text-muted-foreground">
                      When someone comments on your uploads
                    </p>
                  </div>
                  <Switch 
                    checked={user.notifications.newComments}
                    onCheckedChange={(checked) => 
                      handleToggle("notifications", "newComments", checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">New Shares</h5>
                    <p className="text-xs text-muted-foreground">
                      When someone shares your content
                    </p>
                  </div>
                  <Switch 
                    checked={user.notifications.newShares}
                    onCheckedChange={(checked) => 
                      handleToggle("notifications", "newShares", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Manage how your information is displayed and shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Public Profile</h4>
                    <p className="text-sm text-muted-foreground">
                      Allow others to view your profile
                    </p>
                  </div>
                  <Switch 
                    checked={user.privacy.profilePublic}
                    onCheckedChange={(checked) => 
                      handleToggle("privacy", "profilePublic", checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Activity History</h4>
                    <p className="text-sm text-muted-foreground">
                      Show your listening history to others
                    </p>
                  </div>
                  <Switch 
                    checked={user.privacy.showActivityHistory}
                    onCheckedChange={(checked) => 
                      handleToggle("privacy", "showActivityHistory", checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Content Sharing</h4>
                    <p className="text-sm text-muted-foreground">
                      Allow others to share your uploaded content
                    </p>
                  </div>
                  <Switch 
                    checked={user.privacy.allowSharing}
                    onCheckedChange={(checked) => 
                      handleToggle("privacy", "allowSharing", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Privacy Settings</Button>
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
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Storage Used</span>
                  <span className="text-sm">{user.storageUsed}% of 5GB</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full" 
                    style={{ width: `${user.storageUsed}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Free plan: 5GB storage limit
                </p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Audio Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">3.2 GB</div>
                    <p className="text-xs text-muted-foreground">45 files</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">0.8 GB</div>
                    <p className="text-xs text-muted-foreground">62 files</p>
                  </CardContent>
                </Card>
              </div>
              
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

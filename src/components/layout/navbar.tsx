import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "./sidebar-provider";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Bell, 
  Plus,
  ChevronDown
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AlphabetBar from "./alphabet-bar";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, useLogout } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";

const Navbar = () => {
  const { toggle } = useSidebar();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { mutate: logout } = useLogout();

  const handleLetterClick = (letter: string) => {
    // Handle different behaviors based on current route
    if (location.pathname === "/" || location.pathname === "/dashboard") {
      // Dashboard behavior - filter songs by first letter
      toast({
        title: `Filter songs starting with "${letter}"`,
        description: "Displaying songs starting with this letter",
      });
      // In a real implementation, you would call a function to filter the songs
      // Example: fetchSongsByFirstLetter(letter)
    } else if (location.pathname === "/playlists") {
      // Playlists behavior - filter playlists by first letter
      toast({
        title: `Filter playlists starting with "${letter}"`,
        description: "Displaying playlists starting with this letter",
      });
      // Example: fetchPlaylistsByLetter(letter)
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="glass-panel border-b px-3 sm:px-4 py-2 flex items-center justify-between h-16 z-10">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2" 
          onClick={toggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="overflow-x-auto max-w-full flex pb-2 hide-scrollbar">
          <AlphabetBar onLetterClick={handleLetterClick} />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 hover-effect hidden sm:flex">
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/upload")}>
              Upload Audio
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <CreatePlaylistDialog />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="icon" className="hover-effect hidden sm:flex">
          <Bell className="h-5 w-5" />
        </Button>

        <Button 
          variant="outline" 
          size="icon"
          className="sm:hidden"
          onClick={() => navigate("/upload")}
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-9 w-9 rounded-full hover-effect hover:bg-muted/80"
            >
              {isLoadingUser ? (
                <Skeleton className="h-9 w-9 rounded-full" />
              ) : (
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {isLoadingUser ? (
              <div className="p-2">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || ""}
                  </p>
                </div>
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/playlists")}>
              My Playlists
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
            }}>
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;


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

const Navbar = () => {
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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

  return (
    <div className="glass-panel border-b px-4 py-2 flex items-center justify-between h-16 z-10">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2" 
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="overflow-x-auto max-w-full flex pb-2">
          <AlphabetBar onLetterClick={handleLetterClick} />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 hover-effect">
              <Plus className="h-4 w-4 mr-1" />
              Create
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/upload")}>
              Upload Audio
            </DropdownMenuItem>
            <DropdownMenuItem>
              Create Playlist
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="icon" className="hover-effect">
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-9 w-9 rounded-full hover-effect hover:bg-muted/80"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">
                  john.doe@example.com
                </p>
              </div>
            </DropdownMenuLabel>
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
            <DropdownMenuItem onClick={() => navigate("/login")}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;

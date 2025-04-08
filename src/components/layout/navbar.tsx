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
import { AlphabetNotes } from "@/components/AlphabetNotes";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser, useLogout } from "@/hooks/useUser";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { trackService } from "@/services/trackService";
import { playlistService } from "@/services/playlistService";
import { notificationSoundService } from "@/services/notificationSoundService";

const Navbar = () => {
  const { toggle } = useSidebar();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { mutate: logout } = useLogout();

  const handleLetterClick = async (letter: string) => {
    try {
      // Handle different behaviors based on current route
      if (location.pathname === "/" || location.pathname === "/dashboard") {
        // Dashboard behavior - filter songs by first letter
        const songs = await trackService.filterSongsByLetter(letter);
        if (songs.length === 0) {
          toast({
            title: "Không tìm thấy bài hát",
            description: `Không có bài hát nào bắt đầu bằng chữ "${letter}"`,
          });
        } else {
          toast({
            title: `Đã lọc bài hát theo chữ "${letter}"`,
            description: `Tìm thấy ${songs.length} bài hát`,
          });
          // TODO: Update UI to show filtered songs
        }
      } else if (location.pathname === "/playlists") {
        // Playlists behavior - filter playlists by first letter
        const playlists = await playlistService.filterPlaylistsByLetter(letter);
        if (playlists.length === 0) {
          toast({
            title: "Không tìm thấy playlist",
            description: `Không có playlist nào bắt đầu bằng chữ "${letter}"`,
          });
        } else {
          toast({
            title: `Đã lọc playlist theo chữ "${letter}"`,
            description: `Tìm thấy ${playlists.length} playlist`,
          });
          // TODO: Update UI to show filtered playlists
        }
      }
    } catch (error) {
      console.error("Error filtering by letter:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lọc dữ liệu. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleBellClick = async () => {
    try {
      await notificationSoundService.playRandomSound();
    } catch (error) {
      console.error('Error playing notification sound:', error);
      toast({
        title: "Lỗi",
        description: "Không thể phát âm thanh. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="glass-nav fixed top-0 left-0 right-0 px-3 sm:px-4 py-2 flex items-center justify-between h-16 z-50">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden mr-2 glass-button" 
          onClick={toggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 glass-button hidden sm:flex">
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass-card">
            <DropdownMenuItem onClick={() => navigate("/upload")} className="glass-button">
              Upload Audio
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <CreatePlaylistDialog />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="glass-button hidden sm:flex"
          onClick={handleBellClick}
        >
          <Bell className="h-5 w-5" />
        </Button>

        <Button 
          variant="outline" 
          size="icon"
          className="glass-button sm:hidden"
          onClick={() => navigate("/upload")}
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-9 w-9 rounded-full glass-button"
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
          <DropdownMenuContent className="w-56 glass-card" align="end" forceMount>
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
            <DropdownMenuItem onClick={() => navigate("/playlists")} className="glass-button">
              My Playlists
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
            }} className="glass-button">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="glass-button">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Navbar;


import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSidebar } from "./sidebar-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { 
  Home, 
  Upload, 
  ListMusic, 
  User, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Moon,
  Sun
} from "lucide-react";

const Sidebar = () => {
  const { expanded, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const menuItems = [
    { 
      title: "Dashboard", 
      icon: <Home className="w-5 h-5" />, 
      path: "/",
    },
    { 
      title: "Upload", 
      icon: <Upload className="w-5 h-5" />, 
      path: "/upload",
    },
    { 
      title: "Playlists", 
      icon: <ListMusic className="w-5 h-5" />, 
      path: "/playlists",
    },
    { 
      title: "Profile", 
      icon: <User className="w-5 h-5" />, 
      path: "/profile",
    },
  ];

  return (
    <div 
      className={cn(
        "glass-panel flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden z-20 border-r",
        expanded ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Link 
          to="/" 
          className={cn(
            "flex items-center space-x-2 hover-effect",
            !expanded && "justify-center"
          )}
        >
          <div className="relative w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          {expanded && (
            <span className="font-semibold text-lg tracking-tight animate-fade-in">
              SoundStreamline
            </span>
          )}
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="hover:bg-muted"
        >
          {expanded ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <div className="flex flex-col flex-1 py-4 px-2 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? "secondary" : "ghost"}
            className={cn(
              "justify-start mb-1 hover-effect",
              expanded ? "px-4" : "px-0 justify-center"
            )}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            {expanded && <span className="ml-2">{item.title}</span>}
          </Button>
        ))}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex flex-col space-y-2">
          <Button 
            variant="ghost" 
            size={expanded ? "default" : "icon"}
            className={cn(
              "justify-start hover-effect",
              !expanded && "justify-center px-0"
            )}
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            {expanded && (
              <span className="ml-2">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size={expanded ? "default" : "icon"}
            className={cn(
              "justify-start hover-effect",
              !expanded && "justify-center px-0"
            )}
            onClick={() => navigate("/login")}
          >
            <LogOut className="h-5 w-5" />
            {expanded && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

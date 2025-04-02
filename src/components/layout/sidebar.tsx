import { Link } from "react-router-dom";
import { useSidebar } from "./sidebar-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Moon, Sun, LogOut } from "lucide-react";
import { Navigation } from "./navigation";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { useLogout } from "@/hooks/useUser";

const Sidebar = () => {
  const { isOpen, toggle } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { mutate: logout } = useLogout();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div 
      className={cn(
        "glass-panel flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden z-20 border-r",
        isOpen ? "w-64" : "w-16",
        "fixed md:relative left-0 top-0 bottom-0"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Link 
          to="/" 
          className={cn(
            "flex items-center space-x-2 hover-effect",
            !isOpen && "justify-center"
          )}
        >
          <div className="relative w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          {isOpen && (
            <span className="font-semibold text-lg tracking-tight truncate animate-fade-in">
              SoundStreamline
            </span>
          )}
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggle}
          className="hover:bg-muted"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      <div className="flex flex-col flex-1 py-4 px-2">
        <div className="flex-1">
          <Navigation />
        </div>

        <div className="pt-4 border-t space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-x-2"
            onClick={toggleTheme}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            {isOpen && (theme === "dark" ? "Light Mode" : "Dark Mode")}
          </Button>
          {user && (
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-x-2"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {isOpen && "Log out"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

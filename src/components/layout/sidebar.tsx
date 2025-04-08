import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "./sidebar-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Moon, Sun, LogOut, ArrowLeft } from "lucide-react";
import { Navigation } from "./navigation";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { useLogout } from "@/hooks/useUser";

const Sidebar = () => {
  const { isOpen, toggle } = useSidebar();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    logout();
  };

  const handleBack = () => {
    if (location.pathname.startsWith('/song/')) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "glass-card flex flex-col h-full transition-all duration-300 ease-in-out overflow-hidden z-20",
          isOpen ? "w-64" : "w-16",
          "fixed md:relative left-0 top-0 bottom-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-glass">
          <Link 
            to="/" 
            className={cn(
              "flex items-center",
              !isOpen && "justify-center w-full"
            )}
          >
            <div className="relative w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            {isOpen && (
              <span className="font-semibold text-lg tracking-tight truncate animate-fade-in ml-2">
                SoundStreamline
              </span>
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggle}
            className={cn(
              "glass-button transition-transform duration-300 absolute right-2",
              !isOpen && "rotate-180"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center p-2 border-b border-glass">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className={cn(
              "glass-button w-full",
              isOpen ? "justify-start" : "justify-center",
              "relative group"
            )}
          >
            <ArrowLeft className="h-5 w-5" />
            {isOpen && <span className="ml-2">Back</span>}
            {!isOpen && (
              <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-glass text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                Back
              </div>
            )}
          </Button>
        </div>
        
        <div className="flex flex-col flex-1 py-4 px-2">
          <div className="flex-1">
            <Navigation />
          </div>

          <div className="pt-4 border-t border-glass space-y-2">
            <Button 
              variant="ghost" 
              className={cn(
                "w-full glass-button",
                isOpen ? "justify-start" : "justify-center",
                "relative group"
              )}
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              {isOpen && <span className="ml-2">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
              {!isOpen && (
                <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-glass text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </div>
              )}
            </Button>
            {user && (
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full glass-button",
                  isOpen ? "justify-start" : "justify-center",
                  "relative group"
                )}
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                {isOpen && <span className="ml-2">Log out</span>}
                {!isOpen && (
                  <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-glass text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                    Log out
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay để đóng sidebar khi click ra ngoài trên mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
          onClick={toggle}
        />
      )}
    </>
  );
};

export default Sidebar;

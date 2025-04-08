import { Link } from "react-router-dom";
import { Home, Share2, Upload, ListMusic, Heart } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SharedLinksDialog } from "@/components/share/shared-links-dialog";
import { useSidebar } from "./sidebar-provider";
import { cn } from "@/lib/utils";

export function Navigation() {
  const { user } = useAuth();
  const { isOpen } = useSidebar();
  const [showSharedLinks, setShowSharedLinks] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <Link to="/">
          <Button variant="ghost" className={cn(
            "w-full glass-button",
            isOpen ? "justify-start" : "justify-center",
            "relative group"
          )}>
            <Home className="h-5 w-5" />
            {isOpen && <span className="ml-2">Home</span>}
            {!isOpen && (
              <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-glass text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                Home
              </div>
            )}
          </Button>
        </Link>
        {user && (
          <>
            <Link to="/upload">
              <Button variant="ghost" className={cn(
                "w-full glass-button",
                isOpen ? "justify-start" : "justify-center",
                "relative group"
              )}>
                <Upload className="h-5 w-5" />
                {isOpen && <span className="ml-2">Upload</span>}
                {!isOpen && (
                  <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-glass text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                    Upload
                  </div>
                )}
              </Button>
            </Link>
            <Link to="/playlists">
              <Button variant="ghost" className={cn(
                "w-full glass-button",
                isOpen ? "justify-start" : "justify-center",
                "relative group"
              )}>
                <ListMusic className="h-5 w-5" />
                {isOpen && <span className="ml-2">Playlists</span>}
                {!isOpen && (
                  <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-glass text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                    Playlists
                  </div>
                )}
              </Button>
            </Link>
            <Link to="/favorites">
              <Button variant="ghost" className={cn(
                "w-full glass-button",
                isOpen ? "justify-start" : "justify-center",
                "relative group"
              )}>
                <Heart className="h-5 w-5" />
                {isOpen && <span className="ml-2">Favorites</span>}
                {!isOpen && (
                  <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-glass text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                    Favorites
                  </div>
                )}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className={cn(
                "w-full glass-button",
                isOpen ? "justify-start" : "justify-center",
                "relative group"
              )}
              onClick={() => setShowSharedLinks(true)}
            >
              <Share2 className="h-5 w-5" />
              {isOpen && <span className="ml-2">Shared Songs</span>}
              {!isOpen && (
                <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-glass text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                  Shared Songs
                </div>
              )}
            </Button>
          </>
        )}
      </div>

      <SharedLinksDialog 
        open={showSharedLinks} 
        onOpenChange={setShowSharedLinks}
      />
    </>
  );
} 
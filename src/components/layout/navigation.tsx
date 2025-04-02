import { Link } from "react-router-dom";
import { Home, Share2, Upload, ListMusic, Heart } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SharedLinksDialog } from "@/components/share/shared-links-dialog";

export function Navigation() {
  const { user } = useAuth();
  const [showSharedLinks, setShowSharedLinks] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-y-2">
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start gap-x-2">
            <Home className="h-5 w-5" />
            Home
          </Button>
        </Link>
        {user && (
          <>
            <Link to="/upload">
              <Button variant="ghost" className="w-full justify-start gap-x-2">
                <Upload className="h-5 w-5" />
                Upload
              </Button>
            </Link>
            <Link to="/playlists">
              <Button variant="ghost" className="w-full justify-start gap-x-2">
                <ListMusic className="h-5 w-5" />
                Playlists
              </Button>
            </Link>
            <Link to="/favorites">
              <Button variant="ghost" className="w-full justify-start gap-x-2">
                <Heart className="h-5 w-5" />
                Favorites
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-x-2"
              onClick={() => setShowSharedLinks(true)}
            >
              <Share2 className="h-5 w-5" />
              Shared Songs
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
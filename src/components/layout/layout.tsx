
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { useSidebar } from "./sidebar-provider";
import AudioPlayer from "../audio/audio-player";
import { useAudioPlayer } from "../audio/audio-player-provider";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useUser";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const Layout = () => {
  const { expanded } = useSidebar();
  const { currentTrack } = useAudioPlayer();
  const { data: user, isLoading } = useCurrentUser();
  
  // If not loading and no user is found, redirect to login
  if (!isLoading && !user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Navbar />
        <main 
          className={cn(
            "flex-1 overflow-auto p-3 md:p-6 transition-all duration-300"
          )}
        >
          {isLoading ? (
            <div className="container mx-auto max-w-7xl space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="container mx-auto max-w-7xl">
              <Outlet />
            </div>
          )}
        </main>
        {currentTrack && <AudioPlayer />}
      </div>
    </div>
  );
};

export default Layout;

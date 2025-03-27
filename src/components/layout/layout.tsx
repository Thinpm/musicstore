
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import { useSidebar } from "./sidebar-provider";
import AudioPlayer from "../audio/audio-player";
import { useAudioPlayer } from "../audio/audio-player-provider";
import { cn } from "@/lib/utils";

const Layout = () => {
  const { expanded } = useSidebar();
  const { currentTrack } = useAudioPlayer();
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main 
          className={cn(
            "flex-1 overflow-auto p-4 md:p-6 transition-all duration-300",
            currentTrack && "pb-28" // Add padding when player is active
          )}
        >
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        {currentTrack && <AudioPlayer />}
      </div>
    </div>
  );
};

export default Layout;

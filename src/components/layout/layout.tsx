import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { useSidebar } from "./sidebar-provider";
import AudioPlayer from "@/components/audio/audio-player";
import { useTheme } from "@/components/theme-provider";

export default function Layout() {
  const { isOpen } = useSidebar();
  const { theme } = useTheme();

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url(${theme === 'dark' ? '/dark.jpg' : '/Light.jpg'})`,
      }}
    >
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 pt-32">
          <Sidebar />
          <main
            className={`flex-1 transition-all duration-300 overflow-y-auto ${
              isOpen ? "md:ml-64" : "md:ml-16"
            }`}
          >
            <div className="container mx-auto py-4 pb-24">
              <Outlet />
            </div>
          </main>
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-40">
          <AudioPlayer />
        </div>
      </div>
    </div>
  );
} 
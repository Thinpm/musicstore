import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { useSidebar } from "./sidebar-provider";
import AudioPlayer from "@/components/audio/audio-player";

export default function Layout() {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main
          className={`flex-1 transition-all duration-300 ${
            isOpen ? "ml-64" : "ml-20"
          }`}
        >
          <div className="container mx-auto py-4">
            <Outlet />
          </div>
        </main>
      </div>
      <div className="fixed bottom-0 left-0 right-0">
        <AudioPlayer />
      </div>
    </div>
  );
} 
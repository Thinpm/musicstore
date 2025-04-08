import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/layout/sidebar-provider";
import Layout from "@/components/layout/layout";
import { useToast } from "@/components/ui/use-toast";
import { trackService } from "@/services/trackService";
import { playlistService } from "@/services/playlistService";
import { useEffect } from "react";

import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import Playlists from "@/pages/Playlists";
import PlaylistDetail from "@/pages/PlaylistDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import SongDetail from "@/pages/SongDetail";
import SharedSong from "@/pages/SharedSong";
import SharedLinks from "@/pages/SharedLinks";
import Favorites from "@/pages/Favorites";
import SharedPlaylist from "@/pages/SharedPlaylist";
import Profile from "@/pages/Profile";

import { AudioPlayerProvider } from "@/components/audio/audio-player-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import AlphabetBar from "./components/layout/alphabet-bar";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleLetterClick = async (letter: string) => {
    try {
      const currentPath = location.pathname;
      
      // Xử lý dựa trên trang hiện tại
      if (currentPath === "/playlists") {
        // Chỉ tìm kiếm playlist
        const playlists = await playlistService.searchByLetter(letter);
        
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
          
          // Emit event để cập nhật UI của trang Playlists
          const searchEvent = new CustomEvent('playlistSearch', {
            detail: { letter, playlists }
          });
          window.dispatchEvent(searchEvent);
        }
      } else if (currentPath === "/" || currentPath === "/dashboard") {
        // Chỉ tìm kiếm bài hát
        const songs = await trackService.searchByLetter(letter);
        
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
          
          // Emit event để cập nhật UI của trang Dashboard
          const searchEvent = new CustomEvent('songSearch', {
            detail: { letter, songs }
          });
          window.dispatchEvent(searchEvent);
        }
      }

      // Lưu chữ cái đang tìm kiếm vào URL
      if (letter) {
        setSearchParams({ letter });
      } else {
        setSearchParams({});
      }
    } catch (error) {
      console.error("Error searching by letter:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tìm kiếm. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  // Khôi phục tìm kiếm khi load lại trang
  useEffect(() => {
    const letter = searchParams.get('letter');
    if (letter) {
      handleLetterClick(letter);
    }
  }, []);

  return (
    <>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="playlists" element={<Playlists />} />
            <Route path="playlists/:id" element={<PlaylistDetail />} />
            <Route path="songs/:id" element={<SongDetail />} />
            <Route path="share/:token" element={<SharedSong />} />
            <Route path="shared" element={<SharedLinks />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="share/playlist/:token" element={<SharedPlaylist />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SidebarProvider>
      <AlphabetBar onLetterClick={handleLetterClick} />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="theme-preference">
        <AuthProvider>
          <AudioPlayerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </AudioPlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

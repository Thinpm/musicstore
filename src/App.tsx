import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/layout/sidebar-provider";
import Layout from "@/components/layout/layout";

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

import { AudioPlayerProvider } from "@/components/audio/audio-player-provider";
import { AuthProvider } from "@/components/auth/auth-provider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="theme-preference">
      <AuthProvider>
        <AudioPlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                    <Route path="playlists/share/:token" element={<SharedPlaylist />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </SidebarProvider>
            </BrowserRouter>
          </TooltipProvider>
        </AudioPlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

import { useState, useEffect } from "react";
import { Track } from "@/components/audio/audio-player-provider";
import { useTracksQuery } from "@/hooks/useTracks";
import AudioCard from "@/components/audio/audio-card";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Grid, ListMusic } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { trackService } from "@/services/trackService";
import { useSearchParams } from "react-router-dom";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  // Use React Query to manage data
  const { data: tracksQuery = [], isLoading, error } = useTracksQuery({
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setLoading(true);
        const letter = searchParams.get('letter');
        let data;
        
        if (letter) {
          data = await trackService.searchByLetter(letter);
        } else {
          // Nếu không có letter param, lấy tất cả bài hát
          data = await trackService.getAllTracks();
        }
        
        setTracks(data);
      } catch (error) {
        console.error("Error loading tracks:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách bài hát. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, [searchParams]);

  // Lắng nghe sự kiện tìm kiếm
  useEffect(() => {
    const handleLetterSearch = (event: CustomEvent<{ letter: string; songs: Track[]; playlists: any[] }>) => {
      setTracks(event.detail.songs);
    };

    window.addEventListener('letterSearch', handleLetterSearch as EventListener);

    return () => {
      window.removeEventListener('letterSearch', handleLetterSearch as EventListener);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load tracks",
      variant: "destructive",
    });
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <h1 className="text-2xl font-bold">No tracks yet</h1>
        <p className="text-muted-foreground">Upload your first track to get started</p>
      </div>
    );
  }

  // Filter tracks based on search query
  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Your Library</h1>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-1">
          <p className="text-muted-foreground">
            Manage and play music from your library
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <ListMusic className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "grid gap-4"}>
          {filteredTracks.map((track, index) => (
            <AudioCard
              key={track.id}
              track={track}
              tracks={filteredTracks}
              currentIndex={index}
              compact={viewMode === "list"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

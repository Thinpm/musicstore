import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { shareService } from "@/services/shareService";
import { Track } from "@/components/audio/audio-player-provider";

interface SharedPlaylist {
  id: string;
  name: string;
  description: string;
  songs: Track[];
}

export default function SharedPlaylist() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlist, setPlaylist] = useState<SharedPlaylist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!token) return;

      try {
        const playlistData = await shareService.getPlaylistByShareToken(token);
        if (!playlistData) {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy playlist hoặc link đã hết hạn",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setPlaylist(playlistData);
      } catch (error) {
        console.error("Error loading shared playlist:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải playlist. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [token, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-muted-foreground mt-2">{playlist.description}</p>
          )}
        </div>

        <div className="space-y-2">
          {playlist.songs.map((song) => (
            <div
              key={song.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent"
            >
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    // TODO: Implement play functionality
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
                <div>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
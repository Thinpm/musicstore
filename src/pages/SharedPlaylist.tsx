import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { shareService } from "@/services/shareService";
import { Track } from "@/components/audio/audio-player-provider";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface SharedPlaylist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
}

export default function SharedPlaylist() {
  const { token } = useParams<{ token: string }>();
  const [playlist, setPlaylist] = useState<SharedPlaylist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSharedPlaylist = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const data = await shareService.getSharedContent(token);
        if (!data?.playlist) {
          throw new Error("Không tìm thấy playlist được chia sẻ");
        }

        // Chuyển đổi dữ liệu sang định dạng phù hợp
        const playlist = data.playlist;
        const tracks = playlist.playlist_songs.map((ps) => ({
          id: ps.songs.id,
          title: ps.songs.title,
          artist: ps.songs.artist || "Unknown Artist",
          duration: ps.songs.duration || 0,
          url: ps.songs.url,
          cover: ps.songs.cover_url
        }));

        setPlaylist({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || "",
          tracks
        });
      } catch (error) {
        console.error("Error fetching shared playlist:", error);
        const message = error instanceof Error ? error.message : "Không thể tải playlist";
        setError(message);
        toast({
          title: "Lỗi",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPlaylist();
  }, [token, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] space-y-4">
        <h1 className="text-2xl font-bold">Không thể tải playlist</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        {playlist.description && (
          <p className="text-muted-foreground">{playlist.description}</p>
        )}
        <div className="space-y-4">
          {playlist.tracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Playlist này chưa có bài hát nào
            </div>
          ) : (
            playlist.tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center space-x-4 p-4 rounded-lg bg-secondary"
              >
                <img
                  src={track.cover}
                  alt={track.title}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <div>
                  <h3 className="font-semibold">{track.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {track.artist}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 
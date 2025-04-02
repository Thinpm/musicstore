import { useEffect, useState } from "react";
import { Track } from "@/components/audio/audio-player-provider";
import { favoriteService } from "@/services/favoriteService";
import AudioCard from "@/components/audio/audio-card";

export default function Favorites() {
  const [songs, setSongs] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favorites = await favoriteService.getFavorites();
        setSongs(favorites);
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, []);

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Bài hát yêu thích</h1>
      {songs.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          Bạn chưa có bài hát yêu thích nào
        </div>
      ) : (
        <div className="grid gap-4">
          {songs.map((song, index) => (
            <AudioCard
              key={song.id}
              track={song}
              tracks={songs}
              currentIndex={index}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
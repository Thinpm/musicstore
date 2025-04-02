import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAudioPlayer } from "@/components/audio/audio-player-provider";
import AudioCard from "@/components/audio/audio-card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Plus,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDuration } from "@/components/audio/audio-card";
import { usePlaylistById } from "@/hooks/usePlaylists";
import { useQueryClient } from "@tanstack/react-query";
import { AddTracksDialog } from "@/components/playlist/add-tracks-dialog";
import { SharePlaylistDialog } from "@/components/playlist/share-playlist-dialog";

const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack } = useAudioPlayer();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddTracksDialog, setShowAddTracksDialog] = useState(false);
  
  // Fetch playlist data with its tracks
  const { 
    data: playlist, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = usePlaylistById(id);
  
  const tracks = playlist?.tracks || [];
  
  // Calculate total duration
  const totalDuration = tracks.reduce((acc, track) => acc + track.duration, 0);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Đang tải playlist...</p>
      </div>
    );
  }
  
  if (isError || !playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">
          {error instanceof Error ? error.message : "Không tìm thấy playlist"}
        </h2>
        <Button onClick={() => navigate("/playlists")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  const handleTrackRemoved = () => {
    // Refresh playlist data after track removal
    refetch();
  };

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <Button 
        variant="ghost" 
        className="w-fit -ml-2 -mt-2 mb-2"
        onClick={() => navigate("/playlists")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>
      
      <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
        <div className="w-full md:w-48 h-48 rounded-md overflow-hidden bg-accent/50 flex items-center justify-center">
          <div className="text-4xl font-bold text-accent-foreground/50">
            {playlist.name?.[0]?.toUpperCase() || "P"}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="text-sm font-medium uppercase text-muted-foreground">PLAYLIST</div>
          <h1 className="text-3xl md:text-4xl font-bold mt-1">{playlist.name}</h1>
          <p className="text-muted-foreground mt-2">{playlist.description}</p>
          <div className="text-sm text-muted-foreground mt-4">
            {tracks.length} bài hát • {formatDuration(totalDuration)}
          </div>
          
          <div className="flex items-center space-x-2 pt-4">
            <Button onClick={handlePlayAll} disabled={tracks.length === 0}>
              <Play className="mr-2 h-4 w-4" /> Phát tất cả
            </Button>
            <SharePlaylistDialog playlistId={playlist.id} playlistName={playlist.name} />
          </div>
        </div>
      </div>
      
      <div className="glass-card p-6">
        {tracks.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Playlist này chưa có bài hát nào</h3>
            <p className="text-muted-foreground mb-6">Thêm một số bài hát để bắt đầu</p>
            <Button onClick={() => setShowAddTracksDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Thêm bài hát
            </Button>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {tracks.map((track) => (
              <AudioCard 
                key={track.id} 
                track={track} 
                compact 
                playlistId={id}
                onRemoveFromPlaylist={handleTrackRemoved}
              />
            ))}
          </div>
        )}
      </div>

      <AddTracksDialog
        isOpen={showAddTracksDialog}
        onClose={() => setShowAddTracksDialog(false)}
        playlistId={playlist.id}
        onPlaylistUpdated={() => refetch()}
      />
    </div>
  );
}

export default PlaylistDetail; 
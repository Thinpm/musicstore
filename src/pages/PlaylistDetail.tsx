import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAudioPlayer } from "@/components/audio/audio-player-provider";
import AudioCard from "@/components/audio/audio-card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Plus,
  ArrowLeft,
  Loader2,
  MoreVertical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDuration } from "@/components/audio/audio-card";
import { usePlaylistById } from "@/hooks/usePlaylists";
import { useQueryClient } from "@tanstack/react-query";
import { AddTracksDialog } from "@/components/playlist/add-tracks-dialog";
import { DeletePlaylistDialog } from "@/components/playlist/delete-playlist-dialog";
import { EditPlaylistDialog } from "@/components/playlist/edit-playlist-dialog";
import { ShareDialog } from "@/components/share/share-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack } = useAudioPlayer();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddTracksDialog, setShowAddTracksDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
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

  const handlePlaylistUpdated = () => {
    // Refresh playlist data after playlist update
    refetch();
  };

  const handlePlaylistDeleted = () => {
    // Navigate to playlists page after deletion
    navigate("/playlists");
  };

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

      {playlist && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{playlist.name}</h1>
              {playlist.description && (
                <p className="text-muted-foreground mt-2">{playlist.description}</p>
              )}
            </div>

            {playlist.user_id === user?.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                    Chia sẻ
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
            <div className="w-full md:w-48 h-48 rounded-md overflow-hidden bg-accent/50 flex items-center justify-center">
              <div className="text-4xl font-bold text-accent-foreground/50">
                {playlist.name?.[0]?.toUpperCase() || "P"}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-medium uppercase text-muted-foreground">PLAYLIST</div>
              <div className="text-sm text-muted-foreground mt-4">
                {tracks.length} bài hát • {formatDuration(totalDuration)}
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Button onClick={handlePlayAll} disabled={tracks.length === 0}>
                  <Play className="mr-2 h-4 w-4" /> Phát tất cả
                </Button>
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

          <EditPlaylistDialog
            isOpen={showEditDialog}
            onOpenChange={setShowEditDialog}
            playlist={playlist}
            onSuccess={handlePlaylistUpdated}
          />

          <DeletePlaylistDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            playlistId={playlist.id}
            onSuccess={handlePlaylistDeleted}
          />

          <ShareDialog
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            title={playlist.name}
            type="playlist"
            id={playlist.id}
          />
        </div>
      )}
    </div>
  );
}

export default PlaylistDetail; 
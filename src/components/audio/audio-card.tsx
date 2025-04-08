import { useAudioPlayer, Track } from "./audio-player-provider";
import { Button } from "@/components/ui/button";
import { Play, Pause, MoreHorizontal, Share, Trash2, ListMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddToPlaylistDialog } from "@/components/playlist/add-to-playlist-dialog";
import { ShareDialog } from "@/components/share/share-dialog";
import { useState } from "react";
import { FavoriteButton } from "@/components/favorite/favorite-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { playlistService } from "@/services/playlistService";
import { trackService } from "@/services/trackService";

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

type AudioCardProps = {
  track: Track;
  compact?: boolean;
  tracks?: Track[]; // Optional array of all tracks in the current view
  currentIndex?: number; // Optional index of the current track in the tracks array
  playlistId?: string; // Optional playlist ID if the track is being displayed in a playlist
  onRemoveFromPlaylist?: () => void; // Callback when track is removed from playlist
};

const AudioCard = ({ 
  track, 
  compact = false, 
  tracks, 
  currentIndex,
  playlistId,
  onRemoveFromPlaylist 
}: AudioCardProps) => {
  const { playTrack, currentTrack, isPlaying, pauseTrack, resumeTrack } = useAudioPlayer();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();

  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when play button clicked
    if (isCurrentTrack) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      // If tracks array is provided, pass the playlist context
      if (tracks && currentIndex !== undefined) {
        playTrack(track, {
          tracks,
          currentIndex
        });
      } else {
        playTrack(track);
      }
    }
  };

  const handleCardClick = () => {
    // Same behavior as play button click
    if (isCurrentTrack) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      // If tracks array is provided, pass the playlist context
      if (tracks && currentIndex !== undefined) {
        playTrack(track, {
          tracks,
          currentIndex
        });
      } else {
        playTrack(track);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const success = await trackService.deleteTrack(track.id);
      if (success) {
        toast({
          title: "Xóa bài hát thành công",
          description: `Đã xóa "${track.title}"`,
        });
        // Reload the page to refresh the song list
        window.location.reload();
      } else {
        throw new Error("Không thể xóa bài hát");
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài hát. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromPlaylist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playlistId) return;

    try {
      const success = await playlistService.removeSongFromPlaylist(playlistId, track.id);
      if (success) {
        toast({
          title: "Đã xóa khỏi playlist",
          description: `Đã xóa "${track.title}" khỏi playlist`,
        });
        onRemoveFromPlaylist?.();
      } else {
        throw new Error("Không thể xóa bài hát khỏi playlist");
      }
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa bài hát khỏi playlist. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "glass-card relative rounded-lg overflow-hidden transition hover:shadow-md cursor-pointer hover-effect group",
        compact ? "p-2" : "p-4",
        isCurrentTrack && "ring-1 ring-accent"
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "relative rounded overflow-hidden bg-muted flex-shrink-0",
            compact ? "h-10 w-10" : "h-14 w-14"
          )}
        >
          <img
            src={track.cover || "/placeholder.svg"}
            alt={track.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              console.error('Error loading cover image:', track.cover);
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white"
              onClick={handlePlayPause}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className={cn("h-4 w-4", compact ? "h-3 w-3" : "")} />
              ) : (
                <Play className={cn("h-4 w-4 ml-0.5", compact ? "h-3 w-3" : "")} />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-medium truncate",
              compact ? "text-sm" : "text-base"
            )}
          >
            {track.title}
          </h3>
          <p
            className={cn(
              "text-muted-foreground truncate",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {track.artist}
          </p>
        </div>

        <div className="flex items-center gap-2 z-10">
          <AddToPlaylistDialog track={track} />
          <FavoriteButton
            songId={track.id}
            className={cn(
              "opacity-0 group-hover:opacity-100",
              compact ? "h-7 w-7" : "h-8 w-8"
            )}
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn("opacity-0 group-hover:opacity-100", 
              compact ? "h-7 w-7" : "h-8 w-8"
            )}
            onClick={(e) => {
              e.stopPropagation();
              setShowShareDialog(true);
            }}
          >
            <Share className={cn("h-4 w-4", compact ? "h-3 w-3" : "")} />
          </Button>
          <ShareDialog
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            title={track.title}
            type="song"
            id={track.id}
          />
          <span
            className={cn(
              "text-xs text-muted-foreground",
              compact ? "hidden" : "block"
            )}
          >
            {formatDuration(track.duration || 0)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("opacity-0 group-hover:opacity-100", 
                  compact ? "h-7 w-7" : "h-8 w-8"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className={cn("h-4 w-4", compact ? "h-3 w-3" : "")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {playlistId && (
                <>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={handleRemoveFromPlaylist}
                  >
                    <ListMinus className="h-4 w-4 mr-2" />
                    Xóa khỏi playlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa bài hát
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default AudioCard;

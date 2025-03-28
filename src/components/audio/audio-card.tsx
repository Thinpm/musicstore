
import { useAudioPlayer, Track } from "./audio-player-provider";
import { Button } from "@/components/ui/button";
import { Play, Pause, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

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
};

const AudioCard = ({ track, compact = false, tracks, currentIndex }: AudioCardProps) => {
  const { playTrack, currentTrack, isPlaying, pauseTrack, resumeTrack } = useAudioPlayer();

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

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {formatDuration(track.duration)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn("opacity-0 group-hover:opacity-100", 
              compact ? "h-7 w-7" : "h-8 w-8"
            )}
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
            }}
          >
            <MoreHorizontal className={cn("h-4 w-4", compact ? "h-3 w-3" : "")} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioCard;

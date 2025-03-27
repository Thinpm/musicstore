
import { useState } from "react";
import { useAudioPlayer, Track } from "./audio-player-provider";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  MoreHorizontal,
  Share,
  Heart,
  ListPlus,
  Trash2,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface AudioCardProps {
  track: Track;
  compact?: boolean;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

const AudioCard = ({ track, compact = false }: AudioCardProps) => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } =
    useAudioPlayer();
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();
  
  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying;

  const handlePlayPause = () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      playTrack(track);
    }
  };

  const handleShare = () => {
    toast({
      title: "Shared!",
      description: `${track.title} has been copied to clipboard`,
    });
  };

  const handleAddToPlaylist = () => {
    toast({
      title: "Add to playlist",
      description: "Choose a playlist to add this track to",
    });
  };

  if (compact) {
    return (
      <div 
        className={cn(
          "group flex items-center justify-between p-3 rounded-md hover-effect",
          isCurrentTrack ? "bg-accent/10" : "hover:bg-muted/50"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10">
            <img 
              src={track.cover || "/placeholder.svg"} 
              alt={track.title}
              className="w-10 h-10 rounded-md object-cover"
            />
            {(isHovered || isCurrentTrack) && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute inset-0 m-auto h-8 w-8 rounded-full opacity-90"
                onClick={handlePlayPause}
              >
                {isCurrentlyPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </Button>
            )}
          </div>
          <div>
            <p className="font-medium text-sm line-clamp-1">{track.title}</p>
            <p className="text-xs text-muted-foreground">{track.artist}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-xs text-muted-foreground mr-2">
            {formatDuration(track.duration)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              liked ? "text-destructive" : "text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            )}
            onClick={() => setLiked(!liked)}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddToPlaylist}>
                <ListPlus className="h-4 w-4 mr-2" /> Add to playlist
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" /> Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="glass-card rounded-lg overflow-hidden hover-effect group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="aspect-square w-full bg-muted overflow-hidden">
          <img 
            src={track.cover || "/placeholder.svg"} 
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className={cn(
          "absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 transition-opacity duration-300",
          (isHovered || isCurrentTrack) && "opacity-100"
        )}>
          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 rounded-full opacity-90 shadow-lg"
            onClick={handlePlayPause}
          >
            {isCurrentlyPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>
        </div>
        {isCurrentTrack && (
          <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full">
            Now Playing
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium mb-1 line-clamp-1">{track.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{track.artist}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              liked ? "text-destructive" : "text-muted-foreground"
            )}
            onClick={() => setLiked(!liked)}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            {formatDuration(track.duration)}
          </span>
          
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
            >
              <Share className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleAddToPlaylist}>
                  <ListPlus className="h-4 w-4 mr-2" /> Add to playlist
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" /> Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioCard;

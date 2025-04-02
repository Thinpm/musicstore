import { useState, useEffect, useRef } from "react";
import { useAudioPlayer, Track } from "./audio-player-provider";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Shuffle,
  X,
  ListMusic,
  Share,
  Heart,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Music
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import FullScreenPlayer from "./full-screen-player";
import { ShareDialog } from "@/components/share/share-dialog";
import { QueueDialog } from "@/components/queue/queue-dialog";
import { FavoriteButton } from "@/components/favorite/favorite-button";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const AudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    isLooping,
    isShuffling,
    pauseTrack,
    resumeTrack,
    setVolume,
    setProgress,
    nextTrack,
    previousTrack,
    toggleLoop,
    toggleShuffle,
    error
  } = useAudioPlayer();

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showWaveform, setShowWaveform] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem("audioPlayerCollapsed");
    return savedState === "true";
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showQueueDialog, setShowQueueDialog] = useState(false);
  const [loadingState, setLoadingState] = useState<"loading" | "error" | "ready">("ready");

  useEffect(() => {
    localStorage.setItem("audioPlayerCollapsed", String(collapsed));
  }, [collapsed]);

  // Update times based on progress
  useEffect(() => {
    if (currentTrack && duration) {
      setCurrentTime(progress * duration);
    }
  }, [progress, duration, currentTrack]);

  // Set the initial duration
  useEffect(() => {
    if (currentTrack) {
      try {
        if (currentTrack.duration <= 0) {
          throw new Error("Thời lượng bài hát không hợp lệ");
        }
        setDuration(currentTrack.duration);
        setLoadingState("ready");
      } catch (error) {
        console.error("Lỗi khi tải metadata:", error);
        setLoadingState("error");
      }
    }
  }, [currentTrack]);

  const handleProgressChange = (value: number[]) => {
    if (loadingState === "ready") {
      setProgress(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (loadingState === "ready") {
      setVolume(value[0]);
    }
  };

  const toggleMute = () => {
    if (loadingState === "ready") {
      setVolume(volume === 0 ? 0.7 : 0);
    }
  };

  const togglePlayPause = () => {
    if (loadingState === "ready") {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    }
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  const openFullScreen = () => {
    setIsFullScreen(true);
  };
  
  const closeFullScreen = () => {
    setIsFullScreen(false);
  };

  if (!currentTrack) return null;

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}
      
      {loadingState === "error" && (
        <div className="fixed top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg animate-in fade-in slide-in-from-top-2">
          Không thể tải thông tin bài hát
        </div>
      )}
      
      <button 
        className="audio-player-toggle"
        onClick={toggleCollapse}
        aria-label={collapsed ? "Expand Player" : "Collapse Player"}
      >
        {collapsed ? (
          <>
            <Music className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Expand Player</span>
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Hide Player</span>
          </>
        )}
      </button>
      
      <div className={cn(
        "audio-player-container",
        collapsed && "collapsed",
        loadingState === "loading" && "opacity-75"
      )}>
        <div className="glass-panel p-2 sm:p-4 border-t shadow-md animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            {/* Mobile mini player controls (only visible on small screens) */}
            <div className="flex items-center justify-between sm:hidden w-full mb-2">
              <div className="flex items-center space-x-2">
                <img
                  src={currentTrack.cover || "/placeholder.svg"}
                  alt={currentTrack.title}
                  className="h-10 w-10 object-cover rounded-md"
                  crossOrigin="anonymous"
                />
                <div className="truncate max-w-[120px]">
                  <h4 className="font-medium text-sm truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Desktop full player controls */}
            <div className="hidden sm:flex items-center space-x-4 w-1/4">
              <div 
                className="relative h-12 w-12 overflow-hidden rounded-md bg-muted animate-pulse-subtle cursor-pointer"
                onClick={openFullScreen}
              >
                <img
                  src={currentTrack.cover || "/placeholder.svg"}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="hidden sm:block">
                <h4 
                  className="font-medium text-sm line-clamp-1 cursor-pointer hover:text-accent transition-colors"
                  onClick={openFullScreen}
                >
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {currentTrack.artist}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-8 w-8 flex items-center justify-center">
                    <FavoriteButton
                      songId={currentTrack.id}
                      className="h-8 w-8"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Thêm vào yêu thích
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex flex-col w-full sm:w-2/4 space-y-2">
              <div className="hidden sm:flex items-center justify-center space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        isShuffling ? "bg-primary/20 text-primary" : ""
                      )}
                      onClick={toggleShuffle}
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Shuffle</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={previousTrack}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Previous</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {isPlaying ? "Pause" : "Play"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={nextTrack}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Next</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        isLooping ? "bg-primary/20 text-primary" : ""
                      )}
                      onClick={toggleLoop}
                    >
                      <Repeat className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Repeat</TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground w-8 sm:w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[progress]}
                  max={1}
                  step={0.01}
                  onValueChange={handleProgressChange}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground w-8 sm:w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-2 w-1/4 justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={toggleMute}
              >
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>
      
      <FullScreenPlayer isOpen={isFullScreen} onClose={closeFullScreen} />
      {currentTrack && (
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          title={currentTrack.title}
          type="song"
          id={currentTrack.id}
        />
      )}
      <QueueDialog
        isOpen={showQueueDialog}
        onClose={() => setShowQueueDialog(false)}
      />
    </>
  );
};

export default AudioPlayer;

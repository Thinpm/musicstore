
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
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import FullScreenPlayer from "./full-screen-player";

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
    toggleShuffle
  } = useAudioPlayer();
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showWaveform, setShowWaveform] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [liked, setLiked] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    // Check if we have a saved preference in localStorage
    const savedState = localStorage.getItem("audioPlayerCollapsed");
    return savedState === "true";
  });
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    // Save the collapsed state to localStorage whenever it changes
    localStorage.setItem("audioPlayerCollapsed", String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.currentTime / audio.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    } else {
      audio.pause();
    }

    audio.volume = volume;
    
    // Handle looping
    audio.loop = isLooping;

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [currentTrack, isPlaying, volume, setProgress, isLooping]);

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0] * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setVolume(volume === 0 ? 0.7 : 0);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
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
      <div className={cn("audio-player-container", collapsed && "collapsed")}>
        <div className="audio-player-toggle" onClick={toggleCollapse}>
          {collapsed ? (
            <>
              <span className="mr-1 hidden sm:inline">Expand Player</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span className="mr-1 hidden sm:inline">Collapse Player</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </div>
        
        <div className="glass-panel p-4 border-t shadow-md animate-fade-in">
          <audio
            ref={audioRef}
            src={currentTrack.url}
            onEnded={nextTrack}
            hidden
          />

          <div className="flex items-center justify-between">
            {/* Track Info */}
            <div className="flex items-center space-x-4 w-1/4">
              <div 
                className="relative h-12 w-12 overflow-hidden rounded-md bg-muted animate-pulse-subtle cursor-pointer"
                onClick={openFullScreen}
              >
                <img
                  src={currentTrack.cover || "/placeholder.svg"}
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        liked ? "fill-destructive text-destructive" : ""
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {liked ? "Remove from favorites" : "Add to favorites"}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col w-2/4 space-y-2">
              <div className="flex items-center justify-center space-x-2">
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
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <Slider
                  value={[progress]}
                  max={1}
                  step={0.01}
                  onValueChange={handleProgressChange}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center justify-end space-x-2 w-1/4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={openFullScreen}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Full Screen</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {}}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Share</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {}}
                  >
                    <ListMusic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Queue</TooltipContent>
              </Tooltip>

              <div className="hidden sm:flex items-center space-x-2">
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
      </div>
      
      {/* Full Screen Player */}
      <FullScreenPlayer isOpen={isFullScreen} onClose={closeFullScreen} />
    </>
  );
};

export default AudioPlayer;

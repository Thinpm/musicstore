import React, { useState, useEffect } from "react";
import { useAudioPlayer } from "./audio-player-provider";
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
  Maximize2,
  Minimize2,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { FavoriteButton } from "@/components/favorite/favorite-button";

// Reuse the formatTime function from audio-player.tsx
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

type FullScreenPlayerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FullScreenPlayer = ({ isOpen, onClose }: FullScreenPlayerProps) => {
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

  useEffect(() => {
    // Update times based on progress
    if (currentTrack && duration) {
      setCurrentTime(progress * duration);
    }
  }, [progress, duration, currentTrack]);

  // Set the initial duration
  useEffect(() => {
    if (currentTrack) {
      setDuration(currentTrack.duration);
    }
  }, [currentTrack]);

  // Add keyboard shortcuts for ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " && currentTrack) {
        e.preventDefault();
        if (isPlaying) {
          pauseTrack();
        } else {
          resumeTrack();
        }
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPlaying, currentTrack, onClose, pauseTrack, resumeTrack]);

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0] * duration;
    setCurrentTime(newTime);
    setProgress(value[0]);
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

  const handleToggleLoop = () => {
    toggleLoop();
  };

  const handleToggleShuffle = () => {
    toggleShuffle();
  };

  if (!isOpen || !currentTrack) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 animate-fade-in overflow-hidden">
      {/* Background gradient with track image */}
      <div 
        className="absolute inset-0 opacity-20 blur-3xl"
        style={{
          backgroundImage: `url(${currentTrack.cover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Close button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-6 right-6 z-50"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
      
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center relative z-10">
        {/* Large album art */}
        <div className="w-full max-w-md aspect-square rounded-md overflow-hidden mb-8 shadow-xl relative group">
          <img
            src={currentTrack.cover || "/placeholder.svg"}
            alt={currentTrack.title}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              className="scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 rounded-full"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Track info */}
        <div className="text-center mb-8 w-full">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold">{currentTrack.title}</h1>
            <FavoriteButton
              songId={currentTrack.id}
              className="h-10 w-10"
            />
          </div>
          <p className="text-lg text-muted-foreground">{currentTrack.artist}</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full flex items-center space-x-2 mb-6">
          <span className="text-sm text-muted-foreground w-12 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[progress]}
            max={1}
            step={0.001}
            onValueChange={handleProgressChange}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-12">
            {formatTime(duration)}
          </span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full",
                  isShuffling ? "bg-primary/20 text-primary" : ""
                )}
                onClick={handleToggleShuffle}
              >
                <Shuffle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Phát ngẫu nhiên</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={previousTrack}
              >
                <SkipBack className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Bài trước</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-16 w-16 rounded-full"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {isPlaying ? "Tạm dừng" : "Phát"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={nextTrack}
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Bài tiếp theo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full",
                  isLooping ? "bg-primary/20 text-primary" : ""
                )}
                onClick={handleToggleLoop}
              >
                <Repeat className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Lặp lại</TooltipContent>
          </Tooltip>
        </div>
        
        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleMute}
          >
            {volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : volume < 0.5 ? (
              <Volume1 className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-28"
          />
        </div>
      </div>
    </div>
  );
};

export default FullScreenPlayer;

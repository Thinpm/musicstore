import { createContext, useContext, useState, useRef, useEffect } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  cover?: string;
  url: string;
}

interface PlaylistContext {
  tracks: Track[];
  currentIndex: number;
}

type AudioPlayerContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  isLooping: boolean;
  isShuffling: boolean;
  playTrack: (track: Track, playlistContext?: PlaylistContext) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  setVolume: (value: number) => void;
  setProgress: (value: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  playHistory: Track[];
  currentPlaylist: PlaylistContext | null;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
  undefined
);

export const AudioPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistContext | null>(null);
  
  const autoAdvanceRef = useRef(true);

  useEffect(() => {
    if (currentTrack && progress >= 0.999 && autoAdvanceRef.current) {
      const timer = setTimeout(() => {
        nextTrack();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [progress, currentTrack]);

  const playTrack = (track: Track, playlistContext?: PlaylistContext) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    
    setPlayHistory(prev => {
      const newHistory = [...prev];
      
      if (newHistory.length === 0 || newHistory[newHistory.length - 1].id !== track.id) {
        newHistory.push(track);
      }
      
      if (newHistory.length > 50) {
        return newHistory.slice(newHistory.length - 50);
      }
      
      return newHistory;
    });
    
    if (playlistContext) {
      setCurrentPlaylist(playlistContext);
    }
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const resumeTrack = () => {
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (!currentPlaylist || !currentTrack) return;
    
    const { tracks, currentIndex } = currentPlaylist;
    
    if (isShuffling) {
      if (tracks.length <= 1) return;
      
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * tracks.length);
      } while (randomIndex === currentIndex);
      
      const nextTrack = tracks[randomIndex];
      playTrack(nextTrack, { tracks, currentIndex: randomIndex });
      return;
    }
    
    if (currentIndex < tracks.length - 1) {
      const nextTrack = tracks[currentIndex + 1];
      playTrack(nextTrack, { tracks, currentIndex: currentIndex + 1 });
    } else if (isLooping) {
      const nextTrack = tracks[0];
      playTrack(nextTrack, { tracks, currentIndex: 0 });
    } else {
      pauseTrack();
      setProgress(0);
    }
  };

  const previousTrack = () => {
    if (!currentPlaylist || !currentTrack) return;
    
    const { tracks, currentIndex } = currentPlaylist;
    
    if (currentIndex === 0) {
      setProgress(0);
      return;
    }
    
    const prevTrack = tracks[currentIndex - 1];
    playTrack(prevTrack, { tracks, currentIndex: currentIndex - 1 });
  };
  
  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };
  
  const toggleShuffle = () => {
    setIsShuffling(!isShuffling);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        progress,
        isLooping,
        isShuffling,
        playTrack,
        pauseTrack,
        resumeTrack,
        setVolume,
        setProgress,
        nextTrack,
        previousTrack,
        toggleLoop,
        toggleShuffle,
        playHistory,
        currentPlaylist,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error(
      "useAudioPlayer must be used within an AudioPlayerProvider"
    );
  }
  return context;
};

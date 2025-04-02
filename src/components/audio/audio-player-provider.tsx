import { createContext, useContext, useState, useRef, useEffect } from "react";

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  cover?: string;
  url: string;
  canDownload?: boolean;
}

interface PlaylistContext {
  tracks: Track[];
  currentIndex: number;
}

interface PlayerState {
  volume: number;
  isLooping: boolean;
  isShuffling: boolean;
  collapsed: boolean;
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
  error: string | null;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

const STORAGE_KEY = "audioPlayerState";

const getStoredState = (): PlayerState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse stored audio player state:", e);
    }
  }
  return {
    volume: 0.7,
    isLooping: false,
    isShuffling: false,
    collapsed: false
  };
};

export const AudioPlayerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const storedState = getStoredState();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, _setVolume] = useState(storedState.volume);
  const [progress, _setProgress] = useState(0);
  const [isLooping, setIsLooping] = useState(storedState.isLooping);
  const [isShuffling, setIsShuffling] = useState(storedState.isShuffling);
  const [playHistory, setPlayHistory] = useState<Track[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shuffledIndicesRef = useRef<number[]>([]);
  const currentShuffleIndexRef = useRef<number>(-1);
  const autoAdvanceRef = useRef(true);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;
    audioRef.current.loop = isLooping;

    const handleEnded = () => {
      if (isLooping) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      } else {
        nextTrack();
      }
    };

    const handleError = (e: any) => {
      console.error('Audio error:', e);
      setError("Không thể phát bài hát. Vui lòng thử lại.");
      setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        const duration = audioRef.current.duration || 0;
        if (duration > 0) {
          _setProgress(audioRef.current.currentTime / duration);
        }
      }
    };

    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('error', handleError);
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.pause();
      }
    };
  }, []);

  // Update audio properties when they change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = isLooping;
    }
  }, [volume, isLooping]);

  // Save state changes to localStorage
  useEffect(() => {
    const state: PlayerState = {
      volume,
      isLooping,
      isShuffling,
      collapsed: false
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [volume, isLooping, isShuffling]);

  // Reset shuffle when playlist changes or shuffle is toggled
  useEffect(() => {
    if (currentPlaylist && isShuffling) {
      const indices = Array.from(
        { length: currentPlaylist.tracks.length },
        (_, i) => i
      ).filter(i => i !== currentPlaylist.currentIndex);
      shuffledIndicesRef.current = [
        currentPlaylist.currentIndex,
        ...indices.sort(() => Math.random() - 0.5)
      ];
      currentShuffleIndexRef.current = 0;
    }
  }, [currentPlaylist, isShuffling]);

  const playTrack = async (track: Track, playlistContext?: PlaylistContext) => {
    try {
      // Validate URL
      if (!track.url) {
        throw new Error("URL bài hát không tồn tại");
      }

      try {
        const url = new URL(track.url);
        if (!url.protocol.startsWith('http')) {
          throw new Error("URL không hợp lệ");
        }

        // Kiểm tra xem URL có thể truy cập được không
        const response = await fetch(url.toString(), { method: 'HEAD' });
        if (!response.ok) {
          throw new Error("Không thể truy cập URL bài hát");
        }
      } catch (e) {
        throw new Error("URL bài hát không hợp lệ");
      }

      if (audioRef.current) {
        // Stop current playback
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        
        // Set new track
        audioRef.current.src = track.url;
        
        try {
          await audioRef.current.play();
          setCurrentTrack(track);
          setIsPlaying(true);
          setProgress(0);
          setError(null);
          
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
            if (isShuffling) {
              const indices = Array.from(
                { length: playlistContext.tracks.length },
                (_, i) => i
              ).filter(i => i !== playlistContext.currentIndex);
              shuffledIndicesRef.current = [
                playlistContext.currentIndex,
                ...indices.sort(() => Math.random() - 0.5)
              ];
              currentShuffleIndexRef.current = 0;
            }
          }
        } catch (e) {
          console.error("Lỗi khi phát nhạc:", e);
          throw new Error("Không thể phát bài hát. Vui lòng thử lại sau.");
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Không thể phát bài hát. Vui lòng thử lại.";
      setError(errorMessage);
      console.error("Lỗi khi phát bài hát:", e);
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  };

  const nextTrack = () => {
    if (!currentPlaylist || !currentTrack) return;
    
    try {
      const { tracks, currentIndex } = currentPlaylist;
      
      if (isShuffling) {
        if (currentShuffleIndexRef.current < shuffledIndicesRef.current.length - 1) {
          currentShuffleIndexRef.current++;
          const nextIndex = shuffledIndicesRef.current[currentShuffleIndexRef.current];
          const nextTrack = tracks[nextIndex];
          playTrack(nextTrack, { tracks, currentIndex: nextIndex });
        } else if (isLooping) {
          // Reshuffle and start over
          const indices = Array.from(
            { length: tracks.length },
            (_, i) => i
          ).sort(() => Math.random() - 0.5);
          shuffledIndicesRef.current = indices;
          currentShuffleIndexRef.current = 0;
          const nextTrack = tracks[indices[0]];
          playTrack(nextTrack, { tracks, currentIndex: indices[0] });
        } else {
          pauseTrack();
          setProgress(0);
        }
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
    } catch (e) {
      setError("Không thể phát bài hát tiếp theo. Vui lòng thử lại.");
      console.error("Error playing next track:", e);
    }
  };

  const previousTrack = () => {
    if (!currentPlaylist || !currentTrack) return;
    
    try {
      const { tracks, currentIndex } = currentPlaylist;
      
      if (isShuffling && currentShuffleIndexRef.current > 0) {
        currentShuffleIndexRef.current--;
        const prevIndex = shuffledIndicesRef.current[currentShuffleIndexRef.current];
        const prevTrack = tracks[prevIndex];
        playTrack(prevTrack, { tracks, currentIndex: prevIndex });
        return;
      }
      
      if (currentIndex > 0) {
        const prevTrack = tracks[currentIndex - 1];
        playTrack(prevTrack, { tracks, currentIndex: currentIndex - 1 });
      } else {
        setProgress(0);
      }
    } catch (e) {
      setError("Không thể phát bài hát trước đó. Vui lòng thử lại.");
      console.error("Error playing previous track:", e);
    }
  };

  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeTrack = () => {
    if (audioRef.current && currentTrack) {
      try {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setError(null);
          })
          .catch((e) => {
            setError("Không thể tiếp tục phát. Vui lòng thử lại.");
            console.error("Error resuming track:", e);
          });
      } catch (e) {
        setError("Không thể tiếp tục phát. Vui lòng thử lại.");
        console.error("Error resuming track:", e);
      }
    }
  };
  
  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };
  
  const toggleShuffle = () => {
    setIsShuffling(prev => !prev);
  };

  const setVolume = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    _setVolume(value);
  };

  const setProgress = (value: number) => {
    if (audioRef.current) {
      const duration = audioRef.current.duration || 0;
      if (duration > 0) {
        const newTime = value * duration;
        if (isFinite(newTime)) {
          audioRef.current.currentTime = newTime;
          _setProgress(value);
        }
      }
    }
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
        error
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
};

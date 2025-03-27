import { apiService } from "./api";
import { Track } from "@/components/audio/audio-player-provider";

// Playlist interface
export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackCount: number;
  tracks?: Track[];
}

// Mock data
const MOCK_PLAYLISTS: Playlist[] = [
  {
    id: "1",
    title: "Summer Vibes",
    description: "Perfect tracks for sunny days",
    coverUrl: "https://images.unsplash.com/photo-1534196511436-921a4e99f297?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyfGVufDB8fDB8fHww",
    trackCount: 3,
  },
  {
    id: "2",
    title: "Chill Lofi Beats",
    description: "Relaxing background music",
    coverUrl: "https://images.unsplash.com/photo-1482442120256-9c4a5ab72d4c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaWxsfGVufDB8fDB8fHww",
    trackCount: 2,
  },
  {
    id: "3",
    title: "Workout Mix",
    description: "High energy tracks for exercise",
    coverUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29ya291dHxlbnwwfHwwfHx8MA%3D%3D",
    trackCount: 3,
  },
  {
    id: "4",
    title: "Focus & Study",
    description: "Concentration enhancing sounds",
    coverUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3R1ZHl8ZW58MHx8MHx8fDA%3D",
    trackCount: 2,
  },
];

// Mock tracks data for each playlist
const MOCK_PLAYLIST_TRACKS: Record<string, Track[]> = {
  "1": [
    {
      id: "101",
      title: "Beach Sunrise",
      artist: "Ocean Waves",
      duration: 217,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2h8ZW58MHx8MHx8fDA%3D",
    },
    {
      id: "102",
      title: "Tropical Breeze",
      artist: "Island Sounds",
      duration: 198,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGJlYWNofGVufDB8fDB8fHww",
    },
    {
      id: "103",
      title: "Summer Nights",
      artist: "Coastal Rhythms",
      duration: 245,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3VtbWVyJTIwbmlnaHR8ZW58MHx8MHx8fDA%3D",
    },
  ],
  "2": [
    {
      id: "201",
      title: "Midnight Coffee",
      artist: "Chill Hop",
      duration: 182,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1497935586047-9242eb4fc795?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNvZmZlZSUyMG1pZG5pZ2h0fGVufDB8fDB8fHww",
    },
    {
      id: "202",
      title: "Rainy Day",
      artist: "Lo-Fi Mood",
      duration: 214,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1501691223387-dd0500403074?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFpbnklMjBkYXl8ZW58MHx8MHx8fDA%3D",
    },
  ],
  "3": [
    {
      id: "301",
      title: "Power Up",
      artist: "Fitness Beat",
      duration: 168,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltfGVufDB8fDB8fHww",
    },
    {
      id: "302",
      title: "Push Limits",
      artist: "Workout Mix",
      duration: 194,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z3ltfGVufDB8fDB8fHww",
    },
    {
      id: "303",
      title: "Energy Rush",
      artist: "Active Beats",
      duration: 176,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGd5bXxlbnwwfHwwfHx8MA%3D%3D",
    },
  ],
  "4": [
    {
      id: "401",
      title: "Deep Focus",
      artist: "Study Sessions",
      duration: 236,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3R1ZHl8ZW58MHx8MHx8fDA%3D",
    },
    {
      id: "402",
      title: "Concentration",
      artist: "Mind Flow",
      duration: 252,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3R1ZHl8ZW58MHx8MHx8fDA%3D",
    },
  ],
};

export interface PlaylistQuery {
  startsWith?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const playlistService = {
  /**
   * Get all playlists with optional filtering
   */
  getAllPlaylists: async (query: PlaylistQuery = {}): Promise<Playlist[]> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Filter playlists by first letter if specified
        let filteredPlaylists = [...MOCK_PLAYLISTS];
        
        if (query.startsWith) {
          filteredPlaylists = filteredPlaylists.filter(playlist => 
            playlist.title.toLowerCase().startsWith(query.startsWith!.toLowerCase())
          );
        }
        
        // Sort playlists if specified
        if (query.sortBy) {
          filteredPlaylists.sort((a, b) => {
            const aValue = a[query.sortBy as keyof Playlist];
            const bValue = b[query.sortBy as keyof Playlist];
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return query.sortOrder === 'desc' 
                ? bValue.localeCompare(aValue) 
                : aValue.localeCompare(bValue);
            }
            
            return 0;
          });
        }
        
        // Apply pagination if specified
        if (query.limit !== undefined && query.offset !== undefined) {
          filteredPlaylists = filteredPlaylists.slice(query.offset, query.offset + query.limit);
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return filteredPlaylists;
      }
      
      // Actual API implementation
      return await apiService.get<Playlist[]>('/playlists', {
        headers: {
          // Add any custom headers here if needed
        },
      });
    } catch (error) {
      console.error("Error fetching playlists:", error);
      return [];
    }
  },
  
  /**
   * Get playlists that start with a specific letter
   */
  getPlaylistsByLetter: async (letter: string): Promise<Playlist[]> => {
    return playlistService.getAllPlaylists({ startsWith: letter });
  },
  
  /**
   * Get a single playlist by ID, optionally with its tracks
   */
  getPlaylistById: async (id: string, includeTracks = false): Promise<Playlist | null> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        const playlist = MOCK_PLAYLISTS.find(p => p.id === id);
        
        if (!playlist) return null;
        
        // Clone to avoid modifying the original
        const result = { ...playlist };
        
        // Include tracks if requested
        if (includeTracks) {
          result.tracks = MOCK_PLAYLIST_TRACKS[id] || [];
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return result;
      }
      
      // Actual API implementation
      const endpoint = includeTracks 
        ? `/playlists/${id}?includeTracks=true` 
        : `/playlists/${id}`;
        
      return await apiService.get<Playlist>(endpoint);
    } catch (error) {
      console.error(`Error fetching playlist ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Create a new playlist
   */
  createPlaylist: async (playlistData: Omit<Playlist, 'id' | 'trackCount'>): Promise<Playlist | null> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Create a new mock playlist with a unique ID
        const newId = (Math.max(...MOCK_PLAYLISTS.map(p => parseInt(p.id))) + 1).toString();
        
        const newPlaylist: Playlist = {
          id: newId,
          title: playlistData.title,
          description: playlistData.description,
          coverUrl: playlistData.coverUrl || "/placeholder.svg",
          trackCount: 0,
          tracks: [],
        };
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return newPlaylist;
      }
      
      // Actual API implementation
      return await apiService.post<Playlist>('/playlists', playlistData);
    } catch (error) {
      console.error("Error creating playlist:", error);
      return null;
    }
  },
  
  /**
   * Update an existing playlist
   */
  updatePlaylist: async (id: string, playlistData: Partial<Omit<Playlist, 'id'>>): Promise<Playlist | null> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Simulate updating a playlist
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const playlist = MOCK_PLAYLISTS.find(p => p.id === id);
        if (!playlist) return null;
        
        const updatedPlaylist = { ...playlist, ...playlistData };
        
        return updatedPlaylist;
      }
      
      // Actual API implementation
      return await apiService.put<Playlist>(`/playlists/${id}`, playlistData);
    } catch (error) {
      console.error(`Error updating playlist ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Delete a playlist
   */
  deletePlaylist: async (id: string): Promise<boolean> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Simulate playlist deletion
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      }
      
      // Actual API implementation
      await apiService.delete(`/playlists/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting playlist ${id}:`, error);
      return false;
    }
  },
  
  /**
   * Add a track to a playlist
   */
  addTrackToPlaylist: async (playlistId: string, trackId: string): Promise<boolean> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Simulate adding track to playlist
        await new Promise(resolve => setTimeout(resolve, 300));
        return true;
      }
      
      // Actual API implementation
      await apiService.post(`/playlists/${playlistId}/tracks`, { trackId });
      return true;
    } catch (error) {
      console.error(`Error adding track ${trackId} to playlist ${playlistId}:`, error);
      return false;
    }
  },
  
  /**
   * Remove a track from a playlist
   */
  removeTrackFromPlaylist: async (playlistId: string, trackId: string): Promise<boolean> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Simulate removing track from playlist
        await new Promise(resolve => setTimeout(resolve, 300));
        return true;
      }
      
      // Actual API implementation
      await apiService.delete(`/playlists/${playlistId}/tracks/${trackId}`);
      return true;
    } catch (error) {
      console.error(`Error removing track ${trackId} from playlist ${playlistId}:`, error);
      return false;
    }
  }
};

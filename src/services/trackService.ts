import { apiService } from "./api";
import { Track } from "@/components/audio/audio-player-provider";

// Mock data để sử dụng khi phát triển
const MOCK_TRACKS: Track[] = [
  {
    id: "1",
    title: "Digital Resonance",
    artist: "Electronic Waves",
    duration: 243,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG11c2ljfGVufDB8fDB8fHww",
  },
  {
    id: "2",
    title: "Ambient Reflections",
    artist: "Chill Horizon",
    duration: 312,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bXVzaWN8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: "3",
    title: "Urban Echoes",
    artist: "City Pulse",
    duration: 198,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bXVzaWN8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: "4",
    title: "Night Drive",
    artist: "Midnight Cruisers",
    duration: 274,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWN8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: "5",
    title: "Sunrise Memories",
    artist: "Dawn Collective",
    duration: 226,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljfGVufDB8fDB8fHww",
  },
  {
    id: "6",
    title: "Sunset Grooves",
    artist: "Coastal Rhythms",
    duration: 258,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG11c2ljfGVufDB8fDB8fHww",
  },
];

export interface TrackQuery {
  startsWith?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const trackService = {
  /**
   * Fetch all tracks with optional filtering
   */
  getAllTracks: async (query: TrackQuery = {}): Promise<Track[]> => {
    // MOCK implementation - replace with actual API call when backend is ready
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Filter tracks by first letter if specified
        let filteredTracks = [...MOCK_TRACKS];
        
        if (query.startsWith) {
          filteredTracks = filteredTracks.filter(track => 
            track.title.toLowerCase().startsWith(query.startsWith!.toLowerCase())
          );
        }
        
        // Sort tracks if specified
        if (query.sortBy) {
          filteredTracks.sort((a, b) => {
            const aValue = a[query.sortBy as keyof Track];
            const bValue = b[query.sortBy as keyof Track];
            
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
          filteredTracks = filteredTracks.slice(query.offset, query.offset + query.limit);
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return filteredTracks;
      }
      
      // Actual API implementation
      return await apiService.get<Track[]>('/tracks', {
        headers: {
          // Add any custom headers here if needed
        },
      });
    } catch (error) {
      console.error("Error fetching tracks:", error);
      return [];
    }
  },
  
  /**
   * Fetch tracks that start with a specific letter
   */
  getTracksByLetter: async (letter: string): Promise<Track[]> => {
    return trackService.getAllTracks({ startsWith: letter });
  },
  
  /**
   * Get a single track by ID
   */
  getTrackById: async (id: string): Promise<Track | null> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        const track = MOCK_TRACKS.find(t => t.id === id);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return track || null;
      }
      
      return await apiService.get<Track>(`/tracks/${id}`);
    } catch (error) {
      console.error(`Error fetching track ${id}:`, error);
      return null;
    }
  },
  
  /**
   * Upload a new track
   */
  uploadTrack: async (
    file: File, 
    metadata: Omit<Track, 'id' | 'url' | 'duration'>
  ): Promise<Track | null> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Simulate successful upload with mock data
        const newId = (Math.max(...MOCK_TRACKS.map(t => parseInt(t.id))) + 1).toString();
        
        // Get audio duration
        let duration = 180; // Default 3 minutes
        
        try {
          // Try to get actual duration if browser supports it
          const audio = new Audio();
          audio.src = URL.createObjectURL(file);
          await new Promise((resolve) => {
            audio.onloadedmetadata = () => {
              duration = Math.round(audio.duration);
              resolve(duration);
            };
          });
        } catch (err) {
          console.warn("Could not get audio duration", err);
        }
        
        // Create mock track
        const newTrack: Track = {
          id: newId,
          title: metadata.title || file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          artist: metadata.artist || "Unknown Artist",
          duration: duration,
          url: URL.createObjectURL(file), // Local URL for preview
          cover: metadata.cover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG11c2ljfGVufDB8fDB8fHww",
        };
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return newTrack;
      }
      
      // Real implementation with FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));
      
      return await apiService.post<Track>('/tracks/upload', formData, {
        headers: {
          // Remove Content-Type to let browser set it with boundary for FormData
          'Content-Type': undefined as any,
        },
      });
    } catch (error) {
      console.error("Error uploading track:", error);
      return null;
    }
  },
  
  /**
   * Delete a track by ID
   */
  deleteTrack: async (id: string): Promise<boolean> => {
    try {
      if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
        // Simulate track deletion
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      }
      
      await apiService.delete(`/tracks/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting track ${id}:`, error);
      return false;
    }
  }
};

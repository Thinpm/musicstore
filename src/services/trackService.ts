
import { supabase } from "@/lib/supabase";
import { apiService } from "./api";
import { Track } from "@/components/audio/audio-player-provider";
import { Tables } from "@/types/supabase";

export interface TrackQuery {
  startsWith?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Helper to transform Supabase song data to our Track format
const transformTrackData = (songData: Tables<'songs'>): Track => {
  return {
    id: songData.id,
    title: songData.title,
    artist: songData.artist || "Unknown Artist",
    duration: songData.duration || 0,
    url: songData.url,
    cover: songData.cover_url || "/placeholder.svg",
  };
};

export const trackService = {
  /**
   * Fetch all tracks with optional filtering
   */
  getAllTracks: async (query: TrackQuery = {}): Promise<Track[]> => {
    try {
      let tracksQuery = supabase
        .from('songs')
        .select('*');
      
      // Filter by starting letter if provided
      if (query.startsWith) {
        tracksQuery = tracksQuery.ilike('title', `${query.startsWith}%`);
      }
      
      // Apply sorting if provided
      if (query.sortBy) {
        tracksQuery = tracksQuery.order(query.sortBy, { 
          ascending: query.sortOrder !== 'desc' 
        });
      } else {
        // Default sort by title ascending
        tracksQuery = tracksQuery.order('title', { ascending: true });
      }
      
      // Apply pagination if provided
      if (query.limit !== undefined) {
        tracksQuery = tracksQuery.limit(query.limit);
      }
      
      if (query.offset !== undefined) {
        tracksQuery = tracksQuery.range(
          query.offset, 
          query.offset + (query.limit || 10) - 1
        );
      }
      
      const { data, error } = await tracksQuery;
      
      if (error) throw new Error(error.message);
      
      return (data || []).map(transformTrackData);
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
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw new Error(error.message);
      
      return transformTrackData(data);
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
    metadata: Omit<Track, 'id' | 'url' | 'duration'>,
    onProgressUpdate?: (progress: number) => void
  ): Promise<Track | null> => {
    try {
      // Get current user
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) throw new Error("User not authenticated");
      
      const userId = session.session.user.id;
      
      // Create a unique file path in storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `audio/${fileName}`;
      
      // Upload audio file to Supabase Storage
      let currentProgress = 0;
      
      // Manually handle progress updates since Supabase doesn't support it directly
      if (onProgressUpdate) {
        onProgressUpdate(10); // Starting progress
        currentProgress = 10;
      }
      
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('songs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (storageError) throw new Error(storageError.message);
      
      if (onProgressUpdate) {
        onProgressUpdate(70); // File uploaded, now metadata
        currentProgress = 70;
      }
      
      // Get public URL for the file
      const { data: urlData } = supabase
        .storage
        .from('songs')
        .getPublicUrl(filePath);
      
      // Get audio duration - attempt to get it client-side
      let duration = 0;
      try {
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        await new Promise((resolve) => {
          audio.onloadedmetadata = () => {
            duration = Math.round(audio.duration);
            resolve(duration);
          };
          
          // Fallback if metadata loading fails
          setTimeout(() => {
            if (duration === 0) {
              duration = 180; // Default 3 minutes
              resolve(duration);
            }
          }, 3000);
        });
      } catch (err) {
        console.warn("Could not get audio duration", err);
        duration = 180; // Default 3 minutes as fallback
      }
      
      if (onProgressUpdate) {
        onProgressUpdate(85); // Creating database entry
        currentProgress = 85;
      }
      
      // Create entry in the songs table
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .insert([{
          title: metadata.title,
          artist: metadata.artist,
          duration: duration,
          url: urlData.publicUrl,
          cover_url: metadata.cover,
          user_id: userId,
          is_public: true
        }])
        .select()
        .single();
      
      if (songError) throw new Error(songError.message);
      
      if (onProgressUpdate) {
        onProgressUpdate(100); // Complete
      }
      
      return transformTrackData(songData);
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
      // First, get the track to find the storage path
      const { data: track, error: getError } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (getError) throw new Error(getError.message);
      
      // Delete from the songs table
      const { error: deleteError } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw new Error(deleteError.message);
      
      // Extract the file path from the URL and delete from storage
      // This assumes the URL has a pattern we can parse to get the storage path
      // This is a simplified approach and may need adjustment based on your URL structure
      try {
        const url = new URL(track.url);
        const pathMatch = url.pathname.match(/\/songs\/(.+)$/);
        
        if (pathMatch && pathMatch[1]) {
          const storagePath = decodeURIComponent(pathMatch[1]);
          
          // Delete from storage
          const { error: storageError } = await supabase
            .storage
            .from('songs')
            .remove([storagePath]);
          
          if (storageError) {
            console.error("Error removing file from storage:", storageError);
            // We continue even if storage deletion fails - the DB record is gone
          }
        }
      } catch (storageError) {
        console.error("Error parsing URL or deleting from storage:", storageError);
        // We continue even if storage deletion fails - the DB record is gone
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting track ${id}:`, error);
      return false;
    }
  }
};

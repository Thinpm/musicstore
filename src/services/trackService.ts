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
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return [];

      let tracksQuery = supabase
        .from('songs')
        .select('*')
        .eq('user_id', session.session.user.id);
      
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
    onProgressUpdate?: (progress: number) => void,
    coverImage?: File | null
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

      console.log('Uploading file:', {
        originalName: file.name,
        filePath,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Upload audio file to Supabase Storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('songs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
      
      if (storageError) throw new Error(storageError.message);

      console.log('File uploaded successfully:', {
        storageData,
        path: filePath
      });
      
      // Get signed URL that will work for streaming
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from('songs')
        .createSignedUrl(filePath, 31536000);

      if (signedError) throw new Error(signedError.message);

      // Remove any existing query parameters and create clean URL
      const url = new URL(signedData.signedUrl);
      const cleanUrl = `${url.origin}${url.pathname}?token=${url.searchParams.get('token')}`;

      // Handle cover image if provided
      let coverUrl = metadata.cover;
      if (coverImage) {
        // Upload cover image
        const coverFileName = `${userId}/${Date.now()}_cover.jpg`;
        const coverPath = coverFileName;
        
        const { data: coverData, error: coverError } = await supabase
          .storage
          .from('covers')
          .upload(coverPath, coverImage, {
            cacheControl: '3600',
            upsert: true,
            contentType: coverImage.type
          });
          
        if (coverError) {
          console.error('Error uploading cover:', coverError);
        } else {
          // Get signed URL for cover
          const { data: coverUrlData, error: coverUrlError } = await supabase
            .storage
            .from('covers')
            .createSignedUrl(coverPath, 31536000); // URL valid for 1 year
            
          if (coverUrlError) {
            console.error('Error getting cover URL:', coverUrlError);
          } else {
            // Remove any existing query parameters and create clean URL
            const url = new URL(coverUrlData.signedUrl);
            coverUrl = `${url.origin}${url.pathname}?token=${url.searchParams.get('token')}`;
          }
        }
      }

      console.log('Generated URLs:', {
        audioUrl: cleanUrl,
        coverUrl: coverUrl
      });
      
      // Get audio duration - attempt to get it client-side
      let duration = 0;
      try {
        const audio = new Audio(cleanUrl);
        await new Promise((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            // Làm tròn duration thành số nguyên
            duration = Math.round(audio.duration);
            resolve(null);
          });
        });
      } catch (error) {
        console.error('Error getting duration:', error);
        // Nếu không lấy được duration, mặc định là 0
        duration = 0;
      }

      // Insert record into songs table
      const { data: songData, error: insertError } = await supabase
        .from('songs')
        .insert([
          {
            title: metadata.title,
            artist: metadata.artist,
            duration: duration,
            url: cleanUrl,
            cover_url: coverUrl,
            user_id: userId,
            is_public: true
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting song record:', insertError);
        throw new Error(insertError.message);
      }

      console.log('Song record created:', songData);

      return transformTrackData(songData);
    } catch (error) {
      console.error("Error uploading track:", error);
      throw error;
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

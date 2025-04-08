import { supabase } from "@/lib/supabase";
import { apiService } from "./api";
import { Track } from "@/components/audio/audio-player-provider";

interface SongData {
  id: string;
  title: string;
  artist: string | null;
  duration: number | null;
  url: string;
  cover_url: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface TrackQuery {
  startsWith?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Helper to transform Supabase song data to our Track format
const transformTrackData = (songData: SongData): Track => {
  return {
    id: songData.id,
    title: songData.title,
    artist: songData.artist || "Unknown Artist",
    duration: songData.duration || 0,
    url: songData.url,
    cover: songData.cover_url && songData.cover_url.trim() ? songData.cover_url : "/placeholder.svg",
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

      // Keep the full signed URL for streaming
      const cleanUrl = signedData.signedUrl;

      // Handle cover image if provided
      let coverUrl = metadata.cover;
      if (coverImage) {
        // Upload cover image
        const coverFileName = `${userId}/${Date.now()}_cover.jpg`;
        const coverPath = coverFileName;
        
        console.log('Uploading cover image:', {
          originalName: coverImage.name,
          coverPath,
          fileSize: coverImage.size,
          fileType: coverImage.type
        });

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
          console.log('Cover image uploaded successfully:', coverData);
          
          // Get signed URL for cover that's valid for 1 year
          const { data: coverSignedData, error: coverSignedError } = await supabase
            .storage
            .from('covers')
            .createSignedUrl(coverPath, 31536000);
            
          if (coverSignedError) {
            console.error('Error getting signed URL for cover:', coverSignedError);
          } else if (coverSignedData) {
            // Clean up the signed URL similar to audio URL
            const urlObj = new URL(coverSignedData.signedUrl);
            const cleanCoverUrl = `${urlObj.origin}${urlObj.pathname}?token=${urlObj.searchParams.get('token')}`;
            coverUrl = cleanCoverUrl;
            console.log('Generated clean cover URL:', coverUrl);
          }
        }
      }

      console.log('Final URLs:', {
        audioUrl: cleanUrl,
        coverUrl: coverUrl
      });
      
      // Get audio duration - attempt to get it client-side
      let duration = 0;
      try {
        const audio = new Audio();
        await new Promise((resolve, reject) => {
          audio.addEventListener('loadedmetadata', () => {
            if (audio.duration && !isNaN(audio.duration)) {
              duration = Math.round(audio.duration);
              resolve(null);
            } else {
              reject(new Error("Invalid duration"));
            }
          });

          audio.addEventListener('error', () => {
            reject(new Error("Error loading audio"));
          });

          audio.src = cleanUrl;
        });
      } catch (error) {
        console.error('Error getting duration:', error);
        // Nếu không lấy được duration, mặc định là 0
        duration = 0;
      }

      // Create song record in database
      const { data: songData, error: dbError } = await supabase
        .from('songs')
        .insert([{
          title: metadata.title,
          artist: metadata.artist,
          url: cleanUrl,
          cover_url: coverUrl || null,
          user_id: userId,
          duration: duration || 0 // Đảm bảo duration không null
        }])
        .select()
        .single();

      if (dbError) throw new Error(dbError.message);

      console.log('Created song record:', songData);
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
      // First delete all references in playlist_songs
      const { error: playlistError } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('song_id', id);

      if (playlistError) throw playlistError;

      // Then delete the song itself
      const { error: songError } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);
      
      if (songError) throw songError;
      return true;
    } catch (error) {
      console.error(`Error deleting track ${id}:`, error);
      return false;
    }
  },

  /**
   * Lọc bài hát theo chữ cái đầu tiên
   */
  filterSongsByLetter: async (letter: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");

      const { data: songs, error } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", session.session.user.id)
        .ilike("title", `${letter}%`);

      if (error) throw error;

      return songs.map((song) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        url: song.url,
        cover: song.cover_url,
      }));
    } catch (error) {
      console.error("Error filtering songs by letter:", error);
      throw error;
    }
  },

  /**
   * Tìm kiếm bài hát theo chữ cái
   */
  searchByLetter: async (letter: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");

      const { data: songs, error } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", session.session.user.id)
        .or(`title.ilike.${letter}%, artist.ilike.${letter}%`)
        .order('title', { ascending: true });

      if (error) throw error;

      return songs.map((song) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        url: song.url,
        cover: song.cover_url,
      }));
    } catch (error) {
      console.error("Error searching songs by letter:", error);
      throw error;
    }
  }
};

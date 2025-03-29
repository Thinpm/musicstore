
import { supabase } from "@/lib/supabase";
import { Track } from "@/components/audio/audio-player-provider";
import { Tables } from "@/types/supabase";
import { trackService } from "./trackService";

// Playlist interface
export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  trackCount: number;
  tracks?: Track[];
}

// Helper to transform Supabase playlist data to our Playlist format
const transformPlaylistData = (
  playlistData: Tables<'playlists'>, 
  trackCount = 0,
  tracks?: Track[]
): Playlist => {
  return {
    id: playlistData.id,
    title: playlistData.name,
    description: playlistData.description || "",
    coverUrl: playlistData.cover_url || "/placeholder.svg",
    trackCount: trackCount,
    tracks: tracks,
  };
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
      // Get current user
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) throw new Error("User not authenticated");
      
      const userId = session.session.user.id;
      
      // Query playlists
      let playlistsQuery = supabase
        .from('playlists')
        .select('*')
        .eq('user_id', userId);
      
      // Filter by starting letter if provided
      if (query.startsWith) {
        playlistsQuery = playlistsQuery.ilike('name', `${query.startsWith}%`);
      }
      
      // Apply sorting if provided
      if (query.sortBy) {
        playlistsQuery = playlistsQuery.order(query.sortBy, { 
          ascending: query.sortOrder !== 'desc' 
        });
      } else {
        // Default sort by name ascending
        playlistsQuery = playlistsQuery.order('name', { ascending: true });
      }
      
      // Apply pagination if provided
      if (query.limit !== undefined) {
        playlistsQuery = playlistsQuery.limit(query.limit);
      }
      
      if (query.offset !== undefined) {
        playlistsQuery = playlistsQuery.range(
          query.offset, 
          query.offset + (query.limit || 10) - 1
        );
      }
      
      const { data: playlists, error: playlistsError } = await playlistsQuery;
      
      if (playlistsError) throw new Error(playlistsError.message);
      
      // For each playlist, get the track count
      const playlistsWithCounts = await Promise.all((playlists || []).map(async (playlist) => {
        const { count, error: countError } = await supabase
          .from('playlist_songs')
          .select('*', { count: 'exact', head: true })
          .eq('playlist_id', playlist.id);
        
        if (countError) {
          console.error(`Error getting track count for playlist ${playlist.id}:`, countError);
          return transformPlaylistData(playlist, 0);
        }
        
        return transformPlaylistData(playlist, count || 0);
      }));
      
      return playlistsWithCounts;
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
      // Get the playlist
      const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id)
        .single();
      
      if (playlistError) throw new Error(playlistError.message);
      
      // Get track count
      const { count, error: countError } = await supabase
        .from('playlist_songs')
        .select('*', { count: 'exact', head: true })
        .eq('playlist_id', id);
      
      if (countError) throw new Error(countError.message);
      
      if (!includeTracks) {
        return transformPlaylistData(playlist, count || 0);
      }
      
      // Get track IDs in this playlist
      const { data: playlistSongs, error: tracksError } = await supabase
        .from('playlist_songs')
        .select('song_id')
        .eq('playlist_id', id)
        .order('position', { ascending: true, nullsFirst: false });
      
      if (tracksError) throw new Error(tracksError.message);
      
      if (!playlistSongs || playlistSongs.length === 0) {
        return transformPlaylistData(playlist, 0, []);
      }
      
      // Get the actual track data for each track ID
      const trackIds = playlistSongs.map(item => item.song_id);
      
      const { data: songs, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .in('id', trackIds);
      
      if (songsError) throw new Error(songsError.message);
      
      // Transform songs to our Track format and maintain playlist order
      const tracks: Track[] = [];
      
      // Map tracks in the correct order
      playlistSongs.forEach(playlistSong => {
        const song = songs?.find(s => s.id === playlistSong.song_id);
        if (song) {
          tracks.push({
            id: song.id,
            title: song.title,
            artist: song.artist || "Unknown Artist",
            duration: song.duration || 0,
            url: song.url,
            cover: song.cover_url || "/placeholder.svg"
          });
        }
      });
      
      return transformPlaylistData(playlist, tracks.length, tracks);
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
      // Get current user
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) throw new Error("User not authenticated");
      
      const userId = session.session.user.id;
      
      // Create the playlist
      const { data, error } = await supabase
        .from('playlists')
        .insert([{
          name: playlistData.title,
          description: playlistData.description,
          cover_url: playlistData.coverUrl,
          user_id: userId,
          is_public: true
        }])
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      return transformPlaylistData(data, 0, []);
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
      // Update the playlist
      const { data, error } = await supabase
        .from('playlists')
        .update({
          name: playlistData.title,
          description: playlistData.description,
          cover_url: playlistData.coverUrl,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      // Get track count
      const { count, error: countError } = await supabase
        .from('playlist_songs')
        .select('*', { count: 'exact', head: true })
        .eq('playlist_id', id);
      
      if (countError) throw new Error(countError.message);
      
      return transformPlaylistData(data, count || 0);
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
      // Delete the playlist
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
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
      // Get the current highest position
      const { data: positions, error: posError } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);
      
      const nextPosition = positions && positions.length > 0 && positions[0].position !== null
        ? (positions[0].position + 1)
        : 1;
      
      // Add the track to the playlist
      const { error } = await supabase
        .from('playlist_songs')
        .insert([{
          playlist_id: playlistId,
          song_id: trackId,
          position: nextPosition
        }]);
      
      if (error) throw new Error(error.message);
      
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
      // Remove the track from the playlist
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', trackId);
      
      if (error) throw new Error(error.message);
      
      return true;
    } catch (error) {
      console.error(`Error removing track ${trackId} from playlist ${playlistId}:`, error);
      return false;
    }
  }
};

import { supabase } from './supabaseClient';
import type { Database } from './supabaseClient';

type Playlist = Database['public']['Tables']['playlists']['Row'];
type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row'];

export const playlistDAO = {
  async getPlaylists(): Promise<Playlist[]> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPlaylistById(id: string): Promise<Playlist | null> {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createPlaylist(playlist: Omit<Playlist, 'id' | 'created_at' | 'updated_at'>): Promise<Playlist> {
    const { data, error } = await supabase
      .from('playlists')
      .insert([playlist])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePlaylist(id: string, playlist: Partial<Playlist>): Promise<Playlist> {
    const { data, error } = await supabase
      .from('playlists')
      .update(playlist)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePlaylist(id: string): Promise<void> {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addSongToPlaylist(playlistId: string, songId: string, position: number): Promise<PlaylistSong> {
    const { data, error } = await supabase
      .from('playlist_songs')
      .insert([
        {
          playlist_id: playlistId,
          song_id: songId,
          position
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<void> {
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .match({ playlist_id: playlistId, song_id: songId });

    if (error) throw error;
  },

  async getPlaylistSongs(playlistId: string) {
    const { data, error } = await supabase
      .from('playlist_songs')
      .select(`
        *,
        songs (*)
      `)
      .eq('playlist_id', playlistId)
      .order('position');

    if (error) throw error;
    return data || [];
  }
}; 
import { supabase } from './supabaseClient';
import type { Database } from './supabaseClient';

type SharedFile = Database['public']['Tables']['shared_files']['Row'];

export interface CreateShareData {
  song_id?: string | null;
  playlist_id?: string | null;
  token: string;
  permissions: string;
  expires_at: string | null;
  created_by: string;
}

interface SharedPlaylistResponse {
  token: string;
  expires_at: string;
  permissions: string;
  playlist: {
    id: string;
    name: string;
    description: string | null;
    playlist_songs: Array<{
      songs: {
        id: string;
        title: string;
        artist: string | null;
        duration: number | null;
        url: string;
        cover_url: string | null;
      }
    }>;
  }
}

export const shareDAO = {
  async createShare(share: CreateShareData): Promise<SharedFile> {
    const { data, error } = await supabase
      .from('shared_files')
      .insert([share])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getShareByToken(token: string): Promise<SharedFile | null> {
    const { data, error } = await supabase
      .from('shared_files')
      .select('*')
      .eq('token', token)
      .single();

    if (error) throw error;
    return data;
  },

  async getSharedPlaylist(token: string): Promise<SharedPlaylistResponse> {
    const { data, error } = await supabase
      .from('shared_files')
      .select(`
        token,
        expires_at,
        permissions,
        playlists (
          id,
          name,
          description,
          playlist_songs (
            songs (
              id,
              title,
              artist,
              duration,
              url,
              cover_url
            )
          )
        )
      `)
      .eq('token', token)
      .single();

    if (error) {
      throw new Error('Không thể tải playlist được chia sẻ');
    }

    if (!data || !data.playlists) {
      throw new Error('Không tìm thấy playlist được chia sẻ');
    }

    // Lấy playlist đầu tiên từ mảng và chuyển đổi kiểu dữ liệu
    const playlistData = Array.isArray(data.playlists) ? data.playlists[0] : data.playlists;

    if (!playlistData) {
      throw new Error('Không tìm thấy thông tin playlist');
    }

    const playlist = {
      id: String(playlistData.id),
      name: String(playlistData.name),
      description: playlistData.description ? String(playlistData.description) : null,
      playlist_songs: playlistData.playlist_songs.map(ps => {
        const song = ps.songs[0]; // Lấy bài hát đầu tiên từ mảng songs
        return {
          songs: {
            id: String(song.id),
            title: String(song.title),
            artist: song.artist ? String(song.artist) : null,
            duration: song.duration ? Number(song.duration) : null,
            url: String(song.url),
            cover_url: song.cover_url ? String(song.cover_url) : null
          }
        };
      })
    };

    return {
      token: String(data.token),
      expires_at: String(data.expires_at),
      permissions: String(data.permissions),
      playlist
    } as SharedPlaylistResponse;
  },

  async getSharedSong(token: string) {
    const { data, error } = await supabase
      .from('shared_files')
      .select(`
        *,
        song:songs!song_id (*)
      `)
      .eq('token', token)
      .single();

    if (error) throw error;
    return data;
  }
}; 
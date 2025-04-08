import { supabase } from "@/lib/supabase";
import { Track } from "@/components/audio/audio-player-provider";
import { Tables } from "@/types/supabase";
import { trackService } from "./trackService";

// Playlist interface
export interface Playlist {
  id: string;
  name: string;
  title?: string;
  description?: string;
  songs: Track[];
  tracks?: Track[];
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

// Helper to transform Supabase playlist data to our Playlist format
const transformPlaylistData = (
  playlistData: Tables<'playlists'>, 
  trackCount = 0,
  tracks?: Track[]
): Playlist => {
  return {
    id: playlistData.id,
    name: playlistData.name,
    description: playlistData.description || "",
    user_id: playlistData.user_id,
    created_at: playlistData.created_at,
    updated_at: playlistData.updated_at,
    songs: tracks || [],
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
   * Get all playlists for the current user
   */
  getPlaylists: async (): Promise<Playlist[]> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");

      const { data: playlists, error } = await supabase
        .from("playlists")
        .select(`
          id,
          name,
          description,
          user_id,
          songs:playlist_songs(
            song:songs(
              id,
              title,
              artist,
              duration,
              url,
              cover_url
            )
          )
        `)
        .eq("user_id", session.session.user.id)
        .order('name', { ascending: true });

      if (error) throw error;

      return playlists.map((playlist) => ({
        ...playlist,
        title: playlist.name,
        songs: playlist.songs
          .map((item: any) => item.song)
          .filter(Boolean)
          .map((song: any) => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            url: song.url,
            cover: song.cover_url,
          })),
      }));
    } catch (error) {
      console.error("Error getting playlists:", error);
      throw error;
    }
  },

  /**
   * Create a new playlist
   */
  createPlaylist: async (name: string, description?: string): Promise<Playlist | null> => {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("playlists")
      .insert([
        {
          name,
          description,
          user_id: user.user?.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return transformPlaylistData(data);
  },

  /**
   * Add a song to a playlist
   */
  addSongToPlaylist: async (playlistId: string, songId: string): Promise<boolean> => {
    try {
      // Kiểm tra người dùng đã đăng nhập
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");

      // Kiểm tra quyền sở hữu playlist
      const { data: playlists, error: playlistError } = await supabase
        .from('playlists')
        .select('user_id')
        .eq('id', playlistId);

      if (playlistError) throw playlistError;
      if (!playlists || playlists.length === 0) throw new Error("Không tìm thấy playlist");
      
      const playlist = playlists[0];
      if (playlist.user_id !== session.session.user.id) {
        throw new Error("Bạn không có quyền thêm bài hát vào playlist này");
      }

      // Kiểm tra quyền sở hữu bài hát
      const { data: songs, error: songError } = await supabase
        .from('songs')
        .select('user_id')
        .eq('id', songId);

      if (songError) throw songError;
      if (!songs || songs.length === 0) throw new Error("Không tìm thấy bài hát");
      
      const song = songs[0];
      if (song.user_id !== session.session.user.id) {
        throw new Error("Bạn chỉ có thể thêm bài hát của mình vào playlist");
      }

      // Kiểm tra bài hát đã tồn tại trong playlist chưa
      const { data: existingSongs, error: checkError } = await supabase
        .from('playlist_songs')
        .select('*')
        .eq('playlist_id', playlistId)
        .eq('song_id', songId);

      if (checkError) throw checkError;
      if (existingSongs && existingSongs.length > 0) {
        throw new Error("Bài hát đã tồn tại trong playlist");
      }

      // Thêm bài hát vào playlist
      const { error } = await supabase
        .from("playlist_songs")
        .insert([
          {
            playlist_id: playlistId,
            song_id: songId,
          },
        ]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      throw error;
    }
  },

  /**
   * Remove a song from a playlist
   */
  removeSongFromPlaylist: async (playlistId: string, songId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("playlist_songs")
      .delete()
      .eq("playlist_id", playlistId)
      .eq("song_id", songId);

    if (error) throw error;
    return true;
  },

  /**
   * Delete a playlist
   */
  deletePlaylist: async (playlistId: string): Promise<boolean> => {
    try {
      // Kiểm tra người dùng đã đăng nhập
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");

      // Kiểm tra quyền sở hữu playlist
      const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .select('user_id')
        .eq('id', playlistId)
        .single();

      if (playlistError || !playlist) throw new Error("Không tìm thấy playlist");
      if (playlist.user_id !== session.session.user.id) {
        throw new Error("Bạn không có quyền xóa playlist này");
      }

      // Xóa các bản ghi trong playlist_songs trước
      const { error: deleteTracksError } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId);

      if (deleteTracksError) throw deleteTracksError;

      // Sau đó xóa playlist
      const { error: deletePlaylistError } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId);

      if (deletePlaylistError) throw deletePlaylistError;

      return true;
    } catch (error) {
      console.error("Error deleting playlist:", error);
      throw error;
    }
  },

  /**
   * Update a playlist's information
   */
  updatePlaylist: async (playlistId: string, data: { name: string; description?: string }): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("User not authenticated");

      // Kiểm tra quyền sở hữu playlist
      const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .select('user_id')
        .eq('id', playlistId)
        .single();

      if (playlistError || !playlist) throw new Error("Playlist not found");
      if (playlist.user_id !== session.session.user.id) throw new Error("Bạn không có quyền chỉnh sửa playlist này");

      const { error } = await supabase
        .from('playlists')
        .update({
          name: data.name,
          description: data.description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', playlistId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating playlist:", error);
      return false;
    }
  },

  getAllTracks: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");

      const { data: songs, error } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", session.session.user.id);

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
      console.error("Error getting tracks:", error);
      throw error;
    }
  },

  /**
   * Get a playlist by ID with its tracks
   */
  getPlaylistById: async (id: string): Promise<Playlist | null> => {
    try {
      const { data: playlist, error } = await supabase
        .from("playlists")
        .select(`
          id,
          name,
          description,
          user_id,
          songs:playlist_songs(
            song:songs(
              id,
              title,
              artist,
              duration,
              url,
              cover_url
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!playlist) return null;

      return {
        ...playlist,
        title: playlist.name,
        songs: playlist.songs
          .map((item: any) => item.song)
          .filter(Boolean)
          .map((song: any) => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            url: song.url,
            cover: song.cover_url,
          })),
        tracks: playlist.songs
          .map((item: any) => item.song)
          .filter(Boolean)
          .map((song: any) => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            url: song.url,
            cover: song.cover_url,
          })),
      };
    } catch (error) {
      console.error("Error fetching playlist:", error);
      throw error;
    }
  },

  /**
   * Lọc playlist theo chữ cái đầu tiên
   */
  filterPlaylistsByLetter: async (letter: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");

      const { data: playlists, error } = await supabase
        .from("playlists")
        .select(`
          id,
          name,
          description,
          user_id,
          songs:playlist_songs(
            song:songs(
              id,
              title,
              artist,
              duration,
              url,
              cover_url
            )
          )
        `)
        .eq("user_id", session.session.user.id)
        .ilike("name", `${letter}%`);

      if (error) throw error;

      return playlists.map((playlist) => ({
        ...playlist,
        title: playlist.name,
        songs: playlist.songs
          .map((item: any) => item.song)
          .filter(Boolean)
          .map((song: any) => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            url: song.url,
            cover: song.cover_url,
          })),
        tracks: playlist.songs
          .map((item: any) => item.song)
          .filter(Boolean)
          .map((song: any) => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            url: song.url,
            cover: song.cover_url,
          })),
      }));
    } catch (error) {
      console.error("Error filtering playlists by letter:", error);
      throw error;
    }
  },

  /**
   * Tìm kiếm playlist theo chữ cái
   */
  searchByLetter: async (letter: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");

      const { data: playlists, error } = await supabase
        .from("playlists")
        .select(`
          id,
          name,
          description,
          user_id,
          songs:playlist_songs(
            song:songs(
              id,
              title,
              artist,
              duration,
              url,
              cover_url
            )
          )
        `)
        .eq("user_id", session.session.user.id)
        .or(`name.ilike.${letter}%, description.ilike.${letter}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      return playlists.map((playlist) => ({
        ...playlist,
        title: playlist.name,
        songs: playlist.songs
          .map((item: any) => item.song)
          .filter(Boolean)
          .map((song: any) => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            url: song.url,
            cover: song.cover_url,
          })),
      }));
    } catch (error) {
      console.error("Error searching playlists by letter:", error);
      throw error;
    }
  },
};

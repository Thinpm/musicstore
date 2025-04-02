import { supabase } from "@/lib/supabase";
import { Track } from "@/components/audio/audio-player-provider";

interface SongData {
  songs: {
    id: string;
    title: string;
    artist: string;
    duration: number;
    url: string;
    cover_url: string;
  }
}

export const favoriteService = {
  /**
   * Thêm bài hát vào favorites
   */
  addToFavorites: async (songId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Unauthorized');

      const { error } = await supabase
        .from('favorites')
        .insert([{ 
          song_id: songId,
          user_id: session.user.id 
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return false;
    }
  },

  /**
   * Xóa bài hát khỏi favorites
   */
  removeFromFavorites: async (songId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Unauthorized');

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('song_id', songId)
        .eq('user_id', session.user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      return false;
    }
  },

  /**
   * Kiểm tra bài hát có trong favorites không
   */
  isFavorite: async (songId: string): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('song_id', songId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking favorite:", error);
      return false;
    }
  },

  /**
   * Lấy danh sách bài hát yêu thích
   */
  getFavorites: async (): Promise<Track[]> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          songs:song_id (
            id,
            title,
            artist,
            duration,
            url,
            cover_url
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data as SongData[]).map(item => ({
        id: item.songs.id,
        title: item.songs.title,
        artist: item.songs.artist || "Unknown Artist",
        duration: item.songs.duration || 0,
        url: item.songs.url,
        cover: item.songs.cover_url
      }));
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  }
}; 
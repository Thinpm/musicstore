import { supabase } from "@/lib/supabase";
import { Track } from "@/components/audio/audio-player-provider";

function generateToken(): string {
  // Tạo một chuỗi ngẫu nhiên 16 ký tự
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export interface ShareOptions {
  expiresIn?: number; // Thời gian hết hạn tính bằng giây
  permissions?: "read" | "download"; // Quyền truy cập
  email?: string; // Email người được chia sẻ
}

export interface SharedFile {
  id: string;
  songId?: string;
  playlistId?: string;
  sharedBy: string;
  sharedWithEmail: string | null;
  permissions: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export const shareService = {
  /**
   * Tạo link chia sẻ cho một bài hát hoặc playlist
   */
  createShareLink: async (
    id: string,
    type: "song" | "playlist",
    options: ShareOptions = {}
  ): Promise<SharedFile> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("User not authenticated");

      // Tạo token ngẫu nhiên
      const token = generateToken();

      // Tính thời gian hết hạn
      const expiresAt = options.expiresIn
        ? new Date(Date.now() + options.expiresIn * 1000).toISOString()
        : null;

      // Tạo bản ghi chia sẻ mới
      const { data, error } = await supabase
        .from('shared_files')
        .insert([
          {
            song_id: type === "song" ? id : null,
            playlist_id: type === "playlist" ? id : null,
            shared_by: session.session.user.id,
            shared_with_email: options.email || null,
            permissions: options.permissions || "read",
            token,
            expires_at: expiresAt,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned from insert");

      return {
        id: data.id,
        songId: data.song_id,
        playlistId: data.playlist_id,
        sharedBy: data.shared_by,
        sharedWithEmail: data.shared_with_email,
        permissions: data.permissions,
        token: data.token,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
        isActive: data.is_active
      };
    } catch (error) {
      console.error("Error creating share link:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin bài hát từ token chia sẻ
   */
  getSongByShareToken: async (token: string): Promise<Track | null> => {
    try {
      // Kiểm tra token có hợp lệ không
      const { data: shareData, error: shareError } = await supabase
        .from('shared_files')
        .select(`
          *,
          songs:song_id (
            id,
            title,
            artist,
            duration,
            url,
            cover_url,
            user_id
          )
        `)
        .eq('token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (shareError) throw shareError;
      if (!shareData) throw new Error("Không tìm thấy thông tin chia sẻ");

      // Kiểm tra thời hạn
      if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        await supabase
          .from('shared_files')
          .update({ is_active: false })
          .eq('id', shareData.id);
        throw new Error("Link chia sẻ đã hết hạn");
      }

      if (!shareData.songs) {
        throw new Error("Không tìm thấy thông tin bài hát");
      }

      const song = shareData.songs;
      return {
        id: song.id,
        title: song.title,
        artist: song.artist || "Unknown Artist",
        duration: song.duration || 0,
        url: song.url,
        cover: song.cover_url,
        canDownload: shareData.permissions === "download"
      };
    } catch (error) {
      console.error("Error getting shared song:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể truy cập bài hát. Vui lòng thử lại sau.");
    }
  },

  /**
   * Lấy thông tin playlist từ token chia sẻ
   */
  getPlaylistByShareToken: async (token: string) => {
    try {
      // Kiểm tra token có hợp lệ không
      const { data: shareData, error: shareError } = await supabase
        .from('shared_files')
        .select(`
          *,
          playlists:playlist_id (
            id,
            name,
            description,
            user_id,
            songs (
              id,
              title,
              artist,
              duration,
              url,
              cover_url
            )
          )
        `)
        .eq('token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (shareError) throw shareError;
      if (!shareData) throw new Error("Không tìm thấy thông tin chia sẻ");

      // Kiểm tra thời hạn
      if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        await supabase
          .from('shared_files')
          .update({ is_active: false })
          .eq('id', shareData.id);
        throw new Error("Link chia sẻ đã hết hạn");
      }

      if (!shareData.playlists) {
        throw new Error("Không tìm thấy thông tin playlist");
      }

      return {
        id: shareData.playlists.id,
        name: shareData.playlists.name,
        description: shareData.playlists.description,
        songs: shareData.playlists.songs.map((song: any) => ({
          id: song.id,
          title: song.title,
          artist: song.artist || "Unknown Artist",
          duration: song.duration || 0,
          url: song.url,
          cover: song.cover_url,
          canDownload: shareData.permissions === "download"
        }))
      };
    } catch (error) {
      console.error("Error getting shared playlist:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Không thể truy cập playlist. Vui lòng thử lại sau.");
    }
  },

  /**
   * Vô hiệu hóa link chia sẻ
   */
  deactivateShareLink: async (token: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shared_files')
        .update({ is_active: false })
        .eq('token', token);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deactivating share link:", error);
      return false;
    }
  },

  /**
   * Lấy danh sách các link chia sẻ của người dùng
   */
  getUserShares: async (): Promise<SharedFile[]> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('shared_files')
        .select('*')
        .eq('shared_by', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(share => ({
        id: share.id,
        songId: share.song_id,
        playlistId: share.playlist_id,
        sharedBy: share.shared_by,
        sharedWithEmail: share.shared_with_email,
        permissions: share.permissions,
        token: share.token,
        createdAt: share.created_at,
        expiresAt: share.expires_at,
        isActive: share.is_active
      }));
    } catch (error) {
      console.error("Error getting user shares:", error);
      return [];
    }
  }
}; 
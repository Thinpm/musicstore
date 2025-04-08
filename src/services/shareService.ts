import { shareDAO } from '@/dao/shareDAO';
import { playlistDAO } from '@/dao/playlistDAO';
import { trackDAO } from '@/dao/trackDAO';
import { supabase } from '@/dao/supabaseClient';
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

interface SharedPlaylistData {
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

interface ShareData {
  id: string;
  token: string;
  permissions: string;
  expires_at: string | null;
  is_active: boolean;
  playlist: SharedPlaylistData;
}

export const shareService = {
  /**
   * Tạo link chia sẻ cho một bài hát hoặc playlist
   */
  async createShareLink(id: string, type: "song" | "playlist", options: ShareOptions = {}) {
    try {
      // Kiểm tra tồn tại
      const exists = type === 'playlist' 
        ? await playlistDAO.getPlaylistById(id)
        : await trackDAO.getTrackById(id);

      if (!exists) {
        throw new Error(`${type === "playlist" ? "Playlist" : "Bài hát"} không tồn tại`);
      }

      // Lấy user hiện tại
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Bạn cần đăng nhập để tạo link chia sẻ");
      }

      // Tạo token ngẫu nhiên
      const token = generateToken();

      // Tạo share data
      const shareData = {
        song_id: type === "song" ? id : null,
        playlist_id: type === "playlist" ? id : null,
        token,
        permissions: options.permissions || "read",
        expires_at: options.expiresIn ? new Date(Date.now() + options.expiresIn * 1000).toISOString() : null,
        created_by: user.id,
        shared_by: user.id
      };

      // Tạo record trong shared_files
      const share = await shareDAO.createShare(shareData);
      return share;
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
          id,
          token,
          permissions,
          expires_at,
          is_active,
          playlist:playlists!playlist_id (
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
        .eq('is_active', true)
        .single();

      if (shareError) {
        console.error("Error fetching share data:", shareError);
        throw new Error("Không thể truy cập playlist");
      }
      
      if (!shareData) throw new Error("Không tìm thấy thông tin chia sẻ");

      // Kiểm tra thời hạn
      if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
        await supabase
          .from('shared_files')
          .update({ is_active: false })
          .eq('id', shareData.id);
        throw new Error("Link chia sẻ đã hết hạn");
      }

      // Chuyển đổi dữ liệu từ Supabase sang định dạng mong muốn
      const rawPlaylist = shareData.playlist as unknown as SharedPlaylistData[];
      if (!rawPlaylist || !rawPlaylist[0]) {
        throw new Error("Không tìm thấy thông tin playlist");
      }

      const playlist = rawPlaylist[0];
      const songs = playlist.playlist_songs.map(ps => ({
        id: ps.songs.id,
        title: ps.songs.title,
        artist: ps.songs.artist || "Unknown Artist",
        duration: ps.songs.duration || 0,
        url: ps.songs.url,
        cover: ps.songs.cover_url,
        canDownload: shareData.permissions === "download"
      }));

      return {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        songs: songs
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
  },

  /**
   * Tạo URL nhất quán cho cả song và playlist
   */
  async createShareUrl(id: string, type: "song" | "playlist", options: ShareOptions = {}) {
    const share = await this.createShareLink(id, type, options);
    if (!share) {
      throw new Error("Không thể tạo link chia sẻ");
    }

    return `${window.location.origin}/share/${type === "playlist" ? "playlist" : "song"}/${share.token}`;
  },

  async getSharedContent(token: string) {
    try {
      const share = await shareDAO.getShareByToken(token);
      if (!share) {
        throw new Error("Link chia sẻ không tồn tại hoặc đã hết hạn");
      }

      // Kiểm tra hết hạn
      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        throw new Error("Link chia sẻ đã hết hạn");
      }

      if (share.playlist_id) {
        const data = await shareDAO.getSharedPlaylist(token);
        if (!data?.playlist) {
          throw new Error("Không tìm thấy playlist");
        }
        return data;
      } else if (share.song_id) {
        const data = await shareDAO.getSharedSong(token);
        if (!data?.song) {
          throw new Error("Không tìm thấy bài hát");
        }
        return data;
      }

      throw new Error("Không tìm thấy nội dung được chia sẻ");
    } catch (error) {
      console.error("Error getting shared content:", error);
      throw error;
    }
  }
}; 
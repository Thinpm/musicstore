import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Track, useAudioPlayer } from "@/components/audio/audio-player-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Play, Pause, Download } from "lucide-react";
import { shareService } from "@/services/shareService";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { FavoriteButton } from "@/components/favorite/favorite-button";

interface SharedFileInfo {
  permissions: string;
  shared_with_email: string | null;
  shared_by: string;
}

interface SongData {
  id: string;
  title: string;
  artist: string | null;
  duration: number;
  url: string;
  cover_url: string | null;
  user_id: string;
}

interface SharedSongData {
  permissions: string;
  shared_with_email: string | null;
  shared_by: string;
  song_id: string;
  songs: SongData;
  expires_at: string | null;
}

export default function SharedSong() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, pauseTrack, resumeTrack } = useAudioPlayer();
  const [song, setSong] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareInfo, setShareInfo] = useState<SharedFileInfo | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const loadSharedSong = async () => {
      if (!token) return;

      try {
        setLoading(true);
        
        // Lấy session hiện tại
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        // Lấy thông tin share từ token
        const { data: shareData, error: shareError } = await supabase
          .from('shared_files')
          .select(`
            permissions, 
            shared_with_email, 
            shared_by,
            song_id,
            songs!inner (
              id,
              title,
              artist,
              duration,
              url,
              cover_url,
              user_id
            ),
            expires_at
          `)
          .eq('token', token)
          .eq('is_active', true)
          .maybeSingle();

        if (shareError || !shareData) {
          throw new Error("Link chia sẻ không hợp lệ hoặc đã hết hạn");
        }

        // Kiểm tra thời hạn
        if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
          throw new Error("Link chia sẻ đã hết hạn");
        }

        const songData = shareData.songs as unknown as SongData;

        // Kiểm tra quyền truy cập
        const canAccess = session?.user?.id === songData.user_id || // Người tạo bài hát
                         shareData.shared_by === session?.user?.id || // Người chia sẻ
                         (!shareData.shared_with_email) || // Link công khai
                         (session?.user?.email && shareData.shared_with_email === session.user.email); // Email được chia sẻ

        setHasAccess(canAccess);

        if (!canAccess) {
          let message = "Bạn không có quyền truy cập bài hát này.";
          if (shareData.shared_with_email) {
            message = `Bạn cần đăng nhập với email ${shareData.shared_with_email} để nghe bài hát này`;
          } else if (!session) {
            message = "Bạn cần đăng nhập để nghe bài hát này";
          }
          toast({
            title: "Không có quyền truy cập",
            description: message,
            variant: "destructive",
          });
        }

        // Lưu thông tin share
        setShareInfo({
          permissions: shareData.permissions,
          shared_with_email: shareData.shared_with_email,
          shared_by: shareData.shared_by
        });

        // Lưu thông tin bài hát
        setSong({
          id: songData.id,
          title: songData.title,
          artist: songData.artist || "Unknown Artist",
          duration: songData.duration || 0,
          url: songData.url,
          cover: songData.cover_url
        });
      } catch (error) {
        toast({
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Không thể tải bài hát. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSharedSong();
  }, [token, toast]);

  const handlePlayPause = () => {
    if (!song || !hasAccess) {
      // Nếu không có quyền truy cập, hiển thị thông báo
      if (!hasAccess) {
        toast({
          title: "Không có quyền truy cập",
          description: shareInfo?.shared_with_email 
            ? `Bạn cần đăng nhập với email ${shareInfo.shared_with_email} để nghe bài hát này`
            : "Bạn không có quyền nghe bài hát này",
          variant: "destructive",
        });
      }
      return;
    }

    if (currentTrack?.id === song.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        resumeTrack();
      }
    } else {
      playTrack(song);
    }
  };

  const handleDownload = async () => {
    if (!song?.url || !shareInfo || !hasAccess) {
      if (!hasAccess) {
        toast({
          title: "Không có quyền truy cập",
          description: shareInfo?.shared_with_email 
            ? `Bạn cần đăng nhập với email ${shareInfo.shared_with_email} để tải bài hát này`
            : "Bạn không có quyền tải bài hát này",
          variant: "destructive",
        });
      }
      return;
    }

    // Kiểm tra quyền download
    if (shareInfo.permissions !== "download") {
      toast({
        title: "Không có quyền",
        description: "Bạn không có quyền tải xuống bài hát này",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(song.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải xuống bài hát. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!song || !shareInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <h1 className="text-2xl font-bold">Không tìm thấy bài hát</h1>
        <p className="text-muted-foreground">Link chia sẻ không hợp lệ hoặc đã hết hạn.</p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Về trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Button onClick={() => navigate(-1)} variant="ghost" className="mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !song ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài hát</h1>
          <p className="text-muted-foreground">Link chia sẻ không hợp lệ hoặc đã hết hạn</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="relative h-48 w-48 overflow-hidden rounded-md bg-muted">
              <img
                src={song.cover || "/placeholder.svg"}
                alt={song.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{song.title}</h1>
                <p className="text-muted-foreground">{song.artist}</p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePlayPause}
                  disabled={!hasAccess}
                  className="w-32"
                >
                  {currentTrack?.id === song.id && isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Tạm dừng
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Phát nhạc
                    </>
                  )}
                </Button>
                {shareInfo?.permissions === "download" && (
                  <Button
                    onClick={handleDownload}
                    disabled={!hasAccess}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                )}
                {session && hasAccess && (
                  <FavoriteButton
                    songId={song.id}
                    className="h-10 w-10"
                  />
                )}
              </div>
              {!hasAccess && (
                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                  {shareInfo?.shared_with_email ? (
                    <>
                      Bạn cần đăng nhập với email {shareInfo.shared_with_email} để nghe bài hát này
                    </>
                  ) : !session ? (
                    <>
                      Bạn cần đăng nhập để nghe bài hát này
                    </>
                  ) : (
                    <>
                      Bạn không có quyền truy cập bài hát này
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
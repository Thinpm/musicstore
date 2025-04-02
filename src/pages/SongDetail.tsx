import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAudioPlayer, Track } from "@/components/audio/audio-player-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function SongDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, pauseTrack, resumeTrack } = useAudioPlayer();
  const [song, setSong] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadSong = async () => {
      try {
        setLoading(true);
        
        // Đầu tiên lấy thông tin cơ bản của bài hát (không cần auth)
        const { data: basicData, error: basicError } = await supabase
          .from('songs')
          .select('id, title, artist, duration, cover_url')
          .eq('id', id)
          .single();

        if (basicError) throw basicError;

        if (basicData) {
          // Nếu người dùng đã đăng nhập, lấy thêm URL bài hát
          if (user) {
            const { data: urlData, error: urlError } = await supabase
              .from('songs')
              .select('url')
              .eq('id', id)
              .single();

            if (urlError) {
              console.error('Error fetching song URL:', urlError);
              toast({
                title: "Warning",
                description: "Could not load playback URL. You may not have permission to play this song.",
                variant: "destructive",
              });
            }

            // Tạo đối tượng Track với URL nếu có quyền truy cập
            const track: Track = {
              id: basicData.id,
              title: basicData.title,
              artist: basicData.artist,
              duration: basicData.duration,
              cover: basicData.cover_url,
              url: urlData?.url || ''
            };
            setSong(track);
          } else {
            // Nếu chưa đăng nhập, chỉ hiển thị thông tin cơ bản
            const track: Track = {
              id: basicData.id,
              title: basicData.title,
              artist: basicData.artist,
              duration: basicData.duration,
              cover: basicData.cover_url,
              url: '' // Không có URL khi chưa đăng nhập
            };
            setSong(track);
          }
        }
      } catch (error) {
        console.error('Error loading song:', error);
        toast({
          title: "Error",
          description: "Could not load the song. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSong();
  }, [id, user]);

  const handlePlayPause = () => {
    if (!song) return;

    // Kiểm tra xem có URL để phát không
    if (!song.url) {
      toast({
        title: "Cannot play song",
        description: "Please sign in to play this song.",
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <h1 className="text-2xl font-bold">Song not found</h1>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-8"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={song.cover || "/placeholder.svg"}
              alt={song.title}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{song.artist}</p>
            
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                onClick={handlePlayPause}
                className="w-full md:w-auto"
              >
                {currentTrack?.id === song.id && isPlaying ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Play
                  </>
                )}
              </Button>
              
              {user && (
                <div className="flex items-center gap-2">
                  {/* Các nút chức năng chỉ hiển thị khi đã đăng nhập */}
                </div>
              )}
            </div>
          </div>

          {!user && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Sign in to access more features like adding to playlists, liking songs, and more.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
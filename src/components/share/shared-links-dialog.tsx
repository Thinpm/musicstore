import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Music, ListMusic, ExternalLink } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";
import { shareService } from "@/services/shareService";

interface SharedLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SharedLink {
  token: string;
  type: "song" | "playlist";
  title: string;
  artist?: string;
  description?: string;
  sharedBy: string;
  hasAccess: boolean;
}

export function SharedLinksDialog({ open, onOpenChange }: SharedLinksDialogProps) {
  const [loading, setLoading] = useState(false);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAddLink = async () => {
    if (!inputValue.trim()) {
      toast.error("Vui lòng nhập đường dẫn chia sẻ");
      return;
    }

    try {
      setLoading(true);
      // Trích xuất token từ URL
      const url = new URL(inputValue);
      const pathParts = url.pathname.split('/');
      const token = pathParts[pathParts.length - 1];

      console.log("URL being processed:", url.toString());
      console.log("Path parts:", pathParts);
      console.log("Extracted token:", token);

      // Thử lấy thông tin bài hát trước
      try {
        const song = await shareService.getSongByShareToken(token);
        if (song) {
          const newLink: SharedLink = {
            token,
            type: "song",
            title: song.title,
            artist: song.artist,
            sharedBy: user?.id || "",
            hasAccess: true
          };
          setSharedLinks(prev => [newLink, ...prev]);
          toast.success("Đã thêm bài hát vào danh sách chia sẻ");
          setInputValue("");
          return;
        }
      } catch (error) {
        // Nếu không phải bài hát, thử lấy thông tin playlist
        try {
          const playlist = await shareService.getPlaylistByShareToken(token);
          if (playlist) {
            const newLink: SharedLink = {
              token,
              type: "playlist",
              title: playlist.name,
              description: playlist.description,
              sharedBy: user?.id || "",
              hasAccess: true
            };
            setSharedLinks(prev => [newLink, ...prev]);
            toast.success("Đã thêm playlist vào danh sách chia sẻ");
            setInputValue("");
            return;
          }
        } catch (playlistError) {
          console.error("Error handling link:", playlistError);
          toast.error("Không tìm thấy thông tin chia sẻ");
        }
      }
    } catch (error) {
      console.error("Error handling link:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Không thể truy cập link. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSharedLinks = async () => {
    try {
      setLoading(true);
      const shares = await shareService.getUserShares();
      
      const formattedLinks = shares.map(share => ({
        token: share.token,
        type: share.songId ? "song" : "playlist",
        title: "Loading...",
        sharedBy: share.sharedBy,
        hasAccess: true
      }));

      setSharedLinks(formattedLinks);

      // Lấy thông tin chi tiết cho từng share
      const updatedLinks = await Promise.all(
        shares.map(async (share) => {
          if (share.songId) {
            const song = await shareService.getSongByShareToken(share.token);
            if (!song) return null;
            return {
              token: share.token,
              type: "song" as const,
              title: song.title,
              artist: song.artist,
              sharedBy: share.sharedBy,
              hasAccess: true
            };
          } else if (share.playlistId) {
            const playlist = await shareService.getPlaylistByShareToken(share.token);
            if (!playlist) return null;
            return {
              token: share.token,
              type: "playlist" as const,
              title: playlist.name,
              description: playlist.description,
              sharedBy: share.sharedBy,
              hasAccess: true
            };
          }
          return null;
        })
      );

      setSharedLinks(updatedLinks.filter(Boolean) as SharedLink[]);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách link đã chia sẻ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadSharedLinks();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Links được chia sẻ</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nhập đường dẫn chia sẻ"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button onClick={handleAddLink} disabled={loading}>
            Thêm
          </Button>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Đang tải...</p>
            </div>
          ) : sharedLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có link nào được chia sẻ
            </div>
          ) : (
            sharedLinks.map((link) => (
              <div
                key={link.token}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  {link.type === "song" ? (
                    <Music className="h-6 w-6 text-primary" />
                  ) : (
                    <ListMusic className="h-6 w-6 text-primary" />
                  )}
                  <div>
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {link.type === "song" ? link.artist : link.description} • Shared by {link.sharedBy}
                    </p>
                  </div>
                </div>
                {link.hasAccess && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4"
                    onClick={() => {
                      navigate(`/share/${link.token}`);
                      onOpenChange(false);
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Xem
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
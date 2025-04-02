import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Share } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SharePlaylistDialogProps {
  playlistId: string;
  playlistName: string;
}

export function SharePlaylistDialog({ playlistId, playlistName }: SharePlaylistDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Tạo URL trực tiếp từ playlistId
  const shareUrl = `${window.location.origin}/playlists/${playlistId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Đã sao chép",
        description: "Đường dẫn playlist đã được sao chép vào clipboard",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Lỗi khi sao chép:", error);
      // Fallback cho trường hợp không thể sử dụng clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "Đã sao chép",
          description: "Đường dẫn playlist đã được sao chép vào clipboard",
        });
        setIsOpen(false);
      } catch (err) {
        toast({
          title: "Lỗi",
          description: "Không thể sao chép đường dẫn. Vui lòng sao chép thủ công.",
          variant: "destructive",
        });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setIsOpen(false);
  };

  const handleShareX = () => {
    const text = `Nghe playlist "${playlistName}" trên SoundStreamline`;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Share className="mr-2 h-4 w-4" /> Chia sẻ
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chia sẻ Playlist</DialogTitle>
          <DialogDescription>
            Chia sẻ playlist "{playlistName}" với bạn bè của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Đường dẫn chia sẻ</Label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                onClick={(e) => e.currentTarget.select()}
              />
              <Button onClick={handleCopyLink}>
                Sao chép
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Chia sẻ qua mạng xã hội</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleShareFacebook}
              >
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={handleShareX}
              >
                X
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
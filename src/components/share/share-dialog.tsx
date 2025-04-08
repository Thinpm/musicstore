import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share as ShareIcon, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { shareService, ShareOptions } from "@/services/shareService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "song" | "playlist";
  id: string;
}

export const ShareDialog = ({ isOpen, onClose, title, type, id }: ShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [email, setEmail] = useState("");
  const [expiresIn, setExpiresIn] = useState<string>("never");
  const [permissions, setPermissions] = useState<"read" | "download">("read");
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreateShare = async () => {
    if (!id) {
      toast({
        title: "Lỗi",
        description: `ID ${type === "song" ? "bài hát" : "playlist"} không hợp lệ.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Đang tạo link chia sẻ với các tùy chọn:", {
        id,
        permissions,
        expiresIn
      });

      const options: ShareOptions = {
        permissions,
        expiresIn: expiresIn === "never" ? undefined : parseInt(expiresIn)
      };

      if (!navigator.onLine) {
        throw new Error("Không có kết nối internet. Vui lòng kiểm tra lại kết nối của bạn.");
      }

      const share = await shareService.createShareLink(id, type, options);
      console.log("Link chia sẻ đã được tạo:", share);

      if (share) {
        const url = `${window.location.origin}/share/${type === "playlist" ? "playlist" : "song"}/${share.token}`;
        setShareUrl(url);
        toast({
          title: "Đã tạo link chia sẻ",
          description: "Bạn có thể chia sẻ link này với người khác",
        });
      } else {
        throw new Error("Không thể tạo link chia sẻ - không có phản hồi từ server");
      }
    } catch (error) {
      console.error("Lỗi khi tạo link chia sẻ:", error);
      let errorMessage = "Không thể tạo link chia sẻ. Vui lòng thử lại sau.";
      
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          errorMessage = `${type === "playlist" ? "Playlist" : "Bài hát"} không tồn tại`;
        } else if (error.message.includes("permission")) {
          errorMessage = "Bạn không có quyền chia sẻ nội dung này";
        } else if (error.message.includes("network")) {
          errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối internet";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) {
      toast({
        title: "No link",
        description: "Please create a share link first",
        variant: "destructive",
      });
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast({
          title: "Link copied",
          description: "Share link has been copied to clipboard",
        });
      } else {
        if (inputRef.current) {
          inputRef.current.select();
          document.execCommand('copy');
          setCopied(true);
          toast({
            title: "Link copied",
            description: "Share link has been copied to clipboard",
          });
        }
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (!shareUrl) {
      toast({
        title: "No link",
        description: "Please create a share link first",
        variant: "destructive",
      });
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Listen to ${title}`,
          text: `Check out this ${type}: ${title}`,
          url: shareUrl,
        });
        toast({
          title: "Shared successfully",
          description: "Content has been shared",
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
          toast({
            title: "Error",
            description: "Failed to share. Please try again.",
            variant: "destructive",
          });
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby="share-dialog-description">
        <DialogHeader>
          <DialogTitle>Share {type}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground" id="share-dialog-description">
            Share this {type} with your friends
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Link expires in</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="86400">24 hours</SelectItem>
                  <SelectItem value="604800">7 days</SelectItem>
                  <SelectItem value="2592000">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <Select value={permissions} onValueChange={(value: "read" | "download") => setPermissions(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select permissions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">View only</SelectItem>
                  <SelectItem value="download">Allow download</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shareUrl ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Share link</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      ref={inputRef}
                      value={shareUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className={cn("shrink-0", copied && "text-green-500")}
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {navigator.share && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="shrink-0"
                        onClick={handleShare}
                      >
                        <ShareIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setShareUrl("");
                    handleCreateShare();
                  }}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Đang tạo..." : "Tạo link mới"}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleCreateShare}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Đang tạo..." : "Tạo link chia sẻ"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
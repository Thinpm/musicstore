import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Track } from "@/components/audio/audio-player-provider";
import { ListMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playlistService } from "@/services/playlistService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface EditPlaylistDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  playlist: {
    id: string;
    name: string;
    description?: string;
    tracks?: Track[];
  };
  onSuccess?: () => void;
}

export function EditPlaylistDialog({
  isOpen,
  onOpenChange,
  playlist,
  onSuccess
}: EditPlaylistDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (playlist) {
      setName(playlist.name || "");
      setDescription(playlist.description || "");
    }
  }, [playlist]);

  const handleRemoveTrack = async (trackId: string) => {
    try {
      setIsRemoving(true);
      await playlistService.removeSongFromPlaylist(playlist.id, trackId);
      toast.success("Đã xóa bài hát khỏi playlist");
      onSuccess?.();
    } catch (error) {
      console.error("Error removing track:", error);
      toast.error("Không thể xóa bài hát khỏi playlist");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên playlist");
      return;
    }

    try {
      setLoading(true);
      await playlistService.updatePlaylist(playlist.id, {
        name: name.trim(),
        description: description.trim() || null
      });
      toast.success("Đã cập nhật playlist");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating playlist:", error);
      toast.error("Không thể cập nhật playlist. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa playlist</DialogTitle>
          <DialogDescription>
            Quản lý thông tin và bài hát trong playlist của bạn
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="songs">Bài hát</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên playlist</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên playlist"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả (tùy chọn)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Thêm mô tả cho playlist của bạn"
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="songs" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {playlist.tracks?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Playlist này chưa có bài hát nào
                  </div>
                ) : (
                  playlist.tracks?.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative h-12 w-12 rounded overflow-hidden bg-accent/50">
                          {track.cover ? (
                            <img
                              src={track.cover}
                              alt={track.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error('Error loading cover image:', track.cover);
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-accent/50">
                              <span className="text-2xl font-bold text-accent-foreground/50">
                                {track.title[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{track.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {track.artist}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveTrack(track.id)}
                        disabled={isRemoving}
                      >
                        <ListMinus className="h-5 w-5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 
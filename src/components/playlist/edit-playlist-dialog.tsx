import { useState } from "react";
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
import { ListMinus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { playlistService } from "@/services/playlistService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditPlaylistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  playlistName: string;
  playlistDescription?: string;
  tracks: Track[];
  onTracksUpdated: () => void;
  onPlaylistUpdated: () => void;
}

export function EditPlaylistDialog({
  isOpen,
  onClose,
  playlistId,
  playlistName,
  playlistDescription = "",
  tracks,
  onTracksUpdated,
  onPlaylistUpdated
}: EditPlaylistDialogProps) {
  const { toast } = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(playlistName);
  const [description, setDescription] = useState(playlistDescription);

  const handleRemoveTrack = async (trackId: string) => {
    try {
      setIsRemoving(true);
      const success = await playlistService.removeSongFromPlaylist(playlistId, trackId);
      if (success) {
        toast({
          title: "Đã xóa bài hát",
          description: "Bài hát đã được xóa khỏi playlist",
        });
        onTracksUpdated();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bài hát khỏi playlist",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleSavePlaylist = async () => {
    if (!name.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên playlist không được để trống",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const success = await playlistService.updatePlaylist(playlistId, {
        name: name.trim(),
        description: description.trim()
      });

      if (success) {
        toast({
          title: "Đã lưu thay đổi",
          description: "Thông tin playlist đã được cập nhật",
        });
        onPlaylistUpdated();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin playlist",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Playlist</DialogTitle>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên playlist</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên playlist"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả cho playlist (không bắt buộc)"
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="songs" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {tracks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Playlist này chưa có bài hát nào
                  </div>
                ) : (
                  tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={track.cover || "/placeholder.svg"}
                          alt={track.title}
                          className="h-12 w-12 rounded object-cover"
                        />
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSavePlaylist} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
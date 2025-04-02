import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { playlistService } from "@/services/playlistService";
import { Track } from "@/components/audio/audio-player-provider";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import AudioCard from "@/components/audio/audio-card";

interface AddTracksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  onPlaylistUpdated: () => void;
}

export function AddTracksDialog({ 
  isOpen, 
  onClose, 
  playlistId,
  onPlaylistUpdated 
}: AddTracksDialogProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadTracks();
    }
  }, [isOpen]);

  const loadTracks = async () => {
    setIsLoading(true);
    try {
      // Lấy danh sách bài hát từ service
      const data = await playlistService.getAllTracks();
      setTracks(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bài hát. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTracks = async () => {
    if (selectedTracks.size === 0) {
      toast({
        title: "Chú ý",
        description: "Vui lòng chọn ít nhất một bài hát để thêm.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Thêm từng bài hát đã chọn vào playlist
      const trackIds = Array.from(selectedTracks);
      for (const trackId of trackIds) {
        await playlistService.addSongToPlaylist(playlistId, trackId);
      }

      toast({
        title: "Thành công",
        description: `Đã thêm ${selectedTracks.size} bài hát vào playlist.`,
      });
      
      onPlaylistUpdated();
      onClose();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm bài hát vào playlist. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    const newSelection = new Set(selectedTracks);
    if (newSelection.has(trackId)) {
      newSelection.delete(trackId);
    } else {
      newSelection.add(trackId);
    }
    setSelectedTracks(newSelection);
  };

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm bài hát vào playlist</DialogTitle>
          <DialogDescription>
            Chọn các bài hát bạn muốn thêm vào playlist
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <Input
            placeholder="Tìm kiếm bài hát..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4">Đang tải danh sách bài hát...</div>
            ) : filteredTracks.length === 0 ? (
              <div className="text-center py-4">
                {searchQuery ? "Không tìm thấy bài hát nào" : "Chưa có bài hát nào"}
              </div>
            ) : (
              filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedTracks.has(track.id)}
                    onChange={() => toggleTrackSelection(track.id)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <AudioCard
                      track={track}
                      compact
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              Đã chọn {selectedTracks.size} bài hát
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button onClick={handleAddTracks}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm bài hát
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
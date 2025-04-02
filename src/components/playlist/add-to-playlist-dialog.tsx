import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListMusic } from "lucide-react";
import { playlistService, Playlist } from "@/services/playlistService";
import { Track } from "@/components/audio/audio-player-provider";
import { useToast } from "@/components/ui/use-toast";

interface AddToPlaylistDialogProps {
  track: Track;
  onSongAdded?: () => void;
}

export function AddToPlaylistDialog({ track, onSongAdded }: AddToPlaylistDialogProps) {
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadPlaylists();
    }
  }, [open]);

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const data = await playlistService.getPlaylists();
      setPlaylists(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load playlists. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      const success = await playlistService.addSongToPlaylist(playlistId, track.id);
      if (success) {
        toast({
          title: "Success",
          description: "Song added to playlist successfully.",
        });
        setOpen(false);
        onSongAdded?.();
      } else {
        throw new Error("Failed to add song to playlist");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add song to playlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ListMusic className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>
            Choose a playlist to add "{track.title}" to.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4">Loading playlists...</div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-4">No playlists found</div>
            ) : (
              playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  <ListMusic className="h-4 w-4 mr-2" />
                  {playlist.name}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 
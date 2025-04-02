import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAudioPlayer, Track } from "@/components/audio/audio-player-provider";
import AudioCard from "@/components/audio/audio-card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QueueDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QueueDialog = ({ isOpen, onClose }: QueueDialogProps) => {
  const { currentPlaylist, currentTrack } = useAudioPlayer();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Queue</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {currentPlaylist ? (
            <div className="space-y-2">
              {currentPlaylist.tracks.map((track, index) => (
                <AudioCard
                  key={track.id}
                  track={track}
                  compact
                  tracks={currentPlaylist.tracks}
                  currentIndex={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No songs in queue
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}; 
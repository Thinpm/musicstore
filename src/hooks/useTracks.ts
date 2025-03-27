
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trackService, TrackQuery } from "@/services/trackService";
import { Track } from "@/components/audio/audio-player-provider";
import { toast } from "@/components/ui/use-toast";

export function useTracksQuery(query: TrackQuery = {}) {
  return useQuery({
    queryKey: ['tracks', query],
    queryFn: () => trackService.getAllTracks(query),
  });
}

export function useTracksByLetter(letter: string | null) {
  return useQuery({
    queryKey: ['tracks', 'byLetter', letter],
    queryFn: () => letter ? trackService.getTracksByLetter(letter) : trackService.getAllTracks(),
    enabled: true, // Always fetch, even if letter is null (returns all tracks)
  });
}

export function useTrackById(id: string | undefined) {
  return useQuery({
    queryKey: ['track', id],
    queryFn: () => trackService.getTrackById(id || ''),
    enabled: !!id, // Only run if id is provided
  });
}

export function useUploadTrack() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { 
      file: File, 
      metadata: Omit<Track, 'id' | 'url' | 'duration'>,
      onProgressUpdate?: (progress: number) => void
    }) => {
      return trackService.uploadTrack(
        data.file, 
        data.metadata, 
        data.onProgressUpdate
      );
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['tracks'] });
        toast({
          title: "Track uploaded successfully",
          description: `"${data.title}" has been added to your library`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload track",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (trackId: string) => {
      return trackService.deleteTrack(trackId);
    },
    onSuccess: (success, trackId) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['tracks'] });
        toast({
          title: "Track deleted",
          description: "The track has been removed from your library",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Could not delete track",
        variant: "destructive",
      });
    },
  });
}


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistService, PlaylistQuery, Playlist } from "@/services/playlistService";
import { toast } from "@/components/ui/use-toast";

export function usePlaylistsQuery(query: PlaylistQuery = {}) {
  return useQuery({
    queryKey: ['playlists', query],
    queryFn: () => playlistService.getAllPlaylists(query),
  });
}

export function usePlaylistsByLetter(letter: string | null) {
  return useQuery({
    queryKey: ['playlists', 'byLetter', letter],
    queryFn: () => letter ? playlistService.getPlaylistsByLetter(letter) : playlistService.getAllPlaylists(),
    enabled: true, // Always fetch, even if letter is null (returns all playlists)
  });
}

export function usePlaylistById(id: string | undefined, includeTracks = true) {
  return useQuery({
    queryKey: ['playlist', id, { includeTracks }],
    queryFn: () => playlistService.getPlaylistById(id || '', includeTracks),
    enabled: !!id, // Only run if id is provided
  });
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Playlist, 'id' | 'trackCount'>) => {
      return playlistService.createPlaylist(data);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['playlists'] });
        toast({
          title: "Playlist created",
          description: `"${data.title}" has been created successfully`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create playlist",
        description: error instanceof Error ? error.message : "Could not create playlist",
        variant: "destructive",
      });
    },
  });
}

export function useUpdatePlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: string; playlist: Partial<Omit<Playlist, 'id'>> }) => {
      return playlistService.updatePlaylist(data.id, data.playlist);
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['playlists'] });
        queryClient.invalidateQueries({ queryKey: ['playlist', data.id] });
        toast({
          title: "Playlist updated",
          description: `"${data.title}" has been updated successfully`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update playlist",
        description: error instanceof Error ? error.message : "Could not update playlist",
        variant: "destructive",
      });
    },
  });
}

export function useDeletePlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (playlistId: string) => {
      return playlistService.deletePlaylist(playlistId);
    },
    onSuccess: (success, playlistId) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['playlists'] });
        toast({
          title: "Playlist deleted",
          description: "The playlist has been deleted successfully",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to delete playlist",
        description: error instanceof Error ? error.message : "Could not delete playlist",
        variant: "destructive",
      });
    },
  });
}

export function useAddTrackToPlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { playlistId: string; trackId: string }) => {
      return playlistService.addTrackToPlaylist(data.playlistId, data.trackId);
    },
    onSuccess: (success, data) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['playlist', data.playlistId] });
        toast({
          title: "Track added",
          description: "Track has been added to the playlist",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to add track",
        description: error instanceof Error ? error.message : "Could not add track to playlist",
        variant: "destructive",
      });
    },
  });
}

export function useRemoveTrackFromPlaylist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { playlistId: string; trackId: string }) => {
      return playlistService.removeTrackFromPlaylist(data.playlistId, data.trackId);
    },
    onSuccess: (success, data) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['playlist', data.playlistId] });
        toast({
          title: "Track removed",
          description: "Track has been removed from the playlist",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to remove track",
        description: error instanceof Error ? error.message : "Could not remove track from playlist",
        variant: "destructive",
      });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { playlistService } from "@/services/playlistService";

export const usePlaylists = () => {
  return useQuery({
    queryKey: ["playlists"],
    queryFn: () => playlistService.getPlaylists(),
  });
};

export const usePlaylistById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["playlist", id],
    queryFn: () => {
      if (!id) throw new Error("Playlist ID is required");
      return playlistService.getPlaylistById(id);
    },
    enabled: !!id,
  });
};

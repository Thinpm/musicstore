
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAudioPlayer } from "@/components/audio/audio-player-provider";
import AudioCard from "@/components/audio/audio-card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Share, 
  Edit, 
  MoreHorizontal, 
  Plus,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatDuration } from "@/components/audio/audio-card";
import { usePlaylistById, useDeletePlaylist } from "@/hooks/usePlaylists";

const PlaylistDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack } = useAudioPlayer();
  const { toast } = useToast();
  
  // Fetch playlist data with its tracks
  const { 
    data: playlist, 
    isLoading, 
    isError, 
    error 
  } = usePlaylistById(id);
  
  // Delete playlist mutation
  const { mutate: deletePlaylist, isPending: isDeleting } = useDeletePlaylist();
  
  const tracks = playlist?.tracks || [];
  
  // Calculate total duration
  const totalDuration = tracks.reduce((acc, track) => acc + track.duration, 0);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading playlist...</p>
      </div>
    );
  }
  
  if (isError || !playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">
          {error instanceof Error ? error.message : "Playlist not found"}
        </h2>
        <Button onClick={() => navigate("/playlists")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Playlists
        </Button>
      </div>
    );
  }

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  const handleShare = () => {
    // Copy to clipboard current URL
    navigator.clipboard.writeText(window.location.href);
    
    toast({
      title: "Playlist shared",
      description: "Link copied to clipboard",
    });
  };
  
  const handleDeletePlaylist = () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.title}"?`)) {
      deletePlaylist(playlist.id, {
        onSuccess: () => {
          navigate("/playlists");
        },
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <Button 
        variant="ghost" 
        className="w-fit -ml-2 -mt-2 mb-2"
        onClick={() => navigate("/playlists")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
        <div className="w-full md:w-48 h-48 rounded-md overflow-hidden">
          <img 
            src={playlist.coverUrl} 
            alt={playlist.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="text-sm font-medium uppercase">Playlist</div>
          <h1 className="text-3xl md:text-4xl font-bold">{playlist.title}</h1>
          <p className="text-muted-foreground">{playlist.description}</p>
          <div className="text-sm text-muted-foreground">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"} - {formatDuration(totalDuration)}
          </div>
          
          <div className="flex items-center space-x-2 pt-4">
            <Button onClick={handlePlayAll} disabled={tracks.length === 0}>
              <Play className="mr-2 h-4 w-4" /> Play All
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Download Playlist</DropdownMenuItem>
                <DropdownMenuItem>Add to Queue</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={handleDeletePlaylist}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Playlist"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        {tracks.length === 0 ? (
          <div className="glass-panel p-8 rounded-md text-center">
            <h3 className="text-lg font-medium mb-2">This playlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add some tracks to get started
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Tracks
            </Button>
          </div>
        ) : (
          <div className="flex flex-col space-y-2">
            {tracks.map((track) => (
              <AudioCard key={track.id} track={track} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistDetails;


import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAudioPlayer, Track } from "@/components/audio/audio-player-provider";
import AudioCard from "@/components/audio/audio-card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Share, 
  Edit, 
  MoreHorizontal, 
  Plus,
  ArrowLeft
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

// Sample playlists for demonstration
const samplePlaylists = [
  {
    id: "1",
    title: "Summer Vibes",
    description: "Perfect tracks for sunny days",
    coverUrl: "https://images.unsplash.com/photo-1534196511436-921a4e99f297?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyfGVufDB8fDB8fHww",
  },
  {
    id: "2",
    title: "Chill Lofi Beats",
    description: "Relaxing background music",
    coverUrl: "https://images.unsplash.com/photo-1482442120256-9c4a5ab72d4c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaWxsfGVufDB8fDB8fHww",
  },
  {
    id: "3",
    title: "Workout Mix",
    description: "High energy tracks for exercise",
    coverUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29ya291dHxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: "4",
    title: "Focus & Study",
    description: "Concentration enhancing sounds",
    coverUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3R1ZHl8ZW58MHx8MHx8fDA%3D",
  },
];

// Sample tracks for each playlist
const playlistTracks: Record<string, Track[]> = {
  "1": [
    {
      id: "101",
      title: "Beach Sunrise",
      artist: "Ocean Waves",
      duration: 217,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2h8ZW58MHx8MHx8fDA%3D",
    },
    {
      id: "102",
      title: "Tropical Breeze",
      artist: "Island Sounds",
      duration: 198,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGJlYWNofGVufDB8fDB8fHww",
    },
    {
      id: "103",
      title: "Summer Nights",
      artist: "Coastal Rhythms",
      duration: 245,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3VtbWVyJTIwbmlnaHR8ZW58MHx8MHx8fDA%3D",
    },
  ],
  "2": [
    {
      id: "201",
      title: "Midnight Coffee",
      artist: "Chill Hop",
      duration: 182,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1497935586047-9242eb4fc795?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNvZmZlZSUyMG1pZG5pZ2h0fGVufDB8fDB8fHww",
    },
    {
      id: "202",
      title: "Rainy Day",
      artist: "Lo-Fi Mood",
      duration: 214,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1501691223387-dd0500403074?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFpbnklMjBkYXl8ZW58MHx8MHx8fDA%3D",
    },
  ],
  "3": [
    {
      id: "301",
      title: "Power Up",
      artist: "Fitness Beat",
      duration: 168,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3ltfGVufDB8fDB8fHww",
    },
    {
      id: "302",
      title: "Push Limits",
      artist: "Workout Mix",
      duration: 194,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z3ltfGVufDB8fDB8fHww",
    },
    {
      id: "303",
      title: "Energy Rush",
      artist: "Active Beats",
      duration: 176,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGd5bXxlbnwwfHwwfHx8MA%3D%3D",
    },
  ],
  "4": [
    {
      id: "401",
      title: "Deep Focus",
      artist: "Study Sessions",
      duration: 236,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3R1ZHl8ZW58MHx8MHx8fDA%3D",
    },
    {
      id: "402",
      title: "Concentration",
      artist: "Mind Flow",
      duration: 252,
      url: "/sample.mp3",
      cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3R1ZHl8ZW58MHx8MHx8fDA%3D",
    },
  ],
};

const PlaylistDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack } = useAudioPlayer();
  const { toast } = useToast();
  
  // Find playlist data
  const playlist = samplePlaylists.find((p) => p.id === id);
  const tracks = id ? playlistTracks[id] || [] : [];
  
  // Calculate total duration
  const totalDuration = tracks.reduce((acc, track) => acc + track.duration, 0);
  
  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-xl font-semibold mb-4">Playlist not found</h2>
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
    toast({
      title: "Playlist shared",
      description: "Link copied to clipboard",
    });
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
                <DropdownMenuItem className="text-destructive">Delete Playlist</DropdownMenuItem>
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

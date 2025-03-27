
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter, 
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ListMusic, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Share,
  Music
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample playlists for demonstration
const samplePlaylists = [
  {
    id: "1",
    title: "Summer Vibes",
    description: "Perfect tracks for sunny days",
    coverUrl: "https://images.unsplash.com/photo-1534196511436-921a4e99f297?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyfGVufDB8fDB8fHww",
    trackCount: 12,
  },
  {
    id: "2",
    title: "Chill Lofi Beats",
    description: "Relaxing background music",
    coverUrl: "https://images.unsplash.com/photo-1482442120256-9c4a5ab72d4c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaWxsfGVufDB8fDB8fHww",
    trackCount: 8,
  },
  {
    id: "3",
    title: "Workout Mix",
    description: "High energy tracks for exercise",
    coverUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29ya291dHxlbnwwfHwwfHx8MA%3D%3D",
    trackCount: 15,
  },
  {
    id: "4",
    title: "Focus & Study",
    description: "Concentration enhancing sounds",
    coverUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3R1ZHl8ZW58MHx8MHx8fDA%3D",
    trackCount: 10,
  },
];

const Playlists = () => {
  const [playlists, setPlaylists] = useState(samplePlaylists);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim() === "") {
      toast({
        title: "Playlist name required",
        description: "Please enter a name for your playlist",
        variant: "destructive",
      });
      return;
    }

    const newPlaylist = {
      id: (playlists.length + 1).toString(),
      title: newPlaylistName,
      description: newPlaylistDescription || "My custom playlist",
      coverUrl: "/placeholder.svg",
      trackCount: 0,
    };

    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName("");
    setNewPlaylistDescription("");
    setDialogOpen(false);

    toast({
      title: "Playlist created",
      description: `${newPlaylistName} has been created successfully`,
    });
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(playlists.filter((playlist) => playlist.id !== id));
    toast({
      title: "Playlist deleted",
      description: "Playlist has been deleted successfully",
    });
  };

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Playlists</h1>
          <p className="text-muted-foreground">
            Organize your audio files into collections
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="hover-effect">
              <Plus className="mr-2 h-4 w-4" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
              <DialogDescription>
                Add a name and description for your new playlist
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="playlist-name">Playlist Name</Label>
                <Input
                  id="playlist-name"
                  placeholder="My Awesome Playlist"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="playlist-description">Description (Optional)</Label>
                <Input
                  id="playlist-description"
                  placeholder="A collection of my favorite tracks"
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="glass-card p-10 rounded-xl max-w-md mx-auto">
            <div className="p-3 rounded-full bg-muted mx-auto mb-4 w-fit">
              <ListMusic className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No playlists yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first playlist to organize your audio files
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create a Playlist
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="overflow-hidden hover-effect group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button 
                    variant="secondary"
                    className="hover-effect"
                    onClick={() => navigate(`/playlists/${playlist.id}`)}
                  >
                    View Playlist
                  </Button>
                </div>
              </div>
              
              <CardHeader className="pt-5 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="line-clamp-1">{playlist.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate(`/playlists/${playlist.id}`)}>
                        <Music className="h-4 w-4 mr-2" /> Play
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="h-4 w-4 mr-2" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeletePlaylist(playlist.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">
                  {playlist.description}
                </CardDescription>
              </CardHeader>
              
              <CardFooter className="pt-0 text-sm text-muted-foreground">
                {playlist.trackCount} {playlist.trackCount === 1 ? "track" : "tracks"}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;


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
  Music,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlaylistsByLetter, useCreatePlaylist, useDeletePlaylist } from "@/hooks/usePlaylists";

const Playlists = () => {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch playlists by letter
  const { 
    data: playlists = [], 
    isLoading, 
    isError 
  } = usePlaylistsByLetter(activeLetter);
  
  // Create playlist mutation
  const { mutate: createPlaylist, isPending: isCreating } = useCreatePlaylist();
  
  // Delete playlist mutation
  const { mutate: deletePlaylist, isPending: isDeleting } = useDeletePlaylist();

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim() === "") {
      toast({
        title: "Playlist name required",
        description: "Please enter a name for your playlist",
        variant: "destructive",
      });
      return;
    }

    createPlaylist({
      title: newPlaylistName,
      description: newPlaylistDescription || "My custom playlist",
      coverUrl: "/placeholder.svg",
    }, {
      onSuccess: () => {
        setNewPlaylistName("");
        setNewPlaylistDescription("");
        setDialogOpen(false);
      }
    });
  };

  const handleDeletePlaylist = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deletePlaylist(id);
    }
  };
  
  const handleLetterClick = (letter: string) => {
    setActiveLetter(letter === activeLetter ? null : letter);
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
              <Button onClick={handleCreatePlaylist} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Playlist"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="glass-card p-8 rounded-xl">
            <h3 className="text-lg font-medium mb-2">Error loading playlists</h3>
            <p className="text-muted-foreground mb-6">
              There was a problem loading your playlists
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      ) : playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="glass-card p-10 rounded-xl max-w-md mx-auto">
            <div className="p-3 rounded-full bg-muted mx-auto mb-4 w-fit">
              <ListMusic className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {activeLetter 
                ? `No playlists starting with "${activeLetter}"` 
                : "No playlists yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {activeLetter 
                ? "Try selecting a different letter or create a new playlist"
                : "Create your first playlist to organize your audio files"}
            </p>
            <div className="flex justify-center space-x-4">
              {activeLetter && (
                <Button variant="outline" onClick={() => setActiveLetter(null)}>
                  Show All Playlists
                </Button>
              )}
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create a Playlist
              </Button>
            </div>
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
                      <DropdownMenuItem onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/playlists/${playlist.id}`);
                        toast({
                          title: "Link copied",
                          description: "Playlist link copied to clipboard",
                        });
                      }}>
                        <Share className="h-4 w-4 mr-2" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeletePlaylist(playlist.id, playlist.title)}
                        disabled={isDeleting}
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

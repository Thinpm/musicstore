import { useEffect, useState } from "react";
import { playlistService, Playlist } from "@/services/playlistService";
import { useToast } from "@/components/ui/use-toast";
import { CreatePlaylistDialog } from "@/components/playlist/create-playlist-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Grid, ListMusic, Filter, Edit, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { EditPlaylistDialog } from "@/components/playlist/edit-playlist-dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Playlists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      const success = await playlistService.deletePlaylist(playlistId);
      if (success) {
        toast({
          title: "Success",
          description: "Playlist deleted successfully.",
        });
        loadPlaylists();
      } else {
        throw new Error("Failed to delete playlist");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete playlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditPlaylist = (e: React.MouseEvent, playlist: Playlist) => {
    e.stopPropagation();
    setEditingPlaylist(playlist);
  };

  // Filter playlists based on search query
  const filteredPlaylists = playlists.filter(
    (playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (playlist.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Playlists</h1>
        <CreatePlaylistDialog onPlaylistCreated={loadPlaylists} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-[300px]">
          <Input
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {}}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <ListMusic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredPlaylists.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchQuery ? "No playlists found." : "You don't have any playlists yet. Create a new one!"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => (
            <div 
              key={playlist.id} 
              className="glass-card p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/playlists/${playlist.id}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{playlist.name}</h2>
                  {playlist.description && (
                    <p className="text-muted-foreground">{playlist.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-accent"
                    onClick={(e) => handleEditPlaylist(e, playlist)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {playlist.songs.length} songs
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPlaylists.map((playlist) => (
            <div 
              key={playlist.id} 
              className="glass-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/playlists/${playlist.id}`)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{playlist.name}</h2>
                  {playlist.description && (
                    <p className="text-sm text-muted-foreground">{playlist.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {playlist.songs.length} songs
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-accent"
                    onClick={(e) => handleEditPlaylist(e, playlist)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingPlaylist && (
        <EditPlaylistDialog
          isOpen={true}
          onClose={() => setEditingPlaylist(null)}
          playlistId={editingPlaylist.id}
          playlistName={editingPlaylist.name}
          playlistDescription={editingPlaylist.description}
          tracks={editingPlaylist.songs}
          onTracksUpdated={loadPlaylists}
          onPlaylistUpdated={loadPlaylists}
        />
      )}
    </div>
  );
}


import { useState } from "react";
import { useAudioPlayer } from "@/components/audio/audio-player-provider";
import AudioCard from "@/components/audio/audio-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Grid, ListMusic } from "lucide-react";
import { useTracksByLetter } from "@/hooks/useTracks";

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const { playTrack } = useAudioPlayer();
  
  // Fetch tracks by first letter
  const { data: tracks = [], isLoading, isError } = useTracksByLetter(activeLetter);

  // Filter tracks based on search query
  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLetterClick = (letter: string) => {
    setActiveLetter(letter === activeLetter ? null : letter);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
          <p className="text-muted-foreground">
            Manage and play your uploaded audio files
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-64 md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your library..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              
              <div className="bg-muted rounded-lg p-1 flex">
                <Button 
                  variant={viewMode === "grid" ? "secondary" : "ghost"} 
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "secondary" : "ghost"} 
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <ListMusic className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="loading-spinner h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="glass-card p-8 rounded-xl">
                    <h3 className="text-lg font-medium mb-2">Error loading audio files</h3>
                    <p className="text-muted-foreground mb-6">
                      There was a problem loading your audio files
                    </p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                </div>
              ) : filteredTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="glass-card p-8 rounded-xl">
                    <h3 className="text-lg font-medium mb-2">No audio files found</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeLetter 
                        ? `No tracks starting with "${activeLetter}"`
                        : "Upload some audio files to get started"}
                    </p>
                    <Button onClick={() => setActiveLetter(null)}>
                      {activeLetter ? "Show All Tracks" : "Upload Files"}
                    </Button>
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredTracks.map((track) => (
                    <AudioCard key={track.id} track={track} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  {filteredTracks.map((track) => (
                    <AudioCard key={track.id} track={track} compact />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="recent" className="mt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Recently played tracks will appear here</p>
              </div>
            </TabsContent>
            <TabsContent value="favorites" className="mt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Your favorite tracks will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

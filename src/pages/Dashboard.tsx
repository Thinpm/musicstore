
import { useState } from "react";
import { useAudioPlayer, Track } from "@/components/audio/audio-player-provider";
import AudioCard from "@/components/audio/audio-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Grid, ListMusic } from "lucide-react";

// Sample data for demonstration
const sampleTracks: Track[] = [
  {
    id: "1",
    title: "Digital Resonance",
    artist: "Electronic Waves",
    duration: 243,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fG11c2ljfGVufDB8fDB8fHww",
  },
  {
    id: "2",
    title: "Ambient Reflections",
    artist: "Chill Horizon",
    duration: 312,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bXVzaWN8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: "3",
    title: "Urban Echoes",
    artist: "City Pulse",
    duration: 198,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bXVzaWN8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: "4",
    title: "Night Drive",
    artist: "Midnight Cruisers",
    duration: 274,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bXVzaWN8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: "5",
    title: "Sunrise Memories",
    artist: "Dawn Collective",
    duration: 226,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG11c2ljfGVufDB8fDB8fHww",
  },
  {
    id: "6",
    title: "Sunset Grooves",
    artist: "Coastal Rhythms",
    duration: 258,
    url: "/sample.mp3",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fG11c2ljfGVufDB8fDB8fHww",
  },
];

const Dashboard = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const { playTrack } = useAudioPlayer();

  // Filter tracks based on search query
  const filteredTracks = sampleTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {filteredTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="glass-card p-8 rounded-xl">
                    <h3 className="text-lg font-medium mb-2">No audio files found</h3>
                    <p className="text-muted-foreground mb-6">
                      Upload some audio files to get started
                    </p>
                    <Button>Upload Files</Button>
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

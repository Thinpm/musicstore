
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload as UploadIcon, 
  Music, 
  X, 
  Check,
  Image,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.includes("audio")
    );
    
    if (files.length > 0) {
      setUploadedFiles(prevFiles => [...prevFiles, ...files]);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload audio files only",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(
        file => file.type.includes("audio")
      );
      setUploadedFiles(prevFiles => [...prevFiles, ...files]);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.includes("image")) {
        setCoverImage(file);
        setCoverPreview(URL.createObjectURL(file));
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
      setCoverPreview(null);
    }
  };

  const handleUpload = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one audio file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadProgress(0);
        toast({
          title: "Upload complete",
          description: `${uploadedFiles.length} files uploaded successfully`,
        });
        setUploadedFiles([]);
        setTitle("");
        setArtist("");
        setCoverImage(null);
        if (coverPreview) {
          URL.revokeObjectURL(coverPreview);
          setCoverPreview(null);
        }
      }
    }, 200);
  };

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Upload Audio</h1>
        <p className="text-muted-foreground">
          Upload your audio files to your library
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col space-y-4">
          {/* Drag & Drop Zone */}
          <div 
            className={cn(
              "border-2 border-dashed rounded-lg p-10 text-center transition-all duration-300 hover-effect",
              dragActive 
                ? "border-accent bg-accent/5" 
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-3 rounded-full bg-muted">
                <UploadIcon className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Drag & drop your audio files</h3>
                <p className="text-sm text-muted-foreground">
                  MP3, WAV, FLAC, or OGG files up to 50MB
                </p>
              </div>
              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                >
                  Browse Files
                </Button>
                <input
                  type="file"
                  ref={inputRef}
                  onChange={handleFileChange}
                  accept="audio/*"
                  multiple
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* List of uploaded files */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Uploaded Files ({uploadedFiles.length})</h3>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-background rounded-md">
                          <Music className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-medium text-lg mb-3">File Details</h3>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter track title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artist">Artist</Label>
                  <Input
                    id="artist"
                    placeholder="Enter artist name"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cover">Cover Image</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Recommended size: 500x500 pixels
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div 
                      className={cn(
                        "relative w-24 h-24 border-2 border-dashed rounded-md overflow-hidden flex items-center justify-center hover-effect",
                        coverImage ? "border-accent" : "border-muted-foreground/25"
                      )}
                      onClick={() => coverInputRef.current?.click()}
                    >
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="h-8 w-8 text-muted-foreground" />
                      )}
                      
                      {coverImage && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-90"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCoverImage();
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <Button
                        variant="outline"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        {coverImage ? "Change Image" : "Add Cover Image"}
                      </Button>
                      <input
                        type="file"
                        ref={coverInputRef}
                        onChange={handleCoverImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        JPG, PNG or GIF up to 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <h3 className="font-medium mb-1">Upload Options</h3>
                <p className="text-sm text-muted-foreground">
                  Files will be processed and available in your library after upload
                </p>
                
                {isUploading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleUpload}
                      disabled={uploadedFiles.length === 0}
                      className="hover-effect"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Upload Files
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Upload;

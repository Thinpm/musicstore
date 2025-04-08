import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface NoteMapping {
  [key: string]: string;
}

const noteMapping: NoteMapping = {
  'A': 'A_C.wav',
  'B': 'B_C#.wav',
  'C': 'C_D.wav',
  'D': 'D_D#.wav',
  'E': 'E_E.wav',
  'F': 'F_F.wav',
  'G': 'G_F#.wav',
  'H': 'H_G.wav',
  'I': 'I_G#.wav',
  'J': 'J_A.wav',
  'K': 'K_A#.wav',
  'L': 'L_B.wav',
  'M': 'M_C.wav',
  'N': 'N_C#.wav',
  'O': 'O_D.wav',
  'P': 'P_D#.wav',
  'Q': 'Q_E.wav',
  'R': 'R_F.wav',
  'S': 'S_F#.wav',
  'T': 'T_G.wav',
  'U': 'U_G#.wav',
  'V': 'V_A.wav',
  'W': 'W_A#.wav',
  'X': 'X_B.wav',
  'Y': 'Y_C.wav',
  'Z': 'Z_C#.wav'
};

export const AlphabetNotes = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const { toast } = useToast();

  const playNote = async (letter: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const fileName = noteMapping[letter];
      if (fileName) {
        const audio = new Audio(`/notes_A_to_Z/${fileName}`);
        
        // Đợi audio load xong
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve);
          audio.addEventListener('error', (e) => {
            console.error('Error loading audio:', e);
            reject(e);
          });
          audio.load();
        });

        setIsPlaying(letter);
        await audio.play();
        audioRef.current = audio;

        // Reset trạng thái sau khi phát xong
        audio.addEventListener('ended', () => {
          setIsPlaying(null);
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Lỗi",
        description: `Không thể phát âm thanh cho chữ ${letter}. Vui lòng thử lại.`,
        variant: "destructive",
      });
      setIsPlaying(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-background border-b">
      {Object.keys(noteMapping).map((letter) => (
        <Button
          key={letter}
          variant={isPlaying === letter ? "default" : "ghost"}
          className={`w-8 h-8 p-0 ${
            isPlaying === letter 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent"
          }`}
          onClick={() => playNote(letter)}
          disabled={isPlaying !== null && isPlaying !== letter}
        >
          {letter}
        </Button>
      ))}
    </div>
  );
}; 
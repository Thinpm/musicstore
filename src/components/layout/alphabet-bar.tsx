import { Button } from "@/components/ui/button";

interface AlphabetBarProps {
  onLetterClick: (letter: string) => void;
}

const AlphabetBar = ({ onLetterClick }: AlphabetBarProps) => {
  const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex justify-center h-16 items-center pointer-events-auto">
      <div className="flex space-x-0.5">
        {alphabet.map((letter) => (
          <Button
            key={letter}
            variant="ghost"
            size="sm"
            className="w-7 h-7 p-0 hover:bg-accent/10 text-sm font-medium rounded-sm"
            onClick={() => onLetterClick(letter)}
          >
            {letter}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AlphabetBar; 
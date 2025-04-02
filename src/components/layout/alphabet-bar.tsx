import { Button } from "@/components/ui/button";

interface AlphabetBarProps {
  onLetterClick: (letter: string) => void;
}

const AlphabetBar = ({ onLetterClick }: AlphabetBarProps) => {
  const alphabet = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

  return (
    <div className="flex space-x-1">
      {alphabet.map((letter) => (
        <Button
          key={letter}
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0"
          onClick={() => onLetterClick(letter)}
        >
          {letter}
        </Button>
      ))}
    </div>
  );
};

export default AlphabetBar; 
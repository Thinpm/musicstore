
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AlphabetBarProps {
  onLetterClick: (letter: string) => void;
}

const AlphabetBar = ({ onLetterClick }: AlphabetBarProps) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const location = useLocation();

  // Reset selected letter when route changes
  useEffect(() => {
    setSelectedLetter(null);
  }, [location.pathname]);

  const handleClick = (letter: string) => {
    setSelectedLetter(letter);
    onLetterClick(letter);
  };

  return (
    <div className="flex flex-wrap gap-1 items-center justify-start">
      {alphabet.map((letter) => (
        <Button
          key={letter}
          variant={selectedLetter === letter ? "default" : "ghost"}
          size="icon"
          className={`h-8 w-8 rounded-full text-sm font-medium transition-all hover:scale-110 ${
            selectedLetter === letter ? "bg-accent text-accent-foreground" : ""
          }`}
          onClick={() => handleClick(letter)}
        >
          {letter}
        </Button>
      ))}
    </div>
  );
};

export default AlphabetBar;

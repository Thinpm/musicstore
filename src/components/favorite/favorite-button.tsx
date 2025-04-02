import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { favoriteService } from '@/services/favoriteService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  songId: string;
  className?: string;
}

export function FavoriteButton({ songId, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFavorite = async () => {
      const result = await favoriteService.isFavorite(songId);
      setIsFavorite(result);
      setIsLoading(false);
    };
    checkFavorite();
  }, [songId]);

  const toggleFavorite = async () => {
    try {
      setIsLoading(true);
      if (isFavorite) {
        await favoriteService.removeFromFavorites(songId);
        setIsFavorite(false);
      } else {
        await favoriteService.addToFavorites(songId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isLoading}
      onClick={toggleFavorite}
      className={cn('hover:bg-transparent', className)}
    >
      <Heart
        className={cn(
          'h-6 w-6 transition-colors',
          isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-600'
        )}
      />
    </Button>
  );
} 
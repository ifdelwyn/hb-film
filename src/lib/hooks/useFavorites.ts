import { useState, useEffect } from 'react';
import { MovieListItem } from '../../types/movie';

export function useFavorites() {
  const [favorites, setFavorites] = useState<MovieListItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hb_favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
  }, []);

  const saveFavorites = (newItems: MovieListItem[]) => {
    setFavorites(newItems);
    try {
      localStorage.setItem('hb_favorites', JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  };

  const addToFavorites = (movie: MovieListItem) => {
    if (favorites.some(item => item.slug === movie.slug)) return;
    const newItems = [movie, ...favorites];
    saveFavorites(newItems);
    window.dispatchEvent(new Event('hb_favorites_updated'));
  };

  const removeFromFavorites = (slug: string) => {
    const newItems = favorites.filter(item => item.slug !== slug);
    saveFavorites(newItems);
    window.dispatchEvent(new Event('hb_favorites_updated'));
  };

  const isFavorite = (slug: string) => {
    return favorites.some(item => item.slug === slug);
  };

  const clearFavorites = () => {
    saveFavorites([]);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites
  };
}

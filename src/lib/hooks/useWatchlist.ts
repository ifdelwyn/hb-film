import { useState, useEffect } from 'react';
import { MovieListItem } from '../../types/movie';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<MovieListItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('filmflow_watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load watchlist:', e);
    }
  }, []);

  const saveWatchlist = (newItems: MovieListItem[]) => {
    setWatchlist(newItems);
    try {
      localStorage.setItem('filmflow_watchlist', JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save watchlist:', e);
    }
  };

  const addToWatchlist = (movie: MovieListItem) => {
    if (watchlist.some(item => item.slug === movie.slug)) return;
    const newItems = [movie, ...watchlist];
    saveWatchlist(newItems);
  };

  const removeFromWatchlist = (slug: string) => {
    const newItems = watchlist.filter(item => item.slug !== slug);
    saveWatchlist(newItems);
  };

  const isInWatchlist = (slug: string) => {
    return watchlist.some(item => item.slug === slug);
  };

  const clearWatchlist = () => {
    saveWatchlist([]);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist
  };
}

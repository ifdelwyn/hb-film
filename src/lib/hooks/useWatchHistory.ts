import { useState, useEffect } from 'react';

export interface HistoryItem {
  movieSlug: string;
  movieName: string;
  posterUrl: string;
  episodeName: string;
  episodeSlug: string;
  progress: number; // 0-100
  duration?: number; // total duration in seconds
  currentTime?: number; // current playback time in seconds
  watchedAt: string;
}

export function useWatchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hb_history') || localStorage.getItem('filmflow_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  const saveHistory = (newItems: HistoryItem[]) => {
    setHistory(newItems);
    try {
      localStorage.setItem('hb_history', JSON.stringify(newItems));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  const updateHistory = (item: Omit<HistoryItem, 'watchedAt'>) => {
    const newItem: HistoryItem = {
      ...item,
      watchedAt: new Date().toISOString()
    };

    // Remove existing entry for the same movie
    const filtered = history.filter(h => h.movieSlug !== item.movieSlug);
    const newItems = [newItem, ...filtered];
    saveHistory(newItems);
  };

  const removeFromHistory = (movieSlug: string) => {
    const newItems = history.filter(h => h.movieSlug !== movieSlug);
    saveHistory(newItems);
  };

  const getMovieHistory = (movieSlug: string) => {
    return history.find(h => h.movieSlug === movieSlug);
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  return {
    history,
    updateHistory,
    removeFromHistory,
    getMovieHistory,
    clearHistory
  };
}

import React, { useState } from 'react';
import { Play, Plus, Check, Star, Heart } from 'lucide-react';
import { MovieListItem, Movie } from '../types/movie';
import { useWatchlist } from '../lib/hooks/useWatchlist';
import { useFavorites } from '../lib/hooks/useFavorites';
import { motion } from 'motion/react';

interface MovieCardProps {
  key?: React.Key;
  movie: MovieListItem | Movie;
  variant?: 'poster' | 'landscape' | 'compact';
  showProgress?: boolean;
  progress?: number;
  onClick: () => void;
}

export default function MovieCard({ 
  movie, 
  variant = 'poster', 
  showProgress = false, 
  progress = 0,
  onClick 
}: MovieCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [imageError, setImageError] = useState(false);
  const [customImgUrl, setCustomImgUrl] = useState<string | null>(null);
  const [hasAttemptedSelfHeal, setHasAttemptedSelfHeal] = useState(false);
  const isAdded = isInWatchlist(movie.slug);
  const isFav = isFavorite(movie.slug);

  // Reset imageError when movie details change
  React.useEffect(() => {
    setImageError(false);
    setCustomImgUrl(null);
    setHasAttemptedSelfHeal(false);
  }, [movie.slug, movie.poster_url, movie.thumb_url]);

  const fallbackImage = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop&q=80';

  const handleImageError = () => {
    if (!hasAttemptedSelfHeal && movie.slug) {
      setHasAttemptedSelfHeal(true);
      fetch(`/api/phim/${movie.slug}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch detail');
          return res.json();
        })
        .then((detail) => {
          if (detail && detail.status && detail.movie) {
            const realPoster = detail.movie.poster_url;
            const realThumb = detail.movie.thumb_url;
            
            if (realPoster && typeof realPoster === 'string' && realPoster.startsWith('http')) {
              setCustomImgUrl(realPoster);
              setImageError(false);
            } else if (realThumb && typeof realThumb === 'string' && realThumb.startsWith('http')) {
              setCustomImgUrl(realThumb);
              setImageError(false);
            } else {
              setImageError(true);
            }
          } else {
            setImageError(true);
          }
        })
        .catch((err) => {
          console.log(`[Self-healing Status] Unable to auto-resolve custom image for slug: ${movie.slug}`);
          setImageError(true);
        });
    } else {
      setImageError(true);
    }
  };

  const getPoster = (movieItem: any) => {
    if (customImgUrl) return customImgUrl;
    if (imageError) return fallbackImage;

    // TMDB poster path or formatted path if stored
    if (movieItem.poster_path) {
      return `https://image.tmdb.org/t/p/w342${movieItem.poster_path}`;
    }

    // Fallback KKPhim / general poster_url (usually full URL)
    if (movieItem.poster_url && typeof movieItem.poster_url === 'string' && movieItem.poster_url.startsWith('http')) {
      return movieItem.poster_url;
    }

    // Fallback thumb_url
    if (movieItem.thumb_url && typeof movieItem.thumb_url === 'string' && movieItem.thumb_url.startsWith('http')) {
      return movieItem.thumb_url;
    }

    // Standard fallback string path check
    return movieItem.poster_url || movieItem.thumb_url || fallbackImage;
  };

  const displayImage = getPoster(movie);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdded) {
      removeFromWatchlist(movie.slug);
    } else {
      addToWatchlist({
        name: movie.name,
        slug: movie.slug,
        origin_name: movie.origin_name,
        thumb_url: movie.thumb_url || movie.poster_url,
        poster_url: movie.poster_url || movie.thumb_url,
        year: movie.year,
        type: movie.type,
        episode_current: movie.episode_current,
        quality: movie.quality,
        lang: movie.lang
      });
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) {
      removeFromFavorites(movie.slug);
    } else {
      addToFavorites({
        name: movie.name,
        slug: movie.slug,
        origin_name: movie.origin_name,
        thumb_url: movie.thumb_url || movie.poster_url,
        poster_url: movie.poster_url || movie.thumb_url,
        year: movie.year,
        type: movie.type,
        episode_current: movie.episode_current,
        quality: movie.quality,
        lang: movie.lang
      });
    }
  };

  if (variant === 'compact') {
    return (
      <div 
        id={`movie-card-compact-${movie.slug}`}
        onClick={onClick}
        className="flex gap-3 bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-surface)] p-2.5 rounded-[18px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-[var(--color-border)]/50 group"
      >
        <div className="relative w-14 h-20 rounded-[12px] overflow-hidden bg-zinc-900 flex-shrink-0">
          <img 
            src={displayImage} 
            alt={movie.name} 
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-brand)] transition-colors">
            {movie.name}
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)] truncate">
            {movie.origin_name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] font-medium">
              {movie.year}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {movie.quality}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'landscape') {
    return (
      <div 
        id={`movie-card-landscape-${movie.slug}`}
        onClick={onClick}
        className="relative aspect-video rounded-[22px] overflow-hidden bg-[var(--color-bg-elevated)] cursor-pointer group shadow-lg border border-[var(--color-border)]/45 focus-within:ring-2 focus-within:ring-[var(--color-brand)] transition-all duration-350 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_16px_36px_rgba(0,0,0,0.85)]"
      >
        {/* Thumbnail Image */}
        <img 
          src={movie.thumb_url || displayImage} 
          alt={movie.name} 
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Cinematic Underlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-transparent to-black/35 opacity-90 group-hover:opacity-100 transition-opacity" />

        {/* Item Markers */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[var(--color-brand)] text-white shadow-md">
            {movie.quality}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-black/60 backdrop-blur-md text-amber-400 border border-amber-400/20">
            ★ {('imdb' in movie && movie.imdb?.star) || '8.0'}
          </span>
        </div>

        {/* Floating actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 flex gap-2">
          <button 
            id={`btn-fav-land-${movie.slug}`}
            onClick={handleFavoriteClick}
            className="p-1.5 rounded-full bg-black/60 hover:bg-zinc-900 text-white backdrop-blur-sm transition-all shadow-md border border-white/5"
          >
            <Heart size={14} className={isFav ? "text-[#e50914] fill-[#e50914]" : "text-white"} />
          </button>
          <button 
            id={`btn-add-watchlist-land-${movie.slug}`}
            onClick={handleWatchlistClick}
            className="p-1.5 rounded-full bg-black/60 hover:bg-[var(--color-brand)] text-white backdrop-blur-sm transition-all shadow-md border border-white/5"
          >
            {isAdded ? <Check size={14} /> : <Plus size={14} />}
          </button>
        </div>

        {/* Text and progress */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end">
          <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[var(--color-brand)] transition-colors">
            {movie.name}
          </h3>
          <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-1 mt-0.5">
            {movie.origin_name} • {movie.year}
          </p>

          {showProgress && (
            <div className="w-full bg-zinc-700/50 h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-[var(--color-brand)] h-full animate-pulse" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // DEFAULT: POSTER (2:3)
  return (
    <div 
      id={`movie-card-poster-${movie.slug}`}
      onClick={onClick}
      className="relative aspect-[2/3] rounded-[22px] overflow-hidden bg-[var(--color-bg-elevated)] cursor-pointer group shadow-xl border border-[var(--color-border)]/40 focus-within:ring-2 focus-within:ring-[var(--color-brand)] transition-all duration-350 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
    >
      {/* Background Poster */}
      <img 
        src={displayImage} 
        alt={movie.name} 
        onError={handleImageError}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />

      {/* Cinematic Underlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

      {/* Item Markers & Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[var(--color-brand)] text-white shadow-md">
          {movie.quality}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-black/60 backdrop-blur-md text-slate-100 font-medium">
          {(movie.lang || 'Vietsub').split(' ')[0]}
        </span>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 flex flex-col gap-2">
        <button 
          id={`btn-fav-post-${movie.slug}`}
          onClick={handleFavoriteClick}
          className="p-2 rounded-full bg-black/70 hover:bg-zinc-900 text-white backdrop-blur-sm transition-all shadow-md border border-white/10"
        >
          <Heart size={16} className={isFav ? "text-[#e50914] fill-[#e50914]" : "text-white"} />
        </button>
        <button 
          id={`btn-add-watchlist-post-${movie.slug}`}
          onClick={handleWatchlistClick}
          className="p-2 rounded-full bg-black/70 hover:bg-[var(--color-brand)] text-white backdrop-blur-sm transition-all shadow-md border border-white/10"
        >
          {isAdded ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Active Stream Play Button overlay on Hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="p-4 rounded-full bg-[var(--color-brand)] text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
          <Play size={24} fill="currentColor" />
        </div>
      </div>

      {/* Text Info */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)]/80 to-transparent pt-10 flex flex-col justify-end">
        <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold mb-1">
          <Star size={10} fill="currentColor" />
          <span>{('imdb' in movie && movie.imdb?.star) || '8.0'}</span>
          <span className="text-zinc-500 font-normal">| {movie.year}</span>
        </div>
        <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[var(--color-brand)] transition-colors">
          {movie.name}
        </h3>
        <p className="text-[11px] text-[var(--color-text-secondary)] truncate">
          {movie.origin_name}
        </p>
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--color-border)]/30">
          <span className="text-[10px] text-[var(--color-text-secondary)] font-semibold uppercase">
            {movie.type === 'series' ? 'Phim Bộ' : 'Phim Lẻ'}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50">
            {movie.episode_current}
          </span>
        </div>
      </div>
    </div>
  );
}

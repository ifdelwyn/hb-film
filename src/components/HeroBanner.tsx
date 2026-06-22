import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Check, Info, Star, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Movie } from '../types/movie';
import { useWatchlist } from '../lib/hooks/useWatchlist';
import { motion, AnimatePresence } from 'motion/react';
import { resolvePremiumBackdrop, resolvePremiumPoster } from '../lib/providers/PosterProvider';

interface HeroBannerProps {
  movies: Movie[];
  onPlay: (slug: string) => void;
  onDetail: (slug: string) => void;
}

export default function HeroBanner({ movies, onPlay, onDetail }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [resolvedImages, setResolvedImages] = useState<Record<string, { backdrop: string; poster: string }>>({});
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Drag and swipe gestures state for mobile compatibility
  const touchStartXRef = useRef<number | null>(null);

  // 1. Resolve premium high resolution poster/backdrop images upon movie catalog load
  useEffect(() => {
    if (!movies || movies.length === 0) return;
    
    let isMounted = true;
    const processImages = async () => {
      const results: Record<string, { backdrop: string; poster: string }> = {};
      for (const m of movies) {
        // VSMov has thumb_url as primary horizontal card, poster_url as primary portrait card
        const finalBackdrop = await resolvePremiumBackdrop(m.slug, m.thumb_url || m.poster_url);
        const finalPoster = await resolvePremiumPoster(m.slug, m.poster_url || m.thumb_url);
        results[m.slug] = {
          backdrop: finalBackdrop,
          poster: finalPoster
        };
      }
      if (isMounted) {
        setResolvedImages(results);
      }
    };
    
    processImages();
    return () => {
      isMounted = false;
    };
  }, [movies]);

  // 2. 10-second autoplay rotation interval (10000ms) with restart defense
  const startAutoplay = () => {
    stopAutoplay();
    if (movies.length <= 1) return;
    autoplayTimerRef.current = setInterval(() => {
      setDirection('next');
      setCurrentIndex((prev) => (prev + 1) % movies.length);
      setIsDescExpanded(false); // Reset expanded description on slide change
    }, 10000);
  };

  const stopAutoplay = () => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [movies, currentIndex]);

  if (!movies || movies.length === 0) {
    return (
      <div className="h-[75vh] w-full bg-[#0A0A0F] skeleton-shimmer flex items-center justify-center">
        <div className="text-zinc-500 font-medium text-xs sm:text-sm uppercase tracking-widest animate-pulse">
          Đang chuẩn bị băng thông 4K UHD...
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];
  const isAdded = isInWatchlist(currentMovie.slug);

  // Get resolved files or fallback directly to VSMov defaults
  const currentImages = resolvedImages[currentMovie.slug] || {
    backdrop: currentMovie.thumb_url || currentMovie.poster_url,
    poster: currentMovie.poster_url || currentMovie.thumb_url
  };

  const handleWatchlistClick = () => {
    if (isAdded) {
      removeFromWatchlist(currentMovie.slug);
    } else {
      addToWatchlist({
        name: currentMovie.name,
        slug: currentMovie.slug,
        origin_name: currentMovie.origin_name,
        thumb_url: currentMovie.thumb_url,
        poster_url: currentMovie.poster_url,
        year: currentMovie.year,
        type: currentMovie.type,
        episode_current: currentMovie.episode_current,
        quality: currentMovie.quality,
        lang: currentMovie.lang
      });
    }
  };

  const slideNext = () => {
    stopAutoplay();
    setDirection('next');
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setIsDescExpanded(false);
    startAutoplay();
  };

  const slidePrev = () => {
    stopAutoplay();
    setDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    setIsDescExpanded(false);
    startAutoplay();
  };

  // Mobile touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const minDistance = 50; // Threshold of minimum distance in px
    
    if (Math.abs(diffX) > minDistance) {
      if (diffX > 0) {
        slideNext();
      } else {
        slidePrev();
      }
    }
    touchStartXRef.current = null;
  };

  // Slide animation variants supporting combined Fade, Scale, and Slide offsets!
  const slideVariants = {
    enter: (dir: 'next' | 'prev') => ({
      opacity: 0,
      scale: 1.08,
      x: dir === 'next' ? 60 : -60
    }),
    center: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: (dir: 'next' | 'prev') => ({
      opacity: 0,
      scale: 0.94,
      x: dir === 'next' ? -60 : 60,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <div 
      id="hero-banner-viewport" 
      className="relative w-full h-[88vh] sm:h-[92vh] md:h-screen bg-[#020205] overflow-hidden flex items-end select-none font-sans"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Slides with premium motion scaling */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Cover Art - Crisp 4K Backdrop, no blur, with precise image filter enhancements */}
          <img 
            src={currentImages.backdrop} 
            alt={currentMovie.name}
            className="w-full h-full object-cover object-center filter blur-0 brightness-[82%] contrast-[110%] saturate-[105%] transition-all duration-700"
            referrerPolicy="no-referrer"
          />
          
          {/* Apple TV+ / Netflix Deep Cinematic Vignette/Gradients */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 40%, rgba(0,0,0,0.35) 75%, transparent 100%)'
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0A0A0F]/80 to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Extreme Premium Navigation Chevron Arrows (Visible on hover) */}
      <button
        onClick={slidePrev}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 border border-white/10 hover:border-white/30 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-md opacity-30 hover:opacity-100 cursor-pointer hidden sm:flex active:scale-90"
        aria-label="Sau trước"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={slideNext}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 border border-white/10 hover:border-white/30 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-md opacity-30 hover:opacity-100 cursor-pointer hidden sm:flex active:scale-90"
        aria-label="Tiếp theo"
      >
        <ChevronRight size={24} />
      </button>

      {/* Classic Slide Indicator Dots */}
      <div className="absolute bottom-10 right-6 md:right-16 z-30 flex gap-2.5">
        {movies.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 'next' : 'prev');
              setCurrentIndex(idx);
              setIsDescExpanded(false);
            }}
            className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
              idx === currentIndex 
                ? 'bg-[#E50914] w-9 shadow-[0_0_12px_#E50914]' 
                : 'bg-white/15 hover:bg-white/40 w-2 hover:scale-110'
            }`}
            aria-label={`Đi tới slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Main Hero Content Banner Column */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pb-14 sm:pb-20 md:pb-24">
        <div className="max-w-3xl text-left select-none">
          
          {/* IMDb, Year, HD, Vietsub rounded chip indicators */}
          <div className="flex flex-wrap items-center gap-2 mb-5 animate-fade-in duration-300">
            {/* IMDb VIP Star Badge */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-md text-[11px] font-black text-amber-400 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <Star size={12} fill="currentColor" className="text-amber-400" />
              IMDb {currentMovie.imdb?.star || '8.5'}
            </span>

            {/* Type badge */}
            <span className="px-3 py-1.5 rounded-full bg-[#E50914]/15 border border-[#E50914]/35 backdrop-blur-md text-[10px] font-extrabold text-[#E50914] uppercase tracking-wider shadow-md">
              {currentMovie.type === 'series' ? 'Phim Bộ' : 'Phim Lẻ'}
            </span>

            {/* Year Badge */}
            <span className="px-3 py-1.5 rounded-full bg-black/40 border border-white/5 backdrop-blur-md text-[11.5px] font-bold text-zinc-300 shadow-sm">
              {currentMovie.year}
            </span>

            {/* Film Quality Tag */}
            <span className="px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 backdrop-blur-md text-[10.5px] font-mono font-black text-zinc-200 tracking-wider shadow-sm">
              {currentMovie.quality || 'FHD'}
            </span>

            {/* Subtitle Format */}
            <span className="px-3 py-1.5 rounded-full bg-zinc-900/60 border border-zinc-800 backdrop-blur-md text-[10.5px] font-bold text-emerald-400 uppercase tracking-widest shadow-sm">
              {currentMovie.lang || 'Vietsub'}
            </span>
          </div>

          {/* Heading Display Title: ultra-bold (900), customized size clamp */}
          <h1 
            style={{ fontWeight: 900 }}
            className="text-[#F5F5FA] leading-[0.95] tracking-tighter mb-2 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] line-clamp-2 max-h-[190px] overflow-hidden break-words font-sans text-[clamp(42px,5.8vw,80px)]"
          >
            {currentMovie.name}
          </h1>

          {/* Subtitle / Original Romanized Title */}
          <h2 className="text-zinc-400 font-semibold tracking-wide text-xs sm:text-lg mb-5 select-none flex items-center gap-2 animate-fade-in opacity-70">
            <span>{currentMovie.origin_name}</span>
            {currentMovie.time && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 block" />
                <span>{currentMovie.time} {currentMovie.time.includes('phút') ? '' : 'phút'}</span>
              </>
            )}
          </h2>

          {/* Categories details mapping */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {currentMovie.category && currentMovie.category.map(cat => (
              <span 
                key={cat.id} 
                className="text-[10px] sm:text-[11px] font-semibold text-zinc-300 bg-white/5 border border-white/5 hover:border-white/10 px-3 py-1 rounded-full hover:bg-white/10 hover:text-white cursor-pointer transition-all duration-200"
              >
                #{cat.name}
              </span>
            ))}
          </div>

          {/* High-density description with expander */}
          <div className="mb-8 max-w-xl">
            <p 
              className={`text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium drop-shadow-md select-text ${
                isDescExpanded ? 'line-clamp-none' : 'line-clamp-4'
              }`}
            >
              {currentMovie.content}
            </p>
            {currentMovie.content && currentMovie.content.length > 200 && (
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-xs font-bold text-[#E50914] hover:text-[#ff2d3d] mt-2 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {isDescExpanded ? (
                  <>
                    Thu gọn <ChevronUp size={13} />
                  </>
                ) : (
                  <>
                    Xem thêm <ChevronDown size={13} />
                  </>
                )}
              </button>
            )}
          </div>

          {/* CTA Action Buttons Row */}
          <div className="flex flex-wrap gap-3.5 items-center">
            {/* Play Button #E50914 */}
            <button
              id={`hero-play-btn-${currentMovie.slug}`}
              onClick={() => onPlay(currentMovie.slug)}
              className="flex items-center gap-2 bg-[#E50914] hover:bg-[#ff2d3d] text-white font-extrabold text-xs sm:text-sm py-4 px-8 sm:px-10 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-red-600/20 cursor-pointer uppercase tracking-wider"
            >
              <Play size={16} fill="currentColor" />
              <span>Xem Ngay</span>
            </button>

            {/* Watchlist add Button */}
            <button
              id={`hero-watchlist-btn-${currentMovie.slug}`}
              onClick={handleWatchlistClick}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs sm:text-sm py-4 px-6 rounded-xl transition-all backdrop-blur-md duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer uppercase tracking-wider"
            >
              {isAdded ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  <span>Đã Lưu</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Danh Sách</span>
                </>
              )}
            </button>

            {/* Movie Info Button */}
            <button
              id={`hero-info-btn-${currentMovie.slug}`}
              onClick={() => onDetail(currentMovie.slug)}
              className="flex items-center gap-2 bg-transparent hover:bg-white/5 text-white border border-white/15 hover:border-white/30 font-bold text-xs sm:text-sm py-4 px-5 sm:px-6 rounded-xl transition-all backdrop-blur-sm duration-300 cursor-pointer uppercase tracking-wider"
            >
              <Info size={16} />
              <span>Chi Tiết</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

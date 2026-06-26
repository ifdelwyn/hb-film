import React, { useEffect, useState } from 'react';
import { useFavorites } from '../lib/hooks/useFavorites';
import MovieCard from '../components/MovieCard';
import { Heart, Trash2, Film, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FavoritesScreenProps {
  onNavigateToMoveDetail: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export default function FavoritesScreen({ onNavigateToMoveDetail, onNavigate }: FavoritesScreenProps) {
  const { favorites, removeFromFavorites, clearFavorites } = useFavorites();
  const [localFavs, setLocalFavs] = useState(favorites);

  // Sync state
  useEffect(() => {
    setLocalFavs(favorites);
  }, [favorites]);

  // Sync updates on storage events
  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem('hb_favorites');
      if (stored) {
        setLocalFavs(JSON.parse(stored));
      } else {
        setLocalFavs([]);
      }
    };
    window.addEventListener('hb_favorites_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('hb_favorites_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pt-24 sm:pt-28 pb-16 font-sans px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[10%] left-[-15%] w-[45%] h-[45%] bg-[#E63946]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-[#E63946]/3 rounded-full blur-[130px] pointer-events-none" />

      {/* Header section with title and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8 relative z-10 select-none">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Heart size={20} className="text-[#E63946] fill-[#E63946] animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Phim Yêu Thích
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-semibold tracking-wide">
            Danh sách rạp chiếu bóng thu nhỏ của riêng bạn ({localFavs.length} phim)
          </p>
        </div>

        {localFavs.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Bạn có muốn xóa toàn bộ danh sách yêu thích?')) {
                clearFavorites();
                setLocalFavs([]);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Xóa Tất Cả</span>
          </button>
        )}
      </div>

      {/* Grid view / Empty states container */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {localFavs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center justify-center py-20 text-center select-none"
            >
              {/* Illustration */}
              <div className="w-20 h-20 rounded-3xl bg-zinc-950 border border-zinc-900/60 flex items-center justify-center text-zinc-600 mb-6 shadow-inner relative">
                <Heart size={36} className="text-zinc-700 stroke-[1.5]" />
                <span className="absolute w-2 h-2 rounded-full bg-[#E63946]/30 animate-ping" />
              </div>

              <h2 className="text-lg sm:text-xl font-black text-zinc-200">
                Chưa có phim yêu thích
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mt-2 leading-relaxed font-medium">
                Ấn vào biểu tượng trái tim ❤️ ở bất kỳ thẻ phim hoặc rạp phim nào để lưu chúng vào tủ phim riêng của bạn và theo dõi tiện lợi.
              </p>

              <button
                onClick={() => onNavigate('home')}
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#E63946] to-[#C1121F] text-xs font-black uppercase tracking-wider text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <span>Khám Phá Phim Hot</span>
                <ArrowRight size={13} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6"
            >
              {localFavs.map((movie) => (
                <div key={movie.slug} className="relative group">
                  <MovieCard
                    movie={movie}
                    onClick={() => onNavigateToMoveDetail(movie.slug)}
                  />
                  {/* Floating quick remove action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites(movie.slug);
                    }}
                    className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-black/80 hover:bg-[#E63946] text-white border border-white/10 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 z-20"
                    title="Xóa khỏi yêu thích"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

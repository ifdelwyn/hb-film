import React, { useState, useEffect } from 'react';
import { Tv, Search, Sparkles, ChevronLeft, ChevronRight, RotateCcw, AlertCircle, Grid, Play } from 'lucide-react';
import { fetchMovieList } from '../lib/api/vsmov';
import { MovieListItem } from '../types/movie';
import MovieCard from '../components/MovieCard';
import { motion, AnimatePresence } from 'motion/react';

export default function TvScreen() {
  const [shows, setShows] = useState<MovieListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const limit = 24;

  const loadTvShows = async (page: number) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await fetchMovieList({
        type: 'tv-shows',
        page: page,
        limit: limit
      });

      const items = res.items || [];
      setShows(items);
      
      const totalItems = res.pagination?.totalItems || items.length;
      setTotalPages(Math.max(1, Math.ceil(totalItems / limit)));
    } catch (err) {
      console.error('Failed to load TV Shows:', err);
      setErrorMsg('Không thể tải danh sách chương trình TV. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTvShows(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Client-side search filtering
  const filteredShows = shows.filter(show => {
    const query = searchQuery.toLowerCase();
    return (
      show.name.toLowerCase().includes(query) ||
      (show.origin_name && show.origin_name.toLowerCase().includes(query))
    );
  });

  const handleCardClick = (slug: string) => {
    window.location.hash = `#/phim/${slug}`;
  };

  return (
    <div className="min-h-screen bg-[#07070B] text-zinc-100 pt-24 pb-16 px-4 md:px-8 select-none font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Cinema-Style Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-gradient-to-r from-[#13131A] to-[#0A0A0F] border border-zinc-900/60 rounded-[32px] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-48 bg-[#E63946]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-48 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex items-start md:items-center gap-5 z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 flex items-center justify-center shadow-lg shadow-red-500/5 shrink-0 animate-pulse">
              <Tv size={28} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                  TV SHOWS
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles size={10} /> HOT SHOWS
                </span>
              </div>
              <p className="text-xs md:text-sm text-zinc-400 mt-2 font-medium leading-relaxed max-w-2xl">
                Nơi tổng hợp các chương trình truyền hình thực tế, liveshow ca nhạc, talkshow đặc sắc từ các đài truyền hình hàng đầu Việt Nam và quốc tế.
              </p>
            </div>
          </div>

          {/* Search Box inside header */}
          <div className="relative w-full md:w-80 shrink-0 z-10">
            <input
              type="text"
              placeholder="Tìm kiếm chương trình..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 hover:bg-zinc-900 focus:bg-zinc-900 border border-zinc-800/80 focus:border-[#E63946]/50 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-white placeholder-zinc-500 transition-all duration-300 outline-none"
            />
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Loading / Error / Data View */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 animate-pulse">
                <div className="aspect-[2/3] bg-zinc-900/60 rounded-[20px] border border-zinc-800/40 w-full" />
                <div className="h-4 bg-zinc-900 rounded-lg w-3/4" />
                <div className="h-3 bg-zinc-900 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-4 bg-[#13131A]/30 border border-zinc-900/60 rounded-[28px]">
            <AlertCircle className="w-12 h-12 text-[#E63946]" />
            <h3 className="text-lg font-bold text-white">Xảy ra sự cố kết nối</h3>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">{errorMsg}</p>
            <button
              onClick={() => loadTvShows(currentPage)}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Thử lại</span>
            </button>
          </div>
        ) : filteredShows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center text-zinc-600 mb-2 border border-zinc-800/40">
              <Grid size={24} />
            </div>
            <h3 className="text-base font-bold text-zinc-300">Không tìm thấy chương trình nào</h3>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.' : 'Danh mục chương trình hiện đang trống.'}
            </p>
          </div>
        ) : (
          <>
            {/* Shows Grid */}
            <motion.div 
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredShows.map((show) => (
                  <motion.div
                    key={show.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MovieCard
                      movie={show}
                      variant="poster"
                      onClick={() => handleCardClick(show.slug)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && !searchQuery && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 border border-zinc-800 rounded-2xl transition-all text-zinc-300 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1 text-xs font-bold px-4 py-2.5 bg-zinc-900/40 border border-zinc-900/80 rounded-2xl">
                  <span className="text-[#E63946]">{currentPage}</span>
                  <span className="text-zinc-500">/</span>
                  <span className="text-zinc-400">{totalPages}</span>
                </div>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 border border-zinc-800 rounded-2xl transition-all text-zinc-300 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

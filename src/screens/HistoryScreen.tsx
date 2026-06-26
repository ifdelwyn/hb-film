import React, { useEffect, useState } from 'react';
import { useWatchHistory } from '../lib/hooks/useWatchHistory';
import { Clock, Trash2, Calendar, Play, Film, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryScreenProps {
  onNavigateToWatch: (slug: string, epSlug?: string) => void;
  onNavigate: (route: string) => void;
}

export default function HistoryScreen({ onNavigateToWatch, onNavigate }: HistoryScreenProps) {
  const { history, removeFromHistory, clearHistory } = useWatchHistory();
  const [localHistory, setLocalHistory] = useState(history);

  useEffect(() => {
    setLocalHistory(history);
  }, [history]);

  // Synchronize on storage/internal custom history update events
  useEffect(() => {
    const handleUpdate = () => {
      const stored = localStorage.getItem('hb_history') || localStorage.getItem('filmflow_history');
      if (stored) {
        setLocalHistory(JSON.parse(stored));
      } else {
        setLocalHistory([]);
      }
    };
    window.addEventListener('hb_history_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('hb_history_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const getGroupLabel = (timestamp?: string | number) => {
    if (!timestamp) return 'Trước đây';
    const date = new Date(timestamp);
    const now = new Date();
    
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hôm nay';
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  // Group items by time group
  const groupedHistory: Record<string, typeof history> = {};
  localHistory.forEach((item) => {
    const label = getGroupLabel(item.updatedAt);
    if (!groupedHistory[label]) {
      groupedHistory[label] = [];
    }
    groupedHistory[label].push(item);
  });

  // Sort groups so that "Hôm nay", "Hôm qua", v.v. are rendered in chronological descending order
  // Object keys ordering in javascript doesn't guarantee it, let's collect sorted items
  const sortedGroupLabels = Object.keys(groupedHistory).sort((a, b) => {
    if (a === 'Hôm nay') return -1;
    if (b === 'Hôm nay') return 1;
    if (a === 'Hôm qua') return -1;
    if (b === 'Hôm qua') return 1;
    if (a.includes('ngày trước') && b.includes('ngày trước')) {
      const dayA = parseInt(a);
      const dayB = parseInt(b);
      return dayA - dayB;
    }
    return 1;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pt-24 sm:pt-28 pb-16 font-sans px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
      {/* Decorative Gradient Background Blur */}
      <div className="absolute top-[10%] left-[-15%] w-[45%] h-[45%] bg-[#E63946]/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8 relative z-10 select-none">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Clock size={20} className="text-[#E63946]" />
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Lịch Sử Xem
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-semibold tracking-wide">
            Những thước phim bạn đã thưởng thức gần đây ({localHistory.length} phim)
          </p>
        </div>

        {localHistory.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Bạn chắc chắn muốn xóa toàn bộ lịch sử xem phim của mình?')) {
                clearHistory();
                setLocalHistory([]);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 self-start sm:self-auto cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Xóa Tất Cả Lịch Sử</span>
          </button>
        )}
      </div>

      {/* History content container */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {localHistory.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center justify-center py-24 text-center select-none"
            >
              <div className="w-20 h-20 rounded-3xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-600 mb-6 shadow-inner">
                <Clock size={36} className="text-zinc-700 stroke-[1.5]" />
              </div>

              <h2 className="text-lg sm:text-xl font-black text-zinc-200">
                Chưa có lịch sử xem
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-sm mt-2 leading-relaxed font-medium">
                Bạn chưa thưởng thức bộ phim nào trên hệ thống. Hãy nhấp vào phim bạn yêu thích và bắt đầu trải nghiệm ngay hôm nay!
              </p>

              <button
                onClick={() => onNavigate('home')}
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#E63946] to-[#C1121F] text-xs font-black uppercase tracking-wider text-white hover:opacity-95 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <span>Xem Ngay</span>
                <ArrowRight size={13} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-8 text-left"
            >
              {sortedGroupLabels.map((groupLabel) => {
                const groupItems = groupedHistory[groupLabel];
                if (!groupItems || groupItems.length === 0) return null;

                return (
                  <div key={groupLabel} className="flex flex-col gap-4">
                    {/* Time Header Indicator */}
                    <div className="flex items-center gap-2 select-none">
                      <Calendar size={12} className="text-[#E63946]" />
                      <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                        {groupLabel}
                      </h3>
                      <div className="flex-1 h-[1px] bg-zinc-900" />
                    </div>

                    {/* Movie List items in the group */}
                    <div className="flex flex-col gap-3.5">
                      {groupItems.map((item) => (
                        <div
                          key={`${item.movieSlug}-${item.episodeSlug}`}
                          className="flex items-center gap-4 bg-[#13131A] border border-zinc-900/60 p-3 sm:p-4 rounded-[20px] hover:bg-zinc-900/30 transition-all duration-300 group"
                        >
                          {/* Poster Preview */}
                          <div
                            onClick={() => onNavigateToWatch(item.movieSlug, item.episodeSlug)}
                            className="w-14 h-20 rounded-[14px] overflow-hidden bg-zinc-950 flex-shrink-0 cursor-pointer relative shadow-md"
                          >
                            <img
                              src={item.posterUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&fit=crop&q=80"}
                              alt={item.movieName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={16} className="text-white fill-white" />
                            </div>
                          </div>

                          {/* Movie Metadata Info */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                            <h4
                              onClick={() => onNavigateToWatch(item.movieSlug, item.episodeSlug)}
                              className="text-sm font-bold text-white hover:text-[var(--color-brand)] transition-colors truncate cursor-pointer"
                            >
                              {item.movieName}
                            </h4>
                            <p className="text-xs text-zinc-400 mt-1">
                              Đang xem:{' '}
                              <span className="text-[var(--color-brand)] font-semibold">
                                {item.episodeName || 'Tập 1'}
                              </span>
                            </p>

                            {/* Custom progress bar info */}
                            <div className="flex items-center gap-3 mt-2.5">
                              <div className="flex-1 h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                                <div
                                  className="h-full bg-gradient-to-r from-[var(--color-brand)] to-[#C1121F] rounded-full"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-zinc-500 font-mono font-bold shrink-0">
                                {item.progress}%
                              </span>
                            </div>
                          </div>

                          {/* Individual action: Delete from history */}
                          <button
                            onClick={() => removeFromHistory(item.movieSlug)}
                            className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                            title="Xóa khỏi lịch sử"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

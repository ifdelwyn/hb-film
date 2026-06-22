import { useState, useEffect } from 'react';
import { fetchMovieDetail, fetchMovieList } from '../lib/api/vsmov';
import { Movie, EpisodeServer, MovieListItem } from '../types/movie';
import { useWatchlist } from '../lib/hooks/useWatchlist';
import MovieCard from '../components/MovieCard';
import { Play, Plus, Check, Star, Calendar, Clock, Tv, Film, Compass, Users, Tag, Share2, Award } from 'lucide-react';

interface DetailScreenProps {
  slug: string;
  onNavigateToWatch: (slug: string, episodeSlug?: string, serverIndex?: number) => void;
  onNavigateToDetail: (slug: string) => void;
}

export default function DetailScreen({ slug, onNavigateToWatch, onNavigateToDetail }: DetailScreenProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeServer[]>([]);
  const [related, setRelated] = useState<MovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'episodes' | 'cast' | 'related'>('info');
  const [activeServerIdx, setActiveServerIdx] = useState(0);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Watchlist hook integration
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetchMovieDetail(slug);
        if (res.status && res.movie) {
          setMovie(res.movie);
          setEpisodes(res.episodes || []);
          
          // Set tab state depending on format type
          setActiveTab(res.movie.type === 'series' ? 'episodes' : 'info');

          // Load related recommendations based on the first category
          if (res.movie.category && res.movie.category.length > 0) {
            const relRes = await fetchMovieList({ 
              category: res.movie.category[0].slug,
              limit: 6 
            });
            // Skip the current item if returned
            const filteredRel = (relRes.items || []).filter(item => item.slug !== slug);
            setRelated(filteredRel);
          }
        }
      } catch (e) {
        console.error('Failed to load detail for film:', slug, e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading || !movie) {
    return (
      <div className="w-full min-h-screen bg-[var(--color-bg-base)] text-white pt-24 pb-20 select-none flex flex-col items-center justify-center animate-pulse gap-4">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <Star size={24} className="text-[var(--color-brand)] animate-bounce" />
        </div>
        <p className="text-xs text-zinc-400 font-medium">Đang giải mã dữ liệu tiêu điểm phim...</p>
      </div>
    );
  }

  const isAdded = isInWatchlist(movie.slug);

  const handleWatchlistClick = () => {
    if (isAdded) {
      removeFromWatchlist(movie.slug);
    } else {
      addToWatchlist({
        name: movie.name,
        slug: movie.slug,
        origin_name: movie.origin_name,
        thumb_url: movie.thumb_url,
        poster_url: movie.poster_url,
        year: movie.year,
        type: movie.type,
        episode_current: movie.episode_current,
        quality: movie.quality,
        lang: movie.lang
      });
    }
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
    }, 2500);
  };

  // Safe handler to watch first episode of play button
  const handlePlayNow = () => {
    if (episodes.length > 0 && episodes[0]?.server_data?.length > 0) {
      const firstEp = episodes[0].server_data[0];
      onNavigateToWatch(movie.slug, firstEp.slug, 0);
    } else {
      onNavigateToWatch(movie.slug);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg-base)] text-white pt-16 pb-20 select-none font-sans">
      
      {/* 3A. CINEMATIC COVER BACKDROP HEADER */}
      <div className="absolute top-0 inset-x-0 h-[50vh] sm:h-[65vh] overflow-hidden">
        <img
          src={movie.poster_url || movie.thumb_url}
          alt={movie.name}
          className="w-full h-full object-cover object-top filter blur-xl scale-110 opacity-30 pointer-events-none"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-base)] via-[var(--color-bg-base)]/40 to-black/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 mt-10 md:mt-20">
        
        {/* Main layout splitting poster on left, details on right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">          {/* Left Column: Artwork */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start group select-none">
            <div className="relative w-60 sm:w-64 md:w-full max-w-[290px] aspect-[2/3] rounded-[24px] overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.85)] border border-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_28px_60px_rgba(0,0,0,0.95)]">
              <img
                src={movie.poster_url || movie.thumb_url}
                alt={movie.name}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-[var(--color-brand)] font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-md">
                {movie.quality}
              </div>
            </div>
          </div>

          {/* Right Column: Metadata details descriptions */}
          <div className="md:col-span-8 flex flex-col justify-end">
            {/* Badges details summary line */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5 text-xs font-bold text-zinc-350">
              <span className="flex items-center gap-1.5 bg-black/50 border border-white/10 backdrop-blur-md px-3.5 py-2 rounded-full text-amber-400">
                <Star size={12} fill="currentColor" />
                IMDb {movie.imdb?.star || '8.2'}
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 backdrop-blur-md px-3.5 py-2 rounded-full">
                <Calendar size={12} />
                {movie.year}
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 backdrop-blur-md px-3.5 py-2 rounded-full">
                <Clock size={12} />
                {movie.time || '120 phút'}
              </span>
              <span className="px-3.5 py-2 rounded-full bg-[var(--color-brand)]/15 border border-[var(--color-brand)]/30 backdrop-blur-md text-[10px] font-black text-[var(--color-brand)] uppercase tracking-widest">
                {movie.lang}
              </span>
            </div>

            {/* Display Headings (Title decreased ~10-15%, clamped to max 2 lines, increased gap with subtitle) */}
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-3.5 leading-tight drop-shadow-2xl line-clamp-2 max-h-[110px] overflow-hidden">
              {movie.name}
            </h1>
            <h2 className="text-xs sm:text-sm font-semibold text-zinc-400 border-b border-[#2A2A3A]/40 pb-4 mb-6 tracking-wide">
              {movie.origin_name}
            </h2>

            {/* Genre tags with enhanced contrast, size, and hover transitions */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.category.map(cat => (
                <span 
                  key={cat.id} 
                  className="flex items-center gap-1.5 text-xs sm:text-[13px] text-white bg-zinc-900/50 hover:bg-white/10 border border-white/15 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:border-[var(--color-brand)] hover:shadow-[0_0_15px_rgba(230,57,70,0.3)] font-medium"
                >
                  <Tag size={11} className="text-[var(--color-brand)]" />
                  {cat.name}
                </span>
              ))}
            </div>

            {/* Synopsis overview excerpt truncated with toggle button */}
            <div className="mb-8 max-w-3xl">
              <p className={`text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans select-text drop-shadow-md transition-all duration-300 ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                {movie.content}
              </p>
              {movie.content && movie.content.length > 250 && (
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="text-xs font-black text-[var(--color-brand)] h-8 flex items-center gap-1 mt-2.5 transition-all hover:text-[var(--color-brand-hover)] cursor-pointer hover:underline"
                >
                  {isDescExpanded ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
            </div>

            {/* Bento-style metadata specs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8 border-b border-[#2A2A3A]/45 mb-8 text-xs sm:text-sm">
              <div className="bg-[#12121A]/35 border border-white/5 hover:border-white/10 p-4 rounded-xl text-left transition-colors">
                <p className="text-zinc-500 font-bold tracking-wider uppercase text-[9px]">Đạo diễn</p>
                <p className="font-bold text-white mt-1.5 truncate" title={movie.director.join(', ') || 'Đang cập nhật'}>
                  {movie.director.join(', ') || 'Đang cập nhật'}
                </p>
              </div>
              <div className="bg-[#12121A]/35 border border-white/5 hover:border-white/10 p-4 rounded-xl text-left transition-colors">
                <p className="text-zinc-500 font-bold tracking-wider uppercase text-[9px]">Trạng thái</p>
                <p className="font-bold text-[var(--color-brand)] mt-1.5 uppercase tracking-wide text-[11px]">
                  {movie.status === 'completed' ? 'Hoàn Tất' : 'Đang chiếu'}
                </p>
              </div>
              <div className="bg-[#12121A]/35 border border-white/5 hover:border-white/10 p-4 rounded-xl text-left transition-colors">
                <p className="text-zinc-500 font-bold tracking-wider uppercase text-[9px]">Quốc gia</p>
                <p className="font-bold text-white mt-1.5 truncate" title={movie.country.map(c => c.name).join(', ')}>
                  {movie.country.map(c => c.name).join(', ') || 'N/A'}
                </p>
              </div>
              <div className="bg-[#12121A]/35 border border-white/5 hover:border-white/10 p-4 rounded-xl text-left transition-colors">
                <p className="text-zinc-500 font-bold tracking-wider uppercase text-[9px]">Tổng số tập</p>
                <p className="font-bold text-zinc-100 mt-1.5">
                  {movie.episode_current} / {movie.episode_total || '1 tập'}
                </p>
              </div>
            </div>

            {/* ACTION TRIGGERS ROW */}
            <div className="flex flex-wrap gap-3 select-none">
              <button
                id="detail-play-now-btn"
                onClick={handlePlayNow}
                className="flex items-center gap-2 bg-[var(--color-brand)] hover:bg-[var(--color-brand-dim)] text-white font-bold py-3.5 px-8 md:px-10 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-red-650/15 cursor-pointer"
              >
                <Play size={18} fill="currentColor" />
                <span>Xem Phim</span>
              </button>

              <button
                id="detail-watchlist-btn"
                onClick={handleWatchlistClick}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 font-semibold py-3.5 px-6 rounded-xl transition-all backdrop-blur-md cursor-pointer"
              >
                {isAdded ? <Check size={18} className="text-teal-400" /> : <Plus size={18} />}
                <span>{isAdded ? 'Đã trong Watchlist' : 'Lưu Danh Sách'}</span>
              </button>

              <button
                id="detail-share-btn"
                onClick={shareLink}
                className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 font-semibold py-3.5 px-5 rounded-xl transition-all cursor-pointer"
              >
                <Share2 size={18} />
                <span>{shareSuccess ? 'Đã sao chép liên kết!' : 'Chia sẻ'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* 3D. TABS NAVIGATION PANEL */}
        <div className="mt-16 sm:mt-24">
          {/* Tab switches */}
          <div className="flex border-b border-zinc-900 pb-3 gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {movie.type === 'series' && (
              <button
                onClick={() => setActiveTab('episodes')}
                className={`text-sm font-bold pb-2 transition-colors cursor-pointer select-none uppercase tracking-wider relative ${activeTab === 'episodes' ? 'text-[var(--color-brand)]' : 'text-zinc-500 hover:text-white'}`}
              >
                Tập phim ({episodes[0]?.server_data?.length || 0})
                {activeTab === 'episodes' && <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[var(--color-brand)] rounded-full animate-scale-in" />}
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('info')}
              className={`text-sm font-bold pb-2 transition-colors cursor-pointer select-none uppercase tracking-wider relative ${activeTab === 'info' ? 'text-[var(--color-brand)]' : 'text-zinc-500 hover:text-white'}`}
            >
              Giới thiệu chung
              {activeTab === 'info' && <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[var(--color-brand)] rounded-full animate-scale-in" />}
            </button>

            <button
              onClick={() => setActiveTab('cast')}
              className={`text-sm font-bold pb-2 transition-colors cursor-pointer select-none uppercase tracking-wider relative ${activeTab === 'cast' ? 'text-[var(--color-brand)]' : 'text-zinc-500 hover:text-white'}`}
            >
              Diễn viên chính
              {activeTab === 'cast' && <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[var(--color-brand)] rounded-full animate-scale-in" />}
            </button>

            <button
              onClick={() => setActiveTab('related')}
              className={`text-sm font-bold pb-2 transition-colors cursor-pointer select-none uppercase tracking-wider relative ${activeTab === 'related' ? 'text-[var(--color-brand)]' : 'text-zinc-500 hover:text-white'}`}
            >
              Có thể bạn thích
              {activeTab === 'related' && <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[var(--color-brand)] rounded-full animate-scale-in" />}
            </button>
          </div>

          {/* Active Tab Panel renderer */}
          <div className="py-8 font-sans">
            
            {/* 1. EPISODES GRID (tab: episodes) */}
            {activeTab === 'episodes' && (
              <div className="flex flex-col gap-6 animate-scale-in select-none">
                {episodes.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-medium">Bản phát sóng tập phim tạm chưa cập nhật.</p>
                ) : (
                  <>
                    {/* Server selectors */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-2">Cổng Truyền:</span>
                      {episodes.map((svr, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveServerIdx(idx)}
                          className={`text-xs py-1.5 px-4 rounded-lg font-bold border transition-colors cursor-pointer ${activeServerIdx === idx ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-lg shadow-red-500/10' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}
                        >
                          {svr.server_name}
                        </button>
                      ))}
                    </div>

                    {/* Episodes list triggers */}
                    <div className="mt-4">
                      <p className="text-xs text-zinc-400 font-medium mb-3">Vui lòng bấm chọn tập phim để truyền phát:</p>
                      
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
                        {episodes[activeServerIdx]?.server_data?.map((ep) => (
                          <button
                            key={ep.slug}
                            id={`btn-ep-select-detail-${ep.slug}`}
                            onClick={() => onNavigateToWatch(movie.slug, ep.slug, activeServerIdx)}
                            className="p-3 text-xs font-bold text-center rounded-lg bg-zinc-900 hover:bg-[var(--color-brand)] hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer border border-zinc-800/80 hover:border-transparent"
                          >
                            Tập {ep.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2. GENERAL INFO (tab: info) */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-scale-in">
                
                {/* Story details */}
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2 mb-4">
                    <Compass size={14} className="text-[var(--color-brand)]" />
                    Cốt truyện đỉnh cao
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
                    {movie.content}
                  </p>
                </div>

                {/* Additional metrics info sidebar */}
                <div className="bg-zinc-900/50 rounded-xl p-5 border border-zinc-900 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2 mb-2">
                    <Award size={14} className="text-amber-400" />
                    Thông tin kĩ thuật
                  </h3>
                  <div className="flex flex-col gap-3 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-semibold">Chất lượng nguồn:</span>
                      <span className="font-bold text-white font-mono bg-zinc-800 px-1.5 rounded">{movie.quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-semibold">Lượt xem tích lũy:</span>
                      <span className="font-bold text-white">{movie.view.toLocaleString()} views</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-semibold">Công chiếu năm:</span>
                      <span className="font-bold text-white">{movie.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500 font-semibold">Giấy phép đăng ký:</span>
                      <span className="font-bold text-teal-400">{movie.is_copyright ? 'Bản Quyền Đầy Đủ' : 'Phổ thông'}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 3. CAST (tab: cast) */}
            {activeTab === 'cast' && (
              <div className="animate-scale-in select-none flex flex-col gap-5">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2 mb-2">
                  <Users size={14} className="text-[var(--color-brand)]" />
                  Dàn diễn viên danh giá
                </h3>
                {movie.actor.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-medium">Danh sách diễn viên chưa hiển thị công khai.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {movie.actor.map((actName, idx) => (
                      <div key={idx} className="flex flex-col items-center text-center p-3 rounded-lg bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 transition-colors">
                        <img
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
                          alt={actName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';
                          }}
                          className="w-16 h-16 rounded-full object-cover border-2 border-zinc-800"
                        />
                        <h4 className="text-xs font-bold text-white mt-3 truncate w-full">{actName}</h4>
                        <p className="text-[10px] text-zinc-500 mt-1">Vai chính</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. RELATED (tab: related) */}
            {activeTab === 'related' && (
              <div className="animate-scale-in">
                {related.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-medium">Không tìm thấy tiêu điểm liên quan khác khớp thể loại.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {related.map(item => (
                      <MovieCard
                        key={item.slug}
                        movie={item}
                        onClick={() => onNavigateToDetail(item.slug)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

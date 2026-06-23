import { useState, useEffect } from 'react';
import { fetchMovieDetail } from '../lib/api/vsmov';
import { Movie, EpisodeServer, EpisodeData } from '../types/movie';
import { useWatchHistory } from '../lib/hooks/useWatchHistory';
import VideoPlayer from '../components/VideoPlayer';
import { Play, Tv, ChevronRight, HelpCircle, Flame, Star, Compass, ArrowLeft } from 'lucide-react';

interface WatchScreenProps {
  slug: string;
  initialEpisodeSlug?: string;
  initialServerIdx?: number;
  onNavigateToDetail: (slug: string) => void;
  onBack: () => void;
}

export default function WatchScreen({ 
  slug, 
  initialEpisodeSlug, 
  initialServerIdx = 0,
  onNavigateToDetail,
  onBack
}: WatchScreenProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeServer[]>([]);
  const [activeServerIdx, setActiveServerIdx] = useState(initialServerIdx);
  const [activeEpisode, setActiveEpisode] = useState<EpisodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Watch history hook integration
  const { updateHistory, getMovieHistory } = useWatchHistory();

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetchMovieDetail(slug);
        if (res.status && res.movie) {
          setMovie(res.movie);
          const serverList = res.episodes || [];
          setEpisodes(serverList);

          // Find specific episode or default to first
          if (serverList.length > 0) {
            const currentServer = serverList[activeServerIdx] || serverList[0];
            const dataList = currentServer?.server_data || [];
            
            if (dataList.length > 0) {
              const matchedEp = initialEpisodeSlug 
                ? dataList.find(ep => ep.slug === initialEpisodeSlug) 
                : dataList[0];
                
              setActiveEpisode(matchedEp || dataList[0]);
            }
          }
        }
      } catch (e) {
        console.error('Failed to resolve episode streams for slug:', slug, e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, initialEpisodeSlug, activeServerIdx]);

  // Sync progress updates to local storage
  const handleProgress = (currentTime: number, duration: number) => {
    if (!movie || !activeEpisode) return;
    const progressPercent = Math.min(100, Math.round((currentTime / duration) * 100)) || 0;
    
    updateHistory({
      movieSlug: movie.slug,
      movieName: movie.name,
      posterUrl: movie.poster_url || movie.thumb_url,
      episodeName: activeEpisode.name,
      episodeSlug: activeEpisode.slug,
      progress: progressPercent,
      duration: duration,
      currentTime: currentTime
    });
  };

  // Skip to next episode helper
  const handleNextEpisode = () => {
    if (episodes.length === 0) return;
    const dataList = episodes[activeServerIdx]?.server_data || [];
    if (dataList.length === 0 || !activeEpisode) return;

    const curIdx = dataList.findIndex(ep => ep.slug === activeEpisode.slug);
    if (curIdx !== -1 && curIdx < dataList.length - 1) {
      const nextEp = dataList[curIdx + 1];
      setActiveEpisode(nextEp);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading || !movie || !activeEpisode) {
    return (
      <div className="w-full min-h-screen bg-black text-white py-20 select-none flex flex-col items-center justify-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-[var(--color-brand)] animate-spin"></div>
          <Tv size={24} className="text-[var(--color-brand)] absolute animate-pulse" />
        </div>
        <div className="text-center max-w-sm px-4">
          <p className="text-sm font-black text-white uppercase tracking-wider">ĐANG KHỞI TẠO LUỒNG PHÁT</p>
          <p className="text-xs text-zinc-500 font-medium mt-1.5 leading-relaxed">
            Kết nối luồng truyền tải m3u8 và cấu hình hệ thống CDN tốc độ cao...
          </p>
        </div>
      </div>
    );
  }

  const currentServerList = episodes[activeServerIdx]?.server_data || [];

  return (
    <div className="w-full min-h-screen bg-black text-white pt-20 pb-20 select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Navigation Breadcrumb Back trigger */}
        <div className="flex items-center gap-3 mb-6 select-none border-b border-zinc-900 pb-4">
          <button 
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
            <span className="hover:text-white cursor-pointer" onClick={onBack}>Trang Trước</span>
            <ChevronRight size={12} />
            <span className="hover:text-white cursor-pointer" onClick={() => onNavigateToDetail(movie.slug)}>
              {movie.name}
            </span>
            <ChevronRight size={12} />
            <span className="text-white font-bold">Xem phim</span>
          </div>
        </div>

        {/* 4A-4B. CUSTOM HYBRID VIDEO PLAYER MOUNTED */}
        <div className="mb-10 shadow-3xl">
          <VideoPlayer
            embedUrl={activeEpisode.link_embed}
            m3u8Url={activeEpisode.link_m3u8}
            title={`${movie.name} - Tập ${activeEpisode.name}`}
            poster={movie.poster_url || movie.thumb_url}
            onEnded={handleNextEpisode}
            onProgress={handleProgress}
          />
        </div>

        {/* 4C. SERVER SELECTOR PORT / GATE SELECT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          
          {/* Broad description, tags */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div>
              <span className="text-[10px] text-[var(--color-brand)] font-bold tracking-widest uppercase mb-1 block">
                DANG PHAT TRUC TUYEN
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold sm:font-black tracking-tighter text-white drop-shadow">
                {movie.name} — <span className="text-[var(--color-brand)] font-black">Tập {activeEpisode.name}</span>
              </h2>
              <p className="text-xs text-zinc-500 font-medium font-sans mt-1">
                {movie.origin_name} • {movie.quality} • {movie.lang} • Lượt xem: {movie.view.toLocaleString()} views
              </p>
            </div>

            {/* Servers listing tags: Tinh gọn và chuyên nghiệp, không chiếm nhiều diện tích */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-900/60 transition-all">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0 select-none">
                <Flame size={12} className="text-[var(--color-brand)] animate-pulse" />
                Nguồn phát:
              </span>
              
              <div className="flex flex-wrap gap-2">
                {episodes.map((svr, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveServerIdx(idx);
                      // Reset to first episode of that server, matching same episode if possible
                      const otherServerList = episodes[idx]?.server_data || [];
                      const matchingep = otherServerList.find(e => e.slug === activeEpisode.slug);
                      setActiveEpisode(matchingep || otherServerList[0]);
                    }}
                    className={`text-[11px] py-1 px-3 rounded-md font-bold border transition-all cursor-pointer ${
                      activeServerIdx === idx 
                        ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-md shadow-red-500/10' 
                        : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:border-zinc-800 hover:text-white'
                    }`}
                  >
                    {svr.server_name}
                  </button>
                ))}
              </div>
            </div>

            {/* General Description content dropdown list */}
            <div className="flex flex-col gap-2 font-sans text-xs sm:text-sm">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2 mb-2">
                <Compass size={14} className="text-[var(--color-brand)]" />
                Cốt truyện tiêu điểm
              </h3>
              <p className="text-zinc-400 leading-relaxed font-sans">{movie.content}</p>
            </div>

          </div>

          {/* Collapsible Sidebar playlists episodes select */}
          <div className="lg:col-span-4 bg-[var(--color-bg-elevated)] border border-zinc-900 rounded-2xl p-5 select-none h-fit">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-3 mb-4">
              <Tv size={14} className="text-[var(--color-brand)]" />
              Danh Sách Tập Phim
            </h3>

            {currentServerList.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center font-medium py-10">Kênh truyền tải chưa cập nhật tập phim nào.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-[11px] text-zinc-500 mb-1 leading-normal">
                  Bạn đang xem server: <span className="text-white font-bold font-sans">{episodes[activeServerIdx]?.server_name || 'N/A'}</span>
                </p>

                {/* Episodes button grid list */}
                <div className="grid grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  {currentServerList.map((ep) => {
                    const isWatching = activeEpisode.slug === ep.slug;
                    return (
                      <button
                        key={ep.slug}
                        id={`btn-ep-watch-select-${ep.slug}`}
                        onClick={() => {
                          setActiveEpisode(ep);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`text-xs p-2 rounded-md font-black text-center border cursor-pointer transition-all ${
                          isWatching 
                            ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-lg shadow-red-650/15' 
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {ep.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

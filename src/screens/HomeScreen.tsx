import { useState, useEffect } from 'react';
import { fetchPhimMoi, fetchMovieList, fetchMovieDetail } from '../lib/api/vsmov';
import { Movie, MovieListItem } from '../types/movie';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import VideoPlayer from '../components/VideoPlayer';
import { 
  Flame, Film, Tv, Heart, Compass, Sparkles, RefreshCw, 
  Globe, TrendingUp, Calendar, Clapperboard, Award,
  Search, X, Play, ChevronRight
} from 'lucide-react';
import { 
  fetchConanMovies, 
  fetchDoraemonMovies, 
  fetchAllAnimeMovies, 
  fetchTrending, 
  fetchNowPlaying, 
  fetchUpcoming 
} from '../services/tmdbService';

async function fetchConanEpisodes() {
  // Check cache first
  try {
    const cached = localStorage.getItem('conan_eps_v4');
    if (cached) {
      const { data, time } = JSON.parse(cached);
      if (Date.now() - time < 1000 * 60 * 60 * 6) { // 6 hours
        return data;
      }
    }
  } catch (e) {
    console.error('Failed to parse cached Conan episodes:', e);
  }

  try {
    const res = await fetch('/api/phim/tham-tu-lung-danh-conan');
    const data = await res.json();

    const bestServer = data.episodes?.sort(
      (a: any, b: any) => (b.server_data?.length || 0) - (a.server_data?.length || 0)
    )[0];

    const rawData = bestServer?.server_data || [];
    const episodes = rawData.map((ep: any) => {
      const numMatch = ep.name?.replace(/\D/g, '');
      return {
        name: ep.name || "",
        embed: ep.link_embed || "",
        m3u8: ep.link_m3u8 || "",
        number: parseInt(numMatch) || 0
      };
    })
    .filter((ep: any) => ep.embed || ep.m3u8)
    .sort((a: any, b: any) => a.number - b.number);

    try {
      localStorage.setItem('conan_eps_v4', JSON.stringify({
        data: episodes,
        time: Date.now(),
        poster: data.movie?.poster_url || data.movie?.thumb_url,
        total: episodes.length
      }));
    } catch (e) {
      console.error('Failed to store Conan episodes in localStorage:', e);
    }

    console.log(`[Conan] Loaded ${episodes.length} episodes successfully.`);
    return episodes;
  } catch (err) {
    console.error('[Conan Fetch Error]:', err);
    return [];
  }
}

interface HomeScreenProps {
  onNavigateToMoveDetail: (slug: string) => void;
  onNavigateToWatch: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export default function HomeScreen({ 
  onNavigateToMoveDetail, 
  onNavigateToWatch,
  onNavigate
}: HomeScreenProps) {
  const [heroPhim, setHeroPhim] = useState<Movie[]>([]);
  const [phimMoi, setPhimMoi] = useState<MovieListItem[]>([]);
  const [phimBo, setPhimBo] = useState<MovieListItem[]>([]);
  const [phimLe, setPhimLe] = useState<MovieListItem[]>([]);
  const [phimAnime, setPhimAnime] = useState<MovieListItem[]>([]);
  
  // TMDB Movie States
  const [conanPhim, setConanPhim] = useState<any[]>([]);
  const [doraemonPhim, setDoraemonPhim] = useState<any[]>([]);
  const [animePhim, setAnimePhim] = useState<any[]>([]);
  const [trendingPhim, setTrendingPhim] = useState<any[]>([]);
  const [nowPlayingPhim, setNowPlayingPhim] = useState<any[]>([]);
  const [upcomingPhim, setUpcomingPhim] = useState<any[]>([]);
  const [animeLimit, setAnimeLimit] = useState(12);
  
  // Conan Episodic Series States
  const [conanTab, setConanTab] = useState<'movie' | 'series'>('movie');
  const [conanEpisodes, setConanEpisodes] = useState<any[]>([]);
  const [conanSearch, setConanSearch] = useState('');
  const [isLoadingConanEps, setIsLoadingConanEps] = useState(false);
  const [playingConanEp, setPlayingConanEp] = useState<any | null>(null);
  const [activePlayIdx, setActivePlayIdx] = useState<number>(0);
  const [selectedGroupIdx, setSelectedGroupIdx] = useState<number>(0);
  const [landingSelectedGroupIdx, setLandingSelectedGroupIdx] = useState<number>(0);
  const GROUP_SIZE = 50;
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch Phim Mới Cập Nhật
      const resPhimMoi = await fetchPhimMoi(1, 15);
      setPhimMoi(resPhimMoi.items || []);

      // 3. Fetch Phim Bộ
      const resPhimBo = await fetchMovieList({ type: 'series', limit: 12 });
      setPhimBo(resPhimBo.items || []);

      // 4. Fetch Phim Lẻ
      const resPhimLe = await fetchMovieList({ type: 'single', limit: 12 });
      setPhimLe(resPhimLe.items || []);

      // 5. Fetch Animated genre movies (tag: hoat-hinh)
      const resPhimAnime = await fetchMovieList({ category: 'hoat-hinh', limit: 12 });
      setPhimAnime(resPhimAnime.items || []);

      // 6. Fetch TMDB integrations in parallel
      const [conan, doraemon, anime, trending, nowPlaying, upcoming] = await Promise.all([
        fetchConanMovies(),
        fetchDoraemonMovies(),
        fetchAllAnimeMovies(),
        fetchTrending(1),
        fetchNowPlaying(1),
        fetchUpcoming(1)
      ]);

      setConanPhim(conan || []);
      setDoraemonPhim(doraemon || []);
      setAnimePhim(anime || []);
      setTrendingPhim(trending || []);
      setNowPlayingPhim(nowPlaying || []);
      setUpcomingPhim(upcoming || []);

      // 7. Determine Hero Banner Movies (Customize this array to pin/promote any movies by slug in the system!)
      // Cấu hình danh sách các slug phim muốn ghim lên Banner trang chủ tại đây để đạt đủ 12 phim cao cấp.
      // Nếu bất kỳ phim nào tải lỗi hoặc thiếu, hệ thống sẽ tự động lấy phim mới/thịnh hành để bù đắp cho đủ đúng 12 phim.
      const CURATED_BANNER_SLUGS: string[] = [
        'tham-tu-lung-danh-conan',
        'doraemon-nobita-va-ban-giao-huong-dia-cau',
        'dau-pha-thuong-khung-phan-5',
        'one-piece',
        'the-gioi-hoan-my',
        'pham-nhan-tu-tien',
        'tu-la-vo-song',
        'dau-la-dai-luc-2-tuyet-the-duong-mon',
        'vo-dong-can-khon-phan-4',
        'than-lan-dai-luc',
        'tay-hanh-ky-phan-5',
        'nghich-thien-ta-than'
      ];

      let initialHeroMovies: Movie[] = [];

      if (CURATED_BANNER_SLUGS.length > 0) {
        // Fetch curated movies by slug
        const fetchedCurated = await Promise.all(
          CURATED_BANNER_SLUGS.map(async (slug) => {
            try {
              const resDetail = await fetchMovieDetail(slug);
              if (resDetail && resDetail.movie) {
                return resDetail.movie;
              }
            } catch (err) {
              console.warn(`Could not load curated banner movie with slug: ${slug}`, err);
            }
            return null;
          })
        );
        initialHeroMovies = fetchedCurated.filter((m): m is Movie => m !== null);
      }

      setHeroPhim(initialHeroMovies);

      // Fetch background details for all hero banner movies to ensure the descriptions (content),
      // categories (category), and durations (time) are fully populated and visible in the premium UI.
      Promise.all(
        initialHeroMovies.map(async (movie) => {
          if (movie.content && movie.category && movie.category.length > 0 && movie.time) {
            // Already has full detail loaded (from curation)
            return movie;
          }
          try {
            const resDetail = await fetchMovieDetail(movie.slug);
            if (resDetail && resDetail.movie) {
              return {
                ...movie,
                content: resDetail.movie.content || movie.content || '',
                category: resDetail.movie.category || movie.category || [],
                time: resDetail.movie.time || movie.time || '',
                quality: resDetail.movie.quality || movie.quality || 'FHD',
                lang: resDetail.movie.lang || movie.lang || 'Vietsub',
                imdb: resDetail.movie.imdb || movie.imdb
              };
            }
          } catch (err) {
            console.warn(`Error loading detailed banner info for ${movie.slug}:`, err);
          }
          return movie;
        })
      ).then(detailedHeroMovies => {
        setHeroPhim(detailedHeroMovies);
      });

    } catch (e) {
      console.error('HomeScreen fetch error:', e);
      setErrorMsg('Không thể kết nối đến máy chủ truyền phát. Vui lòng bấm thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Load Conan episodes when tab switches to 'series'
  useEffect(() => {
    if (conanTab !== 'series') return;
    if (conanEpisodes.length > 0) return;

    setIsLoadingConanEps(true);
    fetchConanEpisodes().then(eps => {
      setConanEpisodes(eps || []);
      setIsLoadingConanEps(false);
    });
  }, [conanTab, conanEpisodes.length]);

  // Auto-align selectedGroupIdx with playing episode index
  useEffect(() => {
    if (playingConanEp) {
      const idx = conanEpisodes.findIndex(e => e.name === playingConanEp.name);
      if (idx !== -1) {
        setSelectedGroupIdx(Math.floor(idx / GROUP_SIZE));
      }
    }
  }, [playingConanEp, conanEpisodes]);

  const renderSkeletonRow = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="aspect-[2/3] w-full rounded-xl bg-[var(--color-bg-elevated)] skeleton-shimmer" />
      ))}
    </div>
  );

  const filteredConanEpisodes = conanEpisodes.filter((ep: any) =>
    ep.name?.toLowerCase().includes(conanSearch.toLowerCase())
  );

  return (
    <div className="w-full bg-[var(--color-bg-base)] text-white pb-20 select-none">
      
      {/* 1. CINEMATIC HERO SLIDES */}
      {!isLoading && heroPhim.length > 0 ? (
        <HeroBanner 
          movies={heroPhim}
          onPlay={onNavigateToWatch}
          onDetail={onNavigateToMoveDetail}
        />
      ) : (
        <div className="w-full h-[75vh] bg-[var(--color-bg-elevated)] skeleton-shimmer flex items-center justify-center">
          {errorMsg ? (
            <div className="flex flex-col items-center gap-4 px-4 text-center">
              <p className="text-sm font-semibold text-zinc-400">{errorMsg}</p>
              <button 
                onClick={loadData}
                className="flex items-center gap-2 p-2 px-4 rounded-lg bg-[var(--color-brand)] text-xs font-bold hover:bg-[var(--color-brand-dim)] transition-colors cursor-pointer"
              >
                <RefreshCw size={14} /> Thử lại ngay
              </button>
            </div>
          ) : (
            <span className="text-zinc-500 text-xs font-medium">Đang kết nối băng thông điện ảnh...</span>
          )}
        </div>
      )}

      {/* Rows Container Layout - Main feed */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 sm:mt-16 md:mt-24 flex flex-col gap-12 sm:gap-16">
        
        {/* ROW 1: Phim mới cập nhật */}
        <section id="homepage-phim-moi-row" className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[var(--color-brand)] rounded-full shadow-[0_0_12px_rgba(230,57,70,0.5)] animate-pulse"></div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold md:font-black tracking-tighter text-[#F0F0F5] uppercase">
                phim mới cập nhật
              </h2>
            </div>
            <div 
              onClick={() => onNavigate('phim-moi')}
              className="text-[#E63946] text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100 cursor-pointer transition-colors"
            >
              Xem tất cả &rarr;
            </div>
          </div>

          {isLoading ? renderSkeletonRow() : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {phimMoi.slice(0, 12).map((item) => (
                <MovieCard 
                  key={item.slug}
                  movie={item}
                  onClick={() => onNavigateToMoveDetail(item.slug)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ROW 2: Phim lẻ hot */}
        <section id="homepage-phim-le-row" className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[var(--color-brand)] rounded-full shadow-[0_0_12px_rgba(230,57,70,0.5)]"></div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold md:font-black tracking-tighter text-[#F0F0F5] uppercase">
                Phim lẻ siêu hot
              </h2>
            </div>
            <div 
              onClick={() => onNavigate('phim-le')}
              className="text-[#E63946] text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100 cursor-pointer transition-colors"
            >
              Xem tất cả &rarr;
            </div>
          </div>

          {isLoading ? renderSkeletonRow() : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {phimLe.map((item) => (
                <MovieCard 
                  key={item.slug}
                  movie={item}
                  variant="poster"
                  onClick={() => onNavigateToMoveDetail(item.slug)}
                />
              ))}
            </div>
          )}
        </section>

        {/* MID-BANNER ADVERTISING (Netflix-style promotion banner) */}
        {!isLoading && phimLe.length > 2 && (
          <div className="relative rounded-2xl overflow-hidden aspect-[21/9] sm:aspect-[3/1] bg-[var(--color-bg-elevated)] border border-zinc-900 flex items-center p-6 sm:p-12 shadow-2xl group select-none">
            <div className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:scale-[1.02] transition-transform duration-[6s]" style={{ backgroundImage: `url(${phimLe[1]?.poster_url || phimBo[2]?.poster_url})` }} referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            
            <div className="relative z-10 max-w-lg">
              <span className="text-[10px] sm:text-xs text-[var(--color-brand)] font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
                <Sparkles size={12} /> GIỚI THIỆU PHIM BOM TẤN
              </span>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-black font-display text-white mb-2 leading-tight">
                {phimLe[1]?.name || 'Chiến Binh Ánh Sáng'}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-2 md:line-clamp-3 mb-4 max-w-sm">
                Tròn bộ trải nghiệm âm thanh 5.1 và hình ảnh sắc nét chuẩn rạp phim IMAX. Xem nhanh không cần tài khoản, đường truyền VIP không quảng cáo.
              </p>
              <button 
                onClick={() => onNavigateToMoveDetail(phimLe[1]?.slug)}
                className="p-2 py-1 px-4 text-xs font-bold text-white bg-[var(--color-brand)] hover:bg-[var(--color-brand-dim)] rounded-md transition-colors cursor-pointer"
              >
                Khám phá ngay
              </button>
            </div>
          </div>
        )}

        {/* ROW 3: Phim bộ đang chiều (series) */}
        <section id="homepage-phim-bo-row" className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[var(--color-brand)] rounded-full shadow-[0_0_12px_rgba(230,57,70,0.5)]"></div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold md:font-black tracking-tighter text-[#F0F0F5] uppercase">
                Phim bộ tuyển chọn
              </h2>
            </div>
            <div 
              onClick={() => onNavigate('phim-bo')}
              className="text-[#E63946] text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100 cursor-pointer transition-colors"
            >
              Xem tất cả &rarr;
            </div>
          </div>

          {isLoading ? renderSkeletonRow() : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {phimBo.map((item) => (
                <MovieCard 
                  key={item.slug}
                  movie={item}
                  onClick={() => onNavigateToMoveDetail(item.slug)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ROW 4: Anime Hoạt Hình */}
        <section id="homepage-anime-row" className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[var(--color-brand)] rounded-full shadow-[0_0_12px_rgba(230,57,70,0.5)]"></div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold md:font-black tracking-tighter text-[#F0F0F5] uppercase">
                Phim hoạt hình &amp; Anime
              </h2>
            </div>
            <div 
              onClick={() => onNavigate('the-loai/hoat-hinh')}
              className="text-[#E63946] text-xs font-bold uppercase tracking-widest opacity-80 hover:opacity-100 cursor-pointer transition-colors"
            >
              Xem tất cả &rarr;
            </div>
          </div>

          {isLoading ? renderSkeletonRow() : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {phimAnime.map((item) => (
                <MovieCard 
                  key={item.slug}
                  movie={item}
                  variant="poster"
                  onClick={() => onNavigateToMoveDetail(item.slug)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── TMDB NEW SECTIONS START ── */}

        {/* SECTION 1: 🎬 Movie Thám Tử Lừng Danh Conan */}
        {(!isLoading || conanPhim.length > 0) && (
          <section id="homepage-tmdb-conan-row" className="flex flex-col gap-6 bg-zinc-950/40 p-4 sm:p-6 rounded-2xl border border-zinc-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#E63946] rounded-full shadow-[0_0_12px_rgba(230,57,70,0.5)]"></div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold md:font-black tracking-tighter text-[#F0F0F5] uppercase flex items-center gap-2">
                  <Award size={22} className="text-[#E63946]" /> Thám Tử Lừng Danh Conan
                </h2>
              </div>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest font-mono">
                {conanPhim.length} PHIM KHẢ DỤNG
              </span>
            </div>

            {isLoading ? renderSkeletonRow() : (
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
                {conanPhim.map((item) => (
                  <div key={item.slug} className="w-[140px] sm:w-[170px] md:w-[190px] flex-shrink-0 snap-start">
                    <MovieCard 
                      movie={item}
                      onClick={() => onNavigateToMoveDetail(item.slug)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 2: 🤖 Movie Doraemon */}
        {(!isLoading || doraemonPhim.length > 0) && (
          <section id="homepage-tmdb-doraemon-row" className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#00B4D8] rounded-full shadow-[0_0_12px_rgba(0,180,216,0.5)]"></div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold md:font-black tracking-tighter text-[#F0F0F5] uppercase flex items-center gap-2">
                  <Globe size={20} className="text-[#00B4D8]" /> Movie Doraemon
                </h2>
              </div>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest font-mono">
                {doraemonPhim.length} PHIM
              </span>
            </div>

            {isLoading ? renderSkeletonRow() : (
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
                {doraemonPhim.map((item) => (
                  <div key={item.slug} className="w-[140px] sm:w-[170px] md:w-[190px] flex-shrink-0 snap-start">
                    <MovieCard 
                      movie={item}
                      onClick={() => onNavigateToMoveDetail(item.slug)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 3: 🎌 Hoạt Hình Hay Nhất */}
        {(!isLoading || animePhim.length > 0) && (
          <section id="homepage-tmdb-anime-row" className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#FFB703] rounded-full shadow-[0_0_12px_rgba(255,183,3,0.5)]"></div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold md:font-black tracking-tighter text-[#F0F0F5] uppercase flex items-center gap-2">
                  <Sparkles size={20} className="text-[#FFB703]" /> Hoạt Hình Hay Nhất
                </h2>
              </div>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest font-mono">
                100 PHIM
              </span>
            </div>

            {isLoading ? renderSkeletonRow() : (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                  {animePhim.slice(0, animeLimit).map((item) => (
                    <MovieCard 
                      key={item.slug}
                      movie={item}
                      onClick={() => onNavigateToMoveDetail(item.slug)}
                    />
                  ))}
                </div>
                
                {animeLimit < animePhim.length && (
                  <div className="flex justify-center mt-2">
                    <button
                      onClick={() => setAnimeLimit(prev => prev + 12)}
                      className="px-8 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-extrabold text-xs uppercase tracking-widest transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                    >
                      Xem thêm phim hoạt hình &darr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* SECTION 4: 🔥 Đang Thịnh Hành */}
        {(!isLoading || trendingPhim.length > 0) && (
          <section id="homepage-tmdb-trending-row" className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#F15BB5] rounded-full shadow-[0_0_12px_rgba(241,91,181,0.5)]"></div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold md:font-black tracking-tighter text-[#F0F0F5] uppercase flex items-center gap-2">
                  <TrendingUp size={20} className="text-[#F15BB5]" /> Đang Thịnh Hành
                </h2>
              </div>
            </div>

            {isLoading ? renderSkeletonRow() : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {trendingPhim.slice(0, 12).map((item) => (
                  <MovieCard 
                    key={item.slug}
                    movie={item}
                    onClick={() => onNavigateToMoveDetail(item.slug)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 5: 🎥 Đang Chiếu Rạp */}
        {(!isLoading || nowPlayingPhim.length > 0) && (
          <section id="homepage-tmdb-nowplaying-row" className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#3A86C8] rounded-full shadow-[0_0_12px_rgba(58,134,200,0.5)]"></div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold md:font-black tracking-tighter text-[#F0F0F5] uppercase flex items-center gap-2">
                  <Clapperboard size={20} className="text-[#3A86C8]" /> Đang Chiếu Rạp
                </h2>
              </div>
            </div>

            {isLoading ? renderSkeletonRow() : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {nowPlayingPhim.slice(0, 12).map((item) => (
                  <MovieCard 
                    key={item.slug}
                    movie={item}
                    onClick={() => onNavigateToMoveDetail(item.slug)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 6: 📅 Sắp Ra Mắt */}
        {(!isLoading || upcomingPhim.length > 0) && (
          <section id="homepage-tmdb-upcoming-row" className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#9B5DE5] rounded-full shadow-[0_0_12px_rgba(155,93,229,0.5)]"></div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold md:font-black tracking-tighter text-[#F0F0F5] uppercase flex items-center gap-2">
                  <Calendar size={20} className="text-[#9B5DE5]" /> Phim Sắp Ra Mắt
                </h2>
              </div>
            </div>

            {isLoading ? renderSkeletonRow() : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {upcomingPhim.slice(0, 12).map((item) => (
                  <MovieCard 
                    key={item.slug}
                    movie={item}
                    onClick={() => onNavigateToMoveDetail(item.slug)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

      </div>

      {playingConanEp && (
        <div className="fixed inset-0 z-[99999] bg-black sm:bg-black/95 sm:backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 md:p-6 select-none animate-fade-in">
          <div className="w-full h-full sm:h-auto sm:max-w-[95vw] lg:max-w-7xl lg:h-[88vh] bg-zinc-950 sm:border border-zinc-900 rounded-none sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(230,57,70,0.25)] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-2.5 py-1 bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 text-[10px] font-black uppercase rounded-full tracking-widest animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]"></span> PHÁT SÓNG
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-tight text-white line-clamp-1 flex items-center gap-2">
                    THÁM TỬ LỪNG DANH CONAN <span className="text-[#E63946] font-mono">&mdash; {playingConanEp.name}</span>
                  </h3>
                  <p className="text-[10px] sm:text-xs text-zinc-500 font-mono mt-0.5">Server truyền phát chính thức • Tốc độ cao</p>
                </div>
              </div>
              <button
                onClick={() => setPlayingConanEp(null)}
                className="p-2 sm:p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-[#E63946] hover:border-[#E63946] transition-all duration-300 shadow-md cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
 
            {/* Main Body Grid */}
            <div className="flex-1 lg:grid lg:grid-cols-12 flex flex-col overflow-hidden min-h-0 bg-zinc-950">
              
              {/* Left Area - Video Player */}
              <div className="lg:col-span-9 flex flex-col justify-between bg-black relative p-2.5 sm:p-5 md:p-6 border-b lg:border-b-0 lg:border-r border-zinc-900 overflow-y-auto min-h-0">
                <div className="w-full bg-black rounded-xl overflow-hidden border border-zinc-900 relative group shadow-2xl">
                  <VideoPlayer
                    key={`conan-player-${playingConanEp.name}`}
                    embedUrl={playingConanEp.embed || undefined}
                    m3u8Url={playingConanEp.m3u8 || undefined}
                    title={`Thám Tử Lừng Danh Conan - ${playingConanEp.name}`}
                    fullWidth
                  />
                </div>
 
                {/* Navigation Controller */}
                <div className="flex items-center justify-between mt-4 sm:mt-5 bg-zinc-900/40 p-2 rounded-xl border border-zinc-900">
                  <button
                    disabled={activePlayIdx === 0}
                    onClick={() => {
                      if (activePlayIdx > 0) {
                        const prevEp = conanEpisodes[activePlayIdx - 1];
                        setPlayingConanEp(prevEp);
                        setActivePlayIdx(activePlayIdx - 1);
                      }
                    }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 disabled:text-zinc-600 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer"
                  >
                    &larr; Tập Trước
                  </button>
                  <span className="text-[10px] sm:text-xs text-zinc-400 font-mono font-bold">
                    Tập <strong className="text-[#E63946]">{activePlayIdx + 1}</strong> / {conanEpisodes.length}
                  </span>
                  <button
                    disabled={activePlayIdx === conanEpisodes.length - 1}
                    onClick={() => {
                      if (activePlayIdx < conanEpisodes.length - 1) {
                        const nextEp = conanEpisodes[activePlayIdx + 1];
                        setPlayingConanEp(nextEp);
                        setActivePlayIdx(activePlayIdx + 1);
                      }
                    }}
                    className="px-4 py-2 bg-[#E63946] hover:bg-[#d62839] disabled:opacity-30 disabled:hover:bg-[#E63946] text-white border border-transparent rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer"
                  >
                    Tập Kế &rarr;
                  </button>
                </div>
 
                {/* Dynamic Instruction Footer */}
                <div className="mt-4 text-[11px] text-zinc-500 font-sans leading-relaxed bg-zinc-900/10 p-3 rounded-lg border border-zinc-900/40">
                  💡 <strong className="text-zinc-400">Mẹo xem phim:</strong> Nếu phim tải chậm hoặc lỗi, vui lòng nhấn tải lại trang. Chế độ phóng to toàn màn hình được hỗ trợ hoàn toàn qua các nút bấm mở rộng bên trong khung phát.
                </div>
              </div>
 
              {/* Right Area - Episode List Sidebar */}
              <div className="lg:col-span-3 flex flex-col bg-zinc-950 flex-1 overflow-hidden h-[35vh] lg:h-full">
                <div className="p-4 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                    <Tv size={14} className="text-[#E63946]" /> Danh sách tập Conan
                  </p>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Tìm tập nhanh..."
                      value={conanSearch}
                      onChange={(e) => setConanSearch(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E63946] transition-all"
                    />
                  </div>

                  {/* Horizontal Scrollable Group Tabs */}
                  {conanSearch.trim() === '' && conanEpisodes.length > GROUP_SIZE && (
                    <div className="flex gap-1 overflow-x-auto pb-1.5 pt-0.5 custom-scrollbar-horizontal scroll-smooth">
                      {Array.from({ length: Math.ceil(conanEpisodes.length / GROUP_SIZE) }).map((_, gIdx) => {
                        const startEp = gIdx * GROUP_SIZE + 1;
                        const endEp = Math.min((gIdx + 1) * GROUP_SIZE, conanEpisodes.length);
                        const isCurrentGroup = selectedGroupIdx === gIdx;
                        return (
                          <button
                            key={`group-tab-${gIdx}`}
                            onClick={() => setSelectedGroupIdx(gIdx)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                              isCurrentGroup 
                                ? 'bg-[#E63946] text-white font-black shadow-md' 
                                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                          >
                            Tập {startEp}-{endEp}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Scrollable grid list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar min-h-0 bg-zinc-950">
                  {(conanSearch.trim() !== '' ? filteredConanEpisodes : conanEpisodes.slice(selectedGroupIdx * GROUP_SIZE, (selectedGroupIdx + 1) * GROUP_SIZE)).map((ep, idx) => {
                    const originalIdx = conanEpisodes.findIndex(e => e.name === ep.name);
                    const isCurrent = ep.name === playingConanEp.name;
                    return (
                      <button
                        key={`${ep.name}-sidebar-${idx}`}
                        onClick={() => {
                          setPlayingConanEp(ep);
                          setActivePlayIdx(originalIdx !== -1 ? originalIdx : 0);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-xs transition-all duration-300 border cursor-pointer ${
                          isCurrent
                            ? 'bg-[#E63946] text-white font-black border-[#E63946] shadow-md hover:scale-[1.02]'
                            : 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate pr-2 font-mono flex items-center gap-2">
                          <Play size={10} className={isCurrent ? 'text-white' : 'text-[#E63946]'} />
                          {ep.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[8px] font-black tracking-widest bg-black/40 px-2 py-0.5 rounded-full uppercase text-white animate-pulse">
                            Đang phát
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

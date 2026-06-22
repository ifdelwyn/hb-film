import { useState, useEffect } from 'react';
import { fetchPhimMoi, fetchMovieList } from '../lib/api/vsmov';
import { Movie, MovieListItem } from '../types/movie';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import { Flame, Film, Tv, Heart, Compass, Sparkles, RefreshCw } from 'lucide-react';

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
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch Phim Mới Cập Nhật
      const resPhimMoi = await fetchPhimMoi(1, 15);
      setPhimMoi(resPhimMoi.items || []);

      // 2. Fetch Detailed entries for the Hero Banner Carousel (5 specific spotlight movies)
      const spotlightSlugs = [
        'tap-yeu-don-dau',
        'hoang-phi-hong-bi-an-mot-huyen-thoai',
        'tuyet-trung-huyet-dao-hanh',
        'ma-thoi-den-nam-hai-quy-hu',
        'tan-phong-than-nhi-lang-than'
      ];
      
      const featuredPromises = spotlightSlugs.map(async (slug) => {
        try {
          const detailRes = await fetch(`/api/phim/${slug}`);
          if (detailRes.ok) {
            const parsed = await detailRes.json();
            if (parsed.status) return parsed.movie as Movie;
          }
        } catch (e) {
          console.error('Failed to resolve hero detail for', slug, e);
        }
        return null;
      });

      const resolvedHeroes = await Promise.all(featuredPromises);
      const activeHeroes = resolvedHeroes.filter((h): h is Movie => h !== null);
      setHeroPhim(activeHeroes);

      // 3. Fetch Phim Bộ
      const resPhimBo = await fetchMovieList({ type: 'series', limit: 12 });
      setPhimBo(resPhimBo.items || []);

      // 4. Fetch Phim Lẻ
      const resPhimLe = await fetchMovieList({ type: 'single', limit: 12 });
      setPhimLe(resPhimLe.items || []);

      // 5. Fetch Animated genre movies (tag: hoat-hinh)
      const resPhimAnime = await fetchMovieList({ category: 'hoat-hinh', limit: 12 });
      setPhimAnime(resPhimAnime.items || []);

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

  const renderSkeletonRow = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="aspect-[2/3] w-full rounded-xl bg-[var(--color-bg-elevated)] skeleton-shimmer" />
      ))}
    </div>
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
              {phimMoi.slice(0, 12).map(item => (
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
              {phimLe.map(item => (
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
              {phimBo.map(item => (
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
              {phimAnime.map(item => (
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

      </div>
    </div>
  );
}

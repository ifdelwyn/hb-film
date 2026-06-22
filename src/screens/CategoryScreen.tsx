import { useState, useEffect } from 'react';
import { fetchMovieList } from '../lib/api/vsmov';
import { MovieListItem } from '../types/movie';
import MovieCard from '../components/MovieCard';
import { Compass, Sparkles, Filter, Grid, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_COUNTRIES } from '../data/mockMovies';

interface CategoryScreenProps {
  type: 'the-loai' | 'quoc-gia' | 'nam' | 'phim-le' | 'phim-bo' | 'phim-moi';
  slug: string;
  onNavigateToMoveDetail: (slug: string) => void;
}

export default function CategoryScreen({ type, slug, onNavigateToMoveDetail }: CategoryScreenProps) {
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [sortField, setSortField] = useState<'modified_time' | 'year'>('modified_time');

  // Resolve user readable title
  const resolveTitle = () => {
    if (type === 'the-loai') {
      const match = MOCK_CATEGORIES.find(c => c.slug === slug);
      return match ? `Thể Loại: ${match.name}` : `Thể Loại: ${slug}`;
    }
    if (type === 'quoc-gia') {
      const match = MOCK_COUNTRIES.find(c => c.slug === slug);
      return match ? `Quốc Gia: ${match.name}` : `Quốc Gia: ${slug}`;
    }
    if (type === 'nam') {
      return `Phim Công Chiếu Năm: ${slug}`;
    }
    if (type === 'phim-le') {
      return 'Phim Lẻ Bản Đẹp / Phân Giải Cao';
    }
    if (type === 'phim-bo') {
      return 'Phim Bộ Tâm Lý & Truyền Hình';
    }
    if (type === 'phim-moi') {
      return 'Phim Mới Phát Hành / Vừa Cập Nhật';
    }
    return 'Duyệt Kho Phim';
  };

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      let params: any = { limit: 24, sort_field: sortField };
      
      if (type === 'the-loai') {
        params.category = slug;
      } else if (type === 'quoc-gia') {
        params.country = slug;
      } else if (type === 'nam') {
        params.year = slug;
      } else if (type === 'phim-le') {
        params.type = 'single';
      } else if (type === 'phim-bo') {
        params.type = 'series';
      }

      const res = await fetchMovieList(params);
      setMovies(res.items || []);
      if ((res.items || []).length === 0) {
        setErrorMsg('Tạm chưa có thước phim nào thuộc mục này.');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Không thể đồng bộ dữ liệu. Đang tải kho phim dự phòng...');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [type, slug, sortField]);

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg-base)] text-white pt-24 pb-20 select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Category banner header display */}
        <div className="relative rounded-2xl bg-gradient-to-r from-red-800/10 via-[var(--color-bg-elevated)] to-teal-800/10 border border-zinc-900 overflow-hidden mb-10 p-6 sm:p-10 select-none shadow-2xl flex items-center">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[var(--color-brand)]/5 rounded-full filter blur-2xl" />
          
          <div className="relative z-10 max-w-xl">
            <span className="text-[10px] text-[var(--color-brand)] font-black tracking-widest uppercase mb-1 block">
              ⭐ CHUYÊN TRANG DUYỆT PHIM
            </span>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[var(--color-brand)] rounded-full animate-pulse flex-shrink-0"></div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                {resolveTitle()}
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mt-2.5 font-medium ml-4">
              Sàng lọc từ băng thông rộng của VSMOV dồi dào, cập nhật theo giờ, trạm phát ổn định, phụ đề tùy chỉnh.
            </p>
          </div>
        </div>

        {/* Sort controls top bar widget sticky */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 mb-8">
          <div className="flex items-center gap-2 text-zinc-400 font-semibold text-xs">
            <Filter size={14} className="text-[var(--color-brand)]" />
            <span>Sắp xếp công chiếu:</span>
            <button
              onClick={() => setSortField('modified_time')}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${sortField === 'modified_time' ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)]' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
            >
              Cập nhật mới
            </button>
            <button
              onClick={() => setSortField('year')}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${sortField === 'year' ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)]' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
            >
              Năm phát hành
            </button>
          </div>

          <div className="text-xs text-zinc-500 font-medium">
            <span>Tìm thấy: <strong className="text-white font-black">{movies.length}</strong> thước phim đặc sắc</span>
          </div>
        </div>

        {/* Display Grid Stage */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="aspect-[2/3] w-full rounded-xl bg-zinc-900 skeleton-shimmer" />
            ))}
          </div>
        ) : errorMsg && movies.length === 0 ? (
          <div className="flex flex-col items-center justify-centery bg-zinc-950 rounded-xl border border-zinc-900/50 p-16 text-center select-none py-28 gap-4">
            <SlidersHorizontal size={36} className="text-zinc-600 animate-pulse" />
            <div>
              <h3 className="text-base font-bold text-zinc-400">{errorMsg}</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">Vui lòng quay lại trang chủ hoặc đổi điều kiện sắp xếp phía bên trên.</p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold px-4 py-2 border border-zinc-800 hover:border-zinc-700 rounded-lg cursor-pointer"
            >
              <RefreshCw size={12} /> Tải lại dữ liệu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {movies.map(item => (
              <MovieCard
                key={item.slug}
                movie={item}
                onClick={() => onNavigateToMoveDetail(item.slug)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

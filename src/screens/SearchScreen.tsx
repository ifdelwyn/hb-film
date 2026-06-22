import { useState, useEffect } from 'react';
import { searchMovies, fetchGenres, fetchCountries } from '../lib/api/vsmov';
import { MovieListItem, Category, Country } from '../types/movie';
import MovieCard from '../components/MovieCard';
import { Search, Sliders, X, Sparkles, Mic, HelpCircle, Film } from 'lucide-react';
import { MOCK_MOVIES } from '../data/mockMovies';

interface SearchScreenProps {
  onNavigateToMoveDetail: (slug: string) => void;
}

export default function SearchScreen({ onNavigateToMoveDetail }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [statusText, setStatusText] = useState('');
  const [results, setResults] = useState<MovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Filters state
  const [genres, setGenres] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Voice Search helper
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Load filter options
    const loadFiltersData = async () => {
      try {
        const gRes = await fetchGenres();
        const cRes = await fetchCountries();
        setGenres(gRes || []);
        setCountries(cRes || []);
      } catch (e) {
        console.error('Failed to load filter items:', e);
      }
    };
    loadFiltersData();
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setStatusText('Đang truy quét kết quả điện ảnh...');
    try {
      const res = await searchMovies(val);
      let items = res.items || [];

      // Apply client-side criteria overlays if active
      if (selectedGenre) {
        items = items.filter(item => {
          // If fallback contains categories or details, search
          const foundMock = MOCK_MOVIES.find(m => m.movie.slug === item.slug);
          return foundMock?.movie.category.some(c => c.slug === selectedGenre);
        });
      }
      if (selectedCountry) {
        items = items.filter(item => {
          const foundMock = MOCK_MOVIES.find(m => m.movie.slug === item.slug);
          return foundMock?.movie.country.some(c => c.slug === selectedCountry);
        });
      }
      if (selectedYear) {
        items = items.filter(item => item.year.toString() === selectedYear);
      }
      if (selectedType) {
        items = items.filter(item => item.type === selectedType);
      }
      if (selectedQuality) {
        items = items.filter(item => item.quality.toLowerCase() === selectedQuality.toLowerCase());
      }
      if (selectedStatus) {
        items = items.filter(item => {
          const foundMock = MOCK_MOVIES.find(m => m.movie.slug === item.slug);
          return foundMock?.movie.status === selectedStatus;
        });
      }

      setResults(items);
      if (items.length === 0) {
        setStatusText('Không tìm thấy thước phim trùng khớp. Hãy điều chỉnh bộ lọc.');
      }
    } catch (e) {
      console.error(e);
      setStatusText('Kênh kết nối tạm bận. Đang tìm kho phim nội bộ...');
      // Fallback search mock list
      const queryLower = val.toLowerCase().trim();
      const mockResult = MOCK_MOVIES.filter(m => (
        m.movie.name.toLowerCase().includes(queryLower) ||
        m.movie.origin_name.toLowerCase().includes(queryLower)
      )).map(m => ({
        name: m.movie.name,
        slug: m.movie.slug,
        origin_name: m.movie.origin_name,
        thumb_url: m.movie.thumb_url,
        poster_url: m.movie.poster_url,
        year: m.movie.year,
        type: m.movie.type,
        episode_current: m.movie.episode_current,
        quality: m.movie.quality,
        lang: m.movie.lang
      }));
      setResults(mockResult);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced typing handler
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query) {
        handleSearch(query);
      }
    }, 450);
    return () => clearTimeout(delayDebounce);
  }, [query, selectedGenre, selectedCountry, selectedYear, selectedType, selectedQuality, selectedStatus]);

  // Voice recognition helper
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ công cụ nhận diện giọng nói Web Speech API.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onspeechend = () => {
      setIsRecording(false);
      recognition.stop();
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  // Quick reset all filter parameters
  const clearAllFilters = () => {
    setSelectedGenre('');
    setSelectedCountry('');
    setSelectedYear('');
    setSelectedType('');
    setSelectedQuality('');
    setSelectedStatus('');
    setQuery('');
    setResults([]);
  };

  // Display default recommendations when empty query
  const trendingList: MovieListItem[] = MOCK_MOVIES.map(v => ({
    name: v.movie.name,
    slug: v.movie.slug,
    origin_name: v.movie.origin_name,
    thumb_url: v.movie.thumb_url,
    poster_url: v.movie.poster_url,
    year: v.movie.year,
    type: v.movie.type,
    episode_current: v.movie.episode_current,
    quality: v.movie.quality,
    lang: v.movie.lang
  }));

  const activeFiltersCount = [
    selectedGenre, selectedCountry, selectedYear, selectedType, selectedQuality, selectedStatus
  ].filter(Boolean).length;

  return (
    <div className="w-full min-h-screen bg-[var(--color-bg-base)] text-white pt-24 pb-20 select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header section tagline */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] text-[var(--color-brand)] font-bold tracking-widest uppercase mb-1 block">
              💡 CÔNG CỤ TRUY QUYẾT TOÀN DIỆN
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Search size={24} className="text-[var(--color-brand)]" /> TRUY TRÌM THƯỚC PHIM
            </h1>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-lg border transition-all cursor-pointer ${
              showFilters 
                ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-[0_0_12px_var(--color-brand-glow)]' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            <Sliders size={14} />
            Bộ Lọc Nâng Cao {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>

        {/* 2A. CINEMATIC SEARCH BAR */}
        <div id="search-input-command-palette" className="relative w-full max-w-3xl mx-auto mb-10">
          <input
            type="text"
            className="w-full h-14 pl-12 pr-28 rounded-xl bg-[var(--color-bg-elevated)] border border-zinc-800 focus:border-[var(--color-brand)] outline-none text-sm transition-all focus:ring-4 focus:ring-red-600/10 placeholder-zinc-500 font-medium"
            placeholder="Nhập tên phim, diễn viên, đạo diễn hoặc thương hiệu điện ảnh..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="p-1.5 text-zinc-400 hover:text-white rounded-md bg-zinc-850 hover:bg-zinc-800 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
            <button
              onClick={startVoiceSearch}
              className={`p-1.5 rounded-md cursor-pointer transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'text-zinc-400 hover:text-white bg-zinc-800'
              }`}
              title="Tìm kiếm bằng giọng nói"
            >
              <Mic size={14} />
            </button>
          </div>
        </div>

        {/* Filters and stage layout combined */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Collapsible Filters Left section */}
          {showFilters && (
            <aside className="lg:col-span-1 bg-[var(--color-bg-elevated)] border border-zinc-900 p-5 rounded-2xl flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders size={12} /> Lọc kết quả
                </h3>
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-[10px] text-[var(--color-brand)] font-bold hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* 1. Format Single vs Series */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Định dạng</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-[var(--color-brand)] cursor-pointer"
                >
                  <option value="">Tất cả các loại</option>
                  <option value="single">Phim Lẻ (Single Movie)</option>
                  <option value="series">Phim Bộ (Series TV)</option>
                </select>
              </div>

              {/* 2. Genre */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Thể loại</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-[var(--color-brand)] cursor-pointer"
                >
                  <option value="">Tất cả thể loại</option>
                  {genres.map(g => (
                    <option key={g.slug} value={g.slug}>{g.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Country */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Quốc gia</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-[var(--color-brand)] cursor-pointer"
                >
                  <option value="">Tất cả quốc gia</option>
                  {countries.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 4. Release Year quick options */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Năm phát hành</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-[var(--color-brand)] cursor-pointer"
                >
                  <option value="">Tất cả các năm</option>
                  {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2016'].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* 5. Resolution Quality */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Độ phân giải</label>
                <select
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-[var(--color-brand)] cursor-pointer"
                >
                  <option value="">Mọi chất lượng</option>
                  <option value="FHD">Full HD (1080p)</option>
                  <option value="HD">HD (720p)</option>
                </select>
              </div>

              {/* 6. Release status */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Trạng thái phát hành</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-[var(--color-brand)] cursor-pointer"
                >
                  <option value="">Bất kỳ</option>
                  <option value="completed">Hoàn Tất</option>
                  <option value="ongoing">Đang Chiếu</option>
                </select>
              </div>

            </aside>
          )}

          {/* Results Block Column */}
          <main className={`flex flex-col gap-6 ${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            
            {/* Stage Title */}
            <div>
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Sparkles size={14} className="text-[var(--color-brand)]" />
                {query ? `Kết quả tìm kiếm cho: "${query}"` : 'Đề xuất danh giá cho bạn'}
              </h2>
            </div>

            {/* Results Grid display */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div key={idx} className="aspect-[2/3] w-full rounded-xl bg-zinc-900 skeleton-shimmer" />
                ))}
              </div>
            ) : query && results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {results.map(item => (
                  <MovieCard
                    key={item.slug}
                    movie={item}
                    onClick={() => onNavigateToMoveDetail(item.slug)}
                  />
                ))}
              </div>
            ) : query && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center select-none gap-4">
                <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-600">
                  <HelpCircle size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-300">Không tìm thấy tiêu điểm trùng khớp</h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm">Hãy kiểm tra từ khóa hoặc reset bớt điều kiện lọc bên thanh công cụ.</p>
                </div>
              </div>
            ) : (
              /* DEFAULT VIEW: Trending Recommendations list */
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {trendingList.map(item => (
                    <MovieCard
                      key={item.slug}
                      movie={item}
                      onClick={() => onNavigateToMoveDetail(item.slug)}
                    />
                  ))}
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}

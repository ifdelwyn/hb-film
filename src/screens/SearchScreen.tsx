import { useState, useEffect } from 'react';
import { searchMovies, fetchGenres, fetchCountries, fetchMovieList } from '../lib/api/vsmov';
import { MovieListItem, Category, Country } from '../types/movie';
import MovieCard from '../components/MovieCard';
import { MOCK_MOVIES } from '../data/mockMovies';
import { 
  Search, Sliders, X, Sparkles, Mic, HelpCircle, Film, Check, Trash2, 
  Tv, Compass, Flame, Filter, ChevronDown, RefreshCw, Award, Play,
  Grid, Globe, Calendar, Zap, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchScreenProps {
  onNavigateToMoveDetail: (slug: string) => void;
}

const TRENDING_KEYWORDS = [
  { text: 'Dune: Cát', query: 'Dune' },
  { text: 'Kimetsu no Yaiba', query: 'Yaiba' },
  { text: 'Conan', query: 'Conan' },
  { text: 'Luffy One Piece', query: 'One Piece' },
  { text: 'Cổ Trang Trung Hoa', query: 'Cổ Trang' },
  { text: 'Hoạt hình Ghibli', query: 'Hoạt hình' }
];

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
        const [gRes, cRes] = await Promise.all([fetchGenres(), fetchCountries()]);
        setGenres(gRes || []);
        setCountries(cRes || []);
      } catch (e) {
        console.error('Failed to load filter items:', e);
      }
    };
    loadFiltersData();
  }, []);

  const handleSearchFn = async (currentQuery: string) => {
    setIsLoading(true);
    setStatusText('Đang lục tìm toàn bộ kho phim vsmov...');
    try {
      let items: MovieListItem[] = [];
      
      if (currentQuery.trim()) {
        // Query exists - load from search endpoint
        const res = await searchMovies(currentQuery.trim());
        items = res.items || [];
      } else {
        // Empty query - Browse by current filters combination
        const res = await fetchMovieList({
          category: selectedGenre,
          country: selectedCountry,
          year: selectedYear,
          type: selectedType,
          page: 1,
          limit: 36
        });
        items = res.items || [];
      }

      // Filter local / proxy items with absolute normalization triggers
      if (selectedGenre && currentQuery.trim()) {
        items = items.filter(item => {
          const foundMock = MOCK_MOVIES.find(m => m.movie.slug === item.slug);
          return foundMock?.movie.category.some(c => c.slug === selectedGenre) || item.slug.includes(selectedGenre);
        });
      }
      if (selectedCountry && currentQuery.trim()) {
        items = items.filter(item => {
          const foundMock = MOCK_MOVIES.find(m => m.movie.slug === item.slug);
          return foundMock?.movie.country.some(c => c.slug === selectedCountry) || item.slug.includes(selectedCountry);
        });
      }
      if (selectedYear) {
        items = items.filter(item => item.year?.toString() === selectedYear);
      }
      if (selectedType) {
        items = items.filter(item => item.type === selectedType);
      }
      if (selectedQuality) {
        items = items.filter(item => item.quality?.toLowerCase() === selectedQuality.toLowerCase());
      }
      if (selectedStatus) {
        items = items.filter(item => {
          const foundMock = MOCK_MOVIES.find(m => m.movie.slug === item.slug);
          return foundMock?.movie.status === selectedStatus;
        });
      }

      // Normalize all poster urls directly client-side for additional reliability
      const baseImg = "https://vsmov.com/uploads/movies/";
      const normalized = items.map((item: any) => {
        let thumb = item.thumb_url || item.thumb || "";
        let poster = item.poster_url || item.poster || "";
        
        if (thumb && !thumb.startsWith("http") && !thumb.startsWith("//")) {
          if (thumb.startsWith('storage') || thumb.startsWith('/storage') || thumb.startsWith('uploads') || thumb.startsWith('/uploads')) {
            item.thumb_url = `https://vsmov.com${thumb.startsWith('/') ? '' : '/'}${thumb}`;
          } else {
            item.thumb_url = `${baseImg}${thumb}`;
          }
        }
        if (poster && !poster.startsWith("http") && !poster.startsWith("//")) {
          if (poster.startsWith('storage') || poster.startsWith('/storage') || poster.startsWith('uploads') || poster.startsWith('/uploads')) {
            item.poster_url = `https://vsmov.com${poster.startsWith('/') ? '' : '/'}${poster}`;
          } else {
            item.poster_url = `${baseImg}${poster}`;
          }
        }
        if (!item.thumb_url && item.poster_url) item.thumb_url = item.poster_url;
        if (!item.poster_url && item.thumb_url) item.poster_url = item.thumb_url;
        return item;
      });

      setResults(normalized);
      if (normalized.length === 0) {
        setStatusText('Không tìm thấy kết quả phù hợp. Hãy thay đổi từ khoá hoặc bộ lọc.');
      }
    } catch (e) {
      console.error('Error fetching search results:', e);
      setStatusText('Có lỗi xảy ra, đang mở kết nối kho dữ liệu dự phòng...');
      
      // Fallback Search Engine local mock matching 
      const queryLower = currentQuery.toLowerCase().trim();
      let matched = MOCK_MOVIES;
      
      if (queryLower) {
        matched = matched.filter(m => (
          m.movie.name.toLowerCase().includes(queryLower) ||
          m.movie.origin_name.toLowerCase().includes(queryLower) ||
          m.movie.content.toLowerCase().includes(queryLower) ||
          m.movie.actor.some(a => a.toLowerCase().includes(queryLower)) ||
          m.movie.director.some(d => d.toLowerCase().includes(queryLower))
        ));
      }
      if (selectedGenre) {
        matched = matched.filter(v => v.movie.category.some(c => c.slug === selectedGenre));
      }
      if (selectedCountry) {
        matched = matched.filter(v => v.movie.country.some(c => c.slug === selectedCountry));
      }
      if (selectedYear) {
        matched = matched.filter(v => v.movie.year.toString() === selectedYear);
      }
      if (selectedType) {
        matched = matched.filter(v => v.movie.type === selectedType);
      }

      const mockResult = matched.map(m => ({
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

  // Debounced input fetcher hook
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearchFn(query);
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [query, selectedGenre, selectedCountry, selectedYear, selectedType, selectedQuality, selectedStatus]);

  // Voice recognition triggers
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói Web Speech API.');
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
      handleSearchFn(transcript);
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition error:', err);
      setIsRecording(false);
    };

    recognition.start();
  };

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

  const handleTrendingKeywordClick = (k: string) => {
    setQuery(k);
    handleSearchFn(k);
  };

  const activeFiltersCount = [
    selectedGenre, selectedCountry, selectedYear, selectedType, selectedQuality, selectedStatus
  ].filter(Boolean).length;

  return (
    <div className="w-full min-h-screen bg-[#060608] text-white pt-24 pb-24 font-sans select-none overflow-x-hidden relative">
      
      {/* Immersive background decoration blur circles */}
      <div className="absolute top-12 left-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-48 right-1/4 w-[350px] h-[350px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 1. HERO SEARCH HUB HEADER */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 py-1 px-4 rounded-full text-[11px] text-[var(--color-brand)] font-bold tracking-wider uppercase mb-4"
          >
            <Sparkles size={11} className="animate-spin text-[var(--color-brand)]" />
            Trung tâm tìm kiếm điện ảnh thông minh
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl sm:text-5xl font-black text-white tracking-tight bg-gradient-to-r from-white via-zinc-150 to-zinc-400 bg-clip-text text-transparent"
          >
            TRUY TÌM SIÊU PHẨM
          </motion.h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 max-w-lg mx-auto font-medium">
            Rà soát toàn bộ tác phẩm phim bộ, anime, drama châu Á và siêu phẩm hollywood với bộ lọc Bento cực nhạy.
          </p>
        </div>

        {/* 2. FROSTED FLOATING SEARCH CAPSULE */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative group bg-zinc-950/40 p-1.5 rounded-2xl border border-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-black/60 focus-within:border-red-650/50 transition-all focus-within:ring-4 focus-within:ring-red-500/5">
            <div className="relative flex items-center">
              <Search size={22} className="absolute left-4 text-zinc-500 group-focus-within:text-[var(--color-brand)] transition-colors" />
              <input
                type="text"
                className="w-full h-14 pl-12 pr-32 bg-transparent outline-none text-sm placeholder-zinc-550 font-medium text-white"
                placeholder="Nhập tên phim, diễn viên, đạo diễn hoặc tên anime..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              
              <div className="absolute right-2 flex items-center gap-1.5">
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-90 w-8 h-8 flex items-center justify-center transition-all cursor-pointer"
                    title="Xoá nội dung"
                  >
                    <X size={15} />
                  </button>
                )}
                
                <button
                  onClick={startVoiceSearch}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                    isRecording 
                      ? 'bg-red-550 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.45)]' 
                      : 'text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800'
                  }`}
                  title="Tìm kiếm bằng giọng nói"
                >
                  <Mic size={15} />
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-10 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    showFilters 
                      ? 'bg-red-600/10 border-red-500/30 text-[var(--color-brand)] shadow-[0_0_12px_rgba(229,9,20,0.15)]' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  <Sliders size={13} />
                  <span className="hidden sm:inline">Lọc Bento</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[var(--color-brand)] text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sound waves animation while voice searching */}
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-3 py-2 px-4 rounded-xl bg-red-950/10 border border-red-500/10 text-red-500 text-xs font-semibold max-w-sm mx-auto shadow-md"
            >
              <div className="flex gap-1 items-end h-3">
                <span className="w-0.5 bg-red-500 animate-[bounce_0.8s_infinite] h-2"></span>
                <span className="w-0.5 bg-red-500 animate-[bounce_0.8s_infinite_0.2s] h-3"></span>
                <span className="w-0.5 bg-red-500 animate-[bounce_0.8s_infinite_0.4s] h-1.5"></span>
                <span className="w-0.5 bg-red-500 animate-[bounce_0.8s_infinite_0.1s] h-3.5"></span>
              </div>
              Hệ thống đang nghe giọng nói của bạn...
            </motion.div>
          )}

          {/* Fast search trends shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs px-2">
            <span className="text-zinc-500 font-bold flex items-center gap-1 shrink-0">
              <Flame size={12} className="text-orange-500" /> Xu hướng:
            </span>
            {TRENDING_KEYWORDS.map((k, ind) => (
              <button
                key={ind}
                onClick={() => handleTrendingKeywordClick(k.query)}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 cursor-pointer text-[11px] transition-all"
              >
                {k.text}
              </button>
            ))}
          </div>
        </div>

        {/* 3. BENTO INTERACTIVE FILTERS CONSOLE */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-3xl bg-zinc-950/30 border border-zinc-900/60 backdrop-blur-md shadow-2xl relative">
                
                {/* Reset filters shortcut */}
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearAllFilters}
                    className="absolute top-4 right-4 text-[10px] text-[var(--color-brand)] font-extrabold hover:underline cursor-pointer flex items-center gap-1 bg-red-500/5 py-1 px-2.5 rounded-full border border-red-500/10 hover:brightness-110"
                  >
                    <Trash2 size={10} />
                    Đặt lại bộ lọc
                  </button>
                )}

                {/* BENTO TILE 1: GENRES MATRIX */}
                <div className="md:col-span-1 bg-[#0c0c0f] border border-zinc-900 p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-900/65">
                    <Grid size={13} className="text-[var(--color-brand)]" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Thể loại đặc thù</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1.5 custom-scrollbar-thin">
                    <button
                      onClick={() => setSelectedGenre('')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedGenre === ''
                          ? 'bg-[var(--color-brand)] text-white font-bold'
                          : 'bg-zinc-900/40 border border-zinc-850/40 text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      Tất cả thể loại
                    </button>
                    {genres.map(g => (
                      <button
                        key={g.slug}
                        onClick={() => setSelectedGenre(selectedGenre === g.slug ? '' : g.slug)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                          selectedGenre === g.slug
                            ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-white font-bold'
                            : 'border-zinc-850 bg-zinc-900/25 text-zinc-400 hover:text-white hover:bg-zinc-900/70 hover:border-zinc-700'
                        }`}
                      >
                        {selectedGenre === g.slug && <Check size={10} />}
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BENTO TILE 2: COUNTRIES & YEARS ORBIT */}
                <div className="md:col-span-1 bg-[#0c0c0f] border border-zinc-900 p-4 rounded-2xl flex flex-col gap-4">
                  
                  {/* Origin */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900/65">
                      <Globe size={13} className="text-[var(--color-brand)]" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Quốc gia - Lãnh thổ</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar-thin">
                      <button
                        onClick={() => setSelectedCountry('')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                          selectedCountry === ''
                            ? 'bg-[var(--color-brand)] text-white'
                            : 'bg-zinc-900/40 border border-zinc-850/40 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Tất cả
                      </button>
                      {countries.map(c => (
                        <button
                          key={c.slug}
                          onClick={() => setSelectedCountry(selectedCountry === c.slug ? '' : c.slug)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                            selectedCountry === c.slug
                              ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-white font-bold'
                              : 'border-zinc-850 bg-zinc-900/20 text-zinc-400 hover:text-white hover:border-zinc-750'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Release timeline years */}
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900/65">
                      <Calendar size={13} className="text-[var(--color-brand)]" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Năm sản xuất</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {['', '2026', '2025', '2024'].map(year => {
                        const isAll = year === '';
                        const displayYear = isAll ? 'Tất cả' : year;
                        return (
                          <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`py-1 rounded text-[10px] font-semibold border text-center transition-all cursor-pointer ${
                              selectedYear === year
                                ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white'
                                : 'border-zinc-850 bg-zinc-900/30 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {displayYear}
                          </button>
                        );
                      })}
                    </div>
                    <select
                      value={['', '2026', '2025', '2024'].includes(selectedYear) ? '' : selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full text-center bg-zinc-900/30 border border-zinc-900 rounded text-[10px] font-semibold text-zinc-400 outline-none p-1.5 cursor-pointer hover:border-zinc-700"
                    >
                      <option value="">Lựa chọn năm khác</option>
                      {['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* BENTO TILE 3: FORMATS, RESOLUTION & PROGRESS */}
                <div className="md:col-span-1 bg-[#0c0c0f] border border-zinc-900 p-4 rounded-2xl flex flex-col gap-4">
                  
                  {/* Formats movie vs series */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900/65">
                      <Tv size={13} className="text-[var(--color-brand)]" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Cấu trúc tác phẩm</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedType(selectedType === 'single' ? '' : 'single')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          selectedType === 'single'
                            ? 'border-[var(--color-brand)] text-white bg-[var(--color-brand)]/10 font-black'
                            : 'border-zinc-900 text-zinc-400 hover:bg-zinc-900 bg-zinc-900/20'
                        }`}
                      >
                        Phim Lẻ (Single)
                      </button>
                      <button
                        onClick={() => setSelectedType(selectedType === 'series' ? '' : 'series')}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          selectedType === 'series'
                            ? 'border-[var(--color-brand)] text-white bg-[var(--color-brand)]/10 font-black'
                            : 'border-zinc-900 text-zinc-400 hover:bg-zinc-900 bg-zinc-900/20'
                        }`}
                      >
                        Phim Bộ (Series)
                      </button>
                    </div>
                  </div>

                  {/* Resolution limits and stream status */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-900/65">
                      <Zap size={13} className="text-[var(--color-brand)]" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Độ phân giải & Trạng thái</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { val: '', label: 'Cả hai' },
                          { val: 'FHD', label: '1080p' },
                          { val: 'HD', label: '720p' }
                        ].map(q => (
                          <button
                            key={q.val}
                            onClick={() => setSelectedQuality(q.val)}
                            className={`py-1.5 rounded text-[9px] font-bold border text-center transition-all cursor-pointer ${
                              selectedQuality === q.val
                                ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-white'
                                : 'border-zinc-900 bg-zinc-900/25 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 mt-1">
                        <button
                          onClick={() => setSelectedStatus(selectedStatus === 'completed' ? '' : 'completed')}
                          className={`py-1.5 text-center rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                            selectedStatus === 'completed'
                              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5'
                              : 'border-zinc-900 text-zinc-400 hover:text-white bg-zinc-900/20'
                          }`}
                        >
                          Hoàn Tất
                        </button>
                        <button
                          onClick={() => setSelectedStatus(selectedStatus === 'ongoing' ? '' : 'ongoing')}
                          className={`py-1.5 text-center rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                            selectedStatus === 'ongoing'
                              ? 'border-amber-500/50 text-amber-400 bg-amber-500/5'
                              : 'border-zinc-900 text-zinc-400 hover:text-white bg-zinc-900/20'
                          }`}
                        >
                          Đang Chiếu
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. RESULTS LABELS AND STAT COUNTERS */}
        <div className="flex items-center justify-between border-b border-zinc-905/60 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-red-500 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-black text-zinc-400 uppercase tracking-widest">
              {query ? `Kết quả tìm tên: "${query}"` : 'Thư viện tác phẩm siêu tinh tú'}
            </h2>
          </div>
          <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 bg-zinc-900/40 py-1.5 px-3 rounded-full border border-zinc-900">
            <span>Rà soát được: <strong className="text-[var(--color-brand)]">{results.length}</strong> siêu phẩm</span>
          </div>
        </div>

        {/* 5. MAIN CINEMATIC SEARCH RESULTS DISPLAY GRID */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="aspect-[2/3] w-full rounded-2xl bg-zinc-950/40 border border-zinc-900/80 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-900/10 to-transparent animate-[shimmer_1.5s_infinite]"></div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6"
          >
            {results.map((item, idx) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              >
                <MovieCard
                  movie={item}
                  onClick={() => onNavigateToMoveDetail(item.slug)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* CINEMATIC EMPTY SPACE STATE */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 md:p-20 text-center rounded-[32px] bg-zinc-950/10 border border-zinc-900/40 gap-4 max-w-xl mx-auto mt-8"
          >
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 shadow-inner">
              <HelpCircle size={26} className="text-[var(--color-brand)]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-200">Không tìm thấy siêu phẩm trùng khớp</h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
                Răng truy tìm chưa tương thích với tổ hợp từ khóa hoặc các thông số định dạng bento. Hãy kiểm tra từ khoá, dùng giọng nói hoặc đặt lại bộ lọc.
              </p>
            </div>

            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-xs font-bold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white py-2 px-5 h-10 rounded-xl cursor-pointer hover:scale-[1.03] transition-all"
            >
              <RefreshCw size={12} />
              Bắt đầu lọc lại từ đầu
            </button>
          </motion.div>
        )}

        {/* 6. ADVANCED RECOMMENDATION ADVISOR BOARD */}
        <div className="mt-16 bg-gradient-to-r from-zinc-950/20 via-red-950/5 to-zinc-950/20 border border-zinc-900/80 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-xl bg-red-600/10 text-[var(--color-brand)] flex items-center justify-center shrink-0">
              <Award size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-205 flex items-center justify-center sm:justify-start gap-1">
                Tìm kiếm thông minh tích hợp
                <ShieldCheck size={13} className="text-emerald-500" />
              </h4>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 leading-normal max-w-md">
                Hệ thống rà quét tự động cân bằng URL hình ảnh poster, khớp nối thông số thể loại và tự động chuẩn hoá nguồn phát dự phòng 100% playable.
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleTrendingKeywordClick('Dune')}
            className="bg-zinc-900 hover:bg-zinc-850 hover:scale-105 active:scale-95 transition-all border border-zinc-800 text-zinc-300 hover:text-white px-5 h-10 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            Quét Ngẫu Nhiên
          </button>
        </div>

      </div>
    </div>
  );
}

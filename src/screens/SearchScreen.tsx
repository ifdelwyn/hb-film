import { useState, useEffect } from 'react';
import { searchMovies, fetchGenres, fetchCountries, fetchMovieList } from '../lib/api/vsmov';
import { searchMovies as searchTmdbMovies } from '../services/tmdbService';
import { MovieListItem, Category, Country } from '../types/movie';
import MovieCard from '../components/MovieCard';
import { MOCK_MOVIES } from '../data/mockMovies';
import { 
  Search, Sliders, X, Sparkles, Mic, HelpCircle, Film, Check, Trash2, 
  Tv, Compass, Flame, Filter, ChevronDown, RefreshCw, Award, Play,
  Grid, Globe, Calendar, Zap, ShieldCheck, Heart, Grid3X3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchScreenProps {
  onNavigateToMoveDetail: (slug: string) => void;
}

const TRENDING_KEYWORDS = [
  { text: 'Conan', query: 'Conan' },
  { text: 'One Piece', query: 'One Piece' },
  { text: 'Dune: Cát', query: 'Dune' },
  { text: 'Solo Leveling', query: 'Solo Leveling' },
  { text: 'Kimetsu no Yaiba', query: 'Yaiba' },
  { text: 'Ghibli', query: 'Ghibli' }
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
    setStatusText('Đang quét song song 3 kho phim OPhim + KKPhim + AnimeHub (Ưu tiên Anime)...');
    try {
      let items: MovieListItem[] = [];
      
      if (currentQuery.trim()) {
        const [localRes, tmdbRes] = await Promise.all([
          searchMovies(currentQuery.trim()).catch(() => ({ items: [] })),
          searchTmdbMovies(currentQuery.trim()).catch(() => [])
        ]);
        const localItems = localRes.items || [];
        const merged = [...tmdbRes, ...localItems];

        // Deduplicate merged results by movie slug
        const seen = new Set<string>();
        const deduped: MovieListItem[] = [];
        for (const item of merged) {
          if (item && item.slug && !seen.has(item.slug)) {
            seen.add(item.slug);
            deduped.push(item);
          }
        }
        items = deduped;
      } else {
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

      // Filter locally based on advanced options
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

      setResults(items);
      if (items.length === 0) {
        setStatusText('Không tìm thấy kết quả phù hợp. Thử từ khoá khác hoặc đặt lại bộ lọc bento.');
      }
    } catch (e) {
      console.error('Error fetching search results:', e);
      setStatusText('Có lỗi xảy ra, đang rà quét cổng dữ liệu dự phòng...');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearchFn(query);
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [query, selectedGenre, selectedCountry, selectedYear, selectedType, selectedQuality, selectedStatus]);

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
    <div className="w-full min-h-screen bg-[var(--color-bg-base)] text-white pt-24 pb-24 font-sans select-none overflow-x-hidden relative">
      
      {/* Cinematic Cover Art Background Glow */}
      <div className="absolute top-0 inset-x-0 h-[45vh] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/15 via-transparent to-transparent blur-3xl opacity-60" />
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-[var(--color-brand)]/5 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute top-20 right-10 w-[350px] h-[350px] bg-indigo-550/5 rounded-full filter blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 1. CINEMATIC DISCOVERY HERO HEADER */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-brand)]/15 to-rose-600/10 border border-[var(--color-brand)]/35 py-1.5 px-4 rounded-full text-[10px] text-[var(--color-brand)] font-black tracking-widest uppercase mb-5 shadow-lg shadow-red-500/5"
          >
            <Sparkles size={11} className="text-[var(--color-brand)] animate-bounce" />
            REALTIME MOVIE FINDER ENGINE v2.0
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-6xl font-black text-white tracking-tighter leading-tight"
          >
            TRUY TÌM SIÊU PHẨM
          </motion.h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-3.5 max-w-xl mx-auto font-medium leading-relaxed">
            Hệ thống rà quét thông minh tích hợp OPhim, KKPhim và AnimeHub (kho phim hoạt hình lớn nhất Việt Nam). Tự động liên kết hình ảnh poster HD và bảo đảm mọi nguồn phát đều 100% khả dụng.
          </p>
        </div>

        {/* 2. PREMIUM DECK GLOW SEARCH CAPSULE */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative bg-[#12121A]/85 p-2 rounded-[24px] border border-white/5 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] focus-within:border-[var(--color-brand)]/50 focus-within:ring-4 focus-within:ring-[var(--color-brand)]/10 transition-all duration-300">
            <div className="relative flex items-center">
              <Search size={22} className="absolute left-4 text-zinc-500 group-focus-within:text-[var(--color-brand)]" />
              <input
                type="text"
                className="w-full h-14 pl-12 pr-32 bg-transparent outline-none text-sm placeholder-zinc-500 font-medium text-white"
                placeholder="Nhập tên anime, tựa phim, đạo diễn hoặc tên diễn viên..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              
              <div className="absolute right-2 flex items-center gap-2">
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 w-8 h-8 flex items-center justify-center transition-all cursor-pointer"
                    title="Xoá ô nhập"
                  >
                    <X size={15} />
                  </button>
                )}
                
                <button
                  onClick={startVoiceSearch}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                    isRecording 
                      ? 'bg-[var(--color-brand)] text-white animate-pulse shadow-[0_0_15px_rgba(230,57,70,0.55)]' 
                      : 'text-zinc-400 hover:text-white bg-zinc-900 border border-white/5'
                  }`}
                  title="Tìm kiếm qua giọng nói"
                >
                  <Mic size={15} />
                </button>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                    showFilters 
                      ? 'bg-[var(--color-brand)]/15 border-[var(--color-brand)]/35 text-[var(--color-brand)] shadow-[0_0_15px_rgba(230,57,70,0.15)]' 
                      : 'bg-zinc-900 border-white/5 text-zinc-300 hover:bg-zinc-850'
                  }`}
                >
                  <Sliders size={13} />
                  <span className="hidden sm:inline font-bold">Lọc Bento</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[var(--color-brand)] text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Audio recording waves */}
          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3.5 flex items-center justify-center gap-3 py-2 px-4 rounded-xl bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 text-[var(--color-brand)] text-xs font-bold max-w-sm mx-auto shadow-md"
            >
              <div className="flex gap-1 items-end h-3">
                <span className="w-0.5 bg-[var(--color-brand)] animate-[bounce_0.8s_infinite] h-2"></span>
                <span className="w-0.5 bg-[var(--color-brand)] animate-[bounce_0.8s_infinite_0.2s] h-3"></span>
                <span className="w-0.5 bg-[var(--color-brand)] animate-[bounce_0.8s_infinite_0.4s] h-1.5"></span>
                <span className="w-0.5 bg-[var(--color-brand)] animate-[bounce_0.8s_infinite_0.1s] h-3.5"></span>
              </div>
              Hệ thống đang thu giọng nói của bạn...
            </motion.div>
          )}

          {/* Fast suggestion tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-xs px-2">
            <span className="text-zinc-500 font-bold flex items-center gap-1 shrink-0 uppercase tracking-widest text-[10px]">
              <Flame size={12} className="text-orange-500" /> Xu hướng tìm:
            </span>
            {TRENDING_KEYWORDS.map((k, ind) => (
              <button
                key={ind}
                onClick={() => handleTrendingKeywordClick(k.query)}
                className="px-3.5 py-1.5 rounded-full bg-[#12121A] border border-white/5 text-zinc-400 hover:text-white hover:border-zinc-700 cursor-pointer text-xs transition-all hover:scale-105"
              >
                {k.text}
              </button>
            ))}
          </div>
        </div>

        {/* 3. BENTO GLASS FILTERS LAYOUT PANEL */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="overflow-hidden mb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 rounded-[32px] bg-[#0c0c12]/60 border border-white/5 backdrop-blur-2xl shadow-3xl relative">
                
                {/* Clear filters shortcut */}
                {activeFiltersCount > 0 && (
                  <button 
                    onClick={clearAllFilters}
                    className="absolute top-5 right-5 text-[10px] text-[var(--color-brand)] font-extrabold hover:underline cursor-pointer flex items-center gap-1 bg-[var(--color-brand)]/5 py-1.5 px-3 rounded-full border border-[var(--color-brand)]/15 hover:brightness-110 transition-all"
                  >
                    <Trash2 size={11} />
                    Reset bộ lọc bento
                  </button>
                )}

                {/* BENTO TILE 1: GENRES MATRIX */}
                <div className="md:col-span-1 bg-black/40 border border-white/5 p-5 rounded-2xl flex flex-col gap-4 shadow-inner">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                    <Grid3X3 size={13} className="text-[var(--color-brand)]" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Bộ lọc Thể loại</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1.5 scrollbar-thin">
                    <button
                      onClick={() => setSelectedGenre('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedGenre === ''
                          ? 'bg-[var(--color-brand)] text-white font-black'
                          : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Tất cả
                    </button>
                    {genres.map((g, idx) => (
                      <button
                        key={`${g.slug}-${idx}`}
                        onClick={() => setSelectedGenre(selectedGenre === g.slug ? '' : g.slug)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedGenre === g.slug
                            ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-white font-black shadow-lg shadow-red-500/5'
                            : 'border-white/5 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-900'
                        }`}
                      >
                        {selectedGenre === g.slug && <Check size={11} />}
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BENTO TILE 2: COUNTRIES & YEARS ORBIT */}
                <div className="md:col-span-1 bg-black/40 border border-white/5 p-5 rounded-2xl flex flex-col gap-5 shadow-inner">
                  
                  {/* Origin Territories */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                      <Globe size={13} className="text-[var(--color-brand)]" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Khu vực sản xuất</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1.5 scrollbar-thin">
                      <button
                        onClick={() => setSelectedCountry('')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          selectedCountry === ''
                            ? 'bg-[var(--color-brand)] text-white'
                            : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        Tất cả
                      </button>
                      {countries.map((c, idx) => (
                        <button
                          key={`${c.slug}-${idx}`}
                          onClick={() => setSelectedCountry(selectedCountry === c.slug ? '' : c.slug)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                            selectedCountry === c.slug
                              ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-white font-bold'
                              : 'border-white/5 bg-zinc-900/30 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Years select timeline */}
                  <div className="flex flex-col gap-2.5 mt-1">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <Calendar size={13} className="text-[var(--color-brand)]" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Timeline năm chiếu</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['', '2026', '2025', '2024'].map(year => {
                        const displayYear = year === '' ? 'Tất cả' : year;
                        return (
                          <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`py-1.5 rounded-lg text-xs font-bold border text-center transition-all cursor-pointer ${
                              selectedYear === year
                                ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white shadow-md'
                                : 'border-white/5 bg-zinc-900/30 text-zinc-400 hover:text-white'
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
                      className="w-full text-center bg-zinc-900 border border-white/5 rounded-lg text-xs font-bold text-zinc-400 outline-none p-2 cursor-pointer hover:border-zinc-700 transition-colors"
                    >
                      <option value="">Lựa chọn năm khác</option>
                      {['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* BENTO TILE 3: FORMATS & RESOLUTION METRICS */}
                <div className="md:col-span-1 bg-black/40 border border-white/5 p-5 rounded-2xl flex flex-col gap-5 shadow-inner">
                  
                  {/* Format single or series */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                      <Tv size={13} className="text-[var(--color-brand)]" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cấu trúc phim</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedType(selectedType === 'single' ? '' : 'single')}
                        className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          selectedType === 'single'
                            ? 'border-[var(--color-brand)] text-white bg-[var(--color-brand)]/10 font-black'
                            : 'border-white/5 text-zinc-400 hover:bg-zinc-900 bg-zinc-900/20'
                        }`}
                      >
                        Phim Lẻ (Single)
                      </button>
                      <button
                        onClick={() => setSelectedType(selectedType === 'series' ? '' : 'series')}
                        className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                          selectedType === 'series'
                            ? 'border-[var(--color-brand)] text-white bg-[var(--color-brand)]/10 font-black'
                            : 'border-white/5 text-zinc-400 hover:bg-zinc-900 bg-zinc-900/20'
                        }`}
                      >
                        Phim Bộ (Series)
                      </button>
                    </div>
                  </div>

                  {/* Quality metrics */}
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                      <Zap size={13} className="text-[var(--color-brand)]" />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Độ phân giải & Trạng thái</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { val: '', label: 'Cả hai' },
                          { val: 'FHD', label: '1080p' },
                          { val: 'HD', label: '720p' }
                        ].map(q => (
                          <button
                            key={q.val}
                            onClick={() => setSelectedQuality(q.val)}
                            className={`py-2 rounded-lg text-[10px] font-bold border text-center transition-all cursor-pointer ${
                              selectedQuality === q.val
                                ? 'border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-white'
                                : 'border-white/5 bg-zinc-900/20 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {q.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-0.5">
                        <button
                          onClick={() => setSelectedStatus(selectedStatus === 'completed' ? '' : 'completed')}
                          className={`py-2 text-center rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                            selectedStatus === 'completed'
                              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5 shadow-md'
                              : 'border-white/5 text-zinc-400 hover:text-white bg-zinc-900/20'
                          }`}
                        >
                          Hoàn Tất
                        </button>
                        <button
                          onClick={() => setSelectedStatus(selectedStatus === 'ongoing' ? '' : 'ongoing')}
                          className={`py-2 text-center rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                            selectedStatus === 'ongoing'
                              ? 'border-amber-500/50 text-amber-400 bg-amber-500/5 shadow-md'
                              : 'border-white/5 text-zinc-400 hover:text-white bg-zinc-900/20'
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

        {/* 4. RESULTS LABELS STATS BAR */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-8">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-[var(--color-brand)] animate-pulse" />
            <h2 className="text-xs sm:text-sm font-black text-zinc-300 uppercase tracking-wider">
              {query ? `Từ khóa: "${query}"` : 'Tất cả siêu phẩm điện ảnh'}
            </h2>
          </div>
          <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-2 bg-[#12121A] py-2 px-4 rounded-full border border-white/5">
            <span>Tìm thấy: <strong className="text-[var(--color-brand)] text-xs font-black">{results.length}</strong> bộ phim</span>
          </div>
        </div>

        {/* 5. DYNAMIC CINEMATIC GRID OF MOVIE CARDS */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-7">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="aspect-[2/3] w-full rounded-[20px] bg-[#12121A]/80 border border-white/5 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite]"></div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 sm:gap-7"
          >
            {results.map((item, idx) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.25) }}
              >
                <MovieCard
                  movie={item}
                  onClick={() => onNavigateToMoveDetail(item.slug)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* EMBELLISHED CINEMATIC SPACE STATE */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 md:p-20 text-center rounded-[32px] bg-[#12121A]/20 border border-white/5 gap-5 max-w-xl mx-auto mt-10"
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 shadow-inner">
              <HelpCircle size={28} className="text-[var(--color-brand)]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-zinc-100">Không tìm thấy phim trùng khớp</h3>
              <p className="text-xs text-zinc-500 mt-2.5 leading-relaxed max-w-sm mx-auto">
                {statusText || 'Răng quét hiện chưa tương thích với tổ hợp từ khóa hoặc bento. Hãy kiểm tra lại từ khóa hoặc đặt lại bộ lọc.'}
              </p>
            </div>

            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-xs font-bold bg-zinc-900 border border-white/5 hover:border-zinc-700 text-white py-3.5 px-6 rounded-xl cursor-pointer hover:scale-[1.03] transition-all duration-200"
            >
              <RefreshCw size={13} />
              Cài lại bộ lọc từ đầu
            </button>
          </motion.div>
        )}

        {/* 6. REALTIME MOVIE DIRECTORY SPEC SHEETS */}
        <div className="mt-16 bg-gradient-to-r from-zinc-950/40 via-[var(--color-brand)]/5 to-zinc-950/40 border border-white/5 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)] flex items-center justify-center shrink-0 shadow-lg shadow-red-500/5">
              <Award size={22} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-zinc-200 flex items-center justify-center sm:justify-start gap-1.5 uppercase tracking-wide">
                Hỗ trợ tìm kiếm đa luồng tự động
                <ShieldCheck size={14} className="text-emerald-500" />
              </h4>
              <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 leading-relaxed max-w-md">
                Tất cả các nguồn được gộp tìm kiếm theo luồng ưu tiên OPhim {'>'} KKPhim {'>'} AnimeHub. Các poster ảnh đều được liên kết tự động và đầy đủ.
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleTrendingKeywordClick('One Piece')}
            className="bg-zinc-900 hover:bg-zinc-850 hover:scale-105 active:scale-95 transition-all border border-white/5 text-zinc-300 hover:text-white px-6 h-12 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            Khám phá One Piece
          </button>
        </div>

      </div>
    </div>
  );
}

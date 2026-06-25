import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

// Screens
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import WatchScreen from './screens/WatchScreen';
import CategoryScreen from './screens/CategoryScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';

// Core types & hooks
import { Search, X, Film, Flame, ShieldAlert, Sparkles, RefreshCw, Play, Clock, ChevronRight } from 'lucide-react';
import { searchMovies } from './lib/api/vsmov';
import { MovieListItem } from './types/movie';
import { useUserPreferences } from './lib/hooks/useUserPreferences';

export default function App() {
  const [route, setRoute] = useState<string>('home');
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [activeEpisodeSlug, setActiveEpisodeSlug] = useState<string | undefined>(undefined);
  const [activeServerIdx, setActiveServerIdx] = useState<number>(0);
  
  // Real authentication state bypassed - always true since site is 100% public
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Search Command Palette Modal state
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [overlayQuery, setOverlayQuery] = useState('');
  const [overlayResults, setOverlayResults] = useState<MovieListItem[]>([]);
  const [isOverlaySearching, setIsOverlaySearching] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  useEffect(() => {
    if (isSearchOverlayOpen) {
      try {
        const stored = localStorage.getItem('filmflow_history');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.length > 0) {
            setHistoryItems(parsed.slice(0, 3));
          } else {
            throw new Error("Empty history");
          }
        } else {
          throw new Error("No stored history");
        }
      } catch (e) {
        setHistoryItems([
          { movieSlug: 'dune-hanh-tinh-cat-phan-2', movieName: 'Dune: Hành Tinh Cát - Phần 2', posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400', progress: 45, episodeName: 'Full' },
          { movieSlug: 'nu-than-thu-tu-wednesday-phan-1', movieName: 'Nữ Thần Thứ Tư (Wednesday)', posterUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400', progress: 80, episodeName: 'Tập 4' }
        ]);
      }
    }
  }, [isSearchOverlayOpen]);

  // Initialize preference to apply theme classes
  const { preferences, updatePreferences } = useUserPreferences();

  const [currentThemeClass, setCurrentThemeClass] = useState<'light' | 'dark'>(
    preferences.theme === 'light' ? 'light' : 'dark'
  );

  useEffect(() => {
    const handleThemeClass = () => {
      const currentTheme = preferences.theme;
      if (currentTheme === 'light') {
        setCurrentThemeClass('light');
      } else if (currentTheme === 'dark') {
        setCurrentThemeClass('dark');
      } else {
        const isSystemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        setCurrentThemeClass(isSystemLight ? 'light' : 'dark');
      }
    };
    handleThemeClass();
  }, [preferences.theme]);

  // Route parser (hashes like: #/home, #/phim/dune-phan-2, #/tim-kiem)
  const parseHash = () => {
    const hash = window.location.hash || '#/';
    const path = hash.replace(/^#\/?/, '').split('?')[0];
    const queryStr = hash.split('?')[1] || '';
    
    // Parse query params (e.g. ?tap=1&server=1)
    const urlParams = new URLSearchParams(queryStr);
    const epSlug = urlParams.get('tap') || undefined;
    const svrIdx = parseInt(urlParams.get('server') || '0');

    if (!path || path === 'home') {
      setRoute('home');
      setRouteParams({});
    } else if (path === 'tim-kiem') {
      setRoute('tim-kiem');
      setRouteParams({});
    } else if (path === 'tai-khoan') {
      setRoute('tai-khoan');
      setRouteParams({});
    } else if (path === 'phim-le') {
      setRoute('phim-le');
      setRouteParams({});
    } else if (path === 'phim-bo') {
      setRoute('phim-bo');
      setRouteParams({});
    } else if (path === 'phim-moi') {
      setRoute('phim-moi');
      setRouteParams({});
    } else if (path.startsWith('phim/')) {
      const slug = path.replace('phim/', '');
      setRoute('phim');
      setRouteParams({ slug });
    } else if (path.startsWith('xem/')) {
      const slug = path.replace('xem/', '');
      setRoute('xem');
      setRouteParams({ slug });
      setActiveEpisodeSlug(epSlug);
      setActiveServerIdx(svrIdx);
    } else if (path.startsWith('the-loai/')) {
      const slug = path.replace('the-loai/', '');
      setRoute('the-loai');
      setRouteParams({ slug });
    } else if (path.startsWith('quoc-gia/')) {
      const slug = path.replace('quoc-gia/', '');
      setRoute('quoc-gia');
      setRouteParams({ slug });
    } else if (path.startsWith('nam/')) {
      const year = path.replace('nam/', '');
      setRoute('nam');
      setRouteParams({ year });
    } else {
      setRoute('home');
      setRouteParams({});
    }
  };

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    
    // Global keyboard shortcut parsing: click '/' to launch Command Palette search
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOverlayOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOverlayOpen(false);
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);

    return () => {
      window.removeEventListener('hashchange', parseHash);
      window.removeEventListener('keydown', handleGlobalShortcuts);
    };
  }, []);

  // Sync route state to hash
  const navigateTo = (path: string, urlParams?: Record<string, string | number>) => {
    let hashUrl = `#/${path}`;
    if (urlParams) {
      const query = Object.entries(urlParams)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      hashUrl += `?${query}`;
    }
    window.location.hash = hashUrl;
  };

  // Autocomplete search handler inside Command Palette
  useEffect(() => {
    const fetchAutocomplete = async () => {
      if (!overlayQuery.trim()) {
        setOverlayResults([]);
        return;
      }
      setIsOverlaySearching(true);
      try {
        const res = await searchMovies(overlayQuery);
        setOverlayResults((res.items || []).slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setIsOverlaySearching(false);
      }
    };

    const delayDebounce = setTimeout(fetchAutocomplete, 300);
    return () => clearTimeout(delayDebounce);
  }, [overlayQuery]);

  // Navigate back helper
  const handleNavBack = () => {
    window.history.back();
  };

  const handleAutocompleteItemClick = (slug: string) => {
    setIsSearchOverlayOpen(false);
    setOverlayQuery('');
    navigateTo(`phim/${slug}`);
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)] transition-colors duration-300 ${currentThemeClass}`}>
      
      {/* GLOBAL NAVBAR SECTION */}
      <Header 
        currentRoute={route}
        onNavigate={navigateTo}
        onSearchOpen={() => setIsSearchOverlayOpen(true)}
      />

      {/* DETAILED SCREEN ROUTER SWITCH DISPLAY */}
      <div className="flex-grow">
        {route === 'home' && (
          <HomeScreen 
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
            onNavigateToWatch={(slug) => navigateTo(`xem/${slug}`)}
            onNavigate={navigateTo}
          />
        )}

        {route === 'phim' && (
          <DetailScreen 
            slug={routeParams.slug}
            onNavigateToWatch={(slug, epSlug, svrIdx) => {
              const params: Record<string, string | number> = {};
              if (epSlug) params.tap = epSlug;
              if (svrIdx !== undefined) params.server = svrIdx;
              navigateTo(`xem/${slug}`, params);
            }}
            onNavigateToDetail={(slug) => navigateTo(`phim/${slug}`)}
          />
        )}

        {route === 'xem' && (
          <WatchScreen 
            slug={routeParams.slug}
            initialEpisodeSlug={activeEpisodeSlug}
            initialServerIdx={activeServerIdx}
            onNavigateToDetail={(slug) => navigateTo(`phim/${slug}`)}
            onBack={handleNavBack}
          />
        )}

        {route === 'tim-kiem' && (
          <SearchScreen 
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
          />
        )}

        {route === 'the-loai' && (
          <CategoryScreen 
            type="the-loai"
            slug={routeParams.slug}
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
          />
        )}

        {route === 'quoc-gia' && (
          <CategoryScreen 
            type="quoc-gia"
            slug={routeParams.slug}
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
          />
        )}

        {route === 'nam' && (
          <CategoryScreen 
            type="nam"
            slug={routeParams.year}
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
          />
        )}

        {route === 'phim-le' && (
          <CategoryScreen 
            type="phim-le"
            slug=""
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
          />
        )}

        {route === 'phim-bo' && (
          <CategoryScreen 
            type="phim-bo"
            slug=""
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
          />
        )}

        {route === 'phim-moi' && (
          <CategoryScreen 
            type="phim-moi"
            slug=""
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
          />
        )}

        {route === 'tai-khoan' && (
          <ProfileScreen 
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
            onNavigateToWatch={(slug, epSlug) => {
              const params: Record<string, string | number> = {};
              if (epSlug) params.tap = epSlug;
              navigateTo(`xem/${slug}`, params);
            }}
            onLogout={() => {
              localStorage.setItem('bao_is_logged_in', 'false');
              setIsLoggedIn(false);
              navigateTo('home');
            }}
          />
        )}
      </div>

      {/* CLIMATIC ATTRIBUTION GLOBAL FOOTER */}
      <Footer onNavigate={navigateTo} />

      {/* 2B. COMMAND PALETTE SEARCH OVERLAY DRAWER MODAL */}
      {isSearchOverlayOpen && (
        <div id="command-palette-modal" className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsSearchOverlayOpen(false)} />
          
          <div className="relative w-full max-w-4xl bg-zinc-950/95 border border-zinc-850 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
            {/* Header: Input Bar */}
            <div className="relative flex items-center justify-between gap-4 border-b border-zinc-900/60 p-5 sm:p-6">
              <div className="flex-grow relative flex items-center">
                <Search size={22} className="absolute left-1 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={overlayQuery}
                  onChange={(e) => setOverlayQuery(e.target.value)}
                  className="w-full bg-transparent pl-9 pr-6 pb-0.5 outline-none font-black text-base sm:text-lg tracking-tight text-white placeholder-zinc-600 font-sans"
                  placeholder="Tìm kiếm phim, anime, chương trình truyền hình..."
                  autoFocus
                />
                {overlayQuery && (
                  <button 
                    onClick={() => setOverlayQuery('')}
                    className="absolute right-1 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <button 
                onClick={() => setIsSearchOverlayOpen(false)}
                className="text-xs font-black px-4 py-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300"
              >
                Đóng (ESC)
              </button>
            </div>

            {/* Scrollable Contents Pane */}
            <div className="flex-grow overflow-y-auto p-5 sm:p-6 no-scrollbar">
              {isOverlaySearching ? (
                /* GORGEOUS SKELETON SHIMMER LOADING STAGE */
                <div className="flex flex-col gap-4 py-2">
                  <div className="h-4 w-32 bg-zinc-900 rounded mb-2 animate-pulse" />
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4 p-3 bg-zinc-900/35 rounded-2xl border border-zinc-900/40 animate-pulse">
                      <div className="w-14 h-20 bg-zinc-900 rounded-xl shrink-0" />
                      <div className="flex-grow flex flex-col justify-center gap-2">
                        <div className="w-2/5 h-4 bg-zinc-900 rounded" />
                        <div className="w-1/4 h-3 bg-zinc-900 rounded" />
                        <div className="w-1/2 h-3 bg-zinc-900 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : overlayQuery.trim() ? (
                overlayResults.length > 0 ? (
                  /* RESULTS PANEL */
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">
                      KẾT QUẢ TÌM KIẾM ({overlayResults.length})
                    </h4>
                    <div className="flex flex-col gap-3">
                      {overlayResults.map((movieItem) => {
                        const isSeries = movieItem.type === 'series';
                        const genreDesc = isSeries 
                          ? 'Phim bộ chất lượng cao. Cập nhật tập mới nhất liên tục, âm thanh sống động và vietsub hoàn chỉnh.' 
                          : 'Phim lẻ bom tấn chiếu rạp. Trải nghiệm tốc độ truyền tải nhanh, hình ảnh chuẩn rạp không giật lag.';
                        
                        return (
                          <div
                            key={movieItem.slug}
                            onClick={() => handleAutocompleteItemClick(movieItem.slug)}
                            className="flex gap-4 p-3.5 rounded-2xl bg-zinc-900/20 hover:bg-zinc-900/60 border border-zinc-900/20 hover:border-zinc-800/40 cursor-pointer transition-all duration-300 group text-left"
                          >
                            <img 
                              src={movieItem.poster_url || movieItem.thumb_url} 
                              alt={movieItem.name} 
                              className="w-16 h-24 object-cover rounded-xl shadow-md border border-white/5 shrink-0 group-hover:scale-[1.03] transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[var(--color-brand)] transition-colors truncate">
                                    {movieItem.name}
                                  </h4>
                                  <span className="text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                                    ★ 8.5
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 font-bold truncate mt-0.5">
                                  {movieItem.origin_name} • {movieItem.year}
                                </p>
                                <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                                  {genreDesc}
                                </p>
                              </div>
                              
                              <div className="flex items-center justify-between mt-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-black uppercase">
                                    {movieItem.quality || 'FHD'}
                                  </span>
                                  <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-400 font-bold">
                                    {movieItem.lang || 'Vietsub'}
                                  </span>
                                </div>
                                
                                <button className="text-[10px] px-3.5 py-1.5 rounded-full bg-[var(--color-brand)] text-white font-bold hover:bg-opacity-90 transition-all flex items-center gap-1 shrink-0">
                                  <Play size={10} fill="currentColor" />
                                  Xem ngay
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* FRIENDLY NOT FOUND PANEL */
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 shadow-inner">
                      <ShieldAlert size={26} className="text-[var(--color-brand)] animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-zinc-200">Không tìm thấy nội dung phù hợp</h4>
                      <p className="text-xs text-zinc-500 max-w-sm mt-1.5 mx-auto leading-relaxed">
                        Thử rà soát lại từ khóa hoặc sử dụng các từ khóa phổ biến của cộng đồng như: <strong className="text-zinc-400">Conan</strong>, <strong className="text-zinc-400">One Piece</strong>, hoặc <strong className="text-zinc-400">Dune</strong>.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                /* DEFAULT PRE-SEARCH STATE: MULTI-COLUMN PREMIUM WIDGETS */
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 select-none">
                  {/* Left Column (8-Span): History & Trending */}
                  <div className="md:col-span-7 flex flex-col gap-6">
                    {/* A. Continue Watching / History */}
                    {historyItems.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-1.5 text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900/60 pb-2">
                          <Clock size={13} className="text-[var(--color-brand)]" />
                          <span>Tiếp Tục Xem &amp; Gần Đây</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {historyItems.map((hist: any, i: number) => (
                            <div
                              key={hist.movieSlug || i}
                              onClick={() => handleAutocompleteItemClick(hist.movieSlug)}
                              className="flex gap-2.5 p-2 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/80 border border-zinc-900/40 cursor-pointer transition-all group text-left"
                            >
                              <img 
                                src={hist.posterUrl} 
                                alt={hist.movieName} 
                                className="w-11 h-15 object-cover rounded-lg shadow shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0 flex flex-col justify-between py-0.5">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-black text-white group-hover:text-[var(--color-brand)] transition-colors truncate">
                                    {hist.movieName}
                                  </p>
                                  <p className="text-[10px] text-zinc-500 mt-0.5">
                                    Đang xem: {hist.episodeName || 'Tập 1'}
                                  </p>
                                </div>
                                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-1">
                                  <div 
                                    className="bg-[var(--color-brand)] h-full" 
                                    style={{ width: `${hist.progress || 50}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* B. Trending (Xu hướng) */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900/60 pb-2">
                        <Flame size={13} className="text-amber-500 animate-pulse" />
                        <span>Xu Hướng Phổ Biến</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {[
                          { name: 'Thám Tử Lừng Danh Conan', slug: 'tham-tu-lung-danh-conan', poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150', year: 2024, star: '8.4' },
                          { name: 'Đảo Hải Tặc (One Piece)', slug: 'one-piece', poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150', year: 2024, star: '8.8' },
                          { name: 'Hành Tinh Cát 2 (Dune)', slug: 'dune-hanh-tinh-cat-phan-2', poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150', year: 2024, star: '8.6' }
                        ].map((trend) => (
                          <div
                            key={trend.slug}
                            onClick={() => handleAutocompleteItemClick(trend.slug)}
                            className="flex flex-col bg-zinc-900/20 hover:bg-zinc-900/50 rounded-2xl border border-zinc-900/30 overflow-hidden cursor-pointer transition-all duration-300 group relative text-left"
                          >
                            <div className="aspect-[2/3] w-full relative overflow-hidden bg-zinc-900">
                              <img 
                                src={trend.poster} 
                                alt={trend.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-md border border-white/5 rounded px-1.5 py-0.5 text-[9px] text-amber-400 font-bold flex items-center gap-0.5">
                                <span>★</span><span>{trend.star}</span>
                              </div>
                            </div>
                            <div className="p-2.5 min-w-0">
                              <p className="text-[11px] font-black text-white group-hover:text-[var(--color-brand)] transition-colors truncate">
                                {trend.name}
                              </p>
                              <p className="text-[9px] text-zinc-500 font-bold mt-0.5">
                                {trend.year} • Thể loại hot
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (5-Span): Popular Searches & Quick Tips */}
                  <div className="md:col-span-5 flex flex-col gap-6">
                    {/* C. Popular Searches */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-900/60 pb-2">
                        <Sparkles size={13} className="text-yellow-400" />
                        <span>Từ Khóa Thịnh Hành</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {[
                          { name: 'Thám Tử Conan (Anime)', query: 'Conan' },
                          { name: 'One Piece (Vua Hải Tặc)', query: 'One Piece' },
                          { name: 'Wednesday Addams', query: 'Wednesday' },
                          { name: 'Kimi no Na wa (Your Name)', query: 'Your Name' },
                          { name: 'Solo Leveling', query: 'Solo' },
                          { name: 'Hoạt hình Ghibli', query: 'Ghibli' }
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setOverlayQuery(item.query)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/10 hover:bg-zinc-900/50 text-xs font-bold text-zinc-300 hover:text-white border border-transparent hover:border-zinc-900/60 transition-all text-left cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-zinc-600">0{idx + 1}</span>
                              <span>{item.name}</span>
                            </span>
                            <ChevronRight size={14} className="text-zinc-600" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* D. Quick info banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/15 to-zinc-950 border border-red-900/10 text-left select-none">
                      <p className="text-[10px] font-black text-[var(--color-brand)] tracking-widest uppercase mb-1">
                        🚀 TÌM KIẾM NHANH CHÓNG
                      </p>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        Bạn có thể ấn phím tắt <kbd className="bg-zinc-900 border border-zinc-800 text-[10px] px-1.5 py-0.5 rounded text-white font-mono font-bold mx-1 shadow">/</kbd> ở bất kỳ màn hình nào để mở nhanh ô tìm kiếm rạp phim cao cấp này.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

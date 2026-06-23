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
import { Search, X, Film, Flame, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
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
        <div id="command-palette-modal" className="fixed inset-0 z-50 bg-[#0A0A0F]/85 backdrop-blur-md flex items-start justify-center p-4 sm:p-10 transition-opacity duration-300">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsSearchOverlayOpen(false)} />
          
          <div className="relative w-full max-w-2xl bg-[var(--color-bg-elevated)] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden mt-10 sm:mt-20 flex flex-col gap-4 p-5 animate-scale-in">
            {/* Overlay Input Bar */}
            <div className="relative flex items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div className="flex-grow relative">
                <Search size={18} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={overlayQuery}
                  onChange={(e) => setOverlayQuery(e.target.value)}
                  className="w-full bg-transparent pl-10 pr-2 pb-0.5 outline-none font-bold text-sm tracking-wide text-white placeholder-zinc-500 font-sans"
                  placeholder="Gõ tên phim cần tìm... Bấm ESC để đóng"
                  autoFocus
                />
              </div>
              <button 
                onClick={() => setIsSearchOverlayOpen(false)}
                className="p-1 px-2 text-xs font-bold rounded-lg border border-zinc-800 text-zinc-500 hover:text-white transition-colors cursor-pointer flex items-center gap-1 hover:bg-zinc-800"
              >
                <span>Đóng</span>
                <X size={12} />
              </button>
            </div>

            {/* Quick autocomplete lists */}
            <div className="flex flex-col gap-3 font-sans pb-1 select-none">
              <h4 className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase flex items-center gap-1 pb-1">
                <Flame size={12} className="text-[var(--color-brand)]" />
                {overlayQuery ? 'GỢI Ý KHỚP NÀO' : 'TIÊU ĐIỂM XEM PHỔ BIẾN'}
              </h4>

              {isOverlaySearching ? (
                <div className="flex items-center gap-2 py-4 justify-center text-zinc-500 text-xs font-medium">
                  <RefreshCw size={12} className="animate-spin text-[var(--color-brand)]" />
                  <span>Đang dò tìm luồng dữ liệu...</span>
                </div>
              ) : overlayQuery.trim() && overlayResults.length > 0 ? (
                <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto">
                  {overlayResults.map(movieItem => (
                    <div
                      key={movieItem.slug}
                      onClick={() => handleAutocompleteItemClick(movieItem.slug)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800/60 cursor-pointer border border-transparent hover:border-zinc-800/40 transition-all text-left"
                    >
                      <img 
                        src={movieItem.thumb_url} 
                        alt={movieItem.name} 
                        className="w-8 h-11 object-cover rounded shadow flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{movieItem.name}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{movieItem.origin_name} ({movieItem.year})</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : overlayQuery.trim() && overlayResults.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">Không dốc được luồng kết quả. Vui lòng bấm <span className="text-[var(--color-brand)] font-bold cursor-pointer" onClick={() => { setIsSearchOverlayOpen(false); navigateTo('tim-kiem'); }}>Tìm nâng cao &rarr;</span></p>
              ) : (
                /* default popular hot search options */
                <div className="flex flex-col gap-1 select-none">
                  {[
                    { name: 'Dune: Hành Tinh Cát - Phần 2', slug: 'dune-hanh-tinh-cat-phan-2' },
                    { name: 'Nữ Thần Thứ Tư (Wednesday)', slug: 'nu-than-thu-tu-wednesday-phan-1' },
                    { name: 'Spider-Man: Across the Spider-Verse', slug: 'spider-man-du-hanh-vu-tru-nhen' },
                    { name: 'Khóa Chặt Cửa Nào Suzume', slug: 'khoa-chat-cua-nao-suzume' }
                  ].map(topic => (
                    <button
                      key={topic.slug}
                      onClick={() => handleAutocompleteItemClick(topic.slug)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-900 transition-colors text-xs font-semibold text-zinc-300 hover:text-white text-left cursor-pointer"
                    >
                      <span>🎬 {topic.name}</span>
                    </button>
                  ))}
                  
                  <div className="mt-4 pt-3 border-t border-zinc-950 flex justify-between items-center text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-400 animate-pulse" />
                      Nhấn nút <strong className="text-zinc-400 font-mono">/</strong> tại trang nào đầu mục để kích hoạt nhanh ô tìm kiếm này.
                    </span>
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

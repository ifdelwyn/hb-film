import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import DonationModal from './components/DonationModal';
import PolicyModal from './components/PolicyModal';
import ReportModal from './components/ReportModal';

// Screens
import HomeScreen from './screens/HomeScreen';
import DetailScreen from './screens/DetailScreen';
import WatchScreen from './screens/WatchScreen';
import CategoryScreen from './screens/CategoryScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import MembershipScreen from './screens/MembershipScreen';
import TvScreen from './screens/TvScreen';
import DownloadScreen from './screens/DownloadScreen';
import BetaIOSScreen from './screens/BetaIOSScreen';
import BetaAndroidScreen from './screens/BetaAndroidScreen';
import MusicScreen from './screens/MusicScreen';
import GameScreen from './screens/GameScreen';

// Core types & hooks
import { Search, X, Film, Flame, ShieldAlert, Sparkles, RefreshCw, Play, Clock, ChevronRight, Mic, MicOff } from 'lucide-react';
import { searchMovies, getAbsoluteFrontEndImageUrl } from './lib/api/vsmov';
import { searchMovies as searchTmdbMovies } from './services/tmdbService';
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

  // Voice Search states
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('vi-VN');
  const [voiceError, setVoiceError] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setVoiceSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = voiceLanguage;
      
      rec.onstart = () => {
        setIsVoiceListening(true);
        setVoiceError('');
      };
      
      rec.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setOverlayQuery(transcript);
          }
        }
      };
      
      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Hãy cấp quyền truy cập Micro để sử dụng tìm kiếm giọng nói.');
        } else if (event.error === 'no-speech') {
          setVoiceError('Không phát hiện tiếng nói. Xin hãy thử lại.');
        } else {
          setVoiceError(`Lỗi nhận diện: ${event.error}`);
        }
        setIsVoiceListening(false);
      };
      
      rec.onend = () => {
        setIsVoiceListening(false);
      };
      
      setRecognitionInstance(rec);
    }
  }, [voiceLanguage]);

  // Stop listening when search overlay is closed
  useEffect(() => {
    if (!isSearchOverlayOpen && isVoiceListening && recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (err) {
        console.error(err);
      }
      setIsVoiceListening(false);
    }
  }, [isSearchOverlayOpen, isVoiceListening, recognitionInstance]);

  const toggleVoiceSearch = () => {
    if (!voiceSupported) {
      setVoiceError('Trình duyệt không hỗ trợ Web Speech API.');
      return;
    }
    
    if (isVoiceListening) {
      try {
        recognitionInstance?.stop();
      } catch (e) {
        console.error(e);
      }
    } else {
      setVoiceError('');
      try {
        recognitionInstance?.start();
      } catch (err) {
        console.error('Failed to start speech recognition', err);
      }
    }
  };

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

    const storedUser = localStorage.getItem('hb_user');
    const isLogged = !!storedUser;

    if (['favorites', 'history', 'settings'].includes(path) && !isLogged) {
      setRoute('auth');
      setRouteParams({ redirect: path });
      window.location.hash = `#/auth?redirect=${path}`;
      return;
    }

    if (!path || path === 'home') {
      setRoute('home');
      setRouteParams({});
    } else if (path === 'auth') {
      setRoute('auth');
      const redirect = urlParams.get('redirect') || '';
      setRouteParams({ redirect });
    } else if (path === 'favorites') {
      setRoute('favorites');
      setRouteParams({});
    } else if (path === 'history') {
      setRoute('history');
      setRouteParams({});
    } else if (path === 'membership') {
      setRoute('membership');
      setRouteParams({});
    } else if (path === 'tv') {
      setRoute('tv');
      setRouteParams({});
    } else if (path === 'security') {
      setRoute('security');
      setRouteParams({});
    } else if (path === 'settings') {
      setRoute('settings');
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
    } else if (path === 'download') {
      setRoute('download');
      setRouteParams({});
    } else if (path === 'download/beta/ios') {
      setRoute('download/beta/ios');
      setRouteParams({});
    } else if (path === 'download/beta/android') {
      setRoute('download/beta/android');
      setRouteParams({});
    } else if (path === 'music') {
      setRoute('music');
      setRouteParams({});
    } else if (path === 'tro-choi') {
      setRoute('tro-choi');
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

    // Chống mở F12, chuột phải kiểm tra phần tử và xem nguồn trang (View Source)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDownSecurity = (e: KeyboardEvent) => {
      // 1. Chống phím F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      
      // 2. Chống Ctrl + Shift + I / J / C (DevTools trên Chrome, Edge, Firefox)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }
      
      // 3. Chống Ctrl + U (Xem mã nguồn trang - View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }

      // 4. Chống Command + Option + I / J / C (DevTools trên macOS Safari/Chrome)
      if (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'I' || e.key === 'J' || e.key === 'C' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      // 5. Chống Command + Shift + C (Phần tử kiểm tra trên macOS)
      if (e.metaKey && e.shiftKey && (e.key === 'c' || e.key === 'C' || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDownSecurity);

    return () => {
      window.removeEventListener('hashchange', parseHash);
      window.removeEventListener('keydown', handleGlobalShortcuts);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDownSecurity);
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

  // Automatically scroll to the top of the page on any navigation/click routing activity
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [route, routeParams, activeEpisodeSlug, activeServerIdx]);

  // Autocomplete search handler inside Command Palette
  useEffect(() => {
    const fetchAutocomplete = async () => {
      if (!overlayQuery.trim()) {
        setOverlayResults([]);
        return;
      }
      setIsOverlaySearching(true);
      try {
        const [localRes, tmdbRes] = await Promise.all([
          searchMovies(overlayQuery).catch(() => ({ items: [] })),
          searchTmdbMovies(overlayQuery).catch(() => [])
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

        setOverlayResults(deduped.slice(0, 10));
      } catch (e) {
        console.error(e);
      } finally {
        setIsOverlaySearching(false);
      }
    };

    const delayDebounce = setTimeout(fetchAutocomplete, 400);
    return () => clearTimeout(delayDebounce);
  }, [overlayQuery]);

  // Navigate back helper
  const handleNavBack = () => {
    if (route === 'xem' && routeParams.slug) {
      navigateTo(`phim/${routeParams.slug}`);
    } else if (route === 'phim') {
      navigateTo('');
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('');
    }
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
              window.dispatchEvent(new Event('hb_user_updated'));
              navigateTo('home');
            }}
          />
        )}

        {route === 'auth' && (
          <LoginScreen
            onAuthSuccess={() => {
              window.dispatchEvent(new Event('hb_user_updated'));
              const target = routeParams.redirect || 'home';
              navigateTo(target);
            }}
            redirectRoute={routeParams.redirect}
          />
        )}

        {route === 'favorites' && (
          <ProfileScreen 
            initialTab="watchlist"
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
            onNavigateToWatch={(slug, epSlug) => {
              const params: Record<string, string | number> = {};
              if (epSlug) params.tap = epSlug;
              navigateTo(`xem/${slug}`, params);
            }}
            onLogout={() => {
              localStorage.setItem('bao_is_logged_in', 'false');
              setIsLoggedIn(false);
              window.dispatchEvent(new Event('hb_user_updated'));
              navigateTo('home');
            }}
          />
        )}

        {route === 'history' && (
          <ProfileScreen 
            initialTab="history"
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
            onNavigateToWatch={(slug, epSlug) => {
              const params: Record<string, string | number> = {};
              if (epSlug) params.tap = epSlug;
              navigateTo(`xem/${slug}`, params);
            }}
            onLogout={() => {
              localStorage.setItem('bao_is_logged_in', 'false');
              setIsLoggedIn(false);
              window.dispatchEvent(new Event('hb_user_updated'));
              navigateTo('home');
            }}
          />
        )}

        {route === 'settings' && (
          <ProfileScreen 
            initialTab="settings"
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
            onNavigateToWatch={(slug, epSlug) => {
              const params: Record<string, string | number> = {};
              if (epSlug) params.tap = epSlug;
              navigateTo(`xem/${slug}`, params);
            }}
            onLogout={() => {
              localStorage.setItem('bao_is_logged_in', 'false');
              setIsLoggedIn(false);
              window.dispatchEvent(new Event('hb_user_updated'));
              navigateTo('home');
            }}
          />
        )}

        {route === 'security' && (
          <ProfileScreen 
            initialTab="security"
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)}
            onNavigateToWatch={(slug, epSlug) => {
              const params: Record<string, string | number> = {};
              if (epSlug) params.tap = epSlug;
              navigateTo(`xem/${slug}`, params);
            }}
            onLogout={() => {
              localStorage.setItem('bao_is_logged_in', 'false');
              setIsLoggedIn(false);
              window.dispatchEvent(new Event('hb_user_updated'));
              navigateTo('home');
            }}
          />
        )}

        {route === 'membership' && (
          <MembershipScreen 
            onNavigate={navigateTo}
          />
        )}

        {route === 'tv' && (
          <TvScreen />
        )}

        {route === 'music' && (
          <MusicScreen />
        )}

        {route === 'tro-choi' && (
          <GameScreen 
            onNavigate={navigateTo} 
            onNavigateToMoveDetail={(slug) => navigateTo(`phim/${slug}`)} 
          />
        )}

        {route === 'download' && (
          <DownloadScreen onNavigate={navigateTo} />
        )}

        {route === 'download/beta/ios' && (
          <BetaIOSScreen onNavigate={navigateTo} />
        )}

        {route === 'download/beta/android' && (
          <BetaAndroidScreen onNavigate={navigateTo} />
        )}
      </div>

      {/* CLIMATIC ATTRIBUTION GLOBAL FOOTER */}
      <Footer onNavigate={navigateTo} />

      {/* 2B. COMMAND PALETTE SEARCH OVERLAY DRAWER MODAL */}
      {isSearchOverlayOpen && (
        <div id="command-palette-modal" className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsSearchOverlayOpen(false)} />
          
          <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-900 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[85vh] animate-scale-in">
            {/* Header: Input Bar */}
            <div className="relative flex items-center justify-between gap-4 border-b border-zinc-900 p-4 sm:p-5">
              <div className="flex-grow relative flex items-center">
                <Search size={20} className="absolute left-3.5 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={overlayQuery}
                  onChange={(e) => setOverlayQuery(e.target.value)}
                  className={`w-full bg-zinc-900/40 pl-11 ${voiceSupported ? 'pr-20' : 'pr-10'} py-2.5 outline-none font-medium text-base tracking-tight text-white placeholder-zinc-500 font-sans border border-zinc-800/60 rounded-full transition-all focus:border-[var(--color-brand)] focus:bg-zinc-900/80`}
                  placeholder={isVoiceListening ? "Đang lắng nghe... Hãy nói tên phim..." : "Tìm kiếm phim, anime, chương trình..."}
                  autoFocus
                />
                
                <div className="absolute right-3.5 flex items-center gap-2">
                  {overlayQuery && (
                    <button 
                      onClick={() => setOverlayQuery('')}
                      className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                      title="Xóa tìm kiếm"
                    >
                      <X size={14} />
                    </button>
                  )}
                  
                  {voiceSupported && (
                    <button
                      onClick={toggleVoiceSearch}
                      className={`p-1.5 rounded-full transition-all duration-300 relative ${
                        isVoiceListening 
                          ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)] scale-105' 
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                      title={isVoiceListening ? "Dừng ghi âm" : "Tìm kiếm bằng giọng nói"}
                    >
                      {isVoiceListening ? (
                        <>
                          <Mic size={16} className="relative z-10" />
                          <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                        </>
                      ) : (
                        <Mic size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsSearchOverlayOpen(false)}
                className="text-xs font-bold px-4 py-2.5 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-300 shrink-0"
              >
                Đóng (ESC)
              </button>
            </div>

            {/* Voice Search Status & Controls - Simple Bar */}
            {(isVoiceListening || voiceError) && (
              <div className="px-5 py-2 bg-zinc-900/40 border-b border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {isVoiceListening ? (
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <p className="text-xs font-semibold text-red-400">
                        Đang nghe tiếng {voiceLanguage === 'vi-VN' ? 'Việt' : 'Anh'}... Thử nói tên phim.
                      </p>
                      
                      <div className="flex items-end gap-0.5 h-3">
                        <span className="w-0.5 bg-red-400 animate-pulse h-1.5" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-0.5 bg-red-400 animate-pulse h-3" style={{ animationDelay: '0.3s' }}></span>
                        <span className="w-0.5 bg-red-400 animate-pulse h-1" style={{ animationDelay: '0.5s' }}></span>
                        <span className="w-0.5 bg-red-400 animate-pulse h-2" style={{ animationDelay: '0.2s' }}></span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-amber-500">
                      ⚠️ {voiceError}
                    </p>
                  )}
                </div>

                {voiceSupported && isVoiceListening && (
                  <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-full border border-zinc-800">
                    <button
                      onClick={() => setVoiceLanguage('vi-VN')}
                      className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full transition-all ${
                        voiceLanguage === 'vi-VN'
                          ? 'bg-[var(--color-brand)] text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      TIẾNG VIỆT
                    </button>
                    <button
                      onClick={() => setVoiceLanguage('en-US')}
                      className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full transition-all ${
                        voiceLanguage === 'en-US'
                          ? 'bg-[var(--color-brand)] text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      ENGLISH
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Scrollable Contents Pane */}
            <div className="flex-grow overflow-y-auto p-5 no-scrollbar">
              {isOverlaySearching ? (
                /* GORGEOUS SKELETON SHIMMER LOADING STAGE */
                <div className="flex flex-col gap-3 py-2">
                  <div className="h-3 w-24 bg-zinc-900 rounded mb-1 animate-pulse" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-3 bg-zinc-900/20 rounded-2xl border border-zinc-900/50 animate-pulse">
                      <div className="w-12 h-18 bg-zinc-900 rounded-lg shrink-0" />
                      <div className="flex-grow flex flex-col justify-center gap-1.5">
                        <div className="w-2/5 h-3.5 bg-zinc-900 rounded" />
                        <div className="w-1/4 h-3 bg-zinc-900 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : overlayQuery.trim() ? (
                overlayResults.length > 0 ? (
                  /* RESULTS PANEL */
                  <div className="flex flex-col gap-3">
                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                      KẾT QUẢ TÌM KIẾM ({overlayResults.length})
                    </h4>
                    <div className="flex flex-col gap-2.5">
                      {overlayResults.map((movieItem) => {
                        return (
                          <div
                            key={movieItem.slug}
                            onClick={() => handleAutocompleteItemClick(movieItem.slug)}
                            className="flex gap-4 p-2.5 rounded-2xl bg-zinc-900/10 hover:bg-zinc-900/50 border border-zinc-900/20 hover:border-zinc-800/40 cursor-pointer transition-all duration-300 group text-left"
                          >
                            <img 
                              src={getAbsoluteFrontEndImageUrl(movieItem.poster_url || movieItem.thumb_url)} 
                              alt={movieItem.name} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&auto=format&fit=crop&q=80';
                              }}
                              className="w-12 h-18 object-cover rounded-lg shadow border border-white/5 shrink-0 group-hover:scale-[1.03] transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-grow min-w-0 flex flex-col justify-between py-0.5">
                              <div>
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="text-sm font-bold text-white group-hover:text-[var(--color-brand)] transition-colors truncate">
                                    {movieItem.name}
                                  </h4>
                                  <span className="text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded shrink-0">
                                    ★ {movieItem.imdb?.star || '8.2'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 font-bold truncate mt-0.5">
                                  {movieItem.origin_name} • {movieItem.year}
                                </p>
                                
                                {movieItem.category && movieItem.category.length > 0 && (
                                  <p className="text-[10px] text-zinc-500 mt-1 truncate">
                                    {movieItem.category.map((c: any) => typeof c === 'string' ? c : c.name).join(' • ')}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between mt-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-mono font-black uppercase">
                                    {movieItem.quality || 'FHD'}
                                  </span>
                                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-zinc-900/60 text-zinc-500 font-bold">
                                    {movieItem.lang || 'Vietsub'}
                                  </span>
                                </div>
                                
                                <button className="text-[9px] px-2.5 py-1 rounded-full bg-[var(--color-brand)] text-white font-bold hover:bg-opacity-90 transition-all flex items-center gap-1 shrink-0">
                                  <Play size={8} fill="currentColor" />
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
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <ShieldAlert size={22} className="text-[var(--color-brand)] animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-200">Không tìm thấy nội dung phù hợp</h4>
                      <p className="text-[11px] text-zinc-500 max-w-sm mt-1 mx-auto leading-relaxed">
                        Thử tìm kiếm với từ khóa khác hoặc bấm từ khóa thịnh hành phía dưới.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                /* DEFAULT PRE-SEARCH STATE: COMPACT & MINIMAL */
                <div className="flex flex-col gap-6 select-none">
                  {/* Trending Keywords */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900/60 pb-1.5">
                      <Sparkles size={11} className="text-yellow-400" />
                      <span>Từ Khóa Thịnh Hành</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {[
                        { name: 'Thám Tử Conan', query: 'Conan' },
                        { name: 'One Piece', query: 'One Piece' },
                        { name: 'Wednesday', query: 'Wednesday' },
                        { name: 'Your Name', query: 'Your Name' },
                        { name: 'Solo Leveling', query: 'Solo' },
                        { name: 'Doraemon', query: 'Doraemon' }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setOverlayQuery(item.query)}
                          className="px-3.5 py-1.5 rounded-full bg-zinc-900/40 hover:bg-zinc-800 text-[11px] font-bold text-zinc-300 hover:text-white border border-zinc-800/40 transition-all cursor-pointer"
                        >
                          🔥 {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Continue Watching / History */}
                  {historyItems.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-900/60 pb-1.5">
                        <Clock size={11} className="text-[var(--color-brand)]" />
                        <span>Xem Gần Đây</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {historyItems.slice(0, 4).map((hist: any, i: number) => (
                          <div
                            key={hist.movieSlug || i}
                            onClick={() => handleAutocompleteItemClick(hist.movieSlug)}
                            className="flex gap-2.5 p-2 rounded-xl bg-zinc-900/10 hover:bg-zinc-900/40 border border-zinc-900/30 cursor-pointer transition-all group text-left"
                          >
                            <img 
                              src={getAbsoluteFrontEndImageUrl(hist.posterUrl)} 
                              alt={hist.movieName} 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=300&auto=format&fit=crop&q=80';
                              }}
                              className="w-10 h-14 object-cover rounded-lg shadow shrink-0 border border-white/5"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 flex flex-col justify-between py-0.5">
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-white group-hover:text-[var(--color-brand)] transition-colors truncate">
                                  {hist.movieName}
                                </p>
                                <p className="text-[9px] text-zinc-500 mt-0.5">
                                  {hist.episodeName || 'Tập 1'}
                                </p>
                              </div>
                              <div className="w-24 bg-zinc-900 h-1 rounded-full overflow-hidden mt-1">
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL DONATION MODAL FOR SUPPORTING THE DEVELOPER */}
      <DonationModal />

      {/* GLOBAL POLICY MODAL FOR REGULATORY & COMPLIANCE INFOS */}
      <PolicyModal />

      {/* GLOBAL REPORT MODAL FOR REPORTING SYSTEMS, MOVIES, OR USERS */}
      <ReportModal />

    </div>
  );
}

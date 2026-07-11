import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, X, ChevronDown, Film, Globe, Heart, User, Award, Flame, Clock, Tv, Gamepad2, Wrench, ExternalLink, Mail, QrCode } from 'lucide-react';
import { Category, Country } from '../types/movie';
import { MOCK_CATEGORIES, MOCK_COUNTRIES } from '../data/mockMovies';
import { useUserPreferences } from '../lib/hooks/useUserPreferences';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onSearchOpen: () => void;
}

export default function Header({ currentRoute, onNavigate, onSearchOpen }: HeaderProps) {
  const { preferences } = useUserPreferences();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [entertainmentOpen, setEntertainmentOpen] = useState(false);
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const stored = localStorage.getItem('hb_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // States for interactive and dynamic notification list
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 1,
      title: "🔥 Siêu kinh điển Dune: Phần 2",
      body: "Vừa được phát sóng bản FHD Vietsub độ phân giải cao!",
      time: "Vừa xong"
    },
    {
      id: 2,
      title: "🎬 Wednesday có cập nhật",
      body: "Học viện Nevermore mở rộng tập phim mới trọn bộ!",
      time: "10 phút trước"
    }
  ]);
  const [realMoviesForNotif, setRealMoviesForNotif] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch real movies for notifications
  useEffect(() => {
    fetch('/api/danh-sach/phim-moi-cap-nhat?page=1&limit=20')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.items)) {
          setRealMoviesForNotif(data.items);
        }
      })
      .catch(e => console.log('Failed to fetch movies for notifications:', e));
  }, []);

  // Set up continuous notification generator
  useEffect(() => {
    if (realMoviesForNotif.length === 0) return;

    const templates = [
      { prefix: "🎬", action: "vừa cập nhật bản thuyết minh cực hay!" },
      { prefix: "🔥 Phim bùng nổ:", action: "đã có tập mới FullHD cực nét!" },
      { prefix: "⭐ Đề cử HOT:", action: "vừa được thêm vào mục phim thịnh hành!" },
      { prefix: "👀 Xem ngay:", action: "vừa phát sóng vietsub chuẩn tốc độ cao!" },
      { prefix: "✨ Tin vui:", action: "đã hoàn tất bản lồng tiếng chất lượng rạp!" }
    ];

    const interval = setInterval(() => {
      const randomMovie = realMoviesForNotif[Math.floor(Math.random() * realMoviesForNotif.length)];
      if (!randomMovie) return;

      const template = templates[Math.floor(Math.random() * templates.length)];
      
      const newNotif = {
        id: Date.now(),
        title: `${template.prefix} ${randomMovie.name}`,
        body: `${randomMovie.origin_name || randomMovie.name} ${template.action}`,
        time: "Vừa xong",
        slug: randomMovie.slug
      };

      setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
    }, 25000); // 25s auto-update interval

    return () => clearInterval(interval);
  }, [realMoviesForNotif]);

  // Click outside to close notification panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleUserUpdate = () => {
      const stored = localStorage.getItem('hb_user');
      setCurrentUser(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener('hb_user_updated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    return () => {
      window.removeEventListener('hb_user_updated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
    };
  }, []);

  // Timeouts for mouse debouncing/delay
  const genreTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const entertainmentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const utilitiesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up any active timers on component unmount
  useEffect(() => {
    return () => {
      if (genreTimeoutRef.current) clearTimeout(genreTimeoutRef.current);
      if (countryTimeoutRef.current) clearTimeout(countryTimeoutRef.current);
      if (entertainmentTimeoutRef.current) clearTimeout(entertainmentTimeoutRef.current);
      if (utilitiesTimeoutRef.current) clearTimeout(utilitiesTimeoutRef.current);
    };
  }, []);

  const handleGenreMouseEnter = () => {
    if (genreTimeoutRef.current) {
      clearTimeout(genreTimeoutRef.current);
      genreTimeoutRef.current = null;
    }
    setGenreOpen(true);
    setCountryOpen(false);
    if (countryTimeoutRef.current) {
      clearTimeout(countryTimeoutRef.current);
      countryTimeoutRef.current = null;
    }
  };

  const handleGenreMouseLeave = () => {
    genreTimeoutRef.current = setTimeout(() => {
      setGenreOpen(false);
    }, 250); // 250ms close buffer delay to avoid flickering
  };

  const handleCountryMouseEnter = () => {
    if (countryTimeoutRef.current) {
      clearTimeout(countryTimeoutRef.current);
      countryTimeoutRef.current = null;
    }
    setCountryOpen(true);
    setGenreOpen(false);
    if (genreTimeoutRef.current) {
      clearTimeout(genreTimeoutRef.current);
      genreTimeoutRef.current = null;
    }
  };

  const handleCountryMouseLeave = () => {
    countryTimeoutRef.current = setTimeout(() => {
      setCountryOpen(false);
    }, 250); // 250ms close buffer delay to avoid flickering
  };

  const handleEntertainmentMouseEnter = () => {
    if (entertainmentTimeoutRef.current) {
      clearTimeout(entertainmentTimeoutRef.current);
      entertainmentTimeoutRef.current = null;
    }
    setEntertainmentOpen(true);
    setGenreOpen(false);
    setCountryOpen(false);
    if (genreTimeoutRef.current) {
      clearTimeout(genreTimeoutRef.current);
      genreTimeoutRef.current = null;
    }
    if (countryTimeoutRef.current) {
      clearTimeout(countryTimeoutRef.current);
      countryTimeoutRef.current = null;
    }
  };

  const handleEntertainmentMouseLeave = () => {
    entertainmentTimeoutRef.current = setTimeout(() => {
      setEntertainmentOpen(false);
    }, 250);
  };

  const handleUtilitiesMouseEnter = () => {
    if (utilitiesTimeoutRef.current) {
      clearTimeout(utilitiesTimeoutRef.current);
      utilitiesTimeoutRef.current = null;
    }
    setUtilitiesOpen(true);
    setGenreOpen(false);
    setCountryOpen(false);
    setEntertainmentOpen(false);
    if (genreTimeoutRef.current) {
      clearTimeout(genreTimeoutRef.current);
      genreTimeoutRef.current = null;
    }
    if (countryTimeoutRef.current) {
      clearTimeout(countryTimeoutRef.current);
      countryTimeoutRef.current = null;
    }
    if (entertainmentTimeoutRef.current) {
      clearTimeout(entertainmentTimeoutRef.current);
      entertainmentTimeoutRef.current = null;
    }
  };

  const handleUtilitiesMouseLeave = () => {
    utilitiesTimeoutRef.current = setTimeout(() => {
      setUtilitiesOpen(false);
    }, 250);
  };

  const handleGenreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (genreOpen) {
      setGenreOpen(false);
    } else {
      setGenreOpen(true);
      setCountryOpen(false);
      setEntertainmentOpen(false);
      setUtilitiesOpen(false);
    }
  };

  const handleCountryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (countryOpen) {
      setCountryOpen(false);
    } else {
      setCountryOpen(true);
      setGenreOpen(false);
      setEntertainmentOpen(false);
      setUtilitiesOpen(false);
    }
  };

  const handleEntertainmentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entertainmentOpen) {
      setEntertainmentOpen(false);
    } else {
      setEntertainmentOpen(true);
      setGenreOpen(false);
      setCountryOpen(false);
      setUtilitiesOpen(false);
    }
  };

  const handleUtilitiesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (utilitiesOpen) {
      setUtilitiesOpen(false);
    } else {
      setUtilitiesOpen(true);
      setGenreOpen(false);
      setCountryOpen(false);
      setEntertainmentOpen(false);
    }
  };

  // Flags mapping for countries
  const getCountryFlag = (slug: string): string => {
    switch (slug) {
      case 'han-quoc':
        return '🇰🇷';
      case 'trung-quoc':
        return '🇨🇳';
      case 'thai-lan':
        return '🇹🇭';
      case 'au-my':
        return '🇺🇸';
      case 'nhat-ban':
        return '🇯🇵';
      case 'viet-nam':
        return '🇻🇳';
      default:
        return '🌐';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync to close elements on navigate
  const navigateTo = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setGenreOpen(false);
    setCountryOpen(false);
    setEntertainmentOpen(false);
    setUtilitiesOpen(false);
    setProfileDropdownOpen(false);
  };

  const getLinkClass = (pattern: string) => {
    const isActive = currentRoute === pattern || currentRoute.startsWith(pattern + '/');
    return `relative text-[13px] font-bold py-1.5 px-3.5 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 select-none ${
      isActive 
        ? 'text-white bg-[#E63946] shadow-md shadow-[#E63946]/20' 
        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
    }`;
  };

  return (
    <>
      <header
        id="app-global-navbar"
        className={`fixed top-0 inset-x-0 z-50 h-16 sm:h-20 transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#0A0A0F]/70 backdrop-blur-xl border-b border-[#2A2A3A]/50 shadow-2xl shadow-black/40' 
            : 'bg-[#0A0A0F]/30 backdrop-blur-md border-b border-white/5 bg-gradient-to-b from-black/20 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div 
            onClick={() => navigateTo('home')}
            className="flex flex-col items-center justify-center select-none cursor-pointer group pb-1 relative"
          >
            <span className="font-signature lowercase text-3xl text-zinc-100 sm:text-4xl tracking-tight group-hover:text-[var(--color-brand)] transition-colors leading-none">
              bao
            </span>
            <div className="w-8 h-[2px] bg-[var(--color-brand)] mt-1.5 group-hover:bg-zinc-100 transition-colors" />
          </div>

          {/* Desktop Navigation Links Menu - Redesigned to be highly neat, aligned, and beautiful capsule style */}
          <nav className="hidden md:flex items-center bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md rounded-full p-1.5 gap-2.5 select-none shadow-[0_4px_24px_-10px_rgba(0,0,0,0.8)]">
            <span 
              onClick={() => navigateTo('home')} 
              className={getLinkClass('home')}
            >
              Trang Chủ
            </span>

            {/* Thể loại dropdown tag */}
            <div 
              className="relative"
              onMouseEnter={handleGenreMouseEnter}
              onMouseLeave={handleGenreMouseLeave}
            >
              <button
                id="navbar-genre-dropdown-btn"
                onClick={handleGenreClick}
                className={`text-[13px] font-bold py-1.5 px-3.5 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 select-none ${
                  currentRoute.startsWith('the-loai/') || genreOpen
                    ? 'text-white bg-zinc-800/80 shadow-inner'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <span>Thể Loại</span>
                <ChevronDown size={12} className={`transform transition-transform duration-300 ${genreOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {genreOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-[-120px] md:left-[-150px] mt-2.5 w-[420px] md:w-[480px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-900 rounded-[20px] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] z-50 flex flex-col gap-4 text-left border-zinc-800/80"
                  >
                    {/* Category main grid: 3 columns */}
                    <div className="grid grid-cols-3 gap-x-5 gap-y-3 pb-4 border-b border-zinc-900/80">
                      {MOCK_CATEGORIES.map(cat => (
                        <span
                          key={cat.id}
                          onClick={() => navigateTo(`the-loai/${cat.slug}`)}
                          className="group/item flex items-center gap-2 text-xs text-zinc-400 hover:text-[#E63946] p-1.5 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.05] hover:translate-x-0.5 select-none font-medium"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover/item:bg-[#E63946] group-hover/item:scale-125 transition-all duration-300" />
                          {cat.name}
                        </span>
                      ))}
                    </div>

                    {/* Popular Categories Sub-section */}
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <Award size={13} className="text-[#E63946] animate-pulse" />
                        <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">
                          Thể loại phổ biến tuần này
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {['Hành Động', 'Hoạt Hình', 'Kinh Dị', 'Tình Cảm'].map((popularName) => {
                          const matchingCat = MOCK_CATEGORIES.find(c => c.name === popularName);
                          const slug = matchingCat ? matchingCat.slug : 'hanh-dong';
                          return (
                            <span
                              key={popularName}
                              onClick={() => navigateTo(`the-loai/${slug}`)}
                              className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-900/60 hover:bg-[#E63946]/10 text-zinc-400 hover:text-[#E63946] border border-zinc-850 hover:border-[#E63946]/30 cursor-pointer transition-all duration-300 select-none font-bold"
                            >
                              {popularName}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Footer View All Actions CTA */}
                    <div className="mt-1 pt-3 border-t border-zinc-900/60 flex justify-end">
                      <button
                        onClick={() => {
                          navigateTo('search');
                        }}
                        className="text-[10px] font-black text-zinc-400 hover:text-[#E63946] uppercase tracking-wider flex items-center gap-1 hover:gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Xem tất cả thể loại</span>
                        <ChevronDown size={12} className="-rotate-90" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quốc gia dropdown tag */}
            <div 
              className="relative"
              onMouseEnter={handleCountryMouseEnter}
              onMouseLeave={handleCountryMouseLeave}
            >
              <button
                id="navbar-country-dropdown-btn"
                onClick={handleCountryClick}
                className={`text-[13px] font-bold py-1.5 px-3.5 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 select-none ${
                  currentRoute.startsWith('quoc-gia/') || countryOpen
                    ? 'text-white bg-zinc-800/80 shadow-inner'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <span>Quốc Gia</span>
                <ChevronDown size={12} className={`transform transition-transform duration-300 ${countryOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {countryOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-[-30px] mt-2.5 w-56 bg-zinc-950/95 backdrop-blur-xl border border-zinc-900 rounded-[20px] p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] z-50 flex flex-col gap-1 text-left border-zinc-800/80"
                  >
                    <div className="flex flex-col gap-1.5">
                      {MOCK_COUNTRIES.map(c => {
                        return (
                          <span
                            key={c.id}
                            onClick={() => navigateTo(`quoc-gia/${c.slug}`)}
                            className="group/item flex items-center gap-3 text-xs text-zinc-400 hover:text-[#E63946] hover:bg-[#E63946]/5 px-3 py-2 border border-transparent hover:border-[#E63946]/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:translate-x-0.5 select-none font-medium"
                          >
                            <span>{c.name}</span>
                          </span>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span 
              onClick={() => navigateTo('phim-le')} 
              className={getLinkClass('phim-le')}
            >
              Phim Lẻ
            </span>

            <span 
              onClick={() => navigateTo('phim-bo')} 
              className={getLinkClass('phim-bo')}
            >
              Phim Bộ
            </span>

            {/* "Giải trí khác" dropdown combining TV and Music */}
            <div 
              className="relative"
              onMouseEnter={handleEntertainmentMouseEnter}
              onMouseLeave={handleEntertainmentMouseLeave}
            >
              <button
                id="navbar-entertainment-dropdown-btn"
                onClick={handleEntertainmentClick}
                className={`text-[13px] font-bold py-1.5 px-3.5 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 select-none ${
                  currentRoute === 'tv' || currentRoute === 'music' || entertainmentOpen
                    ? 'text-white bg-[#E63946] shadow-md shadow-[#E63946]/20 font-black'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <span>Giải Trí</span>
                <ChevronDown size={12} className={`transform transition-transform duration-300 ${entertainmentOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {entertainmentOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-[-30px] mt-2.5 w-60 bg-zinc-950/95 backdrop-blur-xl border border-zinc-900 rounded-[20px] p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] z-50 flex flex-col gap-2.5 text-left border-zinc-800/80"
                  >
                    <div className="flex flex-col gap-1.5">
                      {/* TV Shows Choice */}
                      <div
                        onClick={() => navigateTo('tv')}
                        className="group/item flex items-center justify-between gap-3 text-xs text-zinc-400 hover:text-[#E63946] hover:bg-[#E63946]/5 px-3 py-2.5 border border-transparent hover:border-[#E63946]/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] select-none font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <span>TV Shows</span>
                        </div>
                        <span className="text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-600 text-white">
                          HOT
                        </span>
                      </div>

                      {/* Music Choice */}
                      <div
                        onClick={() => navigateTo('music')}
                        className="group/item flex items-center justify-between gap-3 text-xs text-zinc-400 hover:text-[#E63946] hover:bg-[#E63946]/5 px-3 py-2.5 border border-transparent hover:border-[#E63946]/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] select-none font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <span>Play Music</span>
                        </div>
                        <span className="text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                          FREE
                        </span>
                      </div>

                      {/* Game Center Choice */}
                      <div
                        onClick={() => navigateTo('tro-choi')}
                        className="group/item flex items-center justify-between gap-3 text-xs text-zinc-400 hover:text-[#E63946] hover:bg-[#E63946]/5 px-3 py-2.5 border border-transparent hover:border-[#E63946]/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] select-none font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <span>Trò Chơi Phim</span>
                        </div>
                        <span className="text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-purple-600 text-white">
                          NEW
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* "Tiện ích" dropdown for utility services requested by the user */}
            <div 
              className="relative"
              onMouseEnter={handleUtilitiesMouseEnter}
              onMouseLeave={handleUtilitiesMouseLeave}
            >
              <button
                id="navbar-utilities-dropdown-btn"
                onClick={handleUtilitiesClick}
                className={`text-[13px] font-bold py-1.5 px-3.5 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1.5 select-none ${
                  utilitiesOpen
                    ? 'text-white bg-[#E63946] shadow-md shadow-[#E63946]/20 font-black'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                <span>Tiện Ích</span>
                <ChevronDown size={12} className={`transform transition-transform duration-300 ${utilitiesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {utilitiesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-[-30px] mt-2.5 w-60 bg-zinc-950/95 backdrop-blur-xl border border-zinc-900 rounded-[20px] p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] z-50 flex flex-col gap-2.5 text-left border-zinc-800/80"
                  >
                    <div className="flex flex-col gap-1.5">
                      {/* Đăng ký tên miền miễn phí */}
                      <a
                        href="https://www.pavietnam.vn/en/ten-mien-mien-phi.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item flex items-center justify-between gap-3 text-xs text-zinc-400 hover:text-[#E63946] hover:bg-[#E63946]/5 px-3 py-2.5 border border-transparent hover:border-[#E63946]/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] select-none font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <Globe size={14} className="text-blue-400 group-hover/item:text-[#E63946] transition-colors" />
                          <span>Đăng ký tên miền miễn phí</span>
                        </div>
                        <ExternalLink size={12} className="text-zinc-500 group-hover/item:text-[#E63946] transition-colors" />
                      </a>

                      {/* Lấy mã 2FA */}
                      <a
                        href="https://2fa.co.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item flex items-center justify-between gap-3 text-xs text-zinc-400 hover:text-[#E63946] hover:bg-[#E63946]/5 px-3 py-2.5 border border-transparent hover:border-[#E63946]/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] select-none font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <Wrench size={14} className="text-amber-400 group-hover/item:text-[#E63946] transition-colors" />
                          <span>Lấy mã 2FA</span>
                        </div>
                        <ExternalLink size={12} className="text-zinc-500 group-hover/item:text-[#E63946] transition-colors" />
                      </a>

                      {/* Mail tạm thời */}
                      <a
                        href="https://temp-mail.org/vi/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item flex items-center justify-between gap-3 text-xs text-zinc-400 hover:text-[#E63946] hover:bg-[#E63946]/5 px-3 py-2.5 border border-transparent hover:border-[#E63946]/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] select-none font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-emerald-400 group-hover/item:text-[#E63946] transition-colors" />
                          <span>Mail tạm thời</span>
                        </div>
                        <ExternalLink size={12} className="text-zinc-500 group-hover/item:text-[#E63946] transition-colors" />
                      </a>

                      {/* Tạo QR Code */}
                      <a
                        href="https://qr-generator.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item flex items-center justify-between gap-3 text-xs text-zinc-400 hover:text-[#E63946] hover:bg-[#E63946]/5 px-3 py-2.5 border border-transparent hover:border-[#E63946]/20 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] select-none font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <QrCode size={14} className="text-purple-400 group-hover/item:text-[#E63946] transition-colors" />
                          <span>Tạo QR Code</span>
                        </div>
                        <ExternalLink size={12} className="text-zinc-500 group-hover/item:text-[#E63946] transition-colors" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span 
              onClick={() => navigateTo('download')} 
              className={getLinkClass('download')}
            >
              Tải App
            </span>
          </nav>

          {/* Right Layout Info Actions Row */}
          <div className="flex items-center gap-2 sm:gap-4 select-none">
            {/* Search Button Command palette style */}
            <button
              id="navbar-search-trigger-btn"
              onClick={onSearchOpen}
              className="p-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              title="Tìm kiếm phim..."
            >
              <Search size={20} />
            </button>

            {/* Bell Notifications */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer relative"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-brand)] rounded-full" />
                )}
              </button>
              
              {/* Notification Overlay Panel Dropdown list */}
              {notifOpen && (
                <div className="fixed md:absolute right-4 md:right-0 left-4 md:left-auto mt-2 w-auto md:w-80 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-4 shadow-2xl z-50 animate-scale-in text-left">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center justify-between border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-1.5">
                      <Flame size={14} className="text-[var(--color-brand)]" />
                      <span>Thông báo mới nhất</span>
                    </div>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-zinc-500 hover:text-[var(--color-brand)] transition-colors"
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </h4>
                  <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-xs text-zinc-500">
                        Không có thông báo mới nào
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            if (notif.slug) {
                              onNavigate(`phim/${notif.slug}`);
                            }
                            setNotifOpen(false);
                          }}
                          className="text-xs hover:bg-zinc-800/40 p-2 rounded-lg cursor-pointer transition-colors border-b border-zinc-900/40 last:border-0"
                        >
                          <p className="font-semibold text-white truncate">{notif.title}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">{notif.body}</p>
                          <p className="text-[9px] text-zinc-500 mt-1">{notif.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Public Movie Box Page Trigger with Dropdown / Login button */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="navbar-profile-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 pl-1 pr-2.5 border border-white/10 rounded-full hover:bg-white/5 transition-all text-left cursor-pointer group"
                >
                  <img
                    src={currentUser.photoURL || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=60&h=60&fit=crop&q=80"}
                    alt={currentUser.displayName || "Thành viên"}
                    className="w-7 h-7 rounded-full object-cover border border-[var(--color-brand)] shadow-[0_0_8px_rgba(230,57,70,0.3)]"
                  />
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors hidden sm:inline max-w-[80px] truncate">
                    {currentUser.displayName}
                  </span>
                  <ChevronDown size={12} className={`text-zinc-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu block */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#13131A] border border-zinc-900 rounded-[20px] shadow-2xl p-2 select-none z-50 text-left animate-scale-in">
                    <div className="flex items-center gap-2 p-2.5 border-b border-zinc-900/80 mb-1.5">
                      <img
                        src={currentUser.photoURL || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=60&h=60&fit=crop&q=80"}
                        alt={currentUser.displayName}
                        className="w-8 h-8 rounded-full object-cover border border-[var(--color-brand)]/50"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-white truncate max-w-[80px]" title={currentUser.displayName}>
                            {currentUser.displayName}
                          </p>
                          <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-[var(--color-brand)] text-white shrink-0">
                            {currentUser.plan || 'FREE'}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate" title={currentUser.email}>
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 text-xs">
                      <button
                        onClick={() => navigateTo('favorites')}
                        className="w-full text-left p-2 hover:bg-zinc-950 hover:text-[var(--color-brand)] rounded-lg text-zinc-300 font-bold tracking-wide transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Heart size={13} className="text-[#E63946] fill-[#E63946]" />
                        <span>Phim yêu thích</span>
                      </button>
                      <button
                        onClick={() => navigateTo('history')}
                        className="w-full text-left p-2 hover:bg-zinc-950 hover:text-[var(--color-brand)] rounded-lg text-zinc-300 font-bold tracking-wide transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Clock size={13} className="text-amber-400" />
                        <span>Lịch sử xem</span>
                      </button>
                      <button
                        onClick={() => navigateTo('tv')}
                        className="w-full text-left p-2 hover:bg-zinc-950 hover:text-[var(--color-brand)] rounded-lg text-zinc-300 font-bold tracking-wide transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Tv size={13} className="text-red-500" />
                        <span>TV Shows</span>
                      </button>
                      <button
                        onClick={() => navigateTo('membership')}
                        className="w-full text-left p-2 hover:bg-zinc-950 hover:text-[var(--color-brand)] rounded-lg text-zinc-300 font-bold tracking-wide transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Award size={13} className="text-orange-500" />
                        <span>Gói thành viên</span>
                      </button>
                      <button
                        onClick={() => navigateTo('settings')}
                        className="w-full text-left p-2 hover:bg-zinc-950 hover:text-[var(--color-brand)] rounded-lg text-zinc-300 font-bold tracking-wide transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Globe size={13} className="text-blue-400" />
                        <span>Giao diện</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          window.dispatchEvent(new Event('open-donation-modal'));
                        }}
                        className="w-full text-left p-2 hover:bg-zinc-950 hover:text-rose-400 rounded-lg text-zinc-300 font-bold tracking-wide transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Heart size={13} className="text-rose-400 fill-rose-400/20 animate-pulse" />
                        <span>Ủng hộ nhà phát triển</span>
                      </button>
                    </div>

                    <div className="border-t border-zinc-900/80 mt-1.5 pt-1 mb-0.5 text-xs">
                      <button
                        onClick={() => {
                          localStorage.removeItem('hb_user');
                          localStorage.setItem('bao_is_logged_in', 'false');
                          setCurrentUser(null);
                          setProfileDropdownOpen(false);
                          window.dispatchEvent(new Event('hb_user_updated'));
                          navigateTo('home');
                        }}
                        className="w-full text-left p-2 hover:bg-red-500/10 text-red-400 font-bold rounded-lg tracking-wide transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <X size={13} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* LOGGED OUT state: Beautiful Đăng nhập button */
              <button
                onClick={() => navigateTo('auth')}
                className="px-3.5 py-1.5 bg-[var(--color-brand)] hover:bg-[#C1121F] text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full transition-all shadow-md cursor-pointer flex items-center gap-1"
              >
                <User size={12} />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white rounded-full md:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Drawer Block Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-[#0A0A0F] z-40 md:hidden animate-fade-in p-6 overflow-y-auto flex flex-col gap-8 select-none">
          {/* Section Main route list */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase border-b border-zinc-900 pb-1 flex items-center gap-1.5">
              <Award size={12} /> DIỄN ĐÀN CHÍNH
            </h4>
            <span
              onClick={() => navigateTo('home')}
              className={`text-lg font-bold p-2 rounded-lg ${currentRoute === 'home' ? 'text-[var(--color-brand)] bg-zinc-900/40' : 'text-zinc-300'}`}
            >
              Trang Chủ
            </span>
            <span
              onClick={() => navigateTo('phim-le')}
              className={`text-lg font-bold p-2 rounded-lg ${currentRoute === 'phim-le' ? 'text-[var(--color-brand)] bg-zinc-900/40' : 'text-zinc-300'}`}
            >
              Phim Lẻ
            </span>
            <span
              onClick={() => navigateTo('phim-bo')}
              className={`text-lg font-bold p-2 rounded-lg ${currentRoute === 'phim-bo' ? 'text-[var(--color-brand)] bg-zinc-900/40' : 'text-zinc-300'}`}
            >
              Phim Bộ
            </span>
            <span
              onClick={() => navigateTo('tv')}
              className={`text-lg font-bold p-2 rounded-lg flex items-center justify-between ${currentRoute === 'tv' ? 'text-[var(--color-brand)] bg-zinc-900/40' : 'text-zinc-300'}`}
            >
              <span className="flex items-center gap-2">TV Shows</span>
              <span className="text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-600 text-white">HOT</span>
            </span>
            <span
              onClick={() => navigateTo('music')}
              className={`text-lg font-bold p-2 rounded-lg flex items-center justify-between ${currentRoute === 'music' ? 'text-[var(--color-brand)] bg-zinc-900/40' : 'text-zinc-300'}`}
            >
              <span className="flex items-center gap-2">Play Music</span>
              <span className="text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-emerald-600 text-white">FREE</span>
            </span>
            <span
              onClick={() => navigateTo('tro-choi')}
              className={`text-lg font-bold p-2 rounded-lg flex items-center justify-between ${currentRoute === 'tro-choi' ? 'text-[var(--color-brand)] bg-zinc-900/40' : 'text-zinc-300'}`}
            >
              <span className="flex items-center gap-2">Trò Chơi Phim</span>
              <span className="text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded bg-purple-600 text-white">NEW</span>
            </span>
            <span
              onClick={() => navigateTo('download')}
              className={`text-lg font-bold p-2 rounded-lg ${currentRoute === 'download' ? 'text-[var(--color-brand)] bg-zinc-900/40' : 'text-zinc-300'}`}
            >
              Tải App
            </span>
            <span
              onClick={() => navigateTo('tai-khoan')}
              className={`text-lg font-bold p-2 rounded-lg ${currentRoute === 'tai-khoan' ? 'text-[var(--color-brand)] bg-zinc-900/40' : 'text-zinc-300'}`}
            >
              Tủ Phim Cá Nhân
            </span>
          </div>

          {/* Section Utilities list */}
          <div className="flex flex-col gap-2">
            <h4 className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase border-b border-zinc-900 pb-1 flex items-center gap-1.5">
              <Wrench size={12} /> TIỆN ÍCH
            </h4>
            <div className="flex flex-col gap-2 mt-2">
              <a
                href="https://www.pavietnam.vn/en/ten-mien-mien-phi.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-zinc-900/30 border border-zinc-900/80 rounded-xl hover:text-white"
              >
                <div className="flex items-center gap-2.5 text-xs text-zinc-350 font-bold">
                  <Globe size={14} className="text-blue-400" />
                  <span>Đăng ký tên miền miễn phí</span>
                </div>
                <ExternalLink size={12} className="text-zinc-500" />
              </a>

              <a
                href="https://2fa.co.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-zinc-900/30 border border-zinc-900/80 rounded-xl hover:text-white"
              >
                <div className="flex items-center gap-2.5 text-xs text-zinc-350 font-bold">
                  <Wrench size={14} className="text-amber-400" />
                  <span>Lấy mã 2FA</span>
                </div>
                <ExternalLink size={12} className="text-zinc-500" />
              </a>

              <a
                href="https://temp-mail.org/vi/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-zinc-900/30 border border-zinc-900/80 rounded-xl hover:text-white"
              >
                <div className="flex items-center gap-2.5 text-xs text-zinc-350 font-bold">
                  <Mail size={14} className="text-emerald-400" />
                  <span>Mail tạm thời</span>
                </div>
                <ExternalLink size={12} className="text-zinc-500" />
              </a>

              <a
                href="https://qr-generator.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 bg-zinc-900/30 border border-zinc-900/80 rounded-xl hover:text-white"
              >
                <div className="flex items-center gap-2.5 text-xs text-zinc-350 font-bold">
                  <QrCode size={14} className="text-purple-400" />
                  <span>Tạo QR Code</span>
                </div>
                <ExternalLink size={12} className="text-zinc-500" />
              </a>
            </div>
          </div>

          {/* Section Category mapping list */}
          <div className="flex flex-col gap-2">
            <h4 className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase border-b border-zinc-900 pb-1 flex items-center gap-1.5">
              <Award size={12} /> THỂ LOẠI PHỔ BIẾN
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {MOCK_CATEGORIES.map(cat => (
                <span
                  key={cat.id}
                  onClick={() => navigateTo(`the-loai/${cat.slug}`)}
                  className="text-xs text-zinc-400 p-2 bg-zinc-900/30 border border-zinc-900 rounded-lg hover:text-white"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          {/* Section Countries list */}
          <div className="flex flex-col gap-2 pb-16">
            <h4 className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase border-b border-zinc-900 pb-1 flex items-center gap-1.5">
              <Globe size={12} /> QUỐC GIA
            </h4>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {MOCK_COUNTRIES.map(num => {
                return (
                  <span
                    key={num.id}
                    onClick={() => navigateTo(`quoc-gia/${num.slug}`)}
                    className="text-xs text-zinc-400 p-2.5 bg-zinc-900/30 border border-zinc-900 rounded-xl hover:text-white flex items-center gap-2 hover:bg-zinc-900/60 transition-all cursor-pointer"
                  >
                    <span>{num.name}</span>
                  </span>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </>
  );
}

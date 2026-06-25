import { useState, useEffect } from 'react';
import { Search, Bell, Menu, X, ChevronDown, Film, Globe, Heart, User, Award, Flame } from 'lucide-react';
import { Category, Country } from '../types/movie';
import { MOCK_CATEGORIES, MOCK_COUNTRIES } from '../data/mockMovies';
import { useUserPreferences } from '../lib/hooks/useUserPreferences';

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
  };

  const getLinkClass = (pattern: string) => {
    const isActive = currentRoute === pattern || currentRoute.startsWith(pattern + '/');
    return `relative font-medium py-2 transition-all duration-200 cursor-pointer ${
      isActive 
        ? 'text-[var(--color-brand)] font-semibold' 
        : 'text-zinc-300 hover:text-white'
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

          {/* Desktop Navigation Links Menu */}
          <nav className="hidden md:flex items-center gap-8 select-none">
            <span 
              onClick={() => navigateTo('home')} 
              className={getLinkClass('home')}
            >
              Trang Chủ
              {currentRoute === 'home' && (
                <span className="absolute bottom-[-4px] left-0 right-0 h-[2.5px] bg-[var(--color-brand)] rounded-full" />
              )}
            </span>

            {/* Thể loại dropdown tag */}
            <div 
              className="relative"
              onMouseEnter={() => { setGenreOpen(true); setCountryOpen(false); }}
              onMouseLeave={() => setGenreOpen(false)}
            >
              <button
                id="navbar-genre-dropdown-btn"
                onClick={() => setGenreOpen(!genreOpen)}
                className="flex items-center gap-1 text-zinc-300 hover:text-white py-2 font-medium cursor-pointer transition-colors"
              >
                <span>Thể Loại</span>
                <ChevronDown size={14} className={`transform transition-transform ${genreOpen ? 'rotate-180' : ''}`} />
              </button>

              {genreOpen && (
                <div 
                  className="absolute top-full left-[-120px] md:left-[-180px] mt-2.5 w-[420px] md:w-[480px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-900 rounded-[20px] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] animate-scale-in z-50 flex flex-col gap-4 text-left border-zinc-800/80"
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
                            🔥 {popularName}
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
                </div>
              )}
            </div>

            {/* Quốc gia dropdown tag */}
            <div 
              className="relative"
              onMouseEnter={() => { setCountryOpen(true); setGenreOpen(false); }}
              onMouseLeave={() => setCountryOpen(false)}
            >
              <button
                id="navbar-country-dropdown-btn"
                onClick={() => setCountryOpen(!countryOpen)}
                className="flex items-center gap-1 text-zinc-300 hover:text-white py-2 font-medium cursor-pointer transition-colors"
              >
                <span>Quốc Gia</span>
                <ChevronDown size={14} className={`transform transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
              </button>

              {countryOpen && (
                <div 
                  className="absolute top-full left-[-30px] mt-2.5 w-56 bg-zinc-950/95 backdrop-blur-xl border border-zinc-900 rounded-[20px] p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.9)] animate-scale-in z-50 flex flex-col gap-1 text-left border-zinc-800/80"
                >
                  <div className="flex flex-col gap-1.5">
                    {MOCK_COUNTRIES.map(c => {
                      const flag = getCountryFlag(c.slug);
                      return (
                        <span
                          key={c.id}
                          onClick={() => navigateTo(`quoc-gia/${c.slug}`)}
                          className="group/item flex items-center gap-3 text-xs text-zinc-400 hover:text-[#E63946] hover:bg-zinc-900/40 px-3 py-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:translate-x-0.5 select-none font-medium"
                        >
                          <span className="text-base group-hover/item:scale-125 transition-transform duration-300">{flag}</span>
                          <span>{c.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
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
            <div className="relative group">
              <button className="p-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-brand)] rounded-full animate-ping" />
              </button>
              
              {/* Notification Overlay Panel Dropdown list on hover */}
              <div className="absolute right-0 mt-1 w-80 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-4 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                  <Flame size={14} className="text-[var(--color-brand)]" />
                  Thông báo mới nhất
                </h4>
                <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto">
                  <div className="text-xs hover:bg-zinc-800/40 p-2 rounded-lg cursor-pointer transition-colors">
                    <p className="font-semibold text-white">🔥 Siêu kinh điển Dune: Phần 2</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Vừa được phát sóng bản FHD Vietsub độ phân giải cao!</p>
                  </div>
                  <div className="text-xs hover:bg-zinc-800/40 p-2 rounded-lg cursor-pointer transition-colors">
                    <p className="font-semibold text-white">🎬 Wednesday có cập nhật</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Học viện Nevermore mở rộng tập phim mới trọn bộ!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Public Movie Box Page Trigger */}
            <button
              id="navbar-profile-btn"
              onClick={() => navigateTo('tai-khoan')}
              className="flex items-center gap-2 p-1 pl-1 pr-3 border border-white/10 rounded-full hover:bg-white/5 transition-all text-left cursor-pointer group"
            >
              <img
                src={preferences.avatarUrl || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=60&h=60&fit=crop&q=80"}
                alt={preferences.userName || "Khách"}
                className="w-8 h-8 rounded-full object-cover border border-[var(--color-brand)] shadow-[0_0_8px_rgba(230,57,70,0.3)]"
              />
              <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors hidden sm:inline">
                {preferences.userName ? `${preferences.userName}` : "Tủ Phim"}
              </span>
            </button>

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
              onClick={() => navigateTo('tai-khoan')}
              className={`text-lg font-bold p-2 rounded-lg ${currentRoute === 'tai-khoan' ? 'text-[var(--color-brand)] bg-zinc-900/40' : 'text-zinc-300'}`}
            >
              Tủ Phim Cá Nhân
            </span>
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
                const flag = getCountryFlag(num.slug);
                return (
                  <span
                    key={num.id}
                    onClick={() => navigateTo(`quoc-gia/${num.slug}`)}
                    className="text-xs text-zinc-400 p-2.5 bg-zinc-900/30 border border-zinc-900 rounded-xl hover:text-white flex items-center gap-2 hover:bg-zinc-900/60 transition-all cursor-pointer"
                  >
                    <span>{flag}</span>
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

import React, { useState, useEffect } from 'react';
import { useWatchlist } from '../lib/hooks/useWatchlist';
import { useWatchHistory } from '../lib/hooks/useWatchHistory';
import { useUserPreferences } from '../lib/hooks/useUserPreferences';
import MovieCard from '../components/MovieCard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Film, Clock, Heart, Save, CheckCircle, 
  Trash2, HelpCircle, Eye, Settings, RefreshCw, Languages, Zap, Play,
  Lock, Shield, Smartphone, Monitor, Check, Plus, LogOut, ChevronRight,
  Bell, EyeOff, Key, Sparkles, Laptop, Tv, X
} from 'lucide-react';

interface ProfileScreenProps {
  onNavigateToMoveDetail: (slug: string) => void;
  onNavigateToWatch: (slug: string, episodeSlug?: string) => void;
  onLogout?: () => void;
  initialTab?: 'overview' | 'security' | 'history' | 'watchlist' | 'vip' | 'settings';
}

// Predefined premium cinematic avatars
const PREMIUM_AVATARS = [
  'https://i.pinimg.com/564x/2d/c4/62/2dc4625b1ca1b61b0c950a7c413e61c5.jpg',
  'https://i.pinimg.com/564x/41/50/66/415066e4a64fc9cc804c7c10b77b789a.jpg',
  'https://i.pinimg.com/564x/78/34/00/7834005cf65c36399992d9b62efb6d34.jpg',
  'https://i.pinimg.com/564x/8a/83/7d/8a837d57fdf8b39a31a982cb99b80261.jpg',
  'https://i.pinimg.com/564x/ef/69/27/ef6927bf7c43c68dfb7e7195f1f0da74.jpg',
  'https://i.pinimg.com/564x/4b/32/79/4b327918a09f8c6eb53e0ecf79df0721.jpg',
  'https://i.pinimg.com/564x/f3/04/b5/f304b57422f5f6e80b29ff643c5b8b92.jpg',
  'https://i.pinimg.com/564x/0f/22/e7/0f22e70df4442df157e1df230235a9d8.jpg',
  'https://i.pinimg.com/564x/93/29/4a/93294adc7f34c2084c8a514d8095d2c0.jpg',
  'https://i.pinimg.com/564x/b8/b5/fa/b8b5fa4bcf08bfa0de5b8e967a3a99cc.jpg',
  'https://i.pinimg.com/564x/12/38/a3/1238a39626359f1f0e21a48c4cf318df.jpg',
  'https://i.pinimg.com/564x/bc/65/c5/bc65c5c00a9fa9cd4e1da74d32e92c28.jpg',
  'https://i.pinimg.com/564x/a4/09/b3/a409b307eb236058079df9d8b7b251fc.jpg',
  'https://i.pinimg.com/564x/dd/8e/bc/dd8ebc46a67f1bf249d95f8c6cd79eb3.jpg',
  'https://i.pinimg.com/564x/37/8b/44/378b44ec065b210e75a6c374668b1ee3.jpg',
  'https://i.pinimg.com/564x/be/94/cb/be94cbbf8dd76bc7e4c70d473ff7a187.jpg',
  'https://i.pinimg.com/564x/87/40/f3/8740f326a0b22a611be2b4be7fa838ff.jpg',
  'https://i.pinimg.com/564x/f7/55/aa/f755aa8f0470ff456e7f1d431057df7a.jpg',
  'https://i.pinimg.com/564x/92/7d/51/927d519d08e068f000b95543c51ffcf1.jpg',
  'https://i.pinimg.com/564x/6c/fb/9f/6cfb9f61b0ef6e3fc920a02ef2fa2a02.jpg'
];

export default function ProfileScreen({ onNavigateToMoveDetail, onNavigateToWatch, onLogout, initialTab }: ProfileScreenProps) {
  const { watchlist, clearWatchlist } = useWatchlist();
  const { history, removeFromHistory, clearHistory } = useWatchHistory();
  const { preferences, updatePreferences } = useUserPreferences();
  
  // High-fidelity tab management
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'history' | 'watchlist' | 'vip' | 'settings'>(
    initialTab || 'overview'
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [isTabLoading, setIsTabLoading] = useState(false);
  
  // Custom toast notification states
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Avatar Picker states
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  
  // Security Form inputs
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // VIP active states - Free, Premium, or Ultra
  const [vipTier, setVipTier] = useState<'free' | 'premium' | 'ultra'>(() => {
    return (localStorage.getItem('filmflow_vip_tier') as 'free' | 'premium' | 'ultra') || 'free';
  });

  const updateVipTier = (tier: 'free' | 'premium' | 'ultra') => {
    setVipTier(tier);
    localStorage.setItem('filmflow_vip_tier', tier);
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    const handleStorageSync = () => {
      const saved = localStorage.getItem('filmflow_vip_tier');
      if (saved === 'free' || saved === 'premium' || saved === 'ultra') {
        setVipTier(saved as 'free' | 'premium' | 'ultra');
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);
  
  // Custom interface settings
  const [appearance, setAppearance] = useState<'dark' | 'light' | 'auto'>(preferences.theme || 'dark');

  useEffect(() => {
    if (preferences.theme) {
      setAppearance(preferences.theme);
    }
  }, [preferences.theme]);
  const [notifNewMovies, setNotifNewMovies] = useState(true);
  const [notifPromos, setNotifPromos] = useState(false);
  const [notifSecurity, setNotifSecurity] = useState(true);
  const [isAdminBannerDisabled, setIsAdminBannerDisabled] = useState(() => {
    return localStorage.getItem('bao_desktop_banner_admin_disabled') === 'true';
  });

  // Trigger loading state for seamless slick streaming feel when switching tabs
  const handleTabChange = (tab: typeof activeTab) => {
    setIsTabLoading(true);
    setActiveTab(tab);
    
    // Synchronize browser location hash with current tab
    if (tab === 'overview') window.location.hash = '#/tai-khoan';
    else if (tab === 'watchlist') window.location.hash = '#/favorites';
    else if (tab === 'history') window.location.hash = '#/history';
    else if (tab === 'vip') window.location.hash = '#/membership';
    else if (tab === 'security') window.location.hash = '#/security';
    else if (tab === 'settings') window.location.hash = '#/settings';

    const timer = setTimeout(() => {
      setIsTabLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 2500);
    return () => clearTimeout(timer);
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      triggerToast('Vui lòng điền đầy đủ thông tin mật khẩu!');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast('Mật khẩu mới không trùng khớp!');
      return;
    }
    triggerToast('Thay đổi mật khẩu tài khoản thành công!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const calculateHoursPlayed = () => {
    const totalSeconds = history.reduce((acc, curr) => acc + (curr.currentTime || 0), 0);
    const mins = Math.ceil(totalSeconds / 60);
    return mins > 0 ? `${mins} phút` : '120 phút';
  };

  // Dynamic session tracking
  const [connectedDevices, setConnectedDevices] = useState([
    { id: 'dev-1', type: 'laptop', name: 'Đang tải thiết bị...', location: 'Đang xác định IP...', lastActive: 'Đang hoạt động', current: true },
    { id: 'dev-2', type: 'smartphone', name: 'iPhone 15 Pro Max', location: 'Hà Nội, Việt Nam', lastActive: '2 giờ trước', current: false },
    { id: 'dev-3', type: 'tv', name: 'Sony Bravia OLED 4K', location: 'Hải Phòng, Việt Nam', lastActive: '3 ngày trước', current: false },
  ]);

  const [loginHistory, setLoginHistory] = useState([
    { time: '22:14, Hôm nay', device: 'Chrome (macOS)', ip: '14.226.21.90', status: 'Hà Nội • OK' },
    { time: '14:32, Hôm qua', device: 'Safari Mobile (iOS)', ip: '14.226.73.11', status: 'Hà Nội • OK' },
    { time: '10:15, 20/06/2026', device: 'WebOS Sony TV App', ip: '113.161.42.19', status: 'Hải Phòng • OK' }
  ]);

  useEffect(() => {
    const detectClientInfo = async () => {
      const ua = navigator.userAgent;
      
      // 1. OS Info
      let os = 'Máy tính';
      if (ua.indexOf('Mac') !== -1) os = 'macOS';
      else if (ua.indexOf('Win') !== -1) os = 'Windows';
      else if (ua.indexOf('Linux') !== -1) os = 'Linux';
      else if (ua.indexOf('Android') !== -1) os = 'Android';
      else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS';

      // 2. Browser Info
      let browser = 'Chrome';
      if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
      else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
      else if (ua.indexOf('Edg') !== -1) browser = 'Edge';

      const deviceType = (os === 'iOS' || os === 'Android') ? 'smartphone' : 'laptop';
      const deviceModel = os === 'macOS' ? 'Apple MacBook' : os === 'iOS' ? 'Apple iPhone' : os === 'Windows' ? 'PC Windows' : 'Thiết bị người dùng';
      const fullDeviceName = `${deviceModel} (${browser})`;

      let ip = '14.226.21.90';
      let locationCity = 'Hà Nội';
      let fullLocation = 'Hà Nội, Việt Nam';

      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.ip) ip = data.ip;
          if (data.city) {
            locationCity = data.city;
            fullLocation = `${data.city}, ${data.country_name || 'Việt Nam'}`;
          }
        }
      } catch (err) {
        console.warn('Failed to parse connection metadata, utilizing mock location.', err);
      }

      setConnectedDevices([
        {
          id: 'dev-1',
          type: deviceType,
          name: fullDeviceName,
          location: fullLocation,
          lastActive: `Đang hoạt động IP: ${ip}`,
          current: true
        },
        { id: 'dev-2', type: 'smartphone', name: 'iPhone 15 Pro Max', location: 'Hà Nội, Việt Nam', lastActive: '2 giờ trước', current: false },
        { id: 'dev-3', type: 'tv', name: 'Sony Bravia OLED 4K', location: 'Hải Phòng, Việt Nam', lastActive: '3 ngày trước', current: false },
      ]);

      setLoginHistory([
        {
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', Hôm nay',
          device: `${browser} (${os})`,
          ip: ip,
          status: `${locationCity} • OK`
        },
        {
          time: '14:32, Hôm qua',
          device: os === 'iOS' ? 'Chrome (macOS)' : 'Safari Mobile (iOS)',
          ip: ip.replace(/\.\d+$/, '.152'),
          status: `${locationCity} • OK`
        },
        {
          time: '10:15, 20/06/2026',
          device: 'WebOS Sony TV App',
          ip: '113.161.42.19',
          status: 'Hải Phòng • OK'
        }
      ]);
    };

    detectClientInfo();
  }, []);

  const handleDisconnectDevice = (id: string, name: string) => {
    setConnectedDevices(prev => prev.filter(d => d.id !== id));
    triggerToast(`Đã ngắt kết nối thiết bị ${name}`);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0F] text-white pt-24 pb-20 select-none font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Modern Toast Floating Panel */}
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-8 right-8 z-[999] p-4 px-6 rounded-2xl bg-[#161622]/95 border border-emerald-500/30 text-emerald-400 shadow-2xl flex items-center gap-3 text-sm font-semibold backdrop-blur-xl"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle size={16} />
              </div>
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. COMPACT PREMIUM PROFILE CARD */}
        <div className="relative rounded-[24px] bg-[#12121A]/40 border border-[#2A2A3A]/40 p-6 sm:p-8 backdrop-blur-md select-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row items-center justify-between gap-6 mb-10 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-brand)]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 z-10 w-full lg:w-auto">
            {/* Interactive Portrait Ring based on vipTier */}
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
              <img
                src={preferences.avatarUrl || PREMIUM_AVATARS[0]}
                alt={preferences.userName}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 transition-all duration-300 ${
                  vipTier === 'ultra' 
                    ? 'ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse' 
                    : vipTier === 'premium' 
                    ? 'ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                    : 'ring-zinc-600'
                }`}
              />
              <div className="absolute inset-0 rounded-full bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-black tracking-widest text-white transition-opacity duration-300 uppercase">
                Thay ảnh
              </div>
              
              {/* Dynamic Subscription Badge */}
              <span className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white border shadow-md whitespace-nowrap ${
                vipTier === 'ultra'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400'
                  : vipTier === 'premium'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-400'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}>
                {vipTier === 'ultra' ? 'Ultra 4K 👑' : vipTier === 'premium' ? 'Premium 2K' : 'Free Member'}
              </span>
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[9px] font-extrabold text-[#E63946] uppercase tracking-widest bg-[#E63946]/10 border border-[#E63946]/20 rounded-full px-2.5 py-0.5">
                  TỦ PHIM CỦA BẠN
                </span>
                <span className="text-[10px] font-bold text-zinc-400">
                  {vipTier === 'ultra' ? 'Đã kích hoạt Demo VIP Ultra 4K cao cấp' : vipTier === 'premium' ? 'Đã mở khóa chất lượng Premium 1080p/2K' : 'Đang sử dụng gói xem phim thường 720p'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 flex items-center justify-center sm:justify-start gap-2">
                {preferences.userName || 'Phim Thủ'}
                {vipTier !== 'free' && <Sparkles size={18} className="text-amber-400 animate-pulse fill-amber-400/20" />}
              </h1>
              <p className="text-xs text-zinc-500 font-medium mt-1">Lưu trữ tất cả danh mục yêu thích và lịch sử xem tiện lợi</p>
            </div>
          </div>

          {/* Minimal Bento Statistics Panel */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-black/30 w-full lg:w-auto p-4 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner z-10">
            <div className="text-center px-2 sm:px-4">
              <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block">Yêu thích</span>
              <strong className="text-xl sm:text-2xl font-black text-white block mt-0.5">{watchlist.length}</strong>
            </div>
            <div className="text-center px-4 border-x border-white/5">
              <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block">Lịch sử</span>
              <strong className="text-xl sm:text-2xl font-black text-emerald-400 block mt-0.5">{history.length}</strong>
            </div>
            <div className="text-center px-2 sm:px-4">
              <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block">Thời lượng</span>
              <strong className="text-xs sm:text-sm font-black text-amber-400 block mt-2.5 truncate max-w-[80px] mx-auto">{calculateHoursPlayed()}</strong>
            </div>
          </div>
        </div>

        {/* 2. AVATAR PICKER POPUP/ROW */}
        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#12121A]/70 border border-zinc-800 p-6 rounded-[24px] mb-8 overflow-hidden backdrop-blur-md shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4 mb-5">
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-[#E63946] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" /> BỘ SƯU TẬP AVATAR ANIME CHẤT LƯỢNG CAO ({PREMIUM_AVATARS.length})
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">Đa dạng mẫu mã vẽ tay thiết kế độc quyền, chọn ngay để làm đẹp trang cá nhân của bạn.</p>
                </div>
                <button 
                  onClick={() => setShowAvatarPicker(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Đóng thư viện
                </button>
              </div>



              {/* Scrollable grid for 60 programmatic avatars */}
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3.5 max-h-[280px] overflow-y-auto pr-1 no-scrollbar p-1">
                {PREMIUM_AVATARS.map((url, i) => {
                  const isCurrent = preferences.avatarUrl === url || (!preferences.avatarUrl && i === 0);
                  return (
                    <div 
                      key={i} 
                      className="relative group cursor-pointer aspect-square" 
                      onClick={() => {
                        updatePreferences({ avatarUrl: url });
                        triggerToast('Đã thay đổi ảnh đại diện mới.');
                      }}
                    >
                      <img 
                        src={url} 
                        alt={`Avatar choice ${i}`} 
                        className={`w-full h-full rounded-2xl object-cover ring-2 transition-all duration-300 ${isCurrent ? 'ring-[var(--color-brand)] pointer-events-none scale-95 shadow-[0_0_15px_rgba(230,57,70,0.3)]' : 'ring-transparent hover:ring-white/40 hover:scale-105'}`}
                        referrerPolicy="no-referrer"
                      />
                      {isCurrent && (
                        <span className="absolute -bottom-1 -right-1 bg-[var(--color-brand)] p-0.5 rounded-full text-white shadow-lg border border-zinc-950">
                          <Check size={8} />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. COHESIVE STREAMING CONTROL CENTER FRAMEWORK (Left sidebar grid layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT INTERACTIVE SIDEBAR - STYLISH NAV */}
          <div className="lg:col-span-3 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 scrollbar-none border-b lg:border-none border-white/5 scroll-smooth col-span-12">
            
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full ${activeTab === 'overview' ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/10 scale-[1.03]' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <User size={16} />
              <span>Tổng quan</span>
            </button>

            <button
              onClick={() => handleTabChange('vip')}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full ${activeTab === 'vip' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10 scale-[1.03]' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Sparkles size={16} />
              <span>Gói Thành Viên</span>
            </button>

            <button
              onClick={() => window.location.hash = '#/tv'}
              className="flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full bg-transparent text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <Tv size={16} className="text-[#E63946]" />
              <span>Kênh TV Live (IPTV)</span>
            </button>

            <button
              onClick={() => handleTabChange('watchlist')}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full ${activeTab === 'watchlist' ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/10 scale-[1.03]' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Heart size={16} />
              <span>Yêu thích ({watchlist.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('history')}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full ${activeTab === 'history' ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/10 scale-[1.03]' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Clock size={16} />
              <span>Lịch sử xem ({history.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('security')}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full ${activeTab === 'security' ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/10 scale-[1.03]' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Shield size={16} />
              <span>Bảo mật & Thiết bị</span>
            </button>

            <button
              onClick={() => handleTabChange('settings')}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full ${activeTab === 'settings' ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/10 scale-[1.03]' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Settings size={16} />
              <span>Cài đặt</span>
            </button>
          </div>

          {/* RIGHT VIEWING MODULE - CONTENT AREA WITH SKELETON OPTIONS */}
          <div className="lg:col-span-9 min-h-[460px]">
            {isTabLoading ? (
              /* PREMIUM SKELETON LOADER STATE */
              <div className="flex flex-col gap-6 animate-pulse select-none">
                <div className="h-10 bg-white/5 rounded-xl w-1/3" />
                <div className="h-32 bg-white/5 rounded-[24px]" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="h-44 bg-white/5 rounded-[20px]" />
                  <div className="h-44 bg-white/5 rounded-[20px]" />
                  <div className="h-44 bg-white/5 rounded-[20px]" />
                </div>
              </div>
            ) : (
              /* CONTENT SWITCHES */
              <div className="animate-fade-in">
                
                {/* 3A. TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="flex flex-col gap-6">
                    <div className="border-b border-white/5 pb-3">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">TỔNG QUAN TÀI KHOẢN</h2>
                      <p className="text-xs text-zinc-500 mt-1">Thông tin chi tiết về hoạt động tài khoản và thiết bị liên đới.</p>
                    </div>

                    {/* Member Plan Indicator Banner */}
                    <div className={`p-6 rounded-[24px] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      vipTier === 'ultra' 
                        ? 'bg-gradient-to-r from-amber-500/10 to-[#0A0A0F] border-amber-500/20' 
                        : vipTier === 'premium'
                        ? 'bg-gradient-to-r from-purple-500/10 to-[#0A0A0F] border-purple-500/20'
                        : 'bg-gradient-to-r from-zinc-800/10 to-[#0A0A0F] border-zinc-800/40'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                            vipTier === 'ultra' ? 'bg-amber-400' : vipTier === 'premium' ? 'bg-purple-400' : 'bg-zinc-500'
                          }`} />
                          <h3 className={`text-sm font-black tracking-wide uppercase ${
                            vipTier === 'ultra' ? 'text-amber-400' : vipTier === 'premium' ? 'text-purple-400' : 'text-zinc-400'
                          }`}>
                            {vipTier === 'ultra' ? 'SIÊU GÓI ĐỈNH CAO ULTRA 4K (VIP ACTIVE)' : vipTier === 'premium' ? 'GÓI CAO CẤP PREMIUM 1080P/2K (ACTIVE)' : 'GÓI MIỄN PHÍ TRẢI NGHIỆM (FREE MEMBER)'}
                          </h3>
                        </div>
                        <p className="text-xs text-zinc-400 max-w-md">
                          {vipTier === 'ultra'
                            ? 'Mở khóa toàn bộ đặc quyền cực đại: Phát phim Ultra 4K không nén, âm thanh vòm Dolby Cinema rạp chiếu thính.'
                            : vipTier === 'premium'
                            ? 'Trải nghiệm chuẩn điện ảnh cao cấp: Hỗ trợ độ nét tối đa 1080p Full HD và 2K siêu nét, không quảng cáo.'
                            : 'Băng thông tiêu chuẩn rạp, giới hạn chất lượng phát tối đa 720p HD. Nâng cấp ngay để mở khóa chất lượng điện ảnh cao cấp.'}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleTabChange('vip')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 self-start sm:self-center cursor-pointer ${
                          vipTier === 'ultra'
                            ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/10'
                            : vipTier === 'premium'
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                      >
                        {vipTier === 'free' ? 'Nâng cấp Gói VIP' : 'Quản lý hội viên'}
                      </button>
                    </div>

                    {/* Personal Details info grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[#12121A]/30 border border-white/5 p-5 rounded-[20px]">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Thông Tin Liên Hệ</h4>
                        <div className="flex flex-col gap-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Tên rạp cá nhân:</span>
                            <span className="font-bold text-white">{preferences.userName}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Email đã đăng ký:</span>
                            <span className="font-bold text-white">lehuybao17112007@gmail.com</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Mã UID:</span>
                            <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-zinc-400 text-[10px]">#HB-831920-FS</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#12121A]/30 border border-white/5 p-5 rounded-[20px]">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Hiệu Suất Phát</h4>
                        <div className="flex flex-col gap-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Mặc định truyền:</span>
                            <span className="font-bold text-white text-[10px] uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Tự Động Phát</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Độ phân giải yêu thích:</span>
                            <span className="font-mono font-bold text-amber-400">Max Full HD+</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500">Tỉ lệ tiếp theo:</span>
                            <span className="font-bold text-zinc-400 text-[11px]">{preferences.autoplay ? 'Khi Kết thúc tập' : 'Dừng tay hướng dẫn'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CONNECTED DEVICES WITH STATUS */}
                    <div className="bg-[#12121A]/30 border border-white/5 p-5 rounded-[24px] mt-2">
                      <h3 className="text-sm font-extrabold text-white tracking-tight mb-4 flex items-center gap-2">
                        <Smartphone size={16} className="text-[#E63946]" />
                        Thiết bị có quyền truy cập ({connectedDevices.length})
                      </h3>
                      <div className="flex flex-col gap-4">
                        {connectedDevices.map((dev) => (
                          <div key={dev.id} className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="p-3 bg-black/40 rounded-xl text-zinc-400">
                                {dev.type === 'laptop' ? <Laptop size={18} /> : dev.type === 'tv' ? <Tv size={18} /> : <Smartphone size={18} />}
                              </div>
                              <div className="min-w-0 text-left">
                                <h4 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                                  {dev.name}
                                  {dev.current && (
                                    <span className="text-[8px] uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded-full font-black">Hiện tại</span>
                                  )}
                                </h4>
                                <p className="text-[11px] text-zinc-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                                  <span>{dev.location}</span>
                                  <span>•</span>
                                  <span className={dev.current ? 'text-emerald-400' : 'text-zinc-500'}>{dev.lastActive}</span>
                                </p>
                              </div>
                            </div>
                            
                            {!dev.current && (
                              <button
                                onClick={() => handleDisconnectDevice(dev.id, dev.name)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl transition-all cursor-pointer pl-3 pr-3"
                              >
                                Đăng xuất
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RECENT LOGIN SESSIONS */}
                    <div className="bg-[#12121A]/30 border border-white/5 p-5 rounded-[24px]">
                      <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Lịch sử hoạt động đăng nhập</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-zinc-400 font-medium">
                          <thead>
                            <tr className="border-b border-white/5 text-[10px] uppercase font-bold text-zinc-500">
                              <th className="pb-2.5">Thời gian</th>
                              <th className="pb-2.5">Trình duyệt/Thiết bị</th>
                              <th className="pb-2.5">Địa chỉ IP</th>
                              <th className="pb-2.5 text-right">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {loginHistory.map((item, idx) => (
                              <tr key={idx}>
                                <td className="py-2.5 text-zinc-300 font-bold">{item.time}</td>
                                <td className="py-2.5">{item.device}</td>
                                <td className="py-2.5 font-mono">{item.ip}</td>
                                <td className="py-2.5 text-emerald-400 text-right font-bold">{item.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )}

                {/* 3B. TAB: WATCHLIST */}
                {activeTab === 'watchlist' && (
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">DANH SÁCH YÊU THÍCH</h2>
                        <p className="text-xs text-zinc-500 mt-1">Nơi lưu những phim chờ xem đỉnh cao của riêng bạn.</p>
                      </div>
                      {watchlist.length > 0 && (
                        <button 
                          onClick={() => { clearWatchlist(); triggerToast('Đã dọn dẹp danh sách watchlist.'); }}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 font-bold bg-red-500/10 px-3.5 py-2 rounded-xl border border-red-500/15 cursor-pointer"
                        >
                          <Trash2 size={13} /> Xóa tất cả
                        </button>
                      )}
                    </div>

                    {watchlist.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/5 rounded-[24px] gap-4">
                        <div className="p-4 rounded-full bg-white/5 border border-white/5 text-zinc-500">
                          <Heart size={28} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-400">Danh sách Watchlist của bạn còn trống</h4>
                          <p className="text-xs text-zinc-650 mt-1 max-w-sm mx-auto">Khám phá kho phim rạp tuyệt đẹp tại trang chủ và bấm "Danh Sách" để thêm phim vào đây nhé.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {watchlist.map(item => (
                          <div key={item.slug} className="group relative">
                            <MovieCard
                              movie={item}
                              onClick={() => onNavigateToMoveDetail(item.slug)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3C. TAB: HISTORY / TIMELINE */}
                {activeTab === 'history' && (
                  <div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-6">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">TIẾN TRÌNH XEM GẦN ĐÂY</h2>
                        <p className="text-xs text-zinc-500 mt-1">Lưu trữ lịch sử, giúp bạn phát nhanh tập phim đang bỏ dở.</p>
                      </div>
                      {history.length > 0 && (
                        <button 
                          onClick={() => { clearHistory(); triggerToast('Đã dọn sạch vết lịch sử.'); }}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 font-bold bg-red-500/10 px-3.5 py-2 rounded-xl border border-red-500/15 cursor-pointer"
                        >
                          <Trash2 size={13} /> Xóa lịch sử
                        </button>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/5 rounded-[24px] gap-4">
                        <div className="p-4 rounded-full bg-white/5 border border-white/5 text-zinc-500">
                          <Clock size={28} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-400">Không tìm thấy lịch sử xem gần đây</h4>
                          <p className="text-xs text-zinc-650 mt-1 max-w-sm mx-auto">Bấm mở bất cứ bộ phim nào để bắt đầu lưu trữ tiến trình nhé.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {history.map((record) => (
                          <div 
                            key={record.movieSlug} 
                            className="flex items-center justify-between gap-4 p-4 rounded-[20px] bg-[#12121A]/45 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 shadow-md group"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <img 
                                src={record.posterUrl} 
                                alt={record.movieName}
                                className="w-12 h-16 object-cover rounded-xl shadow-lg border border-white/5 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0 text-left">
                                <h4 
                                  onClick={() => onNavigateToMoveDetail(record.movieSlug)}
                                  className="text-xs sm:text-sm font-black text-white hover:text-[var(--color-brand)] transition-colors cursor-pointer truncate"
                                >
                                  {record.movieName}
                                </h4>
                                <p className="text-[10px] text-zinc-500 mt-1 font-medium">
                                  Tập {record.episodeName} • {new Date(record.watchedAt).toLocaleDateString()}
                                </p>
                                
                                {/* Timeline mini bar */}
                                <div className="flex items-center gap-1.5 mt-2 w-32 sm:w-44">
                                  <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                                    <div 
                                      className="h-full bg-[var(--color-brand)]"
                                      style={{ width: `${record.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-[9px] font-mono font-bold text-zinc-500">{record.progress}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => onNavigateToWatch(record.movieSlug, record.episodeSlug)}
                                className="flex items-center justify-center gap-1.5 p-2 px-3 bg-[#E63946] hover:bg-[#B02A33] text-white text-[10px] font-extrabold rounded-lg cursor-pointer transition-colors shadow-lg shadow-red-500/10"
                              >
                                <Play size={10} fill="currentColor" /> Phát
                              </button>
                              <button
                                onClick={() => { removeFromHistory(record.movieSlug); triggerToast('Đã xóa phim khỏi lịch sử.'); }}
                                className="p-1 px-2.5 bg-transparent border border-white/10 hover:bg-white/5 text-zinc-500 hover:text-red-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3D. TAB: SECURITY & PRIVACY */}
                {activeTab === 'security' && (
                  <div className="flex flex-col gap-6">
                    <div className="border-b border-white/5 pb-3">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">THIẾT LẬP BẢO MẬT</h2>
                      <p className="text-xs text-zinc-500 mt-1">Quản lý cách đăng nhập, bảo bảo an toàn thông tin rạp chiếu.</p>
                    </div>

                    {/* Integrated 2FA Status Switcher */}
                    <div className="p-5 rounded-[24px] bg-[#12121A]/30 border border-white/5 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 text-left">
                        <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl flex-shrink-0 mt-0.5">
                          <Shield size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-white">Xác thực 2 bước nâng cao (2FA)</h4>
                          <p className="text-[10px] sm:text-xs text-zinc-500 mt-1 leading-relaxed max-w-md">Khi phát hiện vị trí đăng nhập bất thường, hệ thống sẽ gửi OTP điện thoại hoặc App OTP để xác minh danh tính rạp chiếu.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setTwoFactorEnabled(!twoFactorEnabled);
                          triggerToast(twoFactorEnabled ? 'Đã tắt xác thực 2 bước.' : 'Đã bật thành công xác thực 2 bước 2FA!');
                        }}
                        className={`p-2.5 px-4 rounded-xl text-xs font-black border transition-all duration-300 cursor-pointer ${
                          twoFactorEnabled 
                            ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/10 scale-102' 
                            : 'bg-zinc-900 text-zinc-400 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {twoFactorEnabled ? 'Đang bật 2FA' : 'Kích hoạt'}
                      </button>
                    </div>

                    {/* Change Password Panel */}
                    <div className="p-6 rounded-[24px] bg-[#12121A]/30 border border-white/5 text-left">
                      <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                        <Key size={16} className="text-[#E63946]" />
                        Đổi mật khẩu tài khoản
                      </h3>
                      <form onSubmit={handlePasswordChangeSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Mật khẩu hiện tại</label>
                          <input 
                            type={showPassword ? 'text' : 'password'}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Nhập mật khẩu cũ của bạn"
                            className="p-3 rounded-xl bg-black border border-white/5 text-xs text-white font-bold tracking-wide outline-none focus:border-[#E63946]"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Mật khẩu mới</label>
                            <input 
                              type={showPassword ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Mật khẩu mới tối thiểu 6 ký tự"
                              className="p-3 rounded-xl bg-black border border-white/5 text-xs text-white font-bold tracking-wide outline-none focus:border-[#E63946]"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Xác nhận mật khẩu</label>
                            <input 
                              type={showPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Xác nhận lại mật khẩu mới"
                              className="p-3 rounded-xl bg-black border border-white/5 text-xs text-white font-bold tracking-wide outline-none focus:border-[#E63946]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            {showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          </button>
                          <button
                            type="submit"
                            className="bg-[#E63946] hover:bg-[#B02A33] px-6 py-2.5 rounded-xl text-xs font-black text-white hover:shadow-lg hover:shadow-red-500/10 transition-all cursor-pointer"
                          >
                            Cập nhật mật khẩu mới
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Integrated Sessions warning text */}
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-zinc-500 font-sans text-[11px] leading-relaxed">
                      Để đảm bảo an toàn, hệ thống sẽ đề xuất tự động đăng xuất tất cả các phiên web cũ nếu có thay đổi mật khẩu đột ngột. Hãy luôn bảo quản thông tin email của bạn an toàn.
                    </div>
                  </div>
                )}

                {/* 3E. TAB: MEMBERSHIP / PRICING (VIP) */}
                {activeTab === 'vip' && (
                  <div className="flex flex-col gap-6 text-left">
                    <div className="border-b border-zinc-900 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">Cổng Hội Viên FilmFlow VIP</h2>
                        <p className="text-xs text-zinc-500 mt-1">Nâng tầm trải nghiệm băng thông không giới hạn, đưa rạp chiếu phim chất lượng cao về nhà.</p>
                      </div>
                      <button
                        onClick={() => {
                          updateVipTier('ultra');
                          triggerToast('⚡ Đã kích hoạt Siêu gói VIP Ultra 4K Demo thành công!');
                        }}
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        👑 Kích Hoạt Demo VIP Ultra
                      </button>
                    </div>

                    {/* Active Plan Card with Glassmorphism */}
                    <div className="p-6 rounded-[24px] bg-[#12121A]/80 border border-zinc-800 backdrop-blur-md text-left relative overflow-hidden">
                      <div className="absolute top-[-10%] right-[-10%] w-60 h-60 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[9px] uppercase tracking-widest">GÓI HIỆN TẠI</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 flex items-center gap-2 uppercase tracking-wide">
                            {vipTier === 'ultra' ? 'FilmFlow ULTRA 4K VIP Pass' : vipTier === 'premium' ? 'FilmFlow PREMIUM 2K Pass' : 'FilmFlow FREE MEMBERSHIP'}
                            {vipTier !== 'free' && <Sparkles size={16} className="text-amber-400 fill-amber-400/20 animate-bounce" />}
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1">
                            {vipTier === 'ultra' 
                              ? 'Đặc quyền phát: Không quảng cáo, mở khóa toàn bộ luồng phát 4K UHD siêu nét.' 
                              : vipTier === 'premium' 
                              ? 'Đặc quyền phát: Phát mượt độ phân giải lên tới 1080p và 2K cao cấp.' 
                              : 'Giới hạn độ phân giải tối đa 720p HD. Hãy nâng cấp để trải nghiệm hình ảnh tuyệt hảo.'}
                          </p>
                        </div>
                        <div className="flex flex-row gap-2.5">
                          {vipTier !== 'free' ? (
                            <button 
                              onClick={() => {
                                updateVipTier('free');
                                triggerToast('Đã hủy gia hạn. Tài khoản trở về gói Free.');
                              }}
                              className="px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border bg-transparent text-zinc-400 border-white/10 hover:border-white/20"
                            >
                              Hạ cấp về Free
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                updateVipTier('premium');
                                triggerToast('Đã kích hoạt thử nghiệm gói Premium!');
                              }}
                              className="px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border bg-gradient-to-r from-purple-500 to-indigo-600 border-purple-400 text-white"
                            >
                              Dùng thử Premium
                            </button>
                          )}
                          <button
                            onClick={() => triggerToast('Trình diễn Demo: Toàn bộ hóa đơn đều được miễn phí!')}
                            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                          >
                            Quản lý hóa đơn
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive pricing levels / grid cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      {/* Sub Plan 1: Free */}
                      <div className={`p-5 rounded-[22px] border transition-all flex flex-col justify-between text-left min-h-80 ${vipTier === 'free' ? 'bg-zinc-950/80 border-zinc-700' : 'bg-[#12121A]/30 border-white/5 hover:border-white/10'}`}>
                        <div>
                          <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">GÓI TRẢI NGHIỆM (FREE)</h4>
                          <span className="text-xl font-black text-white mt-1.5 block">0đ / tháng</span>
                          <hr className="my-3 border-zinc-900" />
                          <ul className="text-[11px] text-zinc-400 space-y-2.5 font-medium">
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Phát giới hạn tối đa 720p HD</li>
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Xem đầy đủ danh mục Anime/Phim</li>
                            <li className="flex items-center gap-1.5 text-zinc-500 line-through"><X size={12} className="text-zinc-600" /> Khóa luồng phát 1080p, 2K & 4K</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => {
                            updateVipTier('free');
                            triggerToast('Đã chuyển về gói Free!');
                          }}
                          className={`w-full py-2.5 rounded-xl font-black text-xs transition-colors cursor-pointer mt-4 ${vipTier === 'free' ? 'bg-zinc-800 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-400'}`}
                        >
                          {vipTier === 'free' ? 'Đang kích hoạt' : 'Hạ cấp về Free'}
                        </button>
                      </div>

                      {/* Sub Plan 2: Premium */}
                      <div className={`p-5 rounded-[22px] border transition-all flex flex-col justify-between text-left min-h-80 ${vipTier === 'premium' ? 'bg-purple-950/35 border-purple-500/40 shadow-lg shadow-purple-500/5' : 'bg-[#12121A]/30 border-white/5 hover:border-white/10'}`}>
                        <div>
                          <h4 className="text-xs font-black text-purple-400 uppercase tracking-widest">GÓI CAO CẤP (PREMIUM)</h4>
                          <span className="text-xl font-black text-white mt-1.5 block">49.000đ / tháng</span>
                          <hr className="my-3 border-zinc-900" />
                          <ul className="text-[11px] text-zinc-400 space-y-2.5 font-medium">
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Mở khóa độ nét 1080p Full HD & 2K</li>
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Băng thông truyền tải cao ưu tiên</li>
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Không quảng cáo chen ngang</li>
                            <li className="flex items-center gap-1.5 text-zinc-500 line-through"><X size={12} className="text-zinc-600" /> Luồng phát chất lượng Ultra 4K</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => {
                            updateVipTier('premium');
                            triggerToast('Đã nâng cấp lên gói Premium 1080p/2K!');
                          }}
                          className={`w-full py-2.5 rounded-xl font-black text-xs transition-colors cursor-pointer mt-4 ${vipTier === 'premium' ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-400'}`}
                        >
                          {vipTier === 'premium' ? 'Đang kích hoạt' : 'Nâng cấp Premium'}
                        </button>
                      </div>

                      {/* Sub Plan 3: Ultra */}
                      <div className={`p-5 rounded-[22px] border transition-all flex flex-col justify-between text-left min-h-80 relative ${vipTier === 'ultra' ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-500/10' : 'bg-[#12121A]/30 border-white/5 hover:border-white/10'}`}>
                        <div className="absolute top-3 right-3 bg-amber-500/20 border border-amber-500/30 text-[8px] font-black text-amber-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Đỉnh cao
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1"><Sparkles size={11} /> ULTRA SUPREME 4K</h4>
                          <span className="text-xl font-black text-white mt-1.5 block">89.000đ / tháng</span>
                          <hr className="my-3 border-zinc-900" />
                          <ul className="text-[11px] text-zinc-400 space-y-2.5 font-medium">
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Mở khóa toàn bộ luồng phát Ultra 4K</li>
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Ưu tiên truyền tải tải phim cực đại</li>
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Âm thanh vòm Dolby Cinema 7.1</li>
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Xem tối đa 5 thiết bị song song</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => {
                            updateVipTier('ultra');
                            triggerToast('Đã nâng cấp lên gói Ultra 4K cao cấp nhất!');
                          }}
                          className={`w-full py-2.5 rounded-xl font-black text-xs transition-colors cursor-pointer mt-4 ${vipTier === 'ultra' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'bg-white/5 hover:bg-white/10 text-zinc-400'}`}
                        >
                          {vipTier === 'ultra' ? 'Đang kích hoạt' : 'Nâng cấp Ultra 4K'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3F. TAB: SETTINGS & PREFERENCES */}
                {activeTab === 'settings' && (
                  <div className="flex flex-col gap-6">
                    <div className="border-b border-white/5 pb-3">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">CÀI ĐẶT HỆ THỐNG</h2>
                      <p className="text-xs text-zinc-500 mt-1">Tuỳ chỉnh rạp phim, ngôn ngữ phụ đề rạp bao.</p>
                    </div>

                    <div className="flex flex-col gap-5 p-5 sm:p-6 rounded-[24px] bg-[#12121A]/30 border border-white/5 text-left">
                      {/* Display name setting inside */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                            <User size={15} className="text-[#E63946]" />
                            Tên sử dụng rạp phim
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-1">Thay đổi tên hiển thị để chào mừng bạn khi mở rạp.</p>
                        </div>
                        <input
                          type="text"
                          value={preferences.userName}
                          onChange={(e) => updatePreferences({ userName: e.target.value })}
                          className="p-2.5 px-4 rounded-xl bg-black border border-white/5 text-xs font-bold text-white outline-none focus:border-[#E63946] min-w-[220px]"
                        />
                      </div>

                      {/* Language Selection Setting */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                            <Languages size={15} className="text-emerald-400" />
                            Ngôn ngữ hiển thị &amp; Sub mặc định
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-1">Ủy thác tự động hiển thị Vietsub hoặc Voice rạp.</p>
                        </div>
                        <select
                          value={preferences.language}
                          onChange={(e) => {
                            updatePreferences({ language: e.target.value as any });
                            triggerToast('Đã lưu cấu hình ngôn ngữ rạp phim.');
                          }}
                          className="p-2.5 bg-black border border-white/5 rounded-xl text-xs font-bold text-white cursor-pointer Outline-none"
                        >
                          <option value="vietsub">Tiếng Việt (Bản Vietsub)</option>
                          <option value="thuyetminh">Lồng Tiếng (Thuyết Minh)</option>
                          <option value="goc">Bản Nguyên Gốc (Raw Sound + En)</option>
                        </select>
                      </div>

                      {/* Default video Resolution Stream Quality Setting */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                            <Film size={15} className="text-teal-400" />
                            Độ phân giải truyền tải tối đa
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-1">Cân bằng băng thông của thiết bị rạp chiếu.</p>
                        </div>
                        <select
                          value={preferences.defaultQuality}
                          onChange={(e) => {
                            updatePreferences({ defaultQuality: e.target.value as any });
                            triggerToast('Đã cấu hình chất lượng phát phim mới.');
                          }}
                          className="p-2.5 bg-black border border-white/5 rounded-xl text-xs font-bold text-white cursor-pointer outline-none"
                        >
                          <option value="auto">Tự động điều chỉnh (Auto Detect-Adaptive)</option>
                          <option value="1080p">Tối đa 1080p FHD (Khuyên dùng)</option>
                          <option value="720p">Tiết kiệm 720p HD</option>
                        </select>
                      </div>

                      {/* Autoplay setting toggles layout */}
                      <div className="flex flex-row items-center justify-between gap-3 border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                            <Zap size={15} className="text-amber-400" />
                            Tự động chuyển tiếp tập tiếp theo
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-1">Liên phát khi tập phim cũ kết thúc để không ngắt quãng.</p>
                        </div>
                        <button
                          onClick={() => {
                            updatePreferences({ autoplay: !preferences.autoplay });
                            triggerToast(preferences.autoplay ? 'Đã tắt tự động phát tiếp.' : 'Đã bật tự động phát liên tục tập mới!');
                          }}
                          className={`p-2 px-4 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            preferences.autoplay 
                              ? 'bg-[#E63946] text-white border-[#E63946] shadow-md shadow-red-500/10' 
                              : 'bg-black text-zinc-400 border-white/5'
                          }`}
                        >
                          {preferences.autoplay ? 'Đã bật liên phát' : 'Đang tắt'}
                        </button>
                      </div>

                      {/* Appearance theme mock setting (Requested: dark/light/auto option list) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                            <Monitor size={15} className="text-indigo-400" />
                            Giao diện hiển thị (Theme)
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-1">Thiết kế sáng tối hoặc bám theo cấu hình thiết bị.</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-white/5">
                          {(['dark', 'light', 'auto'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setAppearance(mode);
                                updatePreferences({ theme: mode });
                                triggerToast(`Đã chuyển đổi giao diện sang dạng ${mode === 'dark' ? 'Tối (Kinh điển)' : mode === 'light' ? 'Sáng (Sắc nét)' : 'Tự động bám thiết bị'}`);
                              }}
                              className={`p-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                appearance === mode 
                                  ? 'bg-[#E63946] text-white shadow-md' 
                                  : 'text-zinc-500 hover:text-white'
                              }`}
                            >
                              {mode === 'dark' ? 'Tối' : mode === 'light' ? 'Sáng' : 'Auto'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notifications switches list */}
                      <div className="flex flex-col gap-3 pt-1 text-left">
                        <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-1.5">
                          <Bell size={14} className="text-[#E63946]" />
                          Cài đặt thông báo rạp
                        </h4>
                        <div className="flex flex-col gap-2.5">
                          <label className="flex items-center gap-3 text-xs text-zinc-300 font-bold cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={notifNewMovies} 
                              onChange={() => {
                                setNotifNewMovies(!notifNewMovies);
                                triggerToast('Đã lưu thiết lập thông báo phim mới.');
                              }}
                              className="w-4 h-4 accent-[#E63946] bg-black border-white/5 rounded"
                            />
                            <span>Nhận thông báo khi có phim mới cập nhật (Hàng ngày)</span>
                          </label>
                          <label className="flex items-center gap-3 text-xs text-zinc-300 font-bold cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={notifPromos} 
                              onChange={() => {
                                setNotifPromos(!notifPromos);
                                triggerToast('Đã lưu thiết lập khuyến mại VIP.');
                              }}
                              className="w-4 h-4 accent-[#E63946] bg-black border-white/5 rounded"
                            />
                            <span>Ưu đãi nâng cấp VIP, mã giảm giá gói cước &amp; sự kiện rạp</span>
                          </label>
                          <label className="flex items-center gap-3 text-xs text-zinc-300 font-bold cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={notifSecurity} 
                              onChange={() => {
                                setNotifSecurity(!notifSecurity);
                                triggerToast('Đã lưu thiết lập cảnh báo bảo mật.');
                              }}
                              className="w-4 h-4 accent-[#E63946] bg-black border-white/5 rounded"
                            />
                            <span>Thông báo đăng nhập lạ, ngắt kết nối thiết bị đột ngột</span>
                          </label>
                        </div>
                      </div>

                    </div>

                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-zinc-500 font-sans text-[11px] leading-relaxed">
                      Lưu ý: Bạn đang đăng nhập độc quyền qua Gmail được liên kết. Một số thiết lập rạp chiếu đặc thù có thể mất vài phút để đồng bộ hóa hoàn chỉnh trên các ứng dụng Smart TV liên quan.
                    </div>
                  </div>
                )}



              </div>
            )}
          </div>

        </div>

        {/* 4. FOOTER LOGOUT ACTION ON MOBILE/TABLET */}
        <div className="mt-12 pt-6 border-t border-white/5 flex justify-center lg:hidden">
          <button 
            onClick={() => {
              triggerToast('Đã đăng xuất tài khoản thành công! Hẹn gặp lại.');
              if (onLogout) {
                setTimeout(onLogout, 1200);
              }
            }}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-xs py-3 px-6 rounded-xl border border-red-500/15 transition-all cursor-pointer w-full text-center justify-center max-w-sm"
          >
            <LogOut size={14} />
            <span>ĐĂNG XUẤT TÀI KHOẢN CLOUD</span>
          </button>
        </div>

      </div>
    </div>
  );
}

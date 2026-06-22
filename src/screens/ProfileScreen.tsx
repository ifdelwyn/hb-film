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
}

// Predefined premium cinematic avatars
const PREMIUM_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
];

export default function ProfileScreen({ onNavigateToMoveDetail, onNavigateToWatch, onLogout }: ProfileScreenProps) {
  const { watchlist, clearWatchlist } = useWatchlist();
  const { history, removeFromHistory, clearHistory } = useWatchHistory();
  const { preferences, updatePreferences } = useUserPreferences();
  
  // High-fidelity tab management
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'history' | 'watchlist' | 'vip' | 'settings'>('overview');
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
  
  // VIP active states
  const [vipTier, setVipTier] = useState<'free' | 'vip'>('vip');
  
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
            {/* Interactive Portrait Ring */}
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
              <img
                src={preferences.avatarUrl || PREMIUM_AVATARS[0]}
                alt={preferences.userName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white/10 group-hover:ring-[var(--color-brand)] transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black tracking-wider text-white transition-opacity duration-300 uppercase">
                Thay ảnh
              </div>
              <span className={`absolute bottom-1 right-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white border border-[#2A2A3A] shadow-md ${vipTier === 'vip' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 'bg-zinc-650'}`}>
                {vipTier === 'vip' ? 'ULTRA 4K' : 'FREE'}
              </span>
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-extrabold text-[#E63946] uppercase tracking-widest bg-[#E63946]/10 border border-[#E63946]/20 rounded-full px-2.5 py-0.5">
                  ID: HB-831920
                </span>
                <span className="text-[10px] font-bold text-zinc-400">Tham gia: Tháng 6, 2024</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 flex items-center justify-center sm:justify-start gap-2">
                {preferences.userName}
                {vipTier === 'vip' && <Sparkles size={18} className="text-amber-400 fill-amber-400/20" />}
              </h1>
              <p className="text-xs text-zinc-500 font-medium mt-1">Hội viên cao cấp trực thuộc hệ thống rạp bao</p>
            </div>
          </div>

          {/* Minimal Bento Statistics Panel */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-black/30 w-full lg:w-auto p-4 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner z-10">
            <div className="text-center px-2 sm:px-4">
              <span className="text-[9px] sm:text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest block">Watchlist</span>
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
              className="bg-[#12121A]/30 border border-white/5 p-6 rounded-[24px] mb-8 overflow-hidden backdrop-blur-md"
            >
              <h4 className="text-xs font-black uppercase tracking-widest text-[#E63946] mb-4 flex items-center gap-1.5">
                <Sparkles size={12} /> Chọn ảnh đại diện cao cấp của bạn
              </h4>
              <div className="flex flex-wrap gap-4 items-center justify-start">
                {PREMIUM_AVATARS.map((url, i) => (
                  <div key={i} className="relative group cursor-pointer" onClick={() => {
                    updatePreferences({ avatarUrl: url });
                    setShowAvatarPicker(false);
                    triggerToast('Đã thay đổi ảnh đại diện mới.');
                  }}>
                    <img 
                      src={url} 
                      alt={`Avatar choice ${i}`} 
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 transition-all duration-300 ${preferences.avatarUrl === url ? 'ring-[var(--color-brand)] pointer-events-none' : 'ring-transparent hover:ring-white/30 hover:scale-105'}`}
                    />
                    {preferences.avatarUrl === url && (
                      <span className="absolute -bottom-1 -right-1 bg-[var(--color-brand)] p-1 rounded-full text-white shadow-lg border border-[#12121A]">
                        <Check size={9} />
                      </span>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => setShowAvatarPicker(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. COHESIVE STREAMING CONTROL CENTER FRAMEWORK (Left sidebar grid layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT INTERACTIVE SIDEBAR - STYLISH NAV */}
          <div className="lg:col-span-3 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 scrollbar-none border-b lg:border-none border-white/5 scroll-smooth">
            
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full ${activeTab === 'overview' ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/10 scale-[1.03]' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <User size={16} />
              <span>Tổng quan</span>
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
              <span>Xem gần đây ({history.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('security')}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full ${activeTab === 'security' ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/10 scale-[1.03]' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Lock size={16} />
              <span>Bảo mật</span>
            </button>

            <button
              onClick={() => handleTabChange('vip')}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full ${activeTab === 'vip' ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/10 scale-[1.03]' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Sparkles size={16} />
              <span>Thành viên VIP</span>
            </button>

            <button
              onClick={() => handleTabChange('settings')}
              className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer flex-shrink-0 w-auto lg:w-full ${activeTab === 'settings' ? 'bg-[#E63946] text-white shadow-lg shadow-red-500/10 scale-[1.03]' : 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Settings size={16} />
              <span>Cài đặt hệ thống</span>
            </button>

            <hr className="my-3 border-white/5 hidden lg:block" />

            <button
              onClick={() => {
                triggerToast('Đã đăng xuất tài khoản thành công! Hẹn gặp lại.');
                if (onLogout) {
                  setTimeout(onLogout, 1200);
                }
              }}
              className="hidden lg:flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer text-left"
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
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
                    <div className="p-6 rounded-[24px] bg-gradient-to-r from-[#C1121F]/20 to-[#0A0A0F] border border-red-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                          <h3 className="text-sm font-black tracking-wide text-amber-400">GỎI PHIM ULTRA VIP (HOẠT ĐỘNG)</h3>
                        </div>
                        <p className="text-xs text-zinc-400 max-w-md">Kích hoạt rạp phim ảo, hỗ trợ tối đa chất lượng Full UHD 4K, âm thanh vòm Dolby Atmos cao cấp rạp truyền phát.</p>
                      </div>
                      <button 
                        onClick={() => handleTabChange('vip')}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black transition-colors self-start sm:self-center"
                      >
                        Nâng Cấp Thiết Bị
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
                  <div className="flex flex-col gap-6">
                    <div className="border-b border-white/5 pb-3">
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">HỘI VIÊN RẠP PHIM VIP CHUYÊN SÂU</h2>
                      <p className="text-xs text-zinc-500 mt-1">Phát triển độ phân giải băng thông lớn, đưa trải nghiệm xem phim rạp cao cấp ngay tại nhà.</p>
                    </div>

                    {/* Active Plan Card with Glassmorphism */}
                    <div className="p-6 rounded-[24px] bg-[#12121A]/55 border border-amber-500/20 backdrop-blur-md text-left relative overflow-hidden">
                      <div className="absolute top-[-10%] right-[-10%] w-60 h-60 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
                      
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[9px] uppercase tracking-widest">Active Plan</span>
                            <span className="text-zinc-500 text-xs">Gói hiện tại:</span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 flex items-center gap-2">
                            HB ULTRA SUPREME VIP PASS
                            <Sparkles size={16} className="text-amber-400 fill-amber-400/20 animate-bounce" />
                          </h3>
                          <p className="text-xs text-zinc-400 mt-1">Ngày gia hạn kế tiếp: <strong className="text-zinc-200">22 tháng 7, 2026</strong> (Tự động gia hạn qua Ví liên kết)</p>
                        </div>
                        <div className="flex flex-row gap-2.5">
                          <button 
                            onClick={() => {
                              setVipTier(vipTier === 'vip' ? 'free' : 'vip');
                              triggerToast(vipTier === 'vip' ? 'Đã hủy dịch vụ VIP tự động gia hạn.' : 'Đã kích hoạt lại VIP tài khoản!');
                            }}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${vipTier === 'vip' ? 'bg-transparent text-zinc-400 border-white/10 hover:border-white/20' : 'bg-amber-500 text-black border-amber-400'}`}
                          >
                            {vipTier === 'vip' ? 'Hủy gói cước' : 'Gia hạn gói'}
                          </button>
                          <button
                            onClick={() => triggerToast('Chuyển đổi thanh toán thành công!')}
                            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                          >
                            Quản lý hóa đơn
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Interactive pricing levels / grid cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                      {/* Sub Plan 1 */}
                      <div className="p-5 rounded-[22px] bg-[#12121A]/30 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between text-left h-76">
                        <div>
                          <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">GÓI TRẢI NGHIỆM (FREE)</h4>
                          <span className="text-xl font-black text-white mt-1.5 block">0đ / tháng</span>
                          <hr className="my-3 border-white/5" />
                          <ul className="text-[11px] text-zinc-500 space-y-2 font-medium">
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Quảng cáo tự động hiển thị mượt</li>
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Độ phân giải tối thiểu 720p HD</li>
                            <li className="flex items-center gap-1.5 text-zinc-650"><X size={12} className="text-zinc-600" /> Tốc độ truyền tải rạp cao cấp</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => {
                            setVipTier('free');
                            triggerToast('Đã hạ cấp về gói miễn phí thành công!');
                          }}
                          className={`w-full py-2.5 rounded-xl font-black text-xs transition-colors cursor-pointer mt-4 ${vipTier === 'free' ? 'bg-[#E63946] text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-400'}`}
                        >
                          {vipTier === 'free' ? 'Gói Đang Bật' : 'Hạ Cấp Gói'}
                        </button>
                      </div>

                      {/* Sub Plan 2 (VIP Active) */}
                      <div className="p-5 rounded-[22px] bg-gradient-to-b from-[#12121A]/50 to-black/30 border-2 border-amber-500/25 flex flex-col justify-between text-left h-76 relative">
                        <div className="absolute top-3 right-3 bg-amber-500/10 border border-amber-500/20 text-[8px] font-black text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Phổ biến</div>
                        <div>
                          <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1"><Sparkles size={11} /> ULTRA VIP PASS</h4>
                          <span className="text-xl font-black text-white mt-1.5 block">59.000đ / tháng</span>
                          <hr className="my-3 border-amber-500/10" />
                          <ul className="text-[11px] text-zinc-400 space-y-2 font-medium">
                            <li className="flex items-center gap-1.5 text-zinc-350"><Check size={12} className="text-emerald-400" /> 100% không quảng cáo chen ngang</li>
                            <li className="flex items-center gap-1.5 text-zinc-350"><Check size={12} className="text-emerald-400" /> Chất lượng tối đa Full HD/4K UHD</li>
                            <li className="flex items-center gap-1.5 text-zinc-350"><Check size={12} className="text-emerald-400" /> 04 Thiết bị xem đồng thời</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => {
                            setVipTier('vip');
                            triggerToast('Bạn đã kích hoạt thành công Gói VIP!');
                          }}
                          className={`w-full py-2.5 rounded-xl font-black text-xs transition-colors cursor-pointer mt-4 ${vipTier === 'vip' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10' : 'bg-white/5 hover:bg-white/10 text-zinc-400'}`}
                        >
                          {vipTier === 'vip' ? 'Gói Đang Bật' : 'Đăng Ký Ngay'}
                        </button>
                      </div>

                      {/* Sub Plan 3 */}
                      <div className="p-5 rounded-[22px] bg-[#12121A]/30 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between text-left h-76">
                        <div>
                          <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">FAMILY CINEMA ULTRA</h4>
                          <span className="text-xl font-black text-white mt-1.5 block">119.000đ / tháng</span>
                          <hr className="my-3 border-white/5" />
                          <ul className="text-[11px] text-zinc-500 space-y-2 font-medium">
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Tối đa 10 Thiết bị thành viên rạp</li>
                            <li className="flex items-center gap-1.5 text-zinc-400"><Check size={12} className="text-emerald-400" /> Âm thanh Dolby Atmos thính rạp</li>
                            <li className="flex items-center gap-1.5 text-zinc-405"><Check size={12} className="text-emerald-400" /> Chia sẻ tài khoản thông minh</li>
                          </ul>
                        </div>
                        <button
                          onClick={() => {
                            setVipTier('vip');
                            triggerToast('Đăng ký gói Family bao thành công!');
                          }}
                          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-extrabold text-xs transition-colors cursor-pointer mt-4"
                        >
                          Nâng cấp Gói
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

                      {/* Admin panel control for welcome recommendation banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                            <Monitor size={15} className="text-[#E63946]" />
                            Đề xuất phiên bản máy tính (Welcome Banner)
                          </h4>
                          <p className="text-[11px] text-zinc-500 mt-1">Tuỳ chỉnh bật/tắt hoặc reset hiển thị thông báo khuyên dùng máy tính cho người dùng mới.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              localStorage.removeItem('bao_desktop_rec_dismissed');
                              triggerToast('Đã khôi phục trạng thái hiển thị Welcome Banner!');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Reset Trạng Thái
                          </button>
                          <button
                            onClick={() => {
                              const nextVal = !isAdminBannerDisabled;
                              setIsAdminBannerDisabled(nextVal);
                              localStorage.setItem('bao_desktop_banner_admin_disabled', String(nextVal));
                              triggerToast(nextVal ? 'Đã tắt Welcome Banner theo quản trị hệ thống!' : 'Đã bật Welcome Banner theo quản trị hệ thống!');
                            }}
                            className={`p-1.5 px-3.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
                              !isAdminBannerDisabled 
                                ? 'bg-[#E63946]/20 text-[#E63946] border-[#E63946]/30 shadow-md shadow-red-500/5' 
                                : 'bg-black text-zinc-500 border-white/5'
                            }`}
                          >
                            {!isAdminBannerDisabled ? 'ĐANG BẬT' : 'ĐANG TẮT'}
                          </button>
                        </div>
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

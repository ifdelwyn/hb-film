import React, { useState } from 'react';
import { Mail, Lock, Sparkles, RefreshCw, LogIn, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginScreenProps {
  onAuthSuccess: (user: {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    plan: string;
    joinDate: string;
  }) => void;
  redirectRoute?: string;
}

export default function LoginScreen({ onAuthSuccess, redirectRoute }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Google Popup Simulator State
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const triggerToast = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => {
      setErrorMsg('');
    }, 4000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail.trim()) {
      triggerToast('Vui lòng nhập địa chỉ Email.');
      return;
    }
    if (loginPassword.length < 4) {
      triggerToast('Mật khẩu phải có ít nhất 4 ký tự.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const mockUser = {
        uid: 'user_' + Date.now(),
        displayName: loginEmail.split('@')[0] || 'Thành viên bao',
        email: loginEmail,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(loginEmail)}`,
        plan: 'free',
        joinDate: new Date().toISOString().split('T')[0]
      };
      
      localStorage.setItem('hb_user', JSON.stringify(mockUser));
      // Sync into preferences so name and avatar display correctly elsewhere
      const prefs = localStorage.getItem('filmflow_preferences');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        parsed.userName = mockUser.displayName;
        parsed.avatarUrl = mockUser.photoURL;
        localStorage.setItem('filmflow_preferences', JSON.stringify(parsed));
      }
      
      onAuthSuccess(mockUser);
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!registerName.trim()) {
      triggerToast('Vui lòng nhập họ và tên.');
      return;
    }
    if (!registerEmail.trim()) {
      triggerToast('Vui lòng nhập địa chỉ Email.');
      return;
    }
    if (registerPassword.length < 4) {
      triggerToast('Mật khẩu phải từ 4 ký tự trở lên.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      triggerToast('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const mockUser = {
        uid: 'user_' + Date.now(),
        displayName: registerName,
        email: registerEmail,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(registerName)}`,
        plan: 'free',
        joinDate: new Date().toISOString().split('T')[0]
      };
      
      localStorage.setItem('hb_user', JSON.stringify(mockUser));
      // Sync with preferences
      const prefs = localStorage.getItem('filmflow_preferences');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        parsed.userName = mockUser.displayName;
        parsed.avatarUrl = mockUser.photoURL;
        localStorage.setItem('filmflow_preferences', JSON.stringify(parsed));
      }
      
      onAuthSuccess(mockUser);
    }, 1200);
  };

  const handleGoogleSignInClick = () => {
    setShowGooglePopup(true);
  };

  const handleSelectGoogleAccount = (name: string, email: string, avatar: string) => {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
      setShowGooglePopup(false);
      
      const mockUser = {
        uid: 'google_' + Date.now(),
        displayName: name,
        email: email,
        photoURL: avatar,
        plan: 'free',
        joinDate: new Date().toISOString().split('T')[0]
      };
      
      localStorage.setItem('hb_user', JSON.stringify(mockUser));
      // Sync with preferences
      const prefs = localStorage.getItem('filmflow_preferences');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        parsed.userName = mockUser.displayName;
        parsed.avatarUrl = mockUser.photoURL;
        localStorage.setItem('filmflow_preferences', JSON.stringify(parsed));
      }
      
      onAuthSuccess(mockUser);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#0F0F0F] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans px-4 pt-20 pb-10">
      {/* Dynamic Blur Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-brand)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-brand)]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center select-none mb-6 text-center z-10">
        <span className="font-signature lowercase text-5xl text-zinc-100 tracking-tight leading-none mb-2">
          bao
        </span>
        <div className="w-10 h-[2px] bg-[var(--color-brand)] mb-3" />
        <p className="text-[10px] text-zinc-400 font-bold max-w-xs uppercase tracking-widest leading-relaxed">
          Thành viên rạp phim cao cấp trực tuyến
        </p>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-[#13131A] border border-zinc-900 rounded-[24px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl z-10">
        {/* Toggle tabs */}
        <div className="flex bg-zinc-950 p-1 rounded-xl mb-6 border border-zinc-900">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'login'
                ? 'bg-[var(--color-brand)] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'register'
                ? 'bg-[var(--color-brand)] text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Email cá nhân</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-[var(--color-brand)] rounded-xl px-4 text-sm font-semibold text-white outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Mật khẩu</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="• • • • • •"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-[var(--color-brand)] rounded-xl pl-4 pr-10 text-sm font-semibold text-white outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[#C1121F] hover:from-[#C1121F] hover:to-[var(--color-brand)] text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Đang kết nối...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={14} />
                      <span>ĐĂNG NHẬP THÀNH VIÊN</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Tên hiển thị</label>
                  <input
                    type="text"
                    placeholder="Tên của bạn"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-[var(--color-brand)] rounded-xl px-4 text-sm font-semibold text-white outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Địa chỉ Email</label>
                  <input
                    type="email"
                    placeholder="username@gmail.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-[var(--color-brand)] rounded-xl px-4 text-sm font-semibold text-white outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Mật khẩu bảo mật</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="• • • • • •"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-[var(--color-brand)] rounded-xl px-4 text-sm font-semibold text-white outline-none transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Xác nhận mật khẩu</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="• • • • • •"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-[var(--color-brand)] rounded-xl px-4 text-sm font-semibold text-white outline-none transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[#C1121F] hover:from-[#C1121F] hover:to-[var(--color-brand)] text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Đang khởi tạo tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>ĐĂNG KÝ TÀI KHOẢN MỚI</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Separator line */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-900"></div>
          </div>
          <span className="relative bg-[#13131A] px-3.5 text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
            Hoặc liên kết nhanh
          </span>
        </div>

        {/* Google sign-in trigger */}
        <button
          onClick={handleGoogleSignInClick}
          className="w-full h-11 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.281 1.09 15.511 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
          </svg>
          <span>Tiếp tục với Google (Demo)</span>
        </button>

        {/* Demo credentials notice */}
        <div className="mt-5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center select-none">
          <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
            💡 Gợi ý: Đây là phiên bản Demo hoàn chỉnh. Bạn có thể tự do nhập bất kỳ thông tin nào để đăng nhập, hoặc bấm nút Google để lựa chọn tài khoản giả lập ngay lập tức!
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <p className="text-[10px] text-zinc-600 font-medium mt-10">
        &copy; {new Date().getFullYear()} bao. Built with ❤️ for absolute movie fans.
      </p>

      {/* Google PopUp Simulator Modal UI */}
      <AnimatePresence>
        {showGooglePopup && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Background glass overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isGoogleLoading) setShowGooglePopup(false); }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Google Popup Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm bg-white text-zinc-900 rounded-[24px] overflow-hidden shadow-2xl flex flex-col p-6 font-sans text-left"
            >
              {/* Google Brand Logo */}
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-100">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="font-bold text-sm text-zinc-600 font-sans tracking-tight">Đăng nhập bằng tài khoản Google</span>
              </div>

              {isGoogleLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <RefreshCw size={36} className="text-blue-500 animate-spin" />
                  <p className="text-xs font-semibold text-zinc-500">Đang đồng bộ hóa dịch vụ Google...</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-zinc-500 font-medium mb-4 leading-relaxed">
                    Chọn một tài khoản Google được phát hiện tự động để đăng nhập ngay vào rạp phim bao:
                  </p>

                  <div className="flex flex-col gap-2 mb-4">
                    {[
                      {
                        name: 'Bảo Lê Huy',
                        email: 'lehuybao17112007@gmail.com',
                        avatar: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100&h=100&fit=crop'
                      },
                      {
                        name: 'Lan Anh Nguyễn',
                        email: 'lananh.nguyen@gmail.com',
                        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
                      },
                      {
                        name: 'Guest Explorer',
                        email: 'guest.explorer@gmail.com',
                        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guestabc'
                      }
                    ].map((acc, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectGoogleAccount(acc.name, acc.email, acc.avatar)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 transition-all cursor-pointer border border-zinc-100/60"
                      >
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-9 h-9 rounded-full object-cover border border-zinc-200 shadow-sm"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-800 truncate">{acc.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{acc.email}</p>
                        </div>
                        <ArrowRight size={14} className="ml-auto text-zinc-300" />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowGooglePopup(false)}
                    className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-xl text-xs font-bold text-zinc-600 text-center cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

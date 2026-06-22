import React, { useState } from 'react';
import { Mail, Lock, Sparkles, RefreshCw, LogIn, Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (userName: string, email: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ Email hoặc Số điện thoại.');
      return;
    }
    if (!userName.trim()) {
      setErrorMsg('Vui lòng nhập Tên hiển thị của bạn.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Mật khẩu của bạn phải có ít nhất 4 ký tự.');
      return;
    }

    setIsSubmitting(true);
    // Simulate loading/authenticating and then trigger login success
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess(userName, email);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0F] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans select-none px-4">
      {/* Decorative Blur Background Glimmers */}
      <div className="absolute top-[-10%] left-[-20%] w-[50%] h-[50%] bg-[var(--color-brand)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[40%] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Brand Cinematic Logo Header */}
      <div className="flex flex-col items-center justify-center select-none mb-10 text-center z-10 animate-fade-in">
        <span className="font-signature lowercase text-5xl text-zinc-100 tracking-tight leading-none mb-2">
          bao
        </span>
        <div className="w-12 h-[2.5px] bg-[var(--color-brand)] mb-4" />
        <p className="text-xs text-zinc-400 font-medium max-w-xs leading-relaxed uppercase tracking-widest">
          Hệ thống rạp chiếu bóng cao cấp trực tuyến
        </p>
      </div>

      {/* Login Card Grid */}
      <div className="w-full max-w-md bg-[#12121A]/80 border border-zinc-900 rounded-[28px] p-6 sm:p-8 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10 animate-scale-in">
        <h2 className="text-xl sm:text-2xl font-black text-white text-center tracking-tight mb-2">
          Đăng nhập hệ thống bao
        </h2>
        <p className="text-xs text-zinc-500 text-center mb-6">
          Đồng bộ hóa danh sách xem phim, lịch sử và tùy biến rạp chiếu.
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* UserName field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Tên hiển thị</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ví dụ: Bảo Lê Huy"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-[var(--color-brand)] rounded-xl px-4 text-sm font-semibold text-white outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Địa chỉ Email / Số điện thoại</label>
            <div className="relative">
              <input
                type="text"
                placeholder="TenCuaBan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-[var(--color-brand)] rounded-xl px-4 text-sm font-semibold text-white outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5 text-left relative">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Mật khẩu bảo mật</label>
              <span className="text-[10px] font-extrabold text-[var(--color-brand)] cursor-pointer hover:underline">Quên mật khẩu?</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="• • • • • • • •"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 bg-zinc-950 border border-zinc-800 focus:border-[var(--color-brand)] rounded-xl pl-4 pr-10 text-sm font-semibold text-white outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--color-brand)] to-[#C1121F] hover:from-[#C1121F] hover:to-[var(--color-brand)] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-red-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Đang bảo mật thông tin...</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>KẾT NỐI TÀI KHOẢN CLOUD</span>
              </>
            )}
          </button>
        </form>

        {/* Guest Demo credentials notice */}
        <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
          <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold">
            🔓 Gợi ý Demo: Điền bất kỳ thông tin nào để trải nghiệm tức thì. Tên bạn nhập sẽ là tên hiển thị trên trang cá nhân của rạp bao!
          </p>
        </div>
      </div>

      {/* Footer copyright */}
      <p className="text-[10px] text-zinc-600 font-medium absolute bottom-6">
        &copy; {new Date().getFullYear()} bao. All rights reserved. Cloud Security Protected.
      </p>
    </div>
  );
}

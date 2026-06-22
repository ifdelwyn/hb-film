import React, { useState, useEffect } from 'react';
import { Monitor, Laptop, ArrowRight, ShieldAlert, X } from 'lucide-react';

export default function DesktopRecommendationBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check local storage to see if they're visiting or already dismissed
    const isDismissed = localStorage.getItem('bao_desktop_rec_dismissed');
    const isAdminDisabled = localStorage.getItem('bao_desktop_banner_admin_disabled') === 'true';

    if (!isDismissed && !isAdminDisabled) {
      // Small timeout to let the page settle in before animating up elegantly
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDoNotShowAgain = () => {
    localStorage.setItem('bao_desktop_rec_dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-sans select-none animate-fade-in duration-300">
      
      {/* Centered Glassmorphic Card */}
      <div 
        className="w-full max-w-lg bg-[rgba(15,15,15,0.85)] border border-white/10 rounded-[24px] p-6 md:p-8 backdrop-blur-[20px] shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-left relative flex flex-col md:flex-row gap-6 items-start md:items-center animate-slide-up duration-400"
        id="desktop-recommendation-banner-modal"
      >
        {/* Subtle Close Cross button on the top right */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Left Side: Modern Desktop / Laptop Icon Column */}
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E50914] to-[#C1121F] flex items-center justify-center shadow-lg shadow-red-600/30 animate-pulse">
          <Monitor size={30} className="text-white" />
        </div>

        {/* Right Side Info and Action Panel */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-lg md:text-xl font-black text-white tracking-tight leading-snug mb-2">
            Trải nghiệm tốt nhất trên máy tính
          </h3>
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-medium mb-4">
            Để tận hưởng giao diện điện ảnh, chất lượng hình ảnh tối đa và các tính năng nâng cao, chúng tôi khuyến nghị sử dụng rạp phim trên máy tính hoặc laptop.
          </p>

          {/* Touch Screen Mobile Help */}
          <div className="block md:hidden mb-5">
            <p className="text-[10px] text-zinc-500 font-bold leading-normal flex items-center gap-1">
              <ShieldAlert size={12} className="text-amber-500 flex-shrink-0" />
              <span>Một số tính năng nâng cao chỉ khả dụng trên phiên bản máy tính.</span>
            </p>
          </div>

          {/* Interactive Button Actions aligned nicely */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
            {/* Primary accept Button */}
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-red-600/20 active:scale-95 cursor-pointer text-center"
            >
              Tiếp tục trên thiết bị này
            </button>

            {/* Secondary quiet trigger Button */}
            <button
              onClick={handleDoNotShowAgain}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-zinc-300 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer text-center"
            >
              Không hiển thị lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

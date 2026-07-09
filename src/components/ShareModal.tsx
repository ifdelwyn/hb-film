import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Instagram, HelpCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
  imageUrl?: string;
  description?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  title,
  imageUrl,
  description = "Xem phim miễn phí, chất lượng cao cực mượt ngay tại đây!"
}: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInsta, setCopiedInsta] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    // Detect mobile device to offer deep links and system sharing
    const detectMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return /android|iphone|ipad|ipod|windows phone/i.test(userAgent.toLowerCase());
    };
    setIsMobile(detectMobile());
  }, []);

  // Standard Link Copy
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      // Fallback
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Messenger Share Handler
  const handleMessengerShare = () => {
    // We use a robust, standard Web Messenger sharing dialog
    const messengerWebUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(shareUrl)}`;
    const messengerMobileUrl = `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`;

    if (isMobile) {
      // Try mobile deep link first
      window.location.href = messengerMobileUrl;
      // Fallback if app is not installed
      setTimeout(() => {
        window.open(messengerWebUrl, '_blank', 'noopener,noreferrer');
      }, 1000);
    } else {
      window.open(messengerWebUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Instagram Share Handler (Copies a beautiful invite template & opens Direct/App)
  const handleInstagramShare = async () => {
    const inviteText = `🎬 Mình vừa tìm thấy phim này hay cực: "${title}"\n🍿 Xem ngay ở đây nhé, phim mượt, nét căng:\n🔗 ${shareUrl}`;
    
    try {
      await navigator.clipboard.writeText(inviteText);
    } catch (err) {
      const el = document.createElement('textarea');
      el.value = inviteText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }

    setCopiedInsta(true);
    setTimeout(() => setCopiedInsta(false), 3000);

    // Open Instagram
    setTimeout(() => {
      if (isMobile) {
        // Open Instagram app
        window.location.href = 'instagram://';
        // Fallback to web
        setTimeout(() => {
          window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
        }, 1200);
      } else {
        window.open('https://www.instagram.com/direct/inbox/', '_blank', 'noopener,noreferrer');
      }
    }, 1200);
  };

  // Native Web Share (The ultimate real feature on mobile!)
  const handleSystemShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Xem phim ${title} cực hay tại đây!`,
          url: shareUrl,
        });
      } catch (err) {
        console.warn('System share dismissed or failed:', err);
      }
    } else {
      // Fallback: Copy link
      handleCopyLink();
    }
  };

  const supportSystemShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.85)] z-10 text-left select-none"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-2 rounded-full cursor-pointer transition-colors active:scale-90"
            >
              <X size={16} />
            </button>

            {/* Content Top */}
            <div className="p-6 pb-4 border-b border-zinc-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E63946]/10 flex items-center justify-center text-[#E63946]">
                <Share2 size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Chia sẻ phim</h3>
                <p className="text-[11px] text-zinc-400 font-medium">Gửi đến bạn bè để cùng thưởng thức</p>
              </div>
            </div>

            {/* Movie Snapshot preview in modal */}
            <div className="px-6 py-4 bg-zinc-900/30 flex gap-4 items-center border-b border-zinc-900/60">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-12 h-18 rounded-lg object-cover bg-zinc-900 shadow-md border border-white/5 select-none shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-18 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0">
                  <Share2 size={16} className="text-zinc-600" />
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="text-sm font-black text-white truncate">{title}</h4>
                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Share Grid / Actions */}
            <div className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3.5">
                {/* Facebook Messenger button */}
                <button
                  onClick={handleMessengerShare}
                  className="cursor-pointer group flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900 hover:border-blue-900/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform duration-300">
                    <svg viewBox="0 0 24 24" className="w-12 h-12">
                      <defs>
                        <linearGradient id="messengerGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#006AFE" />
                          <stop offset="37%" stopColor="#8F39FC" />
                          <stop offset="70%" stopColor="#FF2E93" />
                          <stop offset="100%" stopColor="#FF5C50" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M12 2C6.477 2 2 6.142 2 11.248c0 2.913 1.45 5.513 3.727 7.14a.75.75 0 01.278.61l-.082 1.932c-.018.428.413.738.799.558l2.16-1a.75.75 0 01.623.01c1.034.404 2.131.621 3.295.621 5.523 0 10-4.142 10-9.248S17.523 2 12 2zm4.8 8.1L13.48 15.37a1.125 1.125 0 01-1.633.297l-3.218-2.368a.375.375 0 00-.511.049L4.72 17.25a.375.375 0 01-.617-.432l3.32-5.272a1.125 1.125 0 011.633-.297l3.218 2.368a.375.375 0 00.511-.049l3.398-3.902a.375.375 0 01.617.432z" 
                        fill="url(#messengerGradient)" 
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-black text-white mt-3">Messenger</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5 font-medium group-hover:text-zinc-400">Gửi tin nhắn</span>
                </button>

                {/* Instagram share button */}
                <button
                  onClick={handleInstagramShare}
                  className="cursor-pointer group flex flex-col items-center justify-center p-4 rounded-2xl border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900 hover:border-pink-900/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/15 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    <svg viewBox="0 0 24 24" className="w-12 h-12">
                      <defs>
                        <radialGradient id="instaGradient" cx="20%" cy="115%" r="130%" fx="20%" fy="115%">
                          <stop offset="0%" stopColor="#fdf497" />
                          <stop offset="5%" stopColor="#fdf497" />
                          <stop offset="45%" stopColor="#fd5949" />
                          <stop offset="60%" stopColor="#d6249f" />
                          <stop offset="90%" stopColor="#285AEB" />
                        </radialGradient>
                      </defs>
                      <rect width="24" height="24" rx="6" fill="url(#instaGradient)" />
                      <rect x="5" y="5" width="14" height="14" rx="3.5" fill="none" stroke="white" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="3" fill="none" stroke="white" strokeWidth="1.5" />
                      <circle cx="16.5" cy="7.5" r="0.75" fill="white" />
                    </svg>
                  </div>
                  <span className="text-xs font-black text-white mt-3">Instagram</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5 font-medium group-hover:text-zinc-400">Direct / Story</span>
                </button>
              </div>

              {/* Informative Toast / Status Banner for Instagram Share */}
              <AnimatePresence>
                {copiedInsta && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-pink-950/40 border border-pink-900/35 rounded-2xl flex gap-2.5 items-start"
                  >
                    <div className="text-pink-400 shrink-0 mt-0.5">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-pink-300">Đã copy lời mời xem phim!</p>
                      <p className="text-[10px] text-pink-400/80 leading-relaxed mt-0.5 font-medium">
                        Bạn chỉ cần dán tin nhắn vào cuộc hội thoại Direct trên Instagram để chia sẻ ngay.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Share link copy input bar */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Đường dẫn chia sẻ</p>
                <div className="flex gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-1.5 pl-3.5 items-center">
                  <span className="text-zinc-400 font-mono text-xs truncate flex-grow select-all">
                    {shareUrl}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all duration-200 active:scale-95 shrink-0 ${
                      copiedLink 
                        ? 'bg-emerald-950/80 border border-emerald-900 text-emerald-300' 
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-transparent'
                    }`}
                  >
                    {copiedLink ? <Check size={13} className="stroke-[3]" /> : <Copy size={13} />}
                    <span>{copiedLink ? 'Đã copy' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Mobile optimizations: System Native Share trigger */}
              {supportSystemShare && (
                <button
                  onClick={handleSystemShare}
                  className="cursor-pointer w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-750 text-zinc-200 hover:text-white py-3.5 rounded-2xl text-xs font-extrabold transition-all duration-200 active:scale-95"
                >
                  <Share2 size={14} className="text-[#E63946]" />
                  <span>Mở bảng chia sẻ hệ thống (Zalo, SMS, AirDrop...)</span>
                </button>
              )}
            </div>

            {/* Note instructions footer */}
            <div className="p-4 bg-zinc-900/20 border-t border-zinc-900 flex gap-2.5 items-center justify-center">
              <AlertCircle size={12} className="text-zinc-500 shrink-0" />
              <p className="text-[9.5px] text-zinc-500 font-medium">
                Sử dụng trên thiết bị di động để tối ưu trải nghiệm chia sẻ trực tiếp.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

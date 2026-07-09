import React, { useState, useEffect } from 'react';
import { X, Heart, Sparkles, Copy, Check, ShieldCheck, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DonationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('open-donation-modal', handleOpen);
    window.addEventListener('close-donation-modal', handleClose);

    return () => {
      window.removeEventListener('open-donation-modal', handleOpen);
      window.removeEventListener('close-donation-modal', handleClose);
    };
  }, []);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('70017112007');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="donation-global-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
          {/* Backdrop Click */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 cursor-pointer"
          />

          {/* Modal Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden p-6 text-center z-10 border-zinc-800/80"
          >
            {/* Pulsating Glowing Accent Ring */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              title="Đóng"
            >
              <X size={18} />
            </button>

            {/* Header Icon */}
            <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 animate-pulse">
              <Heart size={24} className="fill-red-500/10" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
              Ủng Hộ Nhà Phát Triển
              <Sparkles size={16} className="text-amber-400" />
            </h3>
            <p className="text-xs text-zinc-400 font-medium max-w-xs mx-auto mt-2 leading-relaxed">
              Hãy tiếp sức cho chúng tôi duy trì máy chủ tốc độ cao và phát triển các tính năng tuyệt vời hơn nữa!
            </p>

            {/* QR Code Container */}
            <div className="relative mt-5 mb-5 mx-auto w-64 h-64 bg-white rounded-2xl overflow-hidden shadow-2xl p-2.5 border border-zinc-800/20 group">
              <img
                src="https://api.vietqr.io/image/970407-70017112007-IpKFrt6.jpg?accountName=HUY%20BAO&amount=0"
                alt="Developer Donation QR Code"
                className="w-full h-full object-contain rounded-xl select-none"
                referrerPolicy="no-referrer"
              />
              {/* Scan Overlay Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white backdrop-blur-[2px]">
                <QrCode size={32} className="text-red-500 animate-bounce" />
                <span className="text-[11px] font-black tracking-wider uppercase bg-red-600 px-2.5 py-1 rounded-full shadow">Quét mã để ủng hộ</span>
              </div>
            </div>

            {/* Bank info box */}
            <div className="bg-zinc-900/45 border border-zinc-900 rounded-2xl p-3 text-left mb-5 flex items-center justify-between gap-3 select-text">
              <div className="min-w-0">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">
                  Thông tin chuyển khoản
                </p>
                <p className="text-xs font-bold text-white truncate">
                  Techcombank (Napas 24/7)
                </p>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  Số TK: <span className="font-extrabold text-white text-xs select-all font-mono">70017112007</span>
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Chủ TK: LE HUY BAO
                </p>
              </div>

              <button
                onClick={handleCopyAccount}
                className={`flex items-center gap-1 text-[11px] font-black tracking-wide uppercase px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  copied 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-zinc-950/80 border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Đã copy TK' : 'Copy Số TK'}</span>
              </button>
            </div>

            {/* Support Message Info */}
            <div className="flex items-start gap-2.5 text-left bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3 mb-2">
              <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">
                  Chuyển Khoản An Toàn
                </h5>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                  Mã QR được tích hợp chuẩn VietQR &amp; Napas 247, tự động điền đầy đủ thông tin khi quét bằng ứng dụng ngân hàng bất kỳ.
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className="text-[10px] text-zinc-600 mt-4 italic font-sans">
              * Mọi đóng góp của bạn đều được trân trọng và sử dụng 100% để thanh toán chi phí máy chủ CDN phát trực tuyến. Xin chân thành cảm ơn!
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

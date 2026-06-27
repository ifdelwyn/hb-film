import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Smartphone, Laptop, Sparkles, Send, CheckCircle } from 'lucide-react';
import PlatformLogo, { PlatformType } from '../components/PlatformLogo';

interface DownloadScreenProps {
  onNavigate: (route: string) => void;
}

export default function DownloadScreen({ onNavigate }: DownloadScreenProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalPlatform, setModalPlatform] = useState<PlatformType | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleOpenModal = (platform: PlatformType) => {
    setModalPlatform(platform);
    setIsSubscribed(false);
    setEmail('');
    setShowModal(true);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      triggerToast('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }
    setIsSubscribed(true);
    triggerToast('Đăng ký nhận thông tin thành công!');
  };

  return (
    <div className="w-full min-h-screen bg-black text-white pt-24 pb-16 relative overflow-hidden font-sans select-none">
      {/* Background visual accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E63946]/10 rounded-full filter blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full filter blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-3 mb-10 border-b border-zinc-900 pb-4">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center justify-center p-2 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-xs font-semibold text-zinc-400">Trang chủ / Tải ứng dụng</span>
        </div>

        {/* SECTION 1: HERO CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          {/* Animated Glow Logo App Icon */}
          <div className="relative w-24 h-24 mb-6 rounded-[28px] bg-gradient-to-tr from-[#E63946] to-rose-400 flex items-center justify-center shadow-[0_0_40px_rgba(230,57,70,0.4)] border border-white/20">
            <span className="font-signature lowercase text-5xl text-white select-none">bao</span>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black font-black text-[9px] uppercase px-1.5 py-0.5 rounded-full tracking-widest border border-black shadow-lg">
              BETA
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 uppercase">
            XEM PHIM MỌI LÚC MỌI NƠI
          </h1>
          <p className="text-zinc-450 text-sm sm:text-base max-w-xl leading-relaxed">
            Ứng dụng HB Film phát trực tuyến tốc độ cực cao, tương thích hoàn toàn thiết bị di động của bạn. Sẵn sàng xem không giới hạn bất cứ lúc nào.
          </p>
        </motion.div>

        {/* DOWNLOAD SECTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* SECTION 2: MOBILE CHÍNH THỨC */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#141414] border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all duration-300 group"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-[#E63946]">
                <Smartphone size={20} />
                <h3 className="text-sm font-black uppercase tracking-wider">Mobile Chính Thức</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                Phiên bản phân phối chính thức qua các cửa hàng ứng dụng toàn cầu. Ổn định và mượt mà nhất.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleOpenModal('ios_app_store')}
                className="w-full py-3.5 px-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-850 active:scale-98 transition-all cursor-pointer font-bold text-xs"
              >
                <PlatformLogo platform="ios_app_store" size="small" />
                <span>App Store</span>
              </button>
              <button 
                onClick={() => handleOpenModal('android_play')}
                className="w-full py-3.5 px-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-850 active:scale-98 transition-all cursor-pointer font-bold text-xs"
              >
                <PlatformLogo platform="android_play" size="small" />
                <span>Google Play</span>
              </button>
            </div>
          </motion.div>

          {/* SECTION 3: THỬ NGHIỆM BETA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#141414] border border-[#E63946]/30 rounded-3xl p-6 flex flex-col justify-between hover:border-[#E63946]/50 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-3 right-3 bg-[#FF6B00] text-white font-extrabold text-[9px] uppercase px-2.5 py-1 rounded-full tracking-wider border border-white/5">
              BETA LIVE
            </div>
            
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-[#FF6B00]">
                <Sparkles size={20} />
                <h3 className="text-sm font-black uppercase tracking-wider">Thử Nghiệm Beta</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                Trải nghiệm sớm các tính năng đột phá nhất trước khi ra mắt công chúng. Cài đặt trực tiếp dễ dàng.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => onNavigate('download/beta/ios')}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#E63946] to-rose-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs hover:scale-[1.02] active:scale-98 transition-all shadow-[0_4px_15px_rgba(230,57,70,0.3)] cursor-pointer"
              >
                <PlatformLogo platform="testflight" size="small" className="w-5 h-5" />
                <span>iOS Enterprise</span>
              </button>
              <button 
                onClick={() => onNavigate('download/beta/android')}
                className="w-full py-3.5 px-4 bg-zinc-900 border border-zinc-850 hover:border-[#FF6B00]/30 rounded-2xl flex items-center justify-center gap-3 hover:bg-zinc-850 hover:text-[#FF6B00] active:scale-98 transition-all font-bold text-xs cursor-pointer"
              >
                <PlatformLogo platform="android_beta" size="small" className="w-5 h-5" />
                <span>Android APK</span>
              </button>
            </div>
          </motion.div>

          {/* SECTION 4: DESKTOP CLIENTS */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#141414] border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-all duration-300 group"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-4 text-zinc-400">
                <Laptop size={20} />
                <h3 className="text-sm font-black uppercase tracking-wider">Phiên Bản Desktop</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                Dành cho trải nghiệm rạp phim màn hình lớn ngay tại nhà với các phím tắt chuyên nghiệp.
              </p>
            </div>
            
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={() => handleOpenModal('macos')}
                className="w-full py-2.5 px-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-between hover:bg-zinc-850 transition-all cursor-pointer text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <PlatformLogo platform="macos" size="small" className="w-5 h-5" />
                  <span>macOS M1/M2/Intel</span>
                </div>
                <span className="text-[10px] text-[#E63946] bg-[#E63946]/10 px-1.5 py-0.5 rounded">Sắp có</span>
              </button>
              <button 
                onClick={() => handleOpenModal('windows')}
                className="w-full py-2.5 px-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-between hover:bg-zinc-850 transition-all cursor-pointer text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <PlatformLogo platform="windows" size="small" className="w-5 h-5" />
                  <span>Windows 10/11</span>
                </div>
                <span className="text-[10px] text-[#E63946] bg-[#E63946]/10 px-1.5 py-0.5 rounded">Sắp có</span>
              </button>
              <button 
                onClick={() => handleOpenModal('linux')}
                className="w-full py-2.5 px-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl flex items-center justify-between hover:bg-zinc-850 transition-all cursor-pointer text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <PlatformLogo platform="linux" size="small" className="w-5 h-5" />
                  <span>Linux (Ubuntu/Deb)</span>
                </div>
                <span className="text-[10px] text-[#E63946] bg-[#E63946]/10 px-1.5 py-0.5 rounded">Sắp có</span>
              </button>
            </div>
          </motion.div>

        </div>

        {/* SECURITY ACCREDITATION BANNER */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 text-center text-xs text-zinc-500 leading-relaxed"
        >
          🛡️ Tất cả tập tin cài đặt và đường dẫn tải về được mã hóa bảo mật SSL, kiểm tra virus tự động qua máy chủ Cloud. Chứng chỉ phân phối được ký hợp lệ và phát hành bởi <strong>HB Film Studio</strong>.
        </motion.div>

        {/* DEVELOPING MODAL */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Blur backdrop overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              {/* Modal Card Content */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md bg-[#14141A] border border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden z-10 text-center"
              >
                {/* Visual light gradient background inside modal */}
                <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-48 h-48 bg-[#E63946]/10 rounded-full filter blur-3xl -z-10 pointer-events-none" />

                <div className="flex justify-center mb-5">
                  {modalPlatform ? (
                    <PlatformLogo platform={modalPlatform} size="large" />
                  ) : (
                    <span className="text-5xl">🚀</span>
                  )}
                </div>
                
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Đang Phát Triển</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
                  Phiên bản này đang trong giai đoạn hoàn thiện cuối cùng. Chúng tôi sẽ sớm ra mắt phiên bản ổn định đến toàn thể người dùng!
                </p>

                {/* Progress bar container */}
                <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden mb-6 relative">
                  {/* Shimmer animation progress body */}
                  <div 
                    className="h-full bg-gradient-to-r from-[#E63946] to-rose-500 relative rounded-full" 
                    style={{ width: '68%' }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:200px_100%] animate-[shimmer_1.5s_infinite]" />
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-zinc-550 font-extrabold mb-8 uppercase tracking-wider">
                  <span>Mức độ hoàn thiện: 68%</span>
                  <span>v1.0.0 Stable</span>
                </div>

                {/* Email Registration Input Form */}
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                  <p className="text-left text-[10px] font-black uppercase tracking-wider text-zinc-500 pl-1">Nhận email thông báo khi ra mắt</p>
                  
                  {isSubscribed ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs"
                    >
                      <CheckCircle size={16} />
                      <span>Đã đăng ký email nhận thông báo thành công!</span>
                    </motion.div>
                  ) : (
                    <div className="flex gap-2 bg-zinc-950 border border-zinc-900 focus-within:border-zinc-800 p-1 rounded-xl">
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email của bạn..." 
                        className="flex-grow bg-transparent text-xs text-white px-3 py-2 outline-none font-semibold"
                      />
                      <button 
                        type="submit"
                        className="bg-[#E63946] hover:bg-red-600 text-white rounded-lg p-2 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  )}
                </form>

                <button 
                  onClick={() => setShowModal(false)}
                  className="mt-6 text-[10px] text-zinc-500 hover:text-white uppercase font-black tracking-widest cursor-pointer hover:underline"
                >
                  Đóng cửa sổ
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Toast Message Notification inside download scope */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className="fixed bottom-10 left-1/2 bg-[#1A1A1A] text-white text-xs font-bold px-5 py-3 rounded-xl border border-zinc-800 shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-50 flex items-center gap-2 select-none"
            >
              <span>🔔</span> {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

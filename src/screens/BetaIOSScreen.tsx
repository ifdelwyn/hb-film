import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Check, Bug, MessageSquare, Play, HelpCircle, ClipboardList, Smartphone } from 'lucide-react';
import PlatformLogo from '../components/PlatformLogo';

interface BetaIOSScreenProps {
  onNavigate: (route: string) => void;
}

export default function BetaIOSScreen({ onNavigate }: BetaIOSScreenProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [downloadState, setDownloadState] = useState<'idle' | 'preparing' | 'downloading' | 'installing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const PLIST_URL = 'https://hb-film.onrender.com/beta/ios/manifest.plist';

  const handleInstall = () => {
    if (downloadState !== 'idle') return;
    
    // Start step-by-step download simulation
    setDownloadState('preparing');
    setProgress(0);
    
    setTimeout(() => {
      setDownloadState('downloading');
      
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setDownloadState('installing');
            
            setTimeout(() => {
              setDownloadState('completed');
              window.location.href = `itms-services://?action=download-manifest&url=${encodeURIComponent(PLIST_URL)}`;
              triggerToast('🍎 Đang bắt đầu cài đặt chứng chỉ Enterprise...');
              
              // Reset back to idle after showing success for 5s
              setTimeout(() => {
                setDownloadState('idle');
                setProgress(0);
              }, 5000);
            }, 1000);
            
            return 100;
          }
          // Increment by random realistic amount
          const step = Math.floor(Math.random() * 8) + 4;
          return Math.min(prev + step, 100);
        });
      }, 150);
    }, 1000);
  };

  // Check if current device is iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="w-full min-h-screen bg-black text-white pt-24 pb-20 font-sans select-none relative">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        
        {/* Back Link to main download */}
        <button 
          onClick={() => onNavigate('download')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold mb-6 transition-colors group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Quay lại tải ứng dụng</span>
        </button>

        {/* ALWAYS VISIBLE WARNING BANNER */}
        <div 
          className="shadow-2xl border border-red-500/10"
          style={{
            background: 'linear-gradient(135deg, #ff6b00, #e50914)',
            borderRadius: '16px',
            padding: '18px 22px',
            marginBottom: '28px',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start'
          }}
        >
          <span className="text-2xl sm:text-3xl animate-bounce shrink-0">⚠️</span>
          <div>
            <p className="text-white font-black text-sm sm:text-base mb-1 uppercase tracking-wide">
              Ứng dụng đang trong quá trình thử nghiệm
            </p>
            <p className="color-[rgba(255,255,255,0.9)] text-xs leading-relaxed font-semibold">
              Đây là phiên bản beta dành cho người dùng thử nghiệm sớm. Một số tính năng chưa được hoàn thiện và có thể xảy ra lỗi không mong muốn. Không nên dùng làm ứng dụng chính.
            </p>
          </div>
        </div>

        {/* MAIN APP DETAILS CONTAINER (TestFlight Style) */}
        <div className="bg-[#141414] border border-zinc-800 rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between pb-6 border-b border-zinc-900">
            <div className="flex items-center gap-5">
              {/* iOS Icon with smooth premium red gradient */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] bg-gradient-to-tr from-[#e50914] to-red-500 flex items-center justify-center text-white font-signature text-4xl shadow-[0_4px_25px_rgba(229,9,20,0.3)] shrink-0 border border-white/10">
                bao
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">HB Film Beta</h2>
                <p className="text-[#FF6B00] text-xs font-bold uppercase mt-1 tracking-wider">Phiên bản thử nghiệm iOS</p>
                <p className="text-zinc-500 text-[11px] font-semibold mt-0.5">v0.9.2 • HB Film Studio</p>
              </div>
            </div>

            {/* Install Button Container */}
            <div className="w-full sm:w-auto min-w-[240px]">
              {downloadState !== 'idle' ? (
                <div className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider">
                    <span className="text-[#FF6B00] animate-pulse">
                      {downloadState === 'preparing' && '🔍 Đang chuẩn bị...'}
                      {downloadState === 'downloading' && '⚡ Đang tải gói...'}
                      {downloadState === 'installing' && '📲 Khởi chạy...'}
                      {downloadState === 'completed' && '🎉 Thành công!'}
                    </span>
                    <span className="text-white font-black text-sm">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-950">
                    <div 
                      className="h-full bg-gradient-to-r from-[#FF6B00] to-red-500 rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wide text-center">
                    {downloadState === 'downloading' && '106 MB • Tốc độ: 8.4 MB/s'}
                    {downloadState === 'completed' && 'Đang bắt đầu cài đặt...'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={handleInstall} 
                    style={{
                      width: '100%',
                      padding: '14px 28px',
                      background: 'linear-gradient(135deg, #e50914, #c8060f)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '15px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 20px rgba(229,9,20,0.4)'
                    }}
                    className="hover:scale-[1.02] active:scale-98 transition-transform"
                  >
                    <PlatformLogo platform="testflight" size="small" className="w-5 h-5" />
                    <span>Cài đặt HB Film Beta</span>
                  </button>
                  {!isIOS && (
                    <p className="text-[10px] text-zinc-500 font-semibold text-center mt-1">
                      ℹ️ Khuyến nghị chạy trên iPhone/iPad
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* APP DETAILS METADATA LIST */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-4 gap-x-2 text-xs">
            <div>
              <p className="text-zinc-550 font-bold uppercase tracking-wider text-[10px] mb-1">Kích thước</p>
              <p className="text-zinc-300 font-extrabold">106 MB</p>
            </div>
            <div>
              <p className="text-zinc-550 font-bold uppercase tracking-wider text-[10px] mb-1">Phiên bản</p>
              <p className="text-zinc-300 font-extrabold text-[#FF6B00]">0.9.2-beta</p>
            </div>
            <div>
              <p className="text-zinc-550 font-bold uppercase tracking-wider text-[10px] mb-1">Cập nhật</p>
              <p className="text-zinc-300 font-extrabold">2 ngày trước</p>
            </div>
            <div>
              <p className="text-zinc-550 font-bold uppercase tracking-wider text-[10px] mb-1">Yêu cầu</p>
              <p className="text-zinc-300 font-extrabold">iOS 15.0+</p>
            </div>
            <div>
              <p className="text-zinc-550 font-bold uppercase tracking-wider text-[10px] mb-1">Ngôn ngữ</p>
              <p className="text-zinc-300 font-extrabold">Tiếng Việt</p>
            </div>
          </div>
        </div>

        {/* SECTION: WHAT'S NEW */}
        <div className="bg-[#141414] border border-zinc-800 rounded-3xl p-6 sm:p-8 mb-8">
          <h3 className="text-sm font-black text-[#FF6B00] uppercase tracking-wider mb-5 pb-3 border-b border-zinc-900 flex items-center gap-2">
            <ClipboardList size={18} /> Có gì mới trong v0.9.2-beta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 text-zinc-350">
                <span className="text-emerald-500 shrink-0">✅</span>
                <span>Xem phim tốc độ cao, tối ưu CDN</span>
              </div>
              <div className="flex items-start gap-2.5 text-zinc-350">
                <span className="text-emerald-500 shrink-0">✅</span>
                <span>Hỗ trợ Picture-in-Picture thu nhỏ</span>
              </div>
              <div className="flex items-start gap-2.5 text-zinc-350">
                <span className="text-emerald-500 shrink-0">✅</span>
                <span>Tải phim xem offline (thử nghiệm)</span>
              </div>
              <div className="flex items-start gap-2.5 text-zinc-350">
                <span className="text-emerald-500 shrink-0">✅</span>
                <span>Chromecast chia sẻ lên Tivi mượt mà</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 text-zinc-450">
                <span className="text-amber-500 shrink-0">🔧</span>
                <span>Đang sửa: Đăng nhập bằng Apple ID</span>
              </div>
              <div className="flex items-start gap-2.5 text-zinc-450">
                <span className="text-amber-500 shrink-0">🔧</span>
                <span>Đang sửa: Nhận thông báo đẩy (Push)</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: ENTERPRISE GUIDE */}
        <div className="bg-[#141414] border border-zinc-800 rounded-3xl p-6 sm:p-8 mb-8">
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-5 pb-3 border-b border-zinc-900">
            📝 Hướng dẫn cài đặt Enterprise
          </h3>
          <div className="space-y-4 text-xs leading-relaxed font-semibold text-zinc-400">
            <div className="flex gap-4 items-start">
              <span className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-[#FF6B00] flex items-center justify-center font-bold text-xs shrink-0">1</span>
              <div>
                <p className="text-white font-bold mb-1">Nhấn nút "Cài đặt" bên trên</p>
                <p className="text-[11px] text-zinc-500">iOS sẽ hiển thị hộp thoại hỏi xác nhận tải về → chọn "Cài đặt" để tiến hành tải ngầm.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-[#FF6B00] flex items-center justify-center font-bold text-xs shrink-0">2</span>
              <div>
                <p className="text-white font-bold mb-1">Cấu hình tin cậy nhà phát triển doanh nghiệp</p>
                <p className="text-[11px] text-[#FF6B00] font-bold">Vào Cài đặt hệ thống → Cài đặt chung → VPN & Quản lý thiết bị → Tìm chứng chỉ "HB Film Studio" → Nhấn "Tin tưởng".</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-[#FF6B00] flex items-center justify-center font-bold text-xs shrink-0">3</span>
              <div>
                <p className="text-white font-bold mb-1">Quay lại màn hình chính và mở ứng dụng</p>
                <p className="text-[11px] text-zinc-500">Bây giờ biểu tượng ứng dụng HB Film đã sẵn sàng hoạt động bình thường mà không bị lỗi bảo mật.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-zinc-900 flex justify-start">
            <button 
              onClick={() => triggerToast('📹 Đang khởi tạo video hướng dẫn trực quan...')}
              className="flex items-center gap-2 text-xs font-bold text-zinc-350 hover:text-white bg-zinc-950 border border-zinc-900 hover:border-zinc-850 py-2 px-4 rounded-xl cursor-pointer transition-all"
            >
              <Play size={14} className="text-[#FF6B00]" />
              <span>Xem video hướng dẫn trực quan</span>
            </button>
          </div>
        </div>

        {/* SECURITY ACCREDITATION FOOTER */}
        <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-500 leading-relaxed flex flex-col gap-4">
          <div>
            <p className="text-zinc-400 font-extrabold mb-1">⚠️ Lưu ý bảo mật</p>
            <p className="font-semibold text-[11px]">
              Ứng dụng được ký số bởi HB Film Studio qua chứng chỉ Enterprise chính gốc, đảm bảo không có mã độc hay phần mềm theo dõi thiết bị. Liên hệ hỗ trợ trực tiếp tại <span className="text-zinc-300 font-bold hover:underline cursor-pointer">beta@hbfilm.vn</span>.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-900/40">
            <button 
              onClick={() => triggerToast('📝 Đã mở biểu mẫu ghi nhận lỗi phát sinh.')}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 hover:text-red-400 border border-zinc-850 text-zinc-400 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Bug size={13} />
              <span>Gửi báo cáo lỗi</span>
            </button>
            <button 
              onClick={() => triggerToast('💬 Đang mở liên kết cộng đồng Telegram Beta.')}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 hover:text-blue-400 border border-zinc-850 text-zinc-400 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <MessageSquare size={13} />
              <span>Cộng đồng Beta</span>
            </button>
          </div>
        </div>

      </div>

      {/* Global Toast Message Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-10 left-1/2 bg-zinc-900 text-white text-xs font-bold px-5 py-3 rounded-xl border border-zinc-800 shadow-2xl z-50 flex items-center gap-2 select-none"
          >
            <span>🔔</span> {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

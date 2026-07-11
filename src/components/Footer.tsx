import { Film, Github, ShieldAlert, Heart, Info, Globe, Mail, BookOpen } from 'lucide-react';
import { SiFacebook, SiTiktok, SiThreads, SiInstagram } from 'react-icons/si';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer id="app-global-footer" className="bg-[#0A0A0F] border-t border-zinc-900 pt-16 pb-8 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12">
          {/* Brand Presentation Column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div 
              onClick={() => onNavigate('home')}
              className="flex flex-col items-start select-none cursor-pointer group pb-1 w-fit"
            >
              <span className="font-signature lowercase text-3xl text-zinc-100 group-hover:text-[var(--color-brand)] transition-colors leading-none">
                bao
              </span>
              <div className="w-8 h-[2px] bg-[var(--color-brand)] mt-1.5 group-hover:bg-zinc-100 transition-colors" />
            </div>
            <p className="text-xs text-zinc-450 leading-relaxed font-sans mt-2">
              Nền tảng phát trực tuyến đỉnh cao, tối ưu hóa tốc độ tải và mang lại trải nghiệm xem phim hoàn mỹ chuẩn rạp chiếu ngay tại nhà.
            </p>
          </div>

          {/* Quick Links & Apps Column */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-4 flex items-center gap-1">
              <Info size={12} /> Khám Phá &amp; App
            </h4>
            <div className="flex flex-col gap-2">
              <span onClick={() => onNavigate('home')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Trang Chủ chính</span>
              <span onClick={() => onNavigate('phim-le')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Phim Lẻ Bản Đẹp</span>
              <span onClick={() => onNavigate('phim-bo')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Phim Bộ Trọn Bộ</span>
              <span onClick={() => onNavigate('tai-khoan')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Lịch Sử Xem</span>
              <span onClick={() => onNavigate('download')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Tải ứng dụng (Beta iOS/Android)</span>
              <span 
                onClick={() => window.dispatchEvent(new Event('open-donation-modal'))} 
                className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer transition-colors flex items-center gap-1 mt-1"
              >
                ❤️ Ủng hộ nhà phát triển
              </span>
            </div>
          </div>

          {/* Hướng Dẫn Column */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-4 flex items-center gap-1">
              <BookOpen size={12} className="text-indigo-400" /> Hướng Dẫn
            </h4>
            <div className="flex flex-col gap-2">
              <span 
                onClick={() => window.dispatchEvent(new CustomEvent('open-guide-modal', { detail: { tab: 'overview' } }))} 
                className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors flex items-center gap-1.5"
              >
                📚 Giáo trình lập trình Web (Cơ bản &amp; Nâng cao)
              </span>
            </div>
          </div>

          {/* Guidelines / Terms */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-4 flex items-center gap-1">
              <ShieldAlert size={12} /> Điều Khoản &amp; Báo Cáo
            </h4>
            <div className="flex flex-col gap-2">
              <span onClick={() => window.dispatchEvent(new CustomEvent('open-policy-modal', { detail: { tab: 'quy-che' } }))} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Quy chế hoạt động</span>
              <span onClick={() => window.dispatchEvent(new CustomEvent('open-policy-modal', { detail: { tab: 'ban-quyen' } }))} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Hợp tác bản quyền</span>
              <span onClick={() => window.dispatchEvent(new CustomEvent('open-policy-modal', { detail: { tab: 'bao-mat' } }))} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Chính sách bảo mật</span>
              <span onClick={() => window.dispatchEvent(new CustomEvent('open-policy-modal', { detail: { tab: 'dmca' } }))} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Báo cáo vi phạm (DMCA)</span>
              
              <div className="w-full h-[1px] bg-zinc-900/80 my-1" />
              
              <span 
                onClick={() => window.dispatchEvent(new CustomEvent('open-report-modal', { detail: { type: 'bug', location: window.location.hash } }))} 
                className="text-xs text-[#E63946] hover:text-rose-400 font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                💬 Gửi ý kiến phản hồi
              </span>
            </div>
          </div>
        </div>

        {/* Social Media Connections Section */}
        <div className="border-t border-zinc-900/60 pb-12 pt-10 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2.5 text-center max-w-lg">
            <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 select-none">
              Kênh Cộng Đồng &amp; Mạng Xã Hội
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md px-4">
              Đăng ký quảng cáo vui lòng liên hệ tới 1 trong số mạng xã hội sau hoặc email (khuyên dùng để được phản hồi nhanh chóng):
            </p>
            <a 
              href="mailto:muahakhongcoem@proton.me" 
              className="text-xs text-zinc-400 hover:text-rose-400 font-sans flex items-center gap-1.5 mt-1 transition-colors select-text cursor-pointer bg-zinc-950/40 border border-zinc-900 px-3 py-1.5 rounded-xl hover:border-zinc-800"
            >
              <Mail size={12} className="text-zinc-500 animate-pulse" />
              <span>Email: <strong className="font-bold text-zinc-300 hover:text-rose-400">muahakhongcoem@proton.me</strong></span>
            </a>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            {[
              {
                name: 'Facebook',
                href: 'https://www.facebook.com/missyourvoice.zz',
                color: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]/50 text-zinc-100 bg-[#1A1A24]',
                glow: 'shadow-[0_0_15px_rgba(24,119,242,0.4)]',
                icon: <SiFacebook size={20} />
              },
              {
                name: 'TikTok',
                href: 'https://www.tiktok.com/@abcxyzconmeokeusao',
                color: 'hover:bg-black hover:text-[#00f2fe] hover:border-zinc-700 text-zinc-100 bg-[#1A1A24]',
                glow: 'shadow-[0_0_15px_rgba(0,242,254,0.3)]',
                icon: <SiTiktok size={20} />
              },
              {
                name: 'Threads',
                href: 'https://www.threads.net/@ur.brace',
                color: 'hover:bg-zinc-100 hover:text-black hover:border-zinc-300 text-zinc-100 bg-[#1A1A24]',
                glow: 'shadow-[0_0_15px_rgba(255,255,255,0.3)]',
                icon: <SiThreads size={20} />
              },
              {
                name: 'Instagram',
                href: 'https://www.instagram.com/ur.brace/',
                color: 'hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C]/50 text-zinc-100 bg-[#1A1A24]',
                glow: 'shadow-[0_0_15px_rgba(225,48,108,0.4)]',
                icon: <SiInstagram size={20} />
              },
              {
                name: 'Locket',
                href: 'https://locket.cam/if.delwyn',
                color: 'hover:bg-[#FFCC00] hover:text-black hover:border-[#FFCC00]/50 text-zinc-100 bg-[#1A1A24]',
                glow: 'shadow-[0_0_15px_rgba(255,204,0,0.4)]',
                icon: (
                  <svg viewBox="0 0 100 100" className="w-5 h-5 rounded-md overflow-hidden select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" rx="22" fill="#FFCC00" />
                    <circle cx="50" cy="50" r="26" fill="#111111" />
                    <circle cx="50" cy="50" r="21" stroke="#222222" strokeWidth="2.5" fill="none" />
                    <path d="M50 62 C47 62 36 52.5 36 44 C36 37 41.5 33.5 46 36.5 C50 39 50 39 50 39 C50 39 50 39 54 36.5 C58.5 33.5 64 37 64 44 C64 53.5 53 62 50 62 Z" fill="#FFCC00" />
                  </svg>
                )
              }
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                title={social.name}
                className={`w-12 h-12 rounded-full border border-zinc-800/80 flex items-center justify-center transition-all duration-300 hover:scale-[1.12] active:scale-95 ${social.color} hover:${social.glow} cursor-pointer`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Closing copyright rows */}
        <div className="border-t border-zinc-900/50 pt-8 flex items-center justify-center text-center">
          <p className="text-xs text-zinc-600 font-medium flex items-center gap-1">
            Made with <Heart size={10} className="text-red-500 fill-red-500 inline animate-pulse" /> Huy Bao
          </p>
        </div>
      </div>
    </footer>
  );
}

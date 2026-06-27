import { Film, Github, ShieldAlert, Heart, Info, Globe } from 'lucide-react';

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

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-4 flex items-center gap-1">
              <Info size={12} /> Khám Phá
            </h4>
            <div className="flex flex-col gap-2">
              <span onClick={() => onNavigate('home')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Trang Chủ chính</span>
              <span onClick={() => onNavigate('phim-le')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Phim Lẻ Bản Đẹp</span>
              <span onClick={() => onNavigate('phim-bo')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Phim Bộ Trọn Bộ</span>
              <span onClick={() => onNavigate('tai-khoan')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Lịch Sử Xem</span>
            </div>
          </div>

          {/* Guidelines / Terms */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-4 flex items-center gap-1">
              <ShieldAlert size={12} /> Điều Khoản
            </h4>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Quy chế hoạt động</span>
              <span className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Hợp tác bản quyền</span>
              <span className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Chính sách bảo mật</span>
              <span className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Báo cáo vi phạm (DMCA)</span>
            </div>
          </div>

          {/* Application Column */}
          <div>
            <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-4 flex items-center gap-1">
              📱 Ứng Dụng
            </h4>
            <div className="flex flex-col gap-2">
              <span onClick={() => onNavigate('download')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Tải ứng dụng</span>
              <span onClick={() => onNavigate('download/beta/ios')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Beta iOS</span>
              <span onClick={() => onNavigate('download/beta/android')} className="text-xs text-zinc-500 hover:text-white cursor-pointer transition-colors">Beta Android</span>
            </div>
          </div>
        </div>

        {/* Closing copyright rows */}
        <div className="border-t border-zinc-900/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} bao. Dự án web xem phim cao cấp cấp Production. All Rights Reserved.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-zinc-600">
            <span>Made with</span>
            <Heart size={10} className="text-[var(--color-brand)] fill-[var(--color-brand)] inline animate-pulse" />
            <span>by Bao Le Huy (lehuybao17112007@gmail.com)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

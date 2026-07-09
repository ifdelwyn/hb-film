import React, { useState, useEffect } from 'react';
import { X, Shield, FileText, Copyright, Lock, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type PolicyTab = 'quy-che' | 'ban-quyen' | 'bao-mat' | 'dmca';

export default function PolicyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PolicyTab>('quy-che');

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: PolicyTab }>;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
      }
      setIsOpen(true);
    };

    window.addEventListener('open-policy-modal', handleOpen);
    return () => {
      window.removeEventListener('open-policy-modal', handleOpen);
    };
  }, []);

  const tabs = [
    { id: 'quy-che', label: 'Quy chế hoạt động', icon: <FileText size={14} /> },
    { id: 'ban-quyen', label: 'Hợp tác bản quyền', icon: <Copyright size={14} /> },
    { id: 'bao-mat', label: 'Chính sách bảo mật', icon: <Lock size={14} /> },
    { id: 'dmca', label: 'Báo cáo vi phạm (DMCA)', icon: <AlertTriangle size={14} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'quy-che':
        return (
          <div className="space-y-4 text-zinc-300 text-xs leading-relaxed font-sans text-left">
            <h4 className="text-sm font-black text-white uppercase tracking-wide border-b border-zinc-900 pb-2 flex items-center gap-2">
              <FileText className="text-blue-500" size={16} />
              Quy Chế Hoạt Động Hệ Thống
            </h4>
            <p>
              Chào mừng bạn đến với nền tảng giải trí điện ảnh cao cấp <strong>FilmFlow (bao)</strong>. Bản quy chế này quy định các điều khoản sử dụng dịch vụ trực tuyến giữa Ban quản trị hệ thống và toàn bộ người dùng đăng ký tài khoản thành viên hoặc truy cập sử dụng.
            </p>
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3">
              <div>
                <strong className="text-white block mb-1">1. Mục đích hoạt động:</strong>
                <p className="text-zinc-400">Xây dựng không gian điện ảnh trực tuyến văn minh, hợp pháp, an toàn và tối ưu hóa tối đa về hiệu suất tải dữ liệu streaming cho trải nghiệm giải trí tại nhà trọn vẹn nhất.</p>
              </div>
              <div>
                <strong className="text-white block mb-1">2. Quyền lợi của thành viên:</strong>
                <p className="text-zinc-400">Người dùng được phép truy cập kho phim, tìm kiếm, lưu trữ lịch sử phát trực tuyến cá nhân, gửi phản hồi/yêu cầu phim và đăng ký nâng cấp trải nghiệm lên tài khoản hội viên VIP để nhận các đặc quyền cao cấp không quảng cáo.</p>
              </div>
              <div>
                <strong className="text-white block mb-1">3. Hành vi nghiêm cấm:</strong>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 mt-1">
                  <li>Nghiêm cấm mọi hành vi tấn công mạng, phá hoại hệ thống hoặc sử dụng các công cụ tự động (scripts, crawl, leech) để tải trái phép dữ liệu từ hệ thống máy chủ phát trực tuyến CDN của chúng tôi.</li>
                  <li>Không đăng tải bình luận bôi nhọ danh dự của người khác, truyền bá các tư tưởng khiếm nhã, thù địch hoặc trái với thuần phong mỹ tục và pháp luật Việt Nam.</li>
                </ul>
              </div>
              <div>
                <strong className="text-white block mb-1">4. Giới hạn trách nhiệm:</strong>
                <p className="text-zinc-400">Chúng tôi luôn không ngừng nỗ lực nâng cấp hệ thống CDN liên tục. Tuy nhiên, FilmFlow được miễn trừ trách nhiệm pháp lý trong trường hợp lỗi mạng diện rộng, lỗi kết nối nhà mạng ISP hoặc các tình huống bất khả kháng ngoài tầm kiểm soát trực tiếp.</p>
              </div>
            </div>
          </div>
        );
      case 'ban-quyen':
        return (
          <div className="space-y-4 text-zinc-300 text-xs leading-relaxed font-sans text-left">
            <h4 className="text-sm font-black text-white uppercase tracking-wide border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Copyright className="text-amber-500" size={16} />
              Chính Sách Hợp Tác Bản Quyền
            </h4>
            <p>
              Tôn trọng sức sáng tạo trí tuệ và bảo hộ tài sản trí tuệ là nguyên tắc sống còn định hình nên sự phát triển của <strong>FilmFlow (bao)</strong>. Chúng tôi luôn mong muốn trở thành đối tác tin cậy vững bền của các đơn vị sở hữu tác quyền.
            </p>
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3">
              <div>
                <strong className="text-white block mb-1">1. Cam kết tuân thủ tác quyền:</strong>
                <p className="text-zinc-400">Hệ thống tuân thủ nghiêm ngặt Luật sở hữu trí tuệ Việt Nam và các công ước quốc tế về bảo vệ quyền tác giả (như Công ước Berne). Mọi tư liệu được chia sẻ và trình chiếu đều hướng tới việc quảng bá nghệ thuật điện ảnh rộng khắp.</p>
              </div>
              <div>
                <strong className="text-white block mb-1">2. Cơ chế đối tác phát hành:</strong>
                <p className="text-zinc-400">Hỗ trợ các đạo diễn độc lập, nhà sản xuất nội địa và quốc tế công chiếu trực tuyến tác phẩm nghệ thuật. Cam kết hệ thống phân phối nội dung bảo mật, ngăn ngừa rò rỉ dữ liệu cùng chính sách chia sẻ lợi ích minh bạch.</p>
              </div>
              <div>
                <strong className="text-white block mb-1">3. Hợp tác quảng cáo &amp; truyền thông:</strong>
                <p className="text-zinc-400">Hỗ trợ quảng bá phi lợi nhuận cho các trailer phim chiếu rạp mới nhất, thúc đẩy doanh thu phòng vé cho các hãng phim đối tác chiến lược.</p>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-amber-500 text-[11px] font-medium leading-relaxed">
                👉 Mọi đề xuất hợp tác bản quyền thương mại hoặc ký kết khai thác phát sóng phim trực tuyến, đối tác vui lòng gửi đề xuất qua Email chính thức của chúng tôi: <strong className="font-bold select-all underline text-white">muahakhongcoem@proton.me</strong>.
              </div>
            </div>
          </div>
        );
      case 'bao-mat':
        return (
          <div className="space-y-4 text-zinc-300 text-xs leading-relaxed font-sans text-left">
            <h4 className="text-sm font-black text-white uppercase tracking-wide border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Lock className="text-emerald-500" size={16} />
              Chính Sách Bảo Mật Riêng Tư
            </h4>
            <p>
              Sự an toàn thông tin và quyền riêng tư tuyệt đối của khách hàng là ưu tiên hàng đầu tại <strong>FilmFlow (bao)</strong>. Chúng tôi chỉ thu thập các dữ liệu cơ bản tối thiểu nhằm mang lại trải nghiệm xem phim cá nhân tốt nhất.
            </p>
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3">
              <div>
                <strong className="text-white block mb-1">1. Dữ liệu cá nhân được thu thập:</strong>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 mt-1">
                  <li>Email đăng nhập tài khoản phục vụ xác thực người dùng.</li>
                  <li>Lịch sử xem phim, danh sách phim yêu thích để tiếp tục theo dõi tiến độ phát trên các thiết bị.</li>
                  <li>Tùy chọn giao diện người dùng bao gồm cấu hình âm lượng, giao diện phụ đề và danh sách bài hát yêu thích.</li>
                </ul>
              </div>
              <div>
                <strong className="text-white block mb-1">2. Phương thức bảo vệ thông tin:</strong>
                <p className="text-zinc-400">Tất cả thông tin tài khoản được lưu trữ an toàn, truyền tải mã hóa qua giao thức SSL/HTTPS đa tầng, mật khẩu tài khoản được băm một chiều hóa (salted hash) ngăn chặn triệt để nguy cơ đánh cắp dữ liệu.</p>
              </div>
              <div>
                <strong className="text-white block mb-1">3. Cam kết bảo mật tuyệt đối:</strong>
                <p className="text-zinc-400 font-semibold text-emerald-400">100% chúng tôi nói KHÔNG với việc thương mại hóa, chia sẻ, mua bán dữ liệu cá nhân của người xem cho bất kỳ đối tác thương mại hay bên thứ ba nào khi chưa có sự đồng ý bằng văn bản của chính chủ sở hữu tài khoản.</p>
              </div>
            </div>
          </div>
        );
      case 'dmca':
        return (
          <div className="space-y-4 text-zinc-300 text-xs leading-relaxed font-sans text-left">
            <h4 className="text-sm font-black text-white uppercase tracking-wide border-b border-zinc-900 pb-2 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={16} />
              Quy Trình Xử Lý Khiếu Nại Vi Phạm (DMCA)
            </h4>
            <p>
              <strong>FilmFlow (bao)</strong> tuân thủ chặt chẽ Đạo luật Bản quyền Thiên niên kỷ Kỹ thuật số (DMCA) và Luật Sở hữu trí tuệ nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Chúng tôi cam kết hành động gỡ bỏ nhanh chóng các tài nguyên khi có khiếu nại chính đáng hợp pháp.
            </p>
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-3">
              <div>
                <strong className="text-white block mb-1">1. Đơn yêu cầu gỡ bỏ hợp lệ cần cung cấp:</strong>
                <ol className="list-decimal list-inside text-zinc-400 space-y-1 mt-1">
                  <li>Văn bản chứng minh tư cách sở hữu bản quyền hợp pháp hoặc văn bản ủy quyền đại diện chính thức.</li>
                  <li>Địa chỉ đường dẫn (URL) cụ thể của tập phim hoặc nội dung bị khiếu nại trên hệ thống web của chúng tôi.</li>
                  <li>Thông tin liên hệ của chủ thể quyền sở hữu hoặc đại diện được ủy quyền (gồm họ tên, số điện thoại, thư điện tử trực tiếp).</li>
                </ol>
              </div>
              <div>
                <strong className="text-white block mb-1">2. Quy trình xử lý của ban quản trị:</strong>
                <p className="text-zinc-400">Sau khi nhận được đầy đủ chứng minh thông tin pháp lý qua email, đội ngũ vận hành hệ thống sẽ tiến hành rà soát kỹ thuật nhanh chóng và thực hiện biện pháp gỡ bỏ/ẩn nội dung vi phạm được báo cáo trong thời gian tối đa là <strong className="text-red-400">24 giờ làm việc</strong>.</p>
              </div>
              <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 text-red-500 text-[11px] font-medium leading-relaxed">
                🚨 Vui lòng gửi trực tiếp đầy đủ thông tin khiếu nại bản quyền hợp lệ về hòm thư chuyên trách: <strong className="font-bold select-all underline text-white">muahakhongcoem@proton.me</strong> để chúng tôi kịp thời xử lý gỡ bỏ bảo vệ tác quyền.
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="policy-global-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
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
            className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-850 rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row h-[550px] md:h-[480px] z-10 border-zinc-800/80"
          >
            {/* Left/Top Navigation rail */}
            <div className="w-full md:w-[220px] bg-zinc-900/30 border-b md:border-b-0 md:border-r border-zinc-900/80 p-4 md:p-5 flex flex-col shrink-0 gap-3">
              {/* Logo / Brand Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                  <Shield size={14} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-white leading-none">FilmFlow</span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5 tracking-wider">CHÍNH SÁCH</span>
                </div>
              </div>

              {/* Tabs list */}
              <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0">
                {tabs.map((tab) => {
                  const isTabActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as PolicyTab)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider text-left transition-all shrink-0 cursor-pointer border ${
                        isTabActive 
                          ? 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/25 shadow-xs' 
                          : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                      }`}
                    >
                      {tab.icon}
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right/Bottom content container */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Modal close header */}
              <div className="flex items-center justify-end p-4 border-b border-zinc-900/60 shrink-0">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Scrollable text container */}
              <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
                {renderContent()}
              </div>

              {/* Footer seal */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-900/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-650 font-bold uppercase tracking-wider">
                  <Sparkles size={10} className="text-zinc-600 animate-pulse" />
                  <span>Bảo mật &amp; Hợp pháp</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle size={10} className="text-emerald-500" />
                  <span className="text-[9px] text-emerald-500 font-extrabold uppercase">Cập nhật: 2026</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

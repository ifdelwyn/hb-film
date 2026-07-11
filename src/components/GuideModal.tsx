import React, { useState, useEffect } from 'react';
import { X, BookOpen, Code, Palette, Play, Database, Sparkles, Copy, Check, Terminal, GraduationCap, ChevronRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TabItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export default function GuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab) {
        setActiveTab(customEvent.detail.tab);
      } else {
        setActiveTab('overview');
      }
      setIsOpen(true);
    };

    const handleClose = () => setIsOpen(false);

    window.addEventListener('open-guide-modal', handleOpen);
    window.addEventListener('close-guide-modal', handleClose);

    return () => {
      window.removeEventListener('open-guide-modal', handleOpen);
      window.removeEventListener('close-guide-modal', handleClose);
    };
  }, []);

  const handleCopyCode = (codeText: string, blockId: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(blockId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs: TabItem[] = [
    {
      id: 'overview',
      title: 'Giới Thiệu Chung',
      subtitle: 'Mục tiêu & Mục lục',
      icon: <GraduationCap size={16} />
    },
    {
      id: 'buoi1',
      title: 'Buổi 1: Web là gì?',
      subtitle: 'Cấu trúc & Hoạt động',
      icon: <BookOpen size={16} />
    },
    {
      id: 'buoi2',
      title: 'Buổi 2: Khung HTML',
      subtitle: 'Xây dựng khung xương',
      icon: <Code size={16} />
    },
    {
      id: 'buoi3',
      title: 'Buổi 3: Trang Trí CSS',
      subtitle: 'Định hình giao diện',
      icon: <Palette size={16} />
    },
    {
      id: 'buoi4',
      title: 'Buổi 4: JS Cơ Bản',
      subtitle: 'Tạo tương tác',
      icon: <Terminal size={16} />
    },
    {
      id: 'buoi5',
      title: 'Buổi 5: Hero Slider',
      subtitle: 'Thực hành Case Study',
      icon: <Play size={16} />
    },
    {
      id: 'buoi6',
      title: 'Buổi 6: Quản Lý Dữ Liệu',
      subtitle: 'Cờ featured & Mở rộng',
      icon: <Database size={16} />
    },
    {
      id: 'rubric',
      title: 'Tiêu Chí Đánh Giá',
      subtitle: 'Barem chấm điểm',
      icon: <Sparkles size={16} className="text-yellow-400" />
    }
  ];

  const htmlCode = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Trang xem phim</title>
</head>
<body>

  <div class="banner">
    <img src="phim.jpg" alt="Ảnh phim" class="banner-image">

    <div class="banner-info">
      <div class="tags">
        <span class="tag">IMDb 4</span>
        <span class="tag">Phim Lẻ</span>
        <span class="tag">2026</span>
      </div>

      <h1 class="movie-title">Ma Nữ Oán Tình</h1>
      <p class="duration">100 phút</p>

      <div class="genres">
        <span>#Kinh Dị</span>
        <span>#Gây Cấn</span>
        <span>#Lãng Mạn</span>
      </div>

      <p class="description">
        Mang theo những ám ảnh từ quá khứ, Malee trở về khu căn hộ
        gắn liền với tuổi thơ...
      </p>

      <div class="buttons">
        <button class="btn-watch">▶ Xem ngay</button>
        <button class="btn-list">+ Danh sách</button>
        <button class="btn-detail">ⓘ Chi tiết</button>
      </div>
    </div>
  </div>

</body>
</html>`;

  const cssCode = `.banner {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-info {
  position: absolute;
  bottom: 60px;
  left: 40px;
  color: white;
  max-width: 600px;
}

.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  background: rgba(0,0,0,0.6);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
}

.movie-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 8px;
}

.btn-watch {
  background: #e50914;
  color: white;
  padding: 14px 28px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.btn-list, .btn-detail {
  background: rgba(255,255,255,0.15);
  color: white;
  padding: 14px 24px;
  border: none;
  border-radius: 6px;
  margin-left: 10px;
  cursor: pointer;
}`;

  const jsCode = `// Biến lưu dữ liệu 1 phim
let movie = {
  title: "Ma Nữ Oán Tình",
  imdb: 4,
  year: 2026,
  duration: "100 phút",
  genres: ["Kinh Dị", "Gây Cấn", "Lãng Mạn"],
  description: "Mang theo những ám ảnh từ quá khứ..."
};

// Lấy phần tử HTML và thay đổi nội dung
document.querySelector(".movie-title").textContent = movie.title;
// Xử lý sự kiện click nút
document.querySelector(".btn-watch").addEventListener("click", () => {
  alert("Đang phát phim: " + movie.title);
});`;

  const b5Code = `// 5.1 Bước 1: Tạo mảng dữ liệu nhiều phim
const movies = [
  {
    title: "Ma Nữ Oán Tình",
    imdb: 4,
    year: 2026,
    duration: "100 phút",
    genres: ["Kinh Dị", "Gây Cấn", "Lãng Mạn"],
    description: "Mang theo những ám ảnh từ quá khứ...",
    image: "phim1.jpg"
  },
  {
    title: "Hồn Ma Báo Oán",
    imdb: 6.5,
    year: 2026,
    duration: "95 phút",
    genres: ["Kinh Dị", "Tâm Linh"],
    description: "Một gia đình chuyển đến ngôi nhà cũ...",
    image: "phim2.jpg"
  },
  {
    title: "Yêu Em Từ Kiếp Trước",
    imdb: 7.2,
    year: 2026,
    duration: "110 phút",
    genres: ["Lãng Mạn", "Tâm Lý"],
    description: "Câu chuyện tình yêu xuyên suốt hai kiếp sống...",
    image: "phim3.jpg"
  }
];

// 5.2 Bước 2: Viết hàm hiển thị 1 phim ra giao diện
let currentIndex = 0;

function renderMovie(index) {
  const movie = movies[index];
  document.querySelector(".movie-title").textContent = movie.title;
  document.querySelector(".duration").textContent = movie.duration;
  document.querySelector(".description").textContent = movie.description;
  document.querySelector(".banner-image").src = movie.image;
}

renderMovie(currentIndex); // hiển thị phim đầu tiên khi tải trang

// 5.3 Bước 3: Tự động chuyển phim sau mỗi X giây
setInterval(() => {
  currentIndex = (currentIndex + 1) % movies.length; // quay vòng về đầu khi hết mảng
  renderMovie(currentIndex);
}, 5000); // 5 giây đổi 1 lần

// 5.4 Bước 4: Nút chuyển thủ công (mũi tên trái/phải)
document.querySelector(".next-btn").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % movies.length;
  renderMovie(currentIndex);
});

document.querySelector(".prev-btn").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + movies.length) % movies.length;
  renderMovie(currentIndex);
});`;

  const b6Code = `const allMovies = [
  { title: "Ma Nữ Oán Tình", featured: true, ... },
  { title: "Hồn Ma Báo Oán", featured: false, ... },
  { title: "Yêu Em Từ Kiếp Trước", featured: true, ... },
];

// Banner chỉ lấy phim có featured = true
const bannerMovies = allMovies.filter(movie => movie.featured);`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="guide-global-modal" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md select-none font-sans">
          {/* Backdrop Click */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-zinc-950 border border-zinc-900 rounded-[24px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col z-10 border-zinc-800/80"
          >
            {/* Header section */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight uppercase">
                    Tài Liệu Học Tập
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    Giáo trình xây dựng Website cơ bản cho người mới bắt đầu
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
              
              {/* Left Sidebar tabs */}
              <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-900 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-1 p-2 bg-zinc-950/40 shrink-0 no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all shrink-0 md:shrink cursor-pointer border ${
                      activeTab === tab.id
                        ? 'bg-indigo-600/10 border-indigo-500/30 text-white font-bold'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className={`${activeTab === tab.id ? 'text-indigo-400' : 'text-zinc-500'}`}>
                      {tab.icon}
                    </div>
                    <div className="hidden md:block min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{tab.title}</p>
                      <p className="text-[9px] text-zinc-500 font-medium leading-none mt-0.5 truncate">{tab.subtitle}</p>
                    </div>
                    <span className="md:hidden text-xs font-bold whitespace-nowrap">{tab.title.replace('Buổi ', 'B')}</span>
                  </button>
                ))}
              </div>

              {/* Right Content details */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-zinc-950/20 select-text">
                
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-full">
                        CASE STUDY THỰC HÀNH: WEBSITE XEM PHIM
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight leading-tight">
                        GIÁO ÁN: XÂY DỰNG WEBSITE CƠ BẢN CHO NGƯỜI MỚI BẮT ĐẦU
                      </h1>
                      <div className="w-16 h-1 bg-indigo-500 rounded-full mt-3" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900">
                      <div>
                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">Đối tượng học viên</p>
                        <p className="text-xs text-zinc-300 font-bold mt-1">Người mới học lập trình web (chưa biết gì hoặc biết chút ít)</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">Thời lượng khóa học</p>
                        <p className="text-xs text-zinc-300 font-bold mt-1">6 buổi học chất lượng cao (mỗi buổi 2-3 giờ)</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <GraduationCap size={14} className="text-indigo-400" /> Mục tiêu cuối khóa học
                      </h3>
                      <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-5 leading-relaxed">
                        <li>Học viên tự tay xây dựng được một trang chủ website xem phim hoàn chỉnh.</li>
                        <li>Có Banner giới thiệu phim tự động chuyển (Hero Slider Carousel).</li>
                        <li>Danh sách phim hiển thị trực quan và hiểu được cách tổ chức dữ liệu website.</li>
                        <li>Nắm vững nền tảng vững chắc để tiếp tục học lên React, Vue hoặc Backend.</li>
                      </ul>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen size={14} className="text-indigo-400" /> Nội dung chương trình (Mục lục)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {tabs.filter(t => t.id !== 'overview').map((tab, idx) => (
                          <div 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900/80 hover:border-zinc-800 hover:bg-zinc-900/80 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black font-mono text-zinc-500 w-4">0{idx + 1}</span>
                              <div>
                                <p className="text-xs font-bold text-zinc-300">{tab.title}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{tab.subtitle}</p>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-zinc-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'buoi1' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 1
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        Website là gì? Cấu trúc một trang web
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">1.1 Mục tiêu buổi học</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>Hiểu cơ chế website hoạt động trên môi trường Internet (Client - Server).</li>
                        <li>Phân biệt rõ ràng vai trò của HTML, CSS, JavaScript.</li>
                        <li>Biết cách phân tích cấu trúc của bất kỳ trang web thực tế nào.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">1.2 Vai trò 3 thành phần (Mô hình Ngôi Nhà)</h3>
                      <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-900/20">
                        <table className="w-full text-left text-xs text-zinc-300 border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-900 bg-zinc-950/80">
                              <th className="p-3 font-bold text-zinc-400">Thành phần</th>
                              <th className="p-3 font-bold text-zinc-400">Vai trò chính</th>
                              <th className="p-3 font-bold text-zinc-400">Ví dụ ngoài đời</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-zinc-900/60">
                              <td className="p-3 font-bold text-red-400 font-mono">HTML</td>
                              <td className="p-3 text-zinc-400">Khung xương, nội dung thô hiển thị</td>
                              <td className="p-3 text-zinc-400">Gạch, tường, cột nhà thô</td>
                            </tr>
                            <tr className="border-b border-zinc-900/60">
                              <td className="p-3 font-bold text-blue-400 font-mono">CSS</td>
                              <td className="p-3 text-zinc-400">Trang trí, màu sắc, sắp xếp bố cục</td>
                              <td className="p-3 text-zinc-400">Sơn tường, nội thất, thiết kế ánh sáng</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-bold text-yellow-400 font-mono">JavaScript</td>
                              <td className="p-3 text-zinc-400">Tương tác động, xử lý logic sự kiện</td>
                              <td className="p-3 text-zinc-400">Hệ thống điện, cửa tự động, thang máy</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-900 space-y-2">
                      <h4 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Cơ chế Client - Server hoạt động ra sao?
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Khi bạn nhập một địa chỉ hoặc bấm vào xem phim, <strong>Trình duyệt (Client)</strong> sẽ gửi một yêu cầu (Request) lên <strong>Máy chủ (Server)</strong>. Server xử lý và tìm kiếm dữ liệu phim từ database, sau đó đóng gói và phản hồi (Response) gửi lại mã nguồn HTML/CSS/JS để trình duyệt dịch và vẽ lên màn hình cho bạn xem.
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">1.3 Thực hành mở đầu</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy quan sát banner của bộ phim thực tế đang chiếu (ví dụ: phim kinh dị <strong>"Ma Nữ Oán Tình"</strong>), phân tích:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest font-mono">HTML chứa gì?</p>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Ảnh nền banner, tiêu đề chữ "Ma Nữ Oán Tình", mô tả, các nút bấm xem phim.</p>
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest font-mono">CSS chỉnh gì?</p>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Sắp xếp chữ đè lên ảnh nền, chỉnh chữ màu trắng nổi bật, tạo nút màu đỏ rực rỡ.</p>
                        </div>
                        <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl">
                          <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest font-mono">JS làm gì?</p>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">Sau 5 giây tự động trượt sang phim khác, hiển thị thông báo phát phim khi bấm Xem ngay.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'buoi2' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 2
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        HTML - Xây dựng khung xương tĩnh cho phim
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">2.1 Mục tiêu buổi học</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>Làm quen và ghi nhớ các thẻ cơ bản: <code className="text-red-400 font-mono">&lt;div&gt;</code>, <code className="text-red-400 font-mono">&lt;h1&gt;</code>, <code className="text-red-400 font-mono">&lt;p&gt;</code>, <code className="text-red-400 font-mono">&lt;button&gt;</code>, <code className="text-red-400 font-mono">&lt;img&gt;</code>.</li>
                        <li>Hiểu thuộc tính <code className="text-indigo-400 font-mono">class</code> để gắn nhãn trang trí sau này.</li>
                        <li>Tự tay viết được cấu trúc thô của Banner Phim tĩnh hoàn thiện.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">2.2 Cấu trúc mã nguồn HTML mẫu</h3>
                        <button
                          onClick={() => handleCopyCode(htmlCode, 'html')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'html' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'html' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text max-h-[350px]">
                          {htmlCode}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2">
                      <h4 className="text-xs font-black text-white uppercase">2.3 Bài tập thực hành buổi 2</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy tự viết lại đoạn mã HTML trên bằng tay (không dùng copy-paste) cho một bộ phim bất kỳ bạn yêu thích. Hãy thay đổi tiêu đề phim thành phim bạn thích, cập nhật thời lượng, thể loại, và mô tả phim tương ứng.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'buoi3' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 3
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        CSS - Trang trí giao diện & Sắp xếp bố cục phim
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">3.1 Mục tiêu buổi học</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>Hiểu cách định cấu trúc vị trí tuyệt đối và tương đối (<code className="text-blue-400 font-mono">position: absolute / relative</code>).</li>
                        <li>Nắm vững cách xếp khối ngang thẳng hàng bằng Flexbox (<code className="text-blue-400 font-mono">display: flex</code>).</li>
                        <li>Biết cách làm nổi bật văn bản trên nền ảnh mờ, nút bấm đỏ chuẩn điện ảnh.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">3.2 Đoạn mã CSS mẫu trang trí</h3>
                        <button
                          onClick={() => handleCopyCode(cssCode, 'css')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'css' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'css' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text max-h-[350px]">
                          {cssCode}
                        </pre>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">3.3 Khái niệm cốt lõi cần nhấn mạnh</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900/80">
                          <p className="text-[11px] font-bold text-white font-mono">position: relative / absolute</p>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">Giúp định vị phần thông tin phim đè lên trên bức ảnh nền. Container chứa ảnh là relative, khối thông tin là absolute dính ở góc dưới.</p>
                        </div>
                        <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900/80">
                          <p className="text-[11px] font-bold text-white font-mono">display: flex</p>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">Công cụ cực kỳ mạnh mẽ giúp các nhãn tag (như IMDb, Năm, Thể loại) tự động nằm ngang và cách đều nhau chỉ với 1 dòng code.</p>
                        </div>
                        <div className="bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-900/80">
                          <p className="text-[11px] font-bold text-white font-mono">object-fit: cover</p>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">Đảm bảo ảnh poster phim luôn luôn lấp đầy diện tích banner mà không bị bóp méo, kéo giãn sai tỉ lệ ảnh gốc.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2">
                      <h4 className="text-xs font-black text-white uppercase">3.4 Bài tập thực hành buổi 3</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy thử chỉnh sửa thuộc tính màu sắc nền nút bấm (background) và thêm hiệu ứng bo góc tròn lớn hơn (<code className="text-blue-400 font-mono">border-radius</code>) để biến đổi phong cách thiết kế theo thẩm mỹ cá nhân của riêng bạn!
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'buoi4' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 4
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        JavaScript Cơ Bản - Thổi hồn tương tác cho phim
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">4.1 Mục tiêu buổi học</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>Hiểu khái niệm Biến, Đối tượng chứa dữ liệu (<code className="text-yellow-400 font-mono">Object</code>) mô tả phim.</li>
                        <li>Học cách tương tác trực tiếp với HTML thô thông qua cơ chế DOM (<code className="text-yellow-400 font-mono">document.querySelector</code>).</li>
                        <li>Lắng nghe hành vi người dùng và phản hồi sự kiện click chuột.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">4.2 Mã nguồn JavaScript nền tảng</h3>
                        <button
                          onClick={() => handleCopyCode(jsCode, 'js')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'js' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'js' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text max-h-[350px]">
                          {jsCode}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2">
                      <h4 className="text-xs font-black text-white uppercase">4.3 Bài tập thực hành buổi 4</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy viết mã JavaScript cho nút <strong>"+ Danh sách"</strong> sao cho khi người dùng click vào, nhãn chữ sẽ lập tức chuyển thành <strong>"✓ Đã thêm vào danh sách"</strong> để tạo cảm giác phản hồi tức thì.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'buoi5' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 5 (QUAN TRỌNG NHẤT)
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        Thực hành Case Study - Hero Banner Slider tự động
                      </h1>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Đây là buổi học thực hành mấu chốt: chúng ta sẽ ghép toàn bộ mảnh ghép HTML, CSS và JavaScript lại để tạo ra một hệ thống Slider trình chiếu banner tự động luân phiên giữa nhiều bộ phim khác nhau một cách mượt mà nhất.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Mã nguồn ghép nối Slider hoàn chỉnh</h3>
                        <button
                          onClick={() => handleCopyCode(b5Code, 'b5')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'b5' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'b5' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text max-h-[350px]">
                          {b5Code}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2.5">
                      <h4 className="text-xs font-black text-white uppercase flex items-center gap-1">
                        <span className="text-indigo-400">⚡</span> Điểm nhấn sư phạm đặc biệt
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy nhấn mạnh thuật toán xoay vòng chỉ mục: <code className="text-yellow-400 font-mono">currentIndex = (currentIndex + 1) % movies.length</code>. Đây là mẹo lập trình kinh điển giúp chỉ mục index luôn quay về đầu danh sách (<code className="font-mono">0</code>) một cách tự động khi chạm giới hạn cuối mảng mà không bao giờ bị lỗi tràn mảng.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'buoi6' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 6
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        Quản lý dữ liệu chuyên nghiệp & Mở rộng hệ thống
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">6.1 Mục tiêu buổi học</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>Thấu hiểu lý do vì sao cần tách rời dữ liệu (Data) ra khỏi giao diện hiển thị (View).</li>
                        <li>Nắm vững tư duy thiết kế hệ thống: <strong>"Chỉ bật/tắt hiển thị, không xóa dữ liệu gốc"</strong>.</li>
                        <li>Hiểu cách dùng thuộc tính lọc cờ nổi bật (<code className="text-indigo-400 font-mono">featured: true/false</code>) như các nền tảng lớn.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">6.2 Đoạn code minh họa lọc cờ Featured</h3>
                        <button
                          onClick={() => handleCopyCode(b6Code, 'b6')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'b6' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'b6' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text">
                          {b6Code}
                        </pre>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">6.3 Giải thích bản chất thực tế</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Khi vận hành website phim thực tế, quản trị viên không bao giờ xóa hẳn phim khỏi kho chỉ vì không muốn nó xuất hiện ở Banner trượt đầu trang nữa. Thuộc tính <code className="text-yellow-400 font-mono">featured: true/false</code> hoạt động giống như một công tắc bóng đèn. Khi gạt sang <code className="font-mono">false</code>, phim sẽ ẩn khỏi Banner nhưng vẫn tồn tại vĩnh viễn trong danh sách tổng để phục vụ tìm kiếm hoặc xem lại.
                      </p>
                    </div>

                    <div className="bg-indigo-950/25 border border-indigo-900/50 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-black text-indigo-400 uppercase">🚀 Kiến thức mở rộng (Cho học viên nâng cao)</h4>
                      <p className="text-xs text-zinc-450 leading-relaxed">
                        Giới thiệu tổng quan về <strong>Database (MySQL, MongoDB)</strong> và các API truyền dữ liệu giúp nạp danh sách phim tự động từ máy chủ từ xa về ứng dụng thay vì khai báo biến cứng trong code JS, kết hợp với các công cụ <strong>CMS (Hệ quản trị nội dung)</strong> tiện lợi.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'rubric' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-full">
                        ĐÁNH GIÁ CUỐI KHÓA
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        Tiêu Chí Chấm Điểm &amp; Bài Tập Tổng Kết
                      </h1>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-900/20">
                      <table className="w-full text-left text-xs text-zinc-300 border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-900 bg-zinc-950/80">
                            <th className="p-3.5 font-bold text-zinc-400">Tiêu chí đánh giá</th>
                            <th className="p-3.5 font-bold text-zinc-400">Trọng số</th>
                            <th className="p-3.5 font-bold text-zinc-400">Yêu cầu cần đạt</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-zinc-900/60">
                            <td className="p-3.5 font-bold text-zinc-200">Cấu trúc HTML</td>
                            <td className="p-3.5 text-zinc-400 font-bold font-mono">20%</td>
                            <td className="p-3.5 text-zinc-450">Các thẻ được lồng ghép chuẩn chỉ, sử dụng class đúng ngữ nghĩa, không sai chính tả thẻ đóng.</td>
                          </tr>
                          <tr className="border-b border-zinc-900/60">
                            <td className="p-3.5 font-bold text-zinc-200">Bố cục trang trí CSS</td>
                            <td className="p-3.5 text-zinc-400 font-bold font-mono">25%</td>
                            <td className="p-3.5 text-zinc-450">Màu sắc hài hòa, responsive thích ứng các kích thước màn hình cơ bản, căn chỉnh chữ nằm đẹp trên ảnh.</td>
                          </tr>
                          <tr className="border-b border-zinc-900/60">
                            <td className="p-3.5 font-bold text-zinc-200">Xử lý JS Slider</td>
                            <td className="p-3.5 text-zinc-400 font-bold font-mono">35%</td>
                            <td className="p-3.5 text-zinc-450">Slider hoạt động trơn tru cả tự động xoay vòng lẫn bấm phím thủ công, phản hồi click chuẩn xác.</td>
                          </tr>
                          <tr>
                            <td className="p-3.5 font-bold text-zinc-200">Quản lý dữ liệu</td>
                            <td className="p-3.5 text-zinc-400 font-bold font-mono">20%</td>
                            <td className="p-3.5 text-zinc-450">Mảng dữ liệu phân tách sạch sẽ khỏi code hiển thị, biết áp dụng cờ lọc Featured cho banner.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2.5 text-zinc-400 text-xs">
                      <h4 className="text-xs font-black text-white uppercase">📝 Đề bài tập tổng kết</h4>
                      <p className="leading-relaxed">
                        Học viên hãy tự thiết lập một trang web cá nhân hoàn chỉnh bao gồm: 1 Banner trượt tự động luân phiên tối thiểu 4 bộ phim do bạn tự biên soạn, bên dưới là một hàng lưới danh sách thẻ phim (Movie Cards Grid) có thể click xem chi tiết hoặc bấm nút thích để tăng lượt tương tác của phim đó.
                      </p>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

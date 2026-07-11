import React, { useState, useEffect } from 'react';
import { X, BookOpen, Code, Palette, Play, Database, Sparkles, Copy, Check, Terminal, GraduationCap, ChevronRight, HelpCircle, Globe } from 'lucide-react';
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
  const [courseMode, setCourseMode] = useState<'basic' | 'advanced'>('basic');

  useEffect(() => {
    if (activeTab.startsWith('adv-')) {
      setCourseMode('advanced');
    } else if (activeTab !== 'deploy-guide') {
      setCourseMode('basic');
    }
  }, [activeTab]);

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
    },
    {
      id: 'adv-overview',
      title: '🚀 Lộ Trình Nâng Cao',
      subtitle: 'Mục tiêu & Định hướng',
      icon: <Sparkles size={16} className="text-indigo-400 animate-pulse" />
    },
    {
      id: 'adv-buoi1',
      title: '💻 Buổi 1: React & Vite',
      subtitle: 'Kiến trúc Single Page App',
      icon: <Code size={16} className="text-cyan-400" />
    },
    {
      id: 'adv-buoi2',
      title: '⚛️ Buổi 2: State & Hooks',
      subtitle: 'useState, useEffect chuyên sâu',
      icon: <Sparkles size={16} className="text-purple-400" />
    },
    {
      id: 'adv-buoi3',
      title: '🎨 Buổi 3: Motion & UI',
      subtitle: 'Xây dựng Hoạt họa mượt mà',
      icon: <Palette size={16} className="text-pink-400" />
    },
    {
      id: 'adv-buoi4',
      title: '⚙️ Buổi 4: Express API',
      subtitle: 'Server & Proxy bảo mật',
      icon: <Terminal size={16} className="text-green-400" />
    },
    {
      id: 'adv-buoi5',
      title: '🗄️ Buổi 5: Cloud Firebase',
      subtitle: 'Realtime Sync & Auth',
      icon: <Database size={16} className="text-amber-400" />
    },
    {
      id: 'adv-buoi6',
      title: '🐋 Buổi 6: SQL & Deploy',
      subtitle: 'PostgreSQL & Cloud Run',
      icon: <HelpCircle size={16} className="text-blue-400" />
    },
    {
      id: 'deploy-guide',
      title: '🌐 Deploy & Domain',
      subtitle: 'Đưa website lên Internet',
      icon: <Globe size={16} className="text-pink-400" />
    },
    {
      id: 'courses-ref',
      title: '🎓 Khóa học tham khảo',
      subtitle: 'Tài liệu & Khóa học ngoài',
      icon: <GraduationCap size={16} className="text-yellow-400" />
    }
  ];

  const basicTabs = tabs.filter(tab => !tab.id.startsWith('adv-') && tab.id !== 'deploy-guide');

  const advancedTabs = tabs.filter(tab => tab.id.startsWith('adv-') && tab.id !== 'deploy-guide');

  const currentTabs = courseMode === 'basic' ? basicTabs : advancedTabs;

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

  const advB1Code = `// src/main.tsx - Điểm khởi đầu của ứng dụng React Single Page Application (SPA)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/App.tsx - Quản lý Component phân cấp và Router cơ bản
import React from 'react';
import { HeroBanner } from './components/HeroBanner';
import { MovieGrid } from './components/MovieGrid';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <HeroBanner />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <MovieGrid />
      </main>
    </div>
  );
}`;

  const advB2Code = `// src/hooks/useFetchMovies.ts - Custom Hook tự viết lấy dữ liệu phim an toàn từ API
import { useState, useEffect } from 'react';
import { Movie } from '../types';

export function useFetchMovies(apiUrl: string) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Hàm fetch bất đồng bộ (async/await) tránh memory leaks
    const fetchMovies = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Không thể kết nối máy chủ API");
        const data = await res.json();
        
        if (isMounted) {
          setMovies(data.items || []);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Lỗi bất ngờ xảy ra");
          setLoading(false);
        }
      }
    };

    fetchMovies();
    return () => {
      isMounted = false; // Cleanup function khi component unmount
    };
  }, [apiUrl]); // Chỉ chạy lại khi url thay đổi

  return { movies, loading, error };
}`;

  const advB3Code = `// src/components/HeroBanner.tsx - Slider phim hoạt họa mượt mà sử dụng Motion
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function HeroBanner({ movies }) {
  const [index, setIndex] = useState(0);

  return (
    <div className="relative h-[450px] w-full overflow-hidden bg-zinc-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={movies[index].slug}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img src={movies[index].thumb_url} className="w-full h-full object-cover opacity-40" />
          <div className="absolute bottom-10 left-10 max-w-lg z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-black text-white"
            >
              {movies[index].title}
            </motion.h1>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}`;

  const advB4Code = `// server.ts - Xây dựng Server Express API Proxy bảo mật an toàn khóa API Key
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo Gemini API an toàn ở Server, không bao giờ lộ về trình duyệt của người dùng
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/ai/recommend", async (req, res) => {
  try {
    const { historySlugs } = req.body;
    const prompt = \`Hãy đề xuất 3 thể loại phim dựa trên lịch sử xem: \${historySlugs.join(', ')}\`;
    
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    
    res.json({ recommendation: aiResponse.text });
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối trí tuệ nhân tạo Gemini Server" });
  }
});

// Chạy server trên port 3000 chuẩn container
app.listen(3000, "0.0.0.0", () => {
  console.log("Server API running on port 3000");
});`;

  const advB5Code = `// src/services/firestore.ts - Đồng bộ hóa tiến trình xem phim thời gian thực lên Cloud
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-EXAMPLE_KEY_DO_NOT_EXPOSE",
  authDomain: "phimhay-tutorial.firebaseapp.com",
  projectId: "phimhay-tutorial"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ghi tiến trình xem phim (giây thứ mấy) của người dùng
export async function updateProgress(userId: string, movieId: string, seconds: number) {
  const ref = doc(db, \`users/\${userId}/progress/\${movieId}\`);
  await setDoc(ref, {
    seconds,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// Lắng nghe realtime tiến trình xem phim trên mọi thiết bị khác
export function listenProgress(userId: string, movieId: string, callback: (seconds: number) => void) {
  const ref = doc(db, \`users/\${userId}/progress/\${movieId}\`);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data().seconds);
    }
  });
}`;

  const advB6Code = `// src/db/schema.ts - Quản lý Cấu trúc bảng PostgreSQL thông qua Drizzle ORM
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  role: text("role").default("member"),
  createdAt: timestamp("created_at").defaultNow()
});

// Dockerfile - Đóng gói container chuẩn chỉnh để deploy tự động lên Google Cloud Run
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]`;

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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  courseMode === 'advanced' 
                    ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' 
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}>
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight uppercase">
                    Tài Liệu Học Tập {courseMode === 'advanced' ? '🚀 Nâng Cao' : '🌱 Cơ Bản'}
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                    {courseMode === 'advanced' 
                      ? 'Lộ trình Full-stack: React JS, NodeJS, Database và Cloud Run Deploy' 
                      : 'Giáo trình xây dựng Website cơ bản cho người mới bắt đầu'}
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
                
                {/* Mode Selector for Desktop & Mobile */}
                <div className="flex p-1 bg-zinc-900/60 rounded-xl mb-1 sm:mb-2 border border-zinc-900 shrink-0 gap-1 w-full">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 text-center py-2 sm:py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      courseMode === 'basic'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                    }`}
                  >
                    🌱 Sơ Cấp
                  </button>
                  <button
                    onClick={() => setActiveTab('adv-overview')}
                    className={`flex-1 text-center py-2 sm:py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                      courseMode === 'advanced'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                    }`}
                  >
                    🚀 Cao Cấp
                  </button>
                </div>

                {currentTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all shrink-0 md:shrink cursor-pointer border ${
                      activeTab === tab.id
                        ? courseMode === 'advanced'
                          ? 'bg-indigo-600/10 border-indigo-500/30 text-white font-bold'
                          : 'bg-emerald-600/10 border-emerald-500/30 text-white font-bold'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className={`${activeTab === tab.id ? (courseMode === 'advanced' ? 'text-indigo-400' : 'text-emerald-400') : 'text-zinc-500'}`}>
                      {tab.icon}
                    </div>
                    <div className="hidden md:block min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{tab.title}</p>
                      <p className="text-[9px] text-zinc-500 font-medium leading-none mt-0.5 truncate">{tab.subtitle}</p>
                    </div>
                    <span className="md:hidden text-xs font-bold whitespace-nowrap">{tab.title.replace('Buổi ', 'B')}</span>
                  </button>
                ))}

                {/* Ngăn cách danh sách bài học và mục khóa học tham khảo */}
                <div className="hidden md:block w-full h-[1px] bg-zinc-900/80 my-2 shrink-0" />

                {(() => {
                  const refTab = tabs.find(t => t.id === 'courses-ref');
                  if (!refTab) return null;
                  return (
                    <button
                      key={refTab.id}
                      onClick={() => setActiveTab(refTab.id)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all shrink-0 md:shrink cursor-pointer border ${
                        activeTab === refTab.id
                          ? 'bg-amber-600/15 border-amber-500/35 text-white font-bold'
                          : 'border-transparent text-zinc-400 hover:text-amber-400 hover:bg-amber-500/5 hover:border-amber-500/10'
                      }`}
                    >
                      <div className={`${activeTab === refTab.id ? 'text-amber-400' : 'text-zinc-500'}`}>
                        {refTab.icon}
                      </div>
                      <div className="hidden md:block min-w-0">
                        <p className="text-xs font-bold leading-tight truncate">{refTab.title}</p>
                        <p className="text-[9px] text-zinc-500 font-medium leading-none mt-0.5 truncate">{refTab.subtitle}</p>
                      </div>
                      <span className="md:hidden text-xs font-bold whitespace-nowrap">{refTab.title}</span>
                    </button>
                  );
                })()}
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

                    <div className="space-y-4 pt-2">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <BookOpen size={14} className="text-emerald-400" /> Chương trình cơ bản (HTML/CSS/JS)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {tabs.filter(t => !t.id.startsWith('adv-') && t.id !== 'overview').map((tab, idx) => (
                          <div 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900/80 hover:border-emerald-500/30 hover:bg-zinc-900/80 cursor-pointer transition-all duration-200"
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

                    <div className="space-y-4 pt-4 border-t border-zinc-900">
                      <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={14} className="text-indigo-400 animate-pulse" /> Chương trình nâng cao (React/Full-stack)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {tabs.filter(t => t.id.startsWith('adv-')).map((tab, idx) => (
                          <div 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/5 border border-indigo-900/30 hover:border-indigo-500/30 hover:bg-indigo-950/20 cursor-pointer transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black font-mono text-indigo-400 w-4">0{idx + 1}</span>
                              <div>
                                <p className="text-xs font-bold text-zinc-200">{tab.title}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{tab.subtitle}</p>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-indigo-600" />
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

                {activeTab === 'adv-overview' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-1 rounded-full animate-pulse">
                        LỘ TRÌNH CHUYÊN SÂU
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight leading-tight">
                        LỘ TRÌNH WEB NÂNG CAO: FULL-STACK REACT, NODEJS & CLOUD RUN
                      </h1>
                      <div className="w-16 h-1 bg-indigo-500 rounded-full mt-3" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900">
                      <div>
                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">Đối tượng học viên</p>
                        <p className="text-xs text-zinc-300 font-bold mt-1">Đã hoàn thành khóa cơ bản hoặc nắm vững HTML, CSS, JS cơ bản</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">Mục tiêu đầu ra</p>
                        <p className="text-xs text-zinc-300 font-bold mt-1">Lập trình viên Full-stack thực chiến, làm chủ công nghệ mới nhất</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                        <GraduationCap size={14} className="text-indigo-400" /> Kỹ năng cốt lõi làm chủ sau khóa học
                      </h3>
                      <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-5 leading-relaxed">
                        <li><strong>Frontend chuyên nghiệp:</strong> Lập trình React với TypeScript, cấu trúc Vite, tối ưu hóa bundle, hoạt họa Motion (Framer Motion) đỉnh cao.</li>
                        <li><strong>Backend & API Security:</strong> Xây dựng API Server với Express, kiến thức Proxy Server giấu an toàn các API Key bí mật khỏi Browser.</li>
                        <li><strong>Database & Cloud:</strong> Tích hợp NoSQL Firestore (Realtime Sync), SQL PostgreSQL kết hợp Drizzle ORM mạnh mẽ.</li>
                        <li><strong>CI/CD & Cloud Deploy:</strong> Đóng gói Container Docker, Deploy mượt mà lên Google Cloud Run, quản lý biến môi trường an toàn.</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-2 text-zinc-400 text-xs">
                      <h4 className="text-xs font-black text-white uppercase flex items-center gap-1">
                        <span className="text-indigo-400">💡</span> Triết lý đào tạo thực chiến
                      </h4>
                      <p className="leading-relaxed text-zinc-300">
                        Khóa học không dạy bạn gõ lại mã nguồn một cách thụ động. Chúng tôi tập trung đào tạo tư duy giải quyết vấn đề, kiến trúc hệ thống, cách tổ chức thư mục dự án gọn gàng, và đặc biệt là cách bảo vệ bảo mật các khóa API tránh rò rỉ dữ liệu của doanh nghiệp.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'adv-buoi1' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase bg-cyan-500/5 border border-cyan-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 1: FRONTEND NÂNG CAO
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        Kiến Trúc React & Dự Án Single Page Application (SPA) với Vite
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">1. Trọng tâm kiến thức</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>Bản chất Virtual DOM và cơ chế nạp trang không tải lại (Single Page Application).</li>
                        <li>Tại sao chọn <strong>Vite</strong> thay thế Webpack? Điểm mạnh về tốc độ khởi chạy ES Modules.</li>
                        <li>Cấu trúc và tổ chức dự án chuyên nghiệp với TypeScript nghiêm ngặt (<code className="text-cyan-400 font-mono">tsconfig.json</code>).</li>
                        <li>Cách chia nhỏ thư mục phân cấp rõ ràng: <code className="text-zinc-300 font-mono">/src/components</code>, <code className="text-zinc-300 font-mono">/src/hooks</code>, <code className="text-zinc-300 font-mono">/src/services</code>, <code className="text-zinc-300 font-mono">/src/types.ts</code>.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">2. Mã nguồn mẫu chuẩn kiến trúc React</h3>
                        <button
                          onClick={() => handleCopyCode(advB1Code, 'adv-b1')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'adv-b1' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'adv-b1' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text max-h-[300px]">
                          {advB1Code}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2">
                      <h4 className="text-xs font-black text-white uppercase">3. Bài tập thực hành thử thách</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy tích hợp công cụ phân tích dung lượng bundle (<code className="text-cyan-400 font-mono">rollup-plugin-visualizer</code>) vào file cấu hình <code className="font-mono">vite.config.ts</code> để đo đạc và tìm ra các thư viện bên thứ ba đang làm nặng ứng dụng của bạn nhất.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'adv-buoi2' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-purple-400 tracking-widest uppercase bg-purple-500/5 border border-purple-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 2: FRONTEND NÂNG CAO
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        Quản Lý Trạng Thái React State & Làm Chủ Hooks Chuyên Sâu
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">1. Trọng tâm kiến thức</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>Luồng dữ liệu một chiều (One-way data binding) và cách thức React re-render.</li>
                        <li>Ngăn ngừa lỗi lặp render vô tận (Infinite Re-renders loop) khi viết <code className="text-purple-400 font-mono">useEffect</code> sai cách.</li>
                        <li>Tìm hiểu <code className="text-purple-400 font-mono">useRef</code>: Lưu giữ tham chiếu thực tế mà không kích hoạt chu trình render mới của component.</li>
                        <li>Tư duy xây dựng <strong>Custom Hooks</strong> để tách biệt hoàn toàn phần xử lý logic khỏi phần giao diện UI.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">2. Custom Hook lấy dữ liệu phim an toàn</h3>
                        <button
                          onClick={() => handleCopyCode(advB2Code, 'adv-b2')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'adv-b2' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'adv-b2' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text max-h-[300px]">
                          {advB2Code}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2">
                      <h4 className="text-xs font-black text-white uppercase">3. Bài tập thực hành thử thách</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy tự viết một Custom Hook mang tên <code className="text-purple-400 font-mono">useIntersectionObserver</code> giúp phát hiện khi nào người dùng cuộn chuột đến cuối màn hình để tự động gửi API yêu cầu lấy thêm danh sách phim mới (Infinite Scroll).
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'adv-buoi3' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-pink-400 tracking-widest uppercase bg-pink-500/5 border border-pink-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 3: UI/UX CHUYÊN NGHIỆP
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        Kiến Tạo Hoạt Họa Giao Diện Đỉnh Cao Với Framer Motion
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">1. Trọng tâm kiến thức</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>Lý thuyết chuyển động trong thiết kế Web: Tránh giật lag, tối ưu hóa CSS GPU acceleration.</li>
                        <li>Sử dụng thẻ thông minh <code className="text-pink-400 font-mono">motion</code> để định nghĩa trạng thái: <code className="font-mono">initial</code>, <code className="font-mono">animate</code>, <code className="font-mono">whileHover</code>.</li>
                        <li>Tận dụng <code className="text-pink-400 font-mono">AnimatePresence</code> để xử lý mượt mà chuyển động của các phần tử khi chúng chuẩn bị biến mất khỏi giao diện (Unmounting).</li>
                        <li>Tạo hiệu ứng chuyển slide banner nhẹ nhàng cuốn hút cho giao diện rạp phim trực tuyến.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">2. Code Banner trượt hoạt hoạt mượt mà</h3>
                        <button
                          onClick={() => handleCopyCode(advB3Code, 'adv-b3')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'adv-b3' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'adv-b3' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text max-h-[300px]">
                          {advB3Code}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2">
                      <h4 className="text-xs font-black text-white uppercase">3. Bài tập thực hành thử thách</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy thiết lập hiệu ứng thu phóng thẻ phim (Layout Zoom-in Modal) sử dụng cơ chế <code className="text-pink-400 font-mono">layoutId</code> của Framer Motion, mang lại trải nghiệm click phóng to thẻ phim ra giữa màn hình trơn tru như ứng dụng di động gốc.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'adv-buoi4' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-green-400 tracking-widest uppercase bg-green-500/5 border border-green-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 4: BACKEND & SECURITY
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        Xây Dựng Backend Server với Express & Giấu API Key Tuyệt Đối
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">1. Trọng tâm kiến thức</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>Nguy cơ rò rỉ khóa bảo mật (API Key) của dự án khi gọi trực tiếp từ phía Browser.</li>
                        <li>Kiến trúc <strong>Server API Proxy</strong>: Client gửi yêu cầu không chứa Key về Server riêng, Server sẽ bọc thêm Key trước khi gọi các nguồn lực ngoài như Gemini AI hay Stripe.</li>
                        <li>Viết API phân tuyến dữ liệu phim, xử lý CORS mượt mà, phân tích cú pháp body payload.</li>
                        <li>Làm việc với biến môi trường thông qua tệp tin bí mật <code className="text-green-400 font-mono">.env</code>.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">2. Code Server Node.js & Proxy AI tích hợp Gemini</h3>
                        <button
                          onClick={() => handleCopyCode(advB4Code, 'adv-b4')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'adv-b4' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'adv-b4' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text max-h-[300px]">
                          {advB4Code}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2">
                      <h4 className="text-xs font-black text-white uppercase">3. Bài tập thực hành thử thách</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy tích hợp gói middleware bảo mật <code className="text-green-400 font-mono">helmet</code> vào Server Node.js của bạn nhằm tự động cấu hình các tiêu đề HTTP headers phòng vệ các lỗi bảo mật XSS nguy hiểm.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'adv-buoi5' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 5: CLOUD DATABASE
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        Đồng Bộ Dữ Liệu Thời Gian Thực Với Firebase Firestore & Auth
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">1. Trọng tâm kiến thức</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>So sánh Cơ sở dữ liệu quan hệ (SQL) và phi quan hệ (NoSQL Document database).</li>
                        <li>Tích hợp Firebase SDK, khởi tạo kết nối thông suốt từ ứng dụng của bạn.</li>
                        <li>Sử dụng cơ chế lắng nghe Realtime Listener (<code className="text-amber-400 font-mono">onSnapshot</code>) để đồng bộ trạng thái, tiến trình xem phim, lịch sử tự động tức thì trên nhiều thiết bị.</li>
                        <li>Bảo mật tầng dữ liệu với <strong>Firestore Security Rules</strong> kết hợp phân quyền Firebase Authentication.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">2. Code đồng bộ hóa tiến trình xem phim</h3>
                        <button
                          onClick={() => handleCopyCode(advB5Code, 'adv-b5')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'adv-b5' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'adv-b5' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text max-h-[300px]">
                          {advB5Code}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2">
                      <h4 className="text-xs font-black text-white uppercase">3. Bài tập thực hành thử thách</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy thiết lập một Security Rule cho bảng bình luận sao cho chỉ người dùng sở hữu bình luận đó mới có quyền xóa nó (<code className="text-amber-400 font-mono">request.auth.uid == resource.data.userId</code>).
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'adv-buoi6' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <span className="text-[10px] font-black text-blue-400 tracking-widest uppercase bg-blue-500/5 border border-blue-500/10 px-2.5 py-1 rounded-full">
                        BUỔI 6: DATABASE & CLOUD DEPLOY
                      </span>
                      <h1 className="text-xl font-black text-white mt-2 tracking-tight">
                        Cơ Sở Dữ Liệu PostgreSQL (Drizzle ORM) & Deploy Lên Cloud Run
                      </h1>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">1. Trọng tâm kiến thức</h3>
                      <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-5 leading-relaxed">
                        <li>Kiến trúc PostgreSQL và cách quản trị Schema dữ liệu chuẩn chỉ.</li>
                        <li>Sử dụng thư viện <strong>Drizzle ORM</strong> để định nghĩa schema và thực thi truy vấn mượt mà.</li>
                        <li>Cơ chế đóng gói toàn bộ mã nguồn bao gồm cả Backend và Frontend vào một <strong>Docker Container</strong> thống nhất.</li>
                        <li>Triển khai tự động (Continuous Deployment) lên nền tảng đám mây Google Cloud Run bảo mật, chịu tải hàng triệu người dùng.</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">2. Schema PostgreSQL mượt mà & Cấu hình Docker Deploy</h3>
                        <button
                          onClick={() => handleCopyCode(advB6Code, 'adv-b6')}
                          className="flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-xl cursor-pointer text-zinc-300 hover:text-white transition-colors"
                        >
                          {copiedId === 'adv-b6' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedId === 'adv-b6' ? 'ĐÃ COPY' : 'COPY CODE'}</span>
                        </button>
                      </div>

                      <div className="relative rounded-2xl overflow-hidden border border-zinc-900 bg-zinc-950/80 p-4">
                        <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed select-text max-h-[300px]">
                          {advB6Code}
                        </pre>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 space-y-2">
                      <h4 className="text-xs font-black text-white uppercase">3. Bài tập thực hành thử thách</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Hãy viết một Dockerfile áp dụng quy trình <strong>Multi-stage Build</strong> chuyên biệt để tối ưu dung lượng ảnh Docker cuối cùng từ hơn 1.2GB xuống dưới chỉ vỏn vẹn 120MB, tăng tốc độ khởi động nguội trên đám mây gấp 5 lần.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'deploy-guide' && (
                  <div className="space-y-6 animate-fade-in pb-8">
                    <div>
                      <span className="text-[10px] font-black text-pink-400 tracking-widest uppercase bg-pink-500/5 border border-pink-500/10 px-2.5 py-1 rounded-full">
                        HƯỚNG DẪN HOÀN CHỈNH
                      </span>
                      <h1 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight leading-tight">
                        ĐƯA DỰ ÁN LÊN GITHUB, DEPLOY &amp; TRỎ DOMAIN CÁ NHÂN
                      </h1>
                      <div className="w-16 h-1 bg-pink-500 rounded-full mt-3" />
                    </div>

                    {/* Step 1: GitHub */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 text-xs font-bold">1</span>
                        Đưa dự án lên GitHub
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        GitHub là kho lưu trữ mã nguồn phổ biến nhất thế giới. Để đẩy code lên Github, hãy làm theo các bước sau:
                      </p>
                      
                      <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900 space-y-3">
                        <div className="space-y-2">
                          <p className="text-xs text-zinc-200 font-bold">Bước 1.1: Khởi tạo Git ở máy cá nhân (Nếu chưa làm)</p>
                          <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 p-3">
                            <pre className="text-[10px] font-mono text-zinc-350 overflow-x-auto leading-relaxed select-text">
{`# Khởi tạo kho lưu trữ cục bộ
git init

# Thêm tất cả các file vào khu vực chuẩn bị (loại trừ các file trong .gitignore)
git add .

# Ghi nhận phiên bản đầu tiên
git commit -m "feat: khởi tạo dự án xem phim"`}
                            </pre>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs text-zinc-200 font-bold">Bước 1.2: Tạo Repository trên GitHub và đẩy mã nguồn lên</p>
                          <ol className="text-xs text-zinc-400 list-decimal pl-5 space-y-1 leading-relaxed">
                            <li>Truy cập <a href="https://github.com" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline">github.com</a> và đăng nhập tài khoản.</li>
                            <li>Nhấp vào nút <strong className="text-white">New</strong> để tạo kho chứa mới. Đặt tên dự án (ví dụ: <code className="text-pink-300 font-mono">web-xem-phim</code>) và chọn chế độ <strong className="text-white">Public</strong> hoặc <strong className="text-white">Private</strong>.</li>
                            <li>Copy các lệnh Github cung cấp và dán vào Terminal trên máy bạn:</li>
                          </ol>
                          <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 p-3">
                            <pre className="text-[10px] font-mono text-zinc-350 overflow-x-auto leading-relaxed select-text">
{`# Liên kết kho cục bộ với kho chứa trên GitHub (Thay USERNAME và REPO bằng thông tin của bạn)
git remote add origin https://github.com/USERNAME/web-xem-phim.git

# Đổi tên nhánh mặc định thành main
git branch -M main

# Đẩy mã nguồn lên Github
git push -u origin main`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Deploy Project */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 text-xs font-bold">2</span>
                        Triển khai (Deploy) Dự án lên Internet
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Bạn có hai giải pháp triển khai phổ biến, cực kỳ mạnh mẽ và hoàn toàn <strong className="text-pink-400">miễn phí</strong>:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option A: Vercel */}
                        <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-900 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-cyan-400 tracking-wider bg-cyan-500/5 border border-cyan-500/10 px-2 py-0.5 rounded">TỐI ƯU GIAO DIỆN</span>
                            <h4 className="text-xs font-black text-white uppercase">Cách A: Deploy Static trên Vercel</h4>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Phù hợp nhất với các dự án Single Page App (SPA) được build ra thư mục tĩnh (như <code className="text-zinc-300 font-mono">dist</code> của Vite).
                          </p>
                          <ol className="text-[11px] text-zinc-400 list-decimal pl-4 space-y-1 leading-relaxed">
                            <li>Đăng ký tài khoản tại <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">vercel.com</a> bằng tài khoản GitHub của bạn.</li>
                            <li>Bấm <strong className="text-white">Add New Project</strong> &gt; Chọn Repository của bạn từ danh sách GitHub vừa kết nối.</li>
                            <li>Tại bảng cấu hình, giữ mặc định (Vercel tự phát hiện Vite).</li>
                            <li>Thêm các biến môi trường (<strong className="text-white">Environment Variables</strong>) nếu dự án có sử dụng API Key hay Endpoint.</li>
                            <li>Nhấp <strong className="text-white">Deploy</strong>. Dự án của bạn sẽ online sau khoảng 30 giây!</li>
                          </ol>
                        </div>

                        {/* Option B: Render */}
                        <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-900 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-purple-400 tracking-wider bg-purple-500/5 border border-purple-500/10 px-2.5 py-0.5 rounded">TỐI ƯU FULL-STACK</span>
                            <h4 className="text-xs font-black text-white uppercase">Cách B: Deploy Full-stack trên Render</h4>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Phù hợp nhất cho các dự án chạy máy chủ Node.js (Express, Fastify) kết hợp cả Client tĩnh.
                          </p>
                          <ol className="text-[11px] text-zinc-400 list-decimal pl-4 space-y-1 leading-relaxed">
                            <li>Đăng nhập <a href="https://render.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">render.com</a> bằng tài khoản GitHub.</li>
                            <li>Bấm <strong className="text-white">New +</strong> &gt; Chọn <strong className="text-white">Web Service</strong>.</li>
                            <li>Kết nối Repository GitHub của bạn.</li>
                            <li>Cấu hình các thông số cốt lõi:
                              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                               <li>Runtime: <code className="text-zinc-300 font-mono">Node</code></li>
                               <li>Build Command: <code className="text-zinc-300 font-mono">npm install &amp;&amp; npm run build</code></li>
                               <li>Start Command: <code className="text-zinc-300 font-mono">npm start</code> hoặc lệnh chạy file server đã dựng.</li>
                              </ul>
                            </li>
                            <li>Thêm tệp <code className="text-purple-300 font-mono">.env</code> vào mục <strong className="text-white">Environment</strong> của Render.</li>
                            <li>Nhấn <strong className="text-white">Create Web Service</strong> để kích hoạt máy chủ của riêng bạn.</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Custom Domain */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 text-xs font-bold">3</span>
                        Trỏ tên miền (Custom Domain) cá nhân
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Để tạo dựng thương hiệu cá nhân chuyên nghiệp, bạn nên trỏ tên miền của riêng mình (ví dụ: <code className="text-pink-300 font-mono">phimhay.com</code> hoặc subdomain <code className="text-pink-300 font-mono">phim.username.dev</code>) thay vì dùng subdomain mặc định của Vercel/Render.
                      </p>

                      <div className="p-4 bg-gradient-to-r from-pink-500/10 via-indigo-500/5 to-zinc-900/10 rounded-2xl border border-pink-500/10 space-y-3">
                        <p className="text-xs text-white font-bold flex items-center gap-2">
                          <Sparkles size={14} className="text-pink-400 animate-pulse" />
                          <span>Sở hữu &amp; Đăng ký tên miền riêng của bạn:</span>
                        </p>
                        <p className="text-xs text-zinc-350 leading-relaxed">
                          Bạn có thể đăng ký <strong>tên miền miễn phí</strong> ngay tại mục <span className="text-pink-400 font-bold">Tiện ích</span> trên thanh menu chính của trang web này, hoặc mua các tên miền tùy ý theo sở thích (.com, .net, .vn...) tại các nhà đăng ký uy tín hàng đầu hiện nay:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <a
                            href="https://www.matbao.net"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-[11px] font-extrabold text-zinc-200 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
                          >
                            <span>🌐 Đăng ký tại Mắt Bão (matbao.net)</span>
                            <ChevronRight size={12} className="transform group-hover/btn:translate-x-0.5 transition-transform" />
                          </a>
                          <a
                            href="https://tenten.vn"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/btn flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-[11px] font-extrabold text-zinc-200 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
                          >
                            <span>🌐 Đăng ký tại Tenten.vn</span>
                            <ChevronRight size={12} className="transform group-hover/btn:translate-x-0.5 transition-transform" />
                          </a>
                        </div>
                      </div>

                      <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900 space-y-3">
                        <p className="text-xs text-zinc-200 font-bold">Quy trình cấu hình DNS chuẩn toàn cầu:</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/50 space-y-1.5">
                            <p className="text-[11px] text-zinc-200 font-black uppercase tracking-wider text-pink-400">Trường hợp 1: Tên miền chính (Ví dụ: phimhay.com)</p>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Cần sử dụng bản ghi <strong>A Record</strong> trỏ về IP của nhà cung cấp hosting.
                            </p>
                            <div className="text-[10px] font-mono text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-900">
                              <p><span className="text-zinc-500">Type:</span> A</p>
                              <p><span className="text-zinc-500">Name:</span> @ (hoặc để trống)</p>
                              <p><span className="text-zinc-500">Value (IP Vercel):</span> 76.76.21.21</p>
                            </div>
                          </div>

                          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/50 space-y-1.5">
                            <p className="text-[11px] text-zinc-200 font-black uppercase tracking-wider text-cyan-400">Trường hợp 2: Tên miền phụ (Ví dụ: phim.tenban.com)</p>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">
                              Sử dụng bản ghi <strong>CNAME Record</strong> trỏ về đường dẫn mặc định của host.
                            </p>
                            <div className="text-[10px] font-mono text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-900">
                              <p><span className="text-zinc-500">Type:</span> CNAME</p>
                              <p><span className="text-zinc-500">Name:</span> phim (hoặc sub-domain mong muốn)</p>
                              <p><span className="text-zinc-500">Value (Vercel):</span> cname.vercel-dns.com</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-zinc-400 leading-relaxed list-decimal pl-5">
                          <p className="font-bold text-zinc-300">💡 Lưu ý quan trọng:</p>
                          <li>Thời gian cập nhật DNS (DNS Propagation) có thể mất từ 5 phút đến 24 giờ tùy thuộc vào nhà đăng ký tên miền của bạn (như Namecheap, GoDaddy, Pavietnam, Tenten...).</li>
                          <li>Cả Vercel và Render đều tự động cấp chứng chỉ bảo mật <strong className="text-white">SSL (HTTPS) miễn phí</strong> hoàn toàn ngay khi cấu hình DNS thành công, bạn không cần cài đặt gì thêm.</li>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'courses-ref' && (
                  <div className="space-y-6">
                    <div className="border-b border-zinc-900 pb-4">
                      <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded">HỌC TẬP &amp; PHÁT TRIỂN</span>
                      <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-2">Khóa Học Tham Khảo</h2>
                      <p className="text-xs text-zinc-400 mt-1">Đề xuất các khóa học chất lượng cao để nâng cao kỹ năng lập trình web của bạn.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* HTML & CSS Course Card */}
                      <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-900 space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-emerald-400 tracking-wider bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-0.5 rounded">MIỄN PHÍ / CƠ BẢN</span>
                          </div>
                          <h3 className="text-sm font-black text-white uppercase">Khóa học HTML + CSS</h3>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Khóa học HTML &amp; CSS từ cơ bản dành cho người mới bắt đầu tại CodeLearn. Cung cấp nền tảng kiến thức vững chắc để xây dựng cấu trúc và định hình giao diện web.
                          </p>
                        </div>
                        <a
                          href="https://codelearn.io/learning/html-css-for-beginner?tab=syllabus"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-[11px] font-extrabold text-zinc-200 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center mt-auto"
                        >
                          <span>📘 Xem chi tiết khóa học</span>
                          <ChevronRight size={12} className="transform group-hover/btn:translate-x-0.5 transition-transform" />
                        </a>
                      </div>

                      {/* JavaScript Course Card */}
                      <div className="bg-zinc-900/30 p-5 rounded-2xl border border-zinc-900 space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-indigo-400 tracking-wider bg-indigo-500/5 border border-indigo-500/10 px-2.5 py-0.5 rounded">CHUYÊN SÂU</span>
                          </div>
                          <h3 className="text-sm font-black text-white uppercase">Khóa học JavaScript</h3>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Khóa học JavaScript từ cơ bản đến chuyên sâu trên Udemy. Giúp bạn làm chủ tư duy logic lập trình, xử lý sự kiện, bất đồng bộ và xây dựng ứng dụng web hiện đại.
                          </p>
                        </div>
                        <a
                          href="https://www.udemy.com/course/khoa-hoc-javascript-tu-co-ban-den-chuyen-sau/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/btn w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-[11px] font-extrabold text-zinc-200 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center mt-auto"
                        >
                          <span>⚡ Học JavaScript chuyên sâu</span>
                          <ChevronRight size={12} className="transform group-hover/btn:translate-x-0.5 transition-transform" />
                        </a>
                      </div>
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

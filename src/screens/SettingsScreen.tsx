import React, { useState, useEffect } from 'react';
import { Palette, Check, Sparkles, Sliders, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsScreenProps {
  onNavigate: (route: string) => void;
}

export const themes = {
  dark: {
    name: 'Tối Cổ Điển',
    bg: '#0F0F0F',
    accent: '#e50914',
    elevated: '#141414',
    overlay: '#1d1d1d',
    surface: '#262626',
    border: '#2a2a2a',
    desc: 'Không gian rạp chiếu phim tối giản, dịu mắt chuẩn Netflix.'
  },
  black: {
    name: 'Đen Tuyền',
    bg: '#000000',
    accent: '#e50914',
    elevated: '#080808',
    overlay: '#101010',
    surface: '#181818',
    border: '#202020',
    desc: 'Tối ưu độ tương phản tuyệt đối cho các dòng màn hình OLED/AMOLED.'
  },
  blue: {
    name: 'Xanh Đêm',
    bg: '#0A0E1A',
    accent: '#1a6ef5',
    elevated: '#10172a',
    overlay: '#1e293b',
    surface: '#334155',
    border: '#1e293b',
    desc: 'Sắc xanh đại dương huyền ảo, đậm chất công nghệ viễn tưởng.'
  },
  purple: {
    name: 'Tím Huyền',
    bg: '#0D0A1A',
    accent: '#8b5cf6',
    elevated: '#151026',
    overlay: '#1e1633',
    surface: '#2e224d',
    border: '#1e1633',
    desc: 'Cực kỳ cá tính, lung linh, tạo cảm xúc nghệ thuật điện ảnh đặc biệt.'
  }
};

export function applyCustomTheme(themeKey: string) {
  const selected = themes[themeKey as keyof typeof themes] || themes.dark;
  const root = document.documentElement;
  
  root.style.setProperty('--color-bg-base', selected.bg);
  root.style.setProperty('--color-bg-elevated', selected.elevated);
  root.style.setProperty('--color-bg-overlay', selected.overlay);
  root.style.setProperty('--color-bg-surface', selected.surface);
  root.style.setProperty('--color-border', selected.border);
  
  root.style.setProperty('--color-brand', selected.accent);
  root.style.setProperty('--color-brand-dim', selected.accent);
  root.style.setProperty('--color-brand-hover', selected.accent);
  root.style.setProperty('--color-border-focus', selected.accent);
  
  // Custom theme badge or active state indicator
  root.setAttribute('data-hb-theme', themeKey);
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const [activeTheme, setActiveTheme] = useState<string>(() => {
    return localStorage.getItem('hb_theme') || 'dark';
  });

  const handleThemeChange = (key: string) => {
    setActiveTheme(key);
    localStorage.setItem('hb_theme', key);
    applyCustomTheme(key);
    
    // Broadcast theme update event
    window.dispatchEvent(new Event('hb_theme_changed'));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white pt-24 sm:pt-28 pb-16 font-sans px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
      {/* Dynamic Ambient Glow */}
      <div className="absolute top-[15%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-brand)]/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="border-b border-zinc-900 pb-6 mb-8 select-none">
        <div className="flex items-center gap-2.5 mb-1">
          <Palette size={20} className="text-[var(--color-brand)]" />
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Cài Đặt Giao Diện
          </h1>
        </div>
        <p className="text-xs text-zinc-400 font-semibold tracking-wide">
          Cá nhân hóa phong cách, màu sắc rạp phim ảo của riêng bạn
        </p>
      </div>

      {/* Settings Sections Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {/* Left column info */}
        <div className="md:col-span-1 select-none flex flex-col gap-5">
          <div className="bg-[#13131A] border border-zinc-900 rounded-[20px] p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-2 mb-2">
              <Sliders size={14} className="text-[var(--color-brand)]" />
              Cá nhân hóa
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
              Chọn màu chủ đạo và không gian nền phù hợp nhất với sở thích của bạn. Thay đổi sẽ có tác dụng tức thì trên toàn hệ thống mà không cần tải lại trang.
            </p>
          </div>

          <div className="bg-[#13131A] border border-zinc-900 rounded-[20px] p-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-2 mb-2">
              <Shield size={14} className="text-emerald-500" />
              Tính riêng tư
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
              Toàn bộ tùy chỉnh của bạn được xử lý nội bộ và lưu giữ an toàn trong trình duyệt thông qua localStorage của thiết bị.
            </p>
          </div>
        </div>

        {/* Right column theme grids */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <h2 className="text-base font-extrabold text-zinc-200 uppercase tracking-widest flex items-center gap-2 select-none">
            <Sparkles size={16} className="text-amber-400 animate-pulse" />
            Chọn chủ đề hiển thị
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(themes).map(([key, item]) => {
              const isSelected = activeTheme === key;

              return (
                <div
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className={`relative p-5 rounded-[22px] border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                    isSelected
                      ? 'border-[var(--color-brand)] bg-zinc-900/40 shadow-lg shadow-[var(--color-brand)]/5'
                      : 'border-zinc-900 bg-[#13131A] hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-black text-white">{item.name}</span>
                    
                    {/* Circle indicators of colors */}
                    <div className="flex items-center gap-1.5 bg-zinc-950 px-2.5 py-1.5 rounded-full border border-zinc-900 select-none">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.bg }} title="Nền" />
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.accent }} title="Điểm nhấn" />
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 font-semibold leading-relaxed mb-6 pr-4">
                    {item.desc}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-900/60 select-none">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {isSelected ? 'Đang kích hoạt' : 'Bấm để chọn'}
                    </span>

                    {/* Active check mark overlay */}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[var(--color-brand)] flex items-center justify-center text-white shadow-md">
                        <Check size={11} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

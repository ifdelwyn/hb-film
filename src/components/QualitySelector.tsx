import React from 'react';
import { Check, Info, Loader2, Sparkles, AlertCircle, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export interface QualityLevel {
  id: number; // HLS level index; -1 is Auto
  label: string; // e.g., '1080p Full HD', '720p HD'
  height: number; // e.g., 1080, 720
  bitrate?: number; // bits per second
}

interface QualitySelectorProps {
  levels: QualityLevel[];
  currentLevelIndex: number; // -1 for Auto, or positive index
  onLevelChange: (index: number) => void;
  isLoading?: boolean;
  activeHeight?: number; // currently active height from Auto source
  error?: string | null;
}

export default function QualitySelector({
  levels,
  currentLevelIndex,
  onLevelChange,
  isLoading = false,
  activeHeight,
  error = null
}: QualitySelectorProps) {
  const [lockedMsg, setLockedMsg] = React.useState<string | null>(null);

  const getSavedTier = () => {
    if (typeof window === 'undefined') return 'free';
    return localStorage.getItem('filmflow_vip_tier') || 'free';
  };

  const isLevelLocked = (height: number) => {
    if (height <= 0) return false;
    const tier = getSavedTier();
    if (tier === 'ultra') return false;
    if (tier === 'premium') {
      return height > 1440; // Lock 4K
    }
    return height > 720; // Lock 1080p, 2K, 4K
  };

  const handleActivateDemoVip = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('filmflow_vip_tier', 'ultra');
      window.dispatchEvent(new Event('storage'));
    }
    setLockedMsg(null);
  };
  
  // Format bitrate into human-readable text
  const formatBitrate = (bitrate?: number) => {
    if (!bitrate) return '';
    const mbps = bitrate / 1000000;
    if (mbps >= 1) {
      return `• ${mbps.toFixed(1)} Mbps`;
    }
    const kbps = bitrate / 1000;
    return `• ${kbps.toFixed(0)} Kbps`;
  };

  // Safe labels to specify Netflix-style indicators
  const getSubLabel = (height: number) => {
    if (height >= 2160) return '4K UHD';
    if (height >= 1440) return '2K QHD';
    if (height >= 1080) return 'Full HD';
    if (height >= 720) return 'HD';
    if (height >= 480) return 'SD';
    return 'Tiết kiệm';
  };

  const getDisplayLabel = (lvl: QualityLevel) => {
    if (lvl.id === -1) return 'Tự động (Auto)';
    if (lvl.height === 360) return '360p';
    if (lvl.height === 480) return '480p';
    if (lvl.height === 720) return '720p HD';
    if (lvl.height === 1080) return '1080p Full HD';
    if (lvl.height === 1440) return '2K';
    if (lvl.height === 2160) return '4K';
    return lvl.label || `${lvl.height}p`;
  };

  return (
    <div id="quality-selector-container" className="w-full flex flex-col select-none font-sans text-white">
      {/* Menu Header with indicator */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-[var(--color-brand)]" />
          <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">Chất Lượng Thước Phim</span>
        </div>
        {currentLevelIndex === -1 && activeHeight && (
          <span className="text-[10px] bg-[var(--color-brand)]/15 text-[var(--color-brand)] border border-[var(--color-brand)]/30 font-bold px-2 py-0.5 rounded-full">
            Auto: {activeHeight}p
          </span>
        )}
      </div>

      {/* Locked Alert Box */}
      {lockedMsg && (
        <div className="flex flex-col gap-2 p-3 text-center bg-amber-500/10 border border-amber-500/20 rounded-xl my-2">
          <p className="text-[10px] text-zinc-300 font-bold leading-normal">{lockedMsg}</p>
          <button
            onClick={handleActivateDemoVip}
            className="bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-black py-1 px-2.5 rounded-lg transition-colors cursor-pointer self-center"
          >
            ⚡ Kích Hoạt Demo VIP Ngay
          </button>
        </div>
      )}

      {/* Loading Skeleton Panel */}
      {isLoading ? (
        <div className="flex flex-col gap-2 py-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex justify-between items-center h-8 bg-white/5 rounded-lg px-3">
              <div className="w-24 h-3 bg-zinc-800 rounded" />
              <div className="w-12 h-2.5 bg-zinc-800 rounded" />
            </div>
          ))}
          <p className="text-[10px] text-zinc-500 font-medium text-center mt-1">Đang cấu hình mảng phát...</p>
        </div>
      ) : error ? (
        // Error Handler UI
        <div className="flex flex-col items-center justify-center p-4 text-center text-zinc-400 bg-red-950/20 border border-red-900/40 rounded-xl my-2">
          <AlertCircle size={20} className="text-[var(--color-brand)] mb-1" />
          <p className="text-xs font-bold text-white mb-0.5">Lỗi nguồn phát</p>
          <p className="text-[10px] text-zinc-400 leading-normal">{error}</p>
        </div>
      ) : levels.length === 0 ? (
        // No separate qualities found, fallback generic Auto details
        <div className="p-3 bg-white/5 rounded-xl flex items-center gap-2 border border-white/5 my-1">
          <Info size={14} className="text-zinc-400" />
          <p className="text-xs font-semibold text-zinc-300">Cổng phát duy nhất (Chất lượng gốc)</p>
        </div>
      ) : (
        // Quality Options List with hover physics
        <div className="flex flex-col max-h-[220px] overflow-y-auto pr-1 gap-1.5 no-scrollbar">
          {levels.map((lvl) => {
            const isSelected = currentLevelIndex === lvl.id;
            const isLocked = isLevelLocked(lvl.height);
            return (
              <button
                key={lvl.id}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (isLocked) {
                    const tier = getSavedTier();
                    const tierLabel = tier === 'free' ? 'Thành viên Free' : 'Gói Premium';
                    const requiredTier = lvl.height >= 2160 ? 'Ultra 4K' : 'Premium 1080p/2K';
                    setLockedMsg(`Luồng phát ${lvl.height}p yêu cầu gói ${requiredTier}. Hiện bạn là ${tierLabel}.`);
                    return;
                  }
                  setLockedMsg(null);
                  onLevelChange(lvl.id);
                }}
                className={`relative flex items-center justify-between w-full p-2.5 rounded-lg text-left text-xs transition-all duration-250 cursor-pointer ${
                  isSelected 
                    ? 'bg-gradient-to-r from-[var(--color-brand)]/20 to-[var(--color-brand)]/5 border border-[var(--color-brand)]/30 text-white font-extrabold shadow-[0_4px_12px_rgba(230,57,70,0.15)]' 
                    : 'bg-transparent border border-transparent hover:bg-white/5 text-zinc-400 hover:text-white font-semibold'
                }`}
              >
                {/* Left Side Labels */}
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    isLocked ? 'border border-zinc-800 bg-zinc-950/40' : (isSelected ? 'bg-[var(--color-brand)] text-white' : 'border border-zinc-700')
                  }`}>
                    {isLocked ? (
                      <Lock size={8} className="text-zinc-600" />
                    ) : (
                      isSelected && <Check size={10} strokeWidth={3} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={`tracking-wide ${isLocked ? 'text-zinc-500 line-through' : ''}`}>
                      {getDisplayLabel(lvl)}
                    </span>
                    {lvl.height > 0 && (
                      <span className="text-[9px] text-zinc-500 font-bold tracking-tight mt-0.5">
                        {getSubLabel(lvl.height)} {formatBitrate(lvl.bitrate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side Quality Tag Badge */}
                {isLocked ? (
                  <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1 shrink-0">
                    <Lock size={7} /> VIP
                  </span>
                ) : lvl.id === -1 ? (
                  <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-black uppercase text-[9px]">
                    Auto
                  </span>
                ) : lvl.height >= 1080 ? (
                  <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-black uppercase text-[9px]">
                    HQ
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

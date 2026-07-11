import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle, RefreshCw, Tv } from 'lucide-react';

interface VideoPlayerProps {
  streamUrl: string;
  channelName?: string;
  channelLogo?: string;
  userAgent?: string;
}

export default function VideoPlayer({ streamUrl, channelName, channelLogo, userAgent }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Helper to wrap the URL with the proxy
  const getProxiedUrl = (url: string, ua?: string) => {
    if (!url) return '';
    let proxyUrl = `/api/tv/proxy?url=${encodeURIComponent(url)}`;
    if (ua) {
      proxyUrl += `&userAgent=${encodeURIComponent(ua)}`;
    }
    return proxyUrl;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // Reset states
    setIsLoading(true);
    setError(null);
    setIsPlaying(true);

    const proxiedUrl = getProxiedUrl(streamUrl, userAgent);

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Set up a 10 seconds timeout for stream failure
    const streamTimeout = setTimeout(() => {
      if (isLoading || error) {
        setIsLoading(false);
        setError('Không thể kết nối tới luồng phát sau 10 giây. Kênh có thể đang ngoại tuyến.');
      }
    }, 10000);

    const handleCanPlay = () => {
      setIsLoading(false);
      clearTimeout(streamTimeout);
      video.play().catch(() => {
        setIsPlaying(false);
      });
    };

    const handleNativeError = () => {
      // If we are using native player and it fails
      if (!Hls.isSupported() || video.src) {
        setIsLoading(false);
        clearTimeout(streamTimeout);
        setError('Lỗi tải video. Luồng phát không khả dụng.');
      }
    };

    // Watch for native events
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleNativeError);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        manifestLoadingTimeOut: 8000,
        fragLoadingTimeOut: 8000,
      });

      hlsRef.current = hls;
      hls.loadSource(proxiedUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        clearTimeout(streamTimeout);
        video.play().catch(() => {
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('Fatal HLS error encountered:', data.type);
          clearTimeout(streamTimeout);
          setIsLoading(false);
          
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Lỗi mạng: Không thể kết nối tới máy chủ IPTV.');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError('Luồng phát bị gián đoạn hoặc không định dạng được.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari / iOS Chrome etc.)
      video.src = proxiedUrl;
    } else {
      setIsLoading(false);
      clearTimeout(streamTimeout);
      setError('Trình duyệt của bạn không hỗ trợ phát luồng HLS m3u8.');
    }

    return () => {
      clearTimeout(streamTimeout);
      if (video) {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleNativeError);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  // Handle Play / Pause toggle
  const handlePlayToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  // Handle Mute Toggle
  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
      video.muted = true;
    } else {
      setIsMuted(false);
      video.muted = false;
    }
  };

  // Handle Fullscreen
  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleRetry = () => {
    // Retrigger the stream load by refreshing the ref
    const video = videoRef.current;
    if (!video || !streamUrl) return;
    setIsLoading(true);
    setError(null);
    
    const proxiedUrl = getProxiedUrl(streamUrl);
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(proxiedUrl);
      hls.attachMedia(video);
    } else {
      video.src = proxiedUrl;
    }
  };

  return (
    <div 
      ref={containerRef}
      id="live-tv-player-container"
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-zinc-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] group"
    >
      {/* Video Tag */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        className="w-full h-full object-contain cursor-pointer"
        onClick={handlePlayToggle}
      />

      {/* Connection Loading Indicator overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-md z-20">
          <div className="w-12 h-12 border-4 border-[var(--color-brand)]/20 border-t-[var(--color-brand)] rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-zinc-300 tracking-wide animate-pulse">
            Đang giải mã tín hiệu truyền hình...
          </p>
        </div>
      )}

      {/* Stream Load Error Panel overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-lg z-20 p-6 text-center select-none">
          <AlertCircle className="w-16 h-16 text-[#E63946] mb-4 animate-bounce" />
          <h4 className="text-lg font-black text-white mb-2">Kênh Tạm Thời Gián Đoạn</h4>
          <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E63946] hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-500/20 active:scale-95"
          >
            <RefreshCw size={14} />
            <span>Thử lại ngay</span>
          </button>
        </div>
      )}

      {/* Info Overlay at the top */}
      {channelName && !isLoading && !error && (
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none select-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {channelLogo ? (
              <img
                src={channelLogo}
                alt={channelName}
                className="w-10 h-10 object-contain bg-white/10 rounded-lg p-1 border border-white/10"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-[var(--color-brand)]/20 text-[var(--color-brand)] border border-[var(--color-brand)]/30 rounded-lg flex items-center justify-center font-bold">
                <Tv size={18} />
              </div>
            )}
            <div>
              <h3 className="text-sm font-black text-white tracking-wide uppercase drop-shadow">
                {channelName}
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[#E63946]">TRỰC TIẾP</span>
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur rounded-full text-[10px] text-zinc-300 font-bold border border-white/5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Proxy CORS Hoạt động</span>
          </div>
        </div>
      )}

      {/* Premium custom control overlay at bottom */}
      {!isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 select-none">
          <div className="flex items-center justify-between gap-4">
            {/* Play/Pause & Live Badge */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayToggle}
                className="w-10 h-10 bg-white/10 hover:bg-[var(--color-brand)] text-white hover:text-white rounded-full flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                title={isPlaying ? 'Tạm dừng' : 'Tiếp tục'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>

              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-xs font-black text-[#E63946] uppercase tracking-widest">
                  Live
                </span>
              </div>
            </div>

            {/* Custom volume controls & fullscreen */}
            <div className="flex items-center gap-4">
              {/* Volume */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={handleMuteToggle}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="custom-range-slider w-0 group-hover/volume:w-24 transition-all duration-300 origin-left scale-x-0 group-hover/volume:scale-x-100 h-1 rounded-full appearance-none cursor-pointer outline-none"
                  style={{
                    background: `linear-gradient(to right, #E63946 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                />
              </div>

              {/* Fullscreen */}
              <button
                onClick={handleFullscreen}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Toàn màn hình"
              >
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

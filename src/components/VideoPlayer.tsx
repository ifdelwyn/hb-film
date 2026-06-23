import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, Settings, RotateCcw, Monitor, RefreshCw, ChevronRight, ChevronLeft, Check, ShieldAlert } from 'lucide-react';
import Hls from 'hls.js';
import QualitySelector, { QualityLevel } from './QualitySelector';

interface VideoPlayerProps {
  embedUrl?: string;
  m3u8Url?: string;
  title: string;
  poster?: string;
  onEnded?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
}

export default function VideoPlayer({ 
  embedUrl, 
  m3u8Url, 
  title, 
  poster,
  onEnded, 
  onProgress 
}: VideoPlayerProps) {
  const [playerType, setPlayerType] = useState<'embed' | 'native'>('embed');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimeoutError, setLoadTimeoutError] = useState(false);

  // Quality selector states
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQualityIdx, setCurrentQualityIdx] = useState<number>(-1); // -1 is Auto
  const [activeHeight, setActiveHeight] = useState<number | undefined>(undefined);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isQualityLoading, setIsQualityLoading] = useState(false);
  const [qualityError, setQualityError] = useState<string | null>(null);

  // Unified Multi-level settings states
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsSubMenu, setSettingsSubMenu] = useState<'main' | 'quality' | 'speed' | 'ratio'>('main');
  const [aspectRatio, setAspectRatio] = useState<'default' | 'fill' | 'cover' | '4-3'>('default');

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Preference load
  useEffect(() => {
    // Prefer ultra-fast, ad-free native HLS/MP4 direct streaming first
    // If no stream URL is provided, fall back to embed iframe player
    if (m3u8Url && m3u8Url.trim() !== '') {
      setPlayerType('native');
    } else if (embedUrl && embedUrl.trim() !== '') {
      setPlayerType('embed');
    } else {
      setPlayerType('native'); // default fallback
    }
    setIsLoading(true);
    setLoadTimeoutError(false);
  }, [embedUrl, m3u8Url]);

  // Redundant 10s loading safety watchdog timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      setLoadTimeoutError(false);
      timer = setTimeout(() => {
        setLoadTimeoutError(true);
      }, 10000); // 10 seconds timeout threshold
    } else {
      setLoadTimeoutError(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // HLS.js streaming configuration and lifecycle
  useEffect(() => {
    if (playerType !== 'native' || !m3u8Url) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setIsQualityLoading(true);
    setQualityError(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const previousTime = video.currentTime;
    const urlFmt = new URLSearchParams(m3u8Url.split('?')[1] || '').get('fmt');
    const isHlsUrl = m3u8Url.includes('.m3u8') || urlFmt === 'm3u8' || (!m3u8Url.toLowerCase().endsWith('.mp4') && urlFmt !== 'mp4');

    if (isHlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        autoStartLoad: true,
        startLevel: -1,
        capLevelToPlayerSize: false,
      });

      hlsRef.current = hls;
      hls.loadSource(m3u8Url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (previousTime > 0) {
          video.currentTime = previousTime;
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsQualityLoading(false);
        
        let loadedQualities: QualityLevel[] = [];
        if (hls.levels && hls.levels.length > 0) {
          loadedQualities = hls.levels.map((lvl, index) => ({
            id: index,
            height: lvl.height || 0,
            label: lvl.height ? `${lvl.height}p` : `Nguồn phát ${index + 1}`,
            bitrate: lvl.bitrate
          })).sort((a, b) => b.height - a.height); // highest to lowest
        }

        const staticQualities: QualityLevel[] = [
          { id: -1, label: 'Tự động (Auto)', height: 0 },
          { id: 1080, label: '1080p Full HD', height: 1080 },
          { id: 720, label: '720p HD', height: 720 },
          { id: 480, label: '480p SD', height: 480 },
          { id: 360, label: '360p', height: 360 },
          { id: 144, label: '144p Tiết kiệm', height: 144 }
        ];
        
        const finalQualities = loadedQualities.length > 0 
          ? [{ id: -1, label: 'Tự động (Auto)', height: 0 }, ...loadedQualities]
          : staticQualities;

        setQualities(finalQualities);

        const savedPref = localStorage.getItem('filmflow_preferred_quality');
        if (savedPref) {
          if (savedPref === 'Auto') {
            hls.currentLevel = -1;
            setCurrentQualityIdx(-1);
          } else {
            const parsedPrefHeight = parseInt(savedPref, 10);
            setCurrentQualityIdx(parsedPrefHeight);
            
            // Map preferred height target resolution to nearest available Hls stream levels
            if (data.levels && data.levels.length > 0) {
              let closestIdx = 0;
              let minDiff = Infinity;
              for (let i = 0; i < data.levels.length; i++) {
                const h = data.levels[i].height || 0;
                if (h > 0) {
                  const diff = Math.abs(h - parsedPrefHeight);
                  if (diff < minDiff) {
                    minDiff = diff;
                    closestIdx = i;
                  }
                }
              }
              hls.currentLevel = closestIdx;
            } else {
              hls.currentLevel = -1;
            }
          }
        } else {
          hls.currentLevel = -1;
          setCurrentQualityIdx(-1);
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const activeLevel = hls.levels[data.level];
        if (activeLevel) {
          setActiveHeight(activeLevel.height);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        // Handle chunk/fragment loading faults to downgrade streaming resolution automatically to the next lower level
        if (
          data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR || 
          data.details === Hls.ErrorDetails.FRAG_LOAD_TIMEOUT ||
          data.details === Hls.ErrorDetails.KEY_LOAD_ERROR
        ) {
          if (hls.currentLevel > 0) {
            console.warn(`Encountered chunk error: ${data.details}. Automatically downgrading quality level.`);
            const lowerLevelIdx = hls.currentLevel - 1;
            hls.currentLevel = lowerLevelIdx;
            setCurrentQualityIdx(lowerLevelIdx);
          }
        }

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              if (embedUrl) {
                console.warn('HLS stream fatal error. Switching to Embed player automatically.');
                setPlayerType('embed');
                setIsLoading(false);
              } else {
                setQualityError('Mạng dẫn truyền dữ liệu m3u8 bị ngắt.');
                setIsQualityLoading(false);
              }
              break;
          }
        }
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple fallback (Safari)
      video.src = m3u8Url;
      video.addEventListener('loadedmetadata', () => {
        if (previousTime > 0) {
          video.currentTime = previousTime;
        }
        setIsQualityLoading(false);
        const mockLevels: QualityLevel[] = [
          { id: -1, label: 'Tự động (Auto)', height: 0 },
          { id: 1080, label: '1080p Full HD', height: 1080 },
          { id: 720, label: '720p HD', height: 720 },
          { id: 480, label: '480p SD', height: 480 },
          { id: 360, label: '360p', height: 360 },
          { id: 144, label: '144p Tiết kiệm', height: 144 }
        ];
        setQualities(mockLevels);
      });
    } else {
      setIsQualityLoading(false);
      setQualityError('Trình phát không hỗ trợ HLS Stream Native.');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playerType, m3u8Url]);

  const handleQualityChange = (levelId: number) => {
    setCurrentQualityIdx(levelId);
    
    if (playerType === 'native' && hlsRef.current) {
      if (levelId === -1) {
        hlsRef.current.currentLevel = -1;
        localStorage.setItem('filmflow_preferred_quality', 'Auto');
      } else {
        const levels = hlsRef.current.levels;
        if (levels && levels.length > 0) {
          if (levelId >= 144) {
            // It is a height! Seek nearest height index
            let closestIdx = 0;
            let minDiff = Infinity;
            for (let i = 0; i < levels.length; i++) {
              const h = levels[i].height || 0;
              if (h > 0) {
                const diff = Math.abs(h - levelId);
                if (diff < minDiff) {
                  minDiff = diff;
                  closestIdx = i;
                }
              }
            }
            hlsRef.current.currentLevel = closestIdx;
            localStorage.setItem('filmflow_preferred_quality', levelId.toString());
          } else {
            // It is an index! Use it directly.
            hlsRef.current.currentLevel = levelId;
            const chosenLevel = levels[levelId];
            if (chosenLevel && chosenLevel.height) {
              localStorage.setItem('filmflow_preferred_quality', chosenLevel.height.toString());
            } else {
              localStorage.setItem('filmflow_preferred_quality', 'Auto');
            }
          }
        }
      }
    } else {
      if (levelId === -1) {
        localStorage.setItem('filmflow_preferred_quality', 'Auto');
      } else {
        localStorage.setItem('filmflow_preferred_quality', levelId.toString());
      }
    }
    
    setTimeout(() => {
      setShowQualityMenu(false);
    }, 250);
  };

  // If we change player types or reload, reset states
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Autohide controls on no interaction
  const triggerControlsVisibility = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const handleMouseMove = () => triggerControlsVisibility();
    const handleKeyDown = () => triggerControlsVisibility();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // Video Native Handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Playback failed', err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 0;
    setCurrentTime(cur);
    setDuration(dur);
    if (onProgress) {
      onProgress(cur, dur);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
    setIsLoading(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    setVolume(val);
    videoRef.current.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
  };

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error(err));
    }
  };

  // Hotkey Control Handlers
  useEffect(() => {
    if (playerType !== 'native') return;

    const handleHotkeys = (e: KeyboardEvent) => {
      // Ignore if user is inside form inputs
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          if (videoRef.current) {
            e.preventDefault();
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          }
          break;
        case 'arrowright':
          if (videoRef.current) {
            e.preventDefault();
            videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          }
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(prev => {
            const next = Math.min(1, prev + 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(prev => {
            const next = Math.max(0, prev - 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleHotkeys);
    return () => window.removeEventListener('keydown', handleHotkeys);
  }, [playerType, isPlaying, duration]);

  // Format Helper minutes:seconds
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full flex flex-col ${isTheaterMode ? 'max-w-none' : 'max-w-5xl mx-auto'} bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-900`}>
      
      {/* Thin, elegant player stream description banner */}
      <div className="flex justify-between items-center bg-zinc-950 border-b border-zinc-900 p-2.5 px-4 select-none">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] animate-pulse" />
          <h3 className="text-xs font-bold text-zinc-400 truncate max-w-full">
            Đang phát: <span className="text-zinc-200 font-semibold">{title}</span>
          </h3>
        </div>
      </div>

      {/* Main Video View Stage */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-black group"
        onMouseMove={triggerControlsVisibility}
      >
        {/* Cinematic Loading Overlay (Netflix, VieON, Disney+ Style) */}
        <div 
          className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 select-none transition-all duration-700 ${
            isLoading 
              ? 'opacity-100 bg-black/95 visible pointer-events-auto' 
              : 'opacity-0 invisible pointer-events-none'
          }`}
        >
          {/* Ambient blurred backdrop of the current content poster/thumbnail for luxury translucent depth */}
          {poster && (
            <img 
              src={poster} 
              alt="Ambient stage" 
              className="absolute inset-0 w-full h-full object-cover filter blur-[32px] opacity-25 scale-110 pointer-events-none"
              referrerPolicy="no-referrer"
            />
          )}
          
          {/* Pitch dark vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/95 pointer-events-none" />

          {/* Loading Container */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md p-6">
            {!loadTimeoutError ? (
              <>
                {/* Netflix/Disney+ style custom spinning neon gradient ring loader */}
                <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                  <span className="absolute w-full h-full rounded-full border-4 border-white/5" />
                  <span className="absolute w-full h-full rounded-full border-4 border-t-[#E50914] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                </div>
                
                <h4 className="text-sm sm:text-base font-black text-rose-500 tracking-wider uppercase mb-2 animate-pulse">
                  FilmFlow Stream
                </h4>
                <p className="text-xs sm:text-sm text-zinc-200 font-extrabold leading-snug">
                  Đang chuẩn bị trải nghiệm xem phim tốt nhất cho bạn...
                </p>
                <p className="text-[10px] text-zinc-500 font-bold mt-2 uppercase tracking-widest">
                  Chất lượng hình ảnh 1080p UHD • Băng thông cao điểm
                </p>
              </>
            ) : (
              <div className="animate-scale-in p-5 rounded-3xl bg-[rgba(20,20,20,0.85)] border border-red-500/30 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                {/* Alert/Timeout stage UI */}
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 mx-auto text-red-500">
                  <ShieldAlert size={24} />
                </div>
                
                <h4 className="text-sm font-black text-white px-2 tracking-tight mb-2 leading-relaxed">
                  Tải phim chậm hơn dự kiến
                </h4>
                
                <p className="text-xs text-zinc-400 font-semibold leading-relaxed mb-5">
                  Việc tải phim đang mất nhiều thời gian hơn dự kiến. Vui lòng kiểm tra kết nối mạng hoặc thử tải lại.
                </p>

                {/* Reload & fallback controls */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      setLoadTimeoutError(false);
                      if (playerType === 'native' && videoRef.current) {
                        const previousSrc = videoRef.current.src;
                        videoRef.current.src = '';
                        setTimeout(() => {
                          if (videoRef.current) videoRef.current.src = previousSrc;
                        }, 50);
                      } else {
                        // Quick iframe bounce force reload
                        const iframe = containerRef.current?.querySelector('iframe');
                        if (iframe) {
                          const src = iframe.src;
                          iframe.src = '';
                          setTimeout(() => {
                            iframe.src = src;
                          }, 50);
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
                  >
                    Thử tải lại
                  </button>
                  {embedUrl && m3u8Url && (
                    <button
                      onClick={() => {
                        setPlayerType(playerType === 'native' ? 'embed' : 'native');
                        setIsLoading(true);
                        setLoadTimeoutError(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-zinc-300 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
                    >
                      Đổi nguồn phát
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 1. EMBED IFRAME STAGE */}
        {playerType === 'embed' && embedUrl && (
          <iframe
            src={embedUrl}
            title={title}
            onLoad={handleIframeLoad}
            className="w-full h-full border-none z-10"
            allowFullScreen
            allow="autoplay; encrypted-media"
            referrerPolicy="no-referrer"
          />
        )}

        {/* 2. NATIVE HTML5 STAGE */}
        {playerType === 'native' && (
          <>
            <video
              ref={videoRef}
              src={m3u8Url}
              poster={poster}
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={onEnded}
              preload="auto"
              onLoadStart={() => {
                setIsLoading(true);
                setLoadTimeoutError(false);
              }}
              onWaiting={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onPlaying={() => setIsLoading(false)}
              className={(() => {
                const base = "w-full h-full cursor-pointer transition-all duration-300";
                if (aspectRatio === 'fill') return `${base} object-fill`;
                if (aspectRatio === 'cover') return `${base} object-cover`;
                if (aspectRatio === '4-3') return `${base} object-contain aspect-[4/3] mx-auto`;
                return `${base} object-contain`;
              })()}
              referrerPolicy="no-referrer"
              playsInline
            />

            {/* Custom overlay controls bar on top of Native stream */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-end transition-opacity duration-300 z-20 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              
              {/* Play Pause screen middle overlay click target (restricted to area above controls) */}
              <div 
                onClick={togglePlay}
                className="absolute inset-x-0 top-0 bottom-24 flex items-center justify-center cursor-pointer select-none z-10"
              >
                {!isPlaying && (
                  <div className="p-5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white scale-100 hover:scale-105 active:scale-95 transition-transform duration-200">
                    <Play size={32} fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Control Deck Dashboard bottom panel with propagation guard */}
              <div 
                onClick={(e) => e.stopPropagation()}
                className="relative p-4 flex flex-col gap-3 select-none z-30 bg-gradient-to-t from-black/95 via-black/40 to-transparent"
              >
                {/* Timeline slider progress track */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono font-medium text-zinc-400 min-w-[32px] text-right">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-zinc-700 hover:h-1.5 rounded-lg appearance-none cursor-pointer accent-[var(--color-brand)] transition-all outline-none"
                  />
                  <span className="text-[11px] font-mono font-medium text-zinc-400 min-w-[32px]">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Function Row widgets buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Play Button */}
                    <button onClick={togglePlay} className="text-white hover:text-[var(--color-brand)] transition-colors cursor-pointer">
                      {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>

                    {/* Rewind 10s */}
                    <button 
                      onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10); }}
                      className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Tua lại 10 giây"
                    >
                      <RotateCcw size={16} />
                    </button>

                    {/* Volume and slider */}
                    <div className="flex items-center gap-2 group/volume">
                      <button onClick={toggleMute} className="text-white hover:text-[var(--color-brand)] transition-colors cursor-pointer">
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-0 group-hover/volume:w-16 h-1 rounded-lg appearance-none cursor-pointer accent-white bg-zinc-700 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Secondary settings list */}
                  <div className="flex items-center gap-3">
                    {/* Unified Settings Gear Menu */}
                    <div className="relative">
                      <button 
                        id="player-unified-settings-btn"
                        onClick={() => {
                          setShowSettingsMenu(!showSettingsMenu);
                          setSettingsSubMenu('main');
                        }}
                        className={`flex items-center gap-1.5 transition-all text-xs font-bold px-2.5 py-1 rounded border cursor-pointer select-none ${
                          showSettingsMenu 
                            ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-lg shadow-red-500/15' 
                            : 'bg-zinc-950 border-zinc-805 hover:border-zinc-700 text-zinc-300 hover:text-white'
                        }`}
                        title="Cài đặt phát"
                      >
                        <Settings size={15} className={`transition-transform duration-500 ${showSettingsMenu ? 'rotate-90 text-white' : 'text-zinc-400'}`} />
                        <span>Cài đặt</span>
                      </button>

                      {showSettingsMenu && (
                        <div className="absolute bottom-full right-0 mb-2.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-3 rounded-xl flex flex-col gap-1 w-64 text-[var(--color-text-primary)] shadow-2xl z-50 backdrop-blur-md animate-scale-in">
                          
                          {/* 1. MAIN MENU PAGE */}
                          {settingsSubMenu === 'main' && (
                            <div className="flex flex-col gap-1 text-sm">
                              <div className="text-[var(--color-text-muted)] text-[10px] uppercase font-black tracking-wider px-2 py-1 select-none border-b border-[var(--color-border)] mb-1">
                                Cài đặt trình phát
                              </div>

                              {/* Option: Chất lượng */}
                              <button 
                                onClick={() => setSettingsSubMenu('quality')}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors cursor-pointer text-xs font-semibold"
                              >
                                <span className="flex items-center gap-2">
                                  <Settings size={14} className="text-zinc-450" />
                                  Chất lượng hình ảnh
                                </span>
                                <span className="flex items-center gap-0.5 text-zinc-450 text-[11px] font-bold">
                                  {currentQualityIdx === -1 ? 'Tự động' : (qualities.find(q => q.id === currentQualityIdx)?.label || 'Tự động')}
                                  <ChevronRight size={14} />
                                </span>
                              </button>

                              {/* Option: Tốc độ phát */}
                              <button 
                                onClick={() => setSettingsSubMenu('speed')}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors cursor-pointer text-xs font-semibold"
                              >
                                <span className="flex items-center gap-2">
                                  <Play size={14} className="text-zinc-450" />
                                  Tốc độ phát
                                </span>
                                <span className="flex items-center gap-0.5 text-zinc-450 text-[11px] font-bold">
                                  {playbackSpeed === 1 ? 'Bình thường' : `${playbackSpeed}x`}
                                  <ChevronRight size={14} />
                                </span>
                              </button>

                              {/* Option: Tỷ lệ khung hình */}
                              <button 
                                onClick={() => setSettingsSubMenu('ratio')}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors cursor-pointer text-xs font-semibold"
                              >
                                <span className="flex items-center gap-2">
                                  <Monitor size={14} className="text-zinc-450" />
                                  Tỷ lệ khung hình
                                </span>
                                <span className="flex items-center gap-0.5 text-zinc-450 text-[11px] font-bold">
                                  {aspectRatio === 'default' && 'Mặc định'}
                                  {aspectRatio === 'fill' && 'Tràn viền (Fill)'}
                                  {aspectRatio === 'cover' && 'Thu phóng (Cover)'}
                                  {aspectRatio === '4-3' && 'Cổ điển 4:3'}
                                  <ChevronRight size={14} />
                                </span>
                              </button>
                            </div>
                          )}

                          {/* 2. QUALITY SUBMENU */}
                          {settingsSubMenu === 'quality' && (
                            <div className="flex flex-col gap-1 text-sm">
                              <button 
                                onClick={() => setSettingsSubMenu('main')}
                                className="flex items-center gap-1 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer text-xs font-bold select-none border-b border-[var(--color-border)] mb-1"
                              >
                                <ChevronLeft size={16} />
                                Quay lại Cài đặt
                              </button>
                              
                              <div className="max-h-48 overflow-y-auto pr-1">
                                <QualitySelector 
                                  levels={qualities}
                                  currentLevelIndex={currentQualityIdx}
                                  onLevelChange={handleQualityChange}
                                  isLoading={isQualityLoading}
                                  activeHeight={activeHeight}
                                  error={qualityError}
                                />
                              </div>
                            </div>
                          )}

                          {/* 3. SPEED SUBMENU */}
                          {settingsSubMenu === 'speed' && (
                            <div className="flex flex-col gap-1 text-sm">
                              <button 
                                onClick={() => setSettingsSubMenu('main')}
                                className="flex items-center gap-1 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer text-xs font-bold select-none border-b border-[var(--color-border)] mb-1"
                              >
                                <ChevronLeft size={16} />
                                Quay lại Cài đặt
                              </button>

                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                                <button
                                  key={speed}
                                  onClick={() => {
                                    handleSpeedChange(speed);
                                    setSettingsSubMenu('main');
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors cursor-pointer text-xs font-semibold ${
                                    playbackSpeed === speed ? 'text-[var(--color-brand)] bg-black/5 dark:bg-white/5 font-bold' : 'text-[var(--color-text-secondary)]'
                                  }`}
                                >
                                  <span>{speed === 1 ? 'Bình thường (1.0x)' : `${speed}x`}</span>
                                  {playbackSpeed === speed && <Check size={14} />}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* 4. RATIO SUBMENU */}
                          {settingsSubMenu === 'ratio' && (
                            <div className="flex flex-col gap-1 text-sm">
                              <button 
                                onClick={() => setSettingsSubMenu('main')}
                                className="flex items-center gap-1 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer text-xs font-bold select-none border-b border-[var(--color-border)] mb-1"
                              >
                                <ChevronLeft size={16} />
                                Quay lại Cài đặt
                              </button>

                              {[
                                { id: 'default', label: 'Tỷ lệ Mặc định (16:9)' },
                                { id: 'fill', label: 'Tràn viền (Fill)' },
                                { id: 'cover', label: 'Cắt viền thu phóng (Cover)' },
                                { id: '4-3', label: 'Khung ảnh cổ điển (4:3)' }
                              ].map(ratio => (
                                <button
                                  key={ratio.id}
                                  onClick={() => {
                                    setAspectRatio(ratio.id as any);
                                    setSettingsSubMenu('main');
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors cursor-pointer text-xs font-semibold ${
                                    aspectRatio === ratio.id ? 'text-[var(--color-brand)] bg-black/5 dark:bg-white/5 font-bold' : 'text-[var(--color-text-secondary)]'
                                  }`}
                                >
                                  <span>{ratio.label}</span>
                                  {aspectRatio === ratio.id && <Check size={14} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Theater Mode */}
                    <button 
                      onClick={() => setIsTheaterMode(!isTheaterMode)}
                      className="text-zinc-300 hover:text-[var(--color-brand)] transition-colors cursor-pointer hidden md:inline"
                      title={isTheaterMode ? 'Chế độ thường' : 'Chế độ rạp chiếu'}
                    >
                      <Monitor size={18} className={isTheaterMode ? 'text-[var(--color-brand)]' : ''} />
                    </button>

                    {/* Fullscreen Button */}
                    <button onClick={toggleFullscreen} className="text-white hover:text-[var(--color-brand)] transition-colors cursor-pointer">
                      {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </>
        )}
      </div>

      {/* Clean high-fidelity status footer bar */}
      <div className="bg-zinc-950 p-3 px-5 flex flex-wrap justify-between items-center gap-2 select-none border-t border-zinc-900 text-zinc-500 font-sans text-xs">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Băng thông Premium:</span>
          <span className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">Ultra 4K Enabled</span>
        </div>
        <div className="text-[11px] font-medium text-zinc-500">
          * Tự động tối ưu hoá chất lượng hình ảnh theo tốc độ mạng.
        </div>
      </div>

    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  RotateCw, 
  Monitor, 
  ShieldAlert,
  SkipForward,
  Clapperboard
} from 'lucide-react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  key?: string;
  embedUrl?: string;
  m3u8Url?: string;
  title: string;
  poster?: string;
  onEnded?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
  fullWidth?: boolean;
  onLocalPlay?: (currentTime: number) => void;
  onLocalPause?: (currentTime: number) => void;
  onLocalSeek?: (currentTime: number) => void;
  externalPlayState?: { isPlaying: boolean; currentTime: number; lastUpdated: number } | null;
  isTheaterMode?: boolean;
  onToggleTheaterMode?: () => void;
}

export default function VideoPlayer({ 
  embedUrl, 
  m3u8Url, 
  title, 
  poster,
  onEnded, 
  onProgress,
  fullWidth,
  onLocalPlay,
  onLocalPause,
  onLocalSeek,
  externalPlayState,
  isTheaterMode = false,
  onToggleTheaterMode
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
  const [showSpeedDropdown, setShowSpeedDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimeoutError, setLoadTimeoutError] = useState(false);
  
  // Custom states for zoom/fit and double-tap gestures
  const [videoFit, setVideoFit] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<{ visible: boolean; type: 'forward' | 'backward' } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);

  // Custom indicator state for volume changes
  const [volumeIndicator, setVolumeIndicator] = useState<{ visible: boolean; value: number } | null>(null);

  // Active keyboard button visual feedback indicator
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // Hover seeking state for desktop progress bar
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const indicatorTimeoutRef = useRef<number | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Preference load and set player mode
  useEffect(() => {
    if (m3u8Url && m3u8Url.trim() !== '') {
      setPlayerType('native');
    } else if (embedUrl && embedUrl.trim() !== '') {
      setPlayerType('embed');
    } else {
      setPlayerType('native');
    }
    setIsLoading(true);
    setLoadTimeoutError(false);
  }, [embedUrl, m3u8Url]);

  // Loading safety watchdog (10s timeout)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      setLoadTimeoutError(false);
      timer = setTimeout(() => {
        setLoadTimeoutError(true);
      }, 10000);
    } else {
      setLoadTimeoutError(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // HLS.js setup and event parsing
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

    setIsLoading(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const previousTime = video.currentTime;
    const isHlsUrl = m3u8Url.includes('.m3u8') || !m3u8Url.toLowerCase().endsWith('.mp4');

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

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setIsLoading(false);
              setLoadTimeoutError(true);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = m3u8Url;
      video.addEventListener('loadedmetadata', () => {
        if (previousTime > 0) {
          video.currentTime = previousTime;
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playerType, m3u8Url, embedUrl]);

  // Autohide controls on inactivity
  const resetControlsTimer = () => {
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
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      onLocalPause?.(videoRef.current.currentTime);
    } else {
      const time = videoRef.current.currentTime;
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          onLocalPlay?.(time);
        })
        .catch(err => console.error('Playback failed:', err));
    }
    resetControlsTimer();
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    const nextTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
    onLocalSeek?.(nextTime);
    resetControlsTimer();
  };

  const toggleVideoFit = () => {
    setVideoFit(prev => {
      if (prev === 'contain') return 'cover';
      if (prev === 'cover') return 'fill';
      return 'contain';
    });
    resetControlsTimer();
  };

  const triggerDoubleTapFeedback = (type: 'forward' | 'backward') => {
    setDoubleTapFeedback({ visible: true, type });
    setTimeout(() => {
      setDoubleTapFeedback(null);
    }, 500);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFullscreen();
  };

  const handleVideoAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // Desktop native double click handler to toggle fullscreen
    if (e.detail === 2) {
      toggleFullscreen();
      if (lastTapRef.current) {
        lastTapRef.current = null;
      }
      return;
    }
    
    const now = Date.now();
    if (lastTapRef.current && (now - lastTapRef.current.time < 320)) {
      e.stopPropagation();
      if (clickX < width * 0.4) {
        seekRelative(-10);
        triggerDoubleTapFeedback('backward');
      } else if (clickX > width * 0.6) {
        seekRelative(10);
        triggerDoubleTapFeedback('forward');
      } else {
        toggleFullscreen();
      }
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: now, x: clickX };
      setTimeout(() => {
        if (lastTapRef.current && lastTapRef.current.time === now) {
          togglePlay();
          lastTapRef.current = null;
        }
      }, 250);
    }
  };

  const handleSeekMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setHoverTime(pct * duration);
    setHoverX(x);
  };

  const handleSeekMouseLeave = () => {
    setHoverTime(null);
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

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    videoRef.current.currentTime = val;
    setCurrentTime(val);
    onLocalSeek?.(val);
    resetControlsTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    setVolume(val);
    videoRef.current.volume = val;
    setIsMuted(val === 0);
    setVolumeIndicator({ visible: true, value: val });
    resetControlsTimer();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
    resetControlsTimer();
  };

  const handleSpeedChange = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    resetControlsTimer();
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP failed:', err);
    }
    resetControlsTimer();
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
    resetControlsTimer();
  };

  // Fullscreen event listener sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (indicatorTimeoutRef.current) window.clearTimeout(indicatorTimeoutRef.current);
    };
  }, []);

  // Auto-hide volume HUD indicator after exactly 1.5 seconds
  useEffect(() => {
    if (volumeIndicator) {
      const timer = setTimeout(() => {
        setVolumeIndicator(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [volumeIndicator]);

  // Hotkey Control Handlers
  useEffect(() => {
    if (playerType !== 'native') return;

    const showHUD = (val: number) => {
      setVolumeIndicator({ visible: true, value: val });
    };

    const triggerButtonFeedback = (buttonId: string) => {
      setActiveButton(buttonId);
      const timer = setTimeout(() => {
        setActiveButton(null);
      }, 200);
      return timer;
    };

    const handleHotkeys = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          triggerButtonFeedback('play');
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          triggerButtonFeedback('fullscreen');
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          triggerButtonFeedback('mute');
          break;
        case 'arrowleft':
          if (videoRef.current) {
            e.preventDefault();
            const nextTime = Math.max(0, videoRef.current.currentTime - 10);
            videoRef.current.currentTime = nextTime;
            setCurrentTime(nextTime);
            onLocalSeek?.(nextTime);
            triggerButtonFeedback('backward');
          }
          break;
        case 'arrowright':
          if (videoRef.current) {
            e.preventDefault();
            const nextTime = Math.min(duration, videoRef.current.currentTime + 10);
            videoRef.current.currentTime = nextTime;
            setCurrentTime(nextTime);
            onLocalSeek?.(nextTime);
            triggerButtonFeedback('forward');
          }
          break;
        case 'arrowup':
          e.preventDefault();
          if (videoRef.current) {
            const nextVolume = Math.min(1, videoRef.current.volume + 0.05);
            videoRef.current.volume = nextVolume;
            setVolume(nextVolume);
            setIsMuted(nextVolume === 0);
            showHUD(nextVolume);
            triggerButtonFeedback('volume');
          }
          break;
        case 'arrowdown':
          e.preventDefault();
          if (videoRef.current) {
            const nextVolume = Math.max(0, videoRef.current.volume - 0.05);
            videoRef.current.volume = nextVolume;
            setVolume(nextVolume);
            setIsMuted(nextVolume === 0);
            showHUD(nextVolume);
            triggerButtonFeedback('volume');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleHotkeys);
    return () => {
      window.removeEventListener('keydown', handleHotkeys);
    };
  }, [playerType, isPlaying, duration, isMuted, onLocalSeek]);

  // Align with remote playback events in Watch Party
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !externalPlayState) return;

    const { isPlaying: extIsPlaying, currentTime: extTime } = externalPlayState;
    const diff = Math.abs(video.currentTime - extTime);

    if (diff > 2) {
      video.currentTime = extTime;
      setCurrentTime(extTime);
    }

    if (extIsPlaying && video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.warn('Playback failed during real-time sync alignment:', err));
    } else if (!extIsPlaying && !video.paused) {
      video.pause();
      setIsPlaying(false);
    }
  }, [externalPlayState]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`w-full flex flex-col bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-900`}>
      {/* 16:9 HARD RIGID CONTAINER */}
      <div 
        ref={containerRef}
        onMouseMove={resetControlsVisibility}
        style={{ position: 'relative', width: '100%', paddingTop: '56.25%', height: 0 }}
        className="bg-black select-none overflow-hidden group"
      >
        {/* Cinematic Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-35 flex flex-col items-center justify-center bg-black/95">
            <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
              <span className="absolute w-full h-full rounded-full border-4 border-white/5" />
              <span className="absolute w-full h-full rounded-full border-4 border-t-[#E63946] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <p className="text-xs text-zinc-400 font-extrabold animate-pulse uppercase tracking-wider">
              Đang chuẩn bị luồng trực tuyến...
            </p>
          </div>
        )}

        {/* Load timeout error layout */}
        {loadTimeoutError && (
          <div className="absolute inset-0 z-35 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center">
            <ShieldAlert size={32} className="text-[#E63946] mb-3" />
            <p className="text-sm font-black text-white mb-2">Tải luồng chậm hơn bình thường</p>
            <p className="text-xs text-zinc-500 max-w-xs mb-4 leading-relaxed">Đang tải phim lâu hơn dự kiến. Vui lòng bấm nguồn phát dự phòng bên dưới.</p>
            {embedUrl && (
              <button 
                onClick={() => setPlayerType('embed')}
                className="px-4 py-2 bg-[#E63946] hover:bg-red-600 rounded-xl text-xs font-black uppercase text-white cursor-pointer"
              >
                Chuyển qua máy chủ Dự phòng
              </button>
            )}
          </div>
        )}

        {/* VOLUME HUD INDICATOR */}
        {volumeIndicator && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-white z-40 animate-fade-in pointer-events-none shadow-2xl">
            <span className="text-2xl">{volumeIndicator.value === 0 ? '🔇' : '🔊'}</span>
            <span className="text-xs font-black font-mono">{Math.round(volumeIndicator.value * 100)}%</span>
            <div className="w-20 bg-zinc-850 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#E63946] h-full" style={{ width: `${volumeIndicator.value * 100}%` }} />
            </div>
          </div>
        )}

        {/* 1. EMBED IFRAME PLAYER */}
        {playerType === 'embed' && embedUrl && (
          <iframe
            key={`embed-${embedUrl}`}
            src={embedUrl}
            title={title}
            onLoad={handleIframeLoad}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            className="border-none z-10"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock"
            referrerPolicy="no-referrer"
          />
        )}

        {/* 2. NATIVE PLAYER WITH CUSTOM CONTROLS */}
        {playerType === 'native' && (
          <>
            <video
              ref={videoRef}
              src={m3u8Url || undefined}
              poster={poster || undefined}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={onEnded}
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onLoadStart={() => setIsLoading(true)}
              onWaiting={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onPlaying={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setLoadTimeoutError(true);
              }}
              style={{ 
                position: 'absolute', 
                inset: 0, 
                width: '100%', 
                height: '100%', 
                objectFit: videoFit, 
                background: '#000',
                pointerEvents: 'none' // REQUIRED BY USER
              }}
              playsInline
            />

            {/* DOUBLE TAP FEEDBACK HUDS */}
            {doubleTapFeedback && (
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center gap-16">
                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full bg-black/60 text-white transition-all duration-300 ${
                  doubleTapFeedback.type === 'backward' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}>
                  <span className="text-xs font-black font-mono">-10s</span>
                  <RotateCcw className="animate-pulse" size={16} />
                </div>
                <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full bg-black/60 text-white transition-all duration-300 ${
                  doubleTapFeedback.type === 'forward' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}>
                  <span className="text-xs font-black font-mono">+10s</span>
                  <RotateCw className="animate-pulse" size={16} />
                </div>
              </div>
            )}

            {/* SKIP INTRO (85s) BUTTON FOR SHORT EPISODES */}
            {isPlaying && currentTime < 150 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  seekRelative(85);
                }}
                className="absolute right-4 bottom-20 z-30 px-3.5 py-2 bg-black/85 hover:bg-[#E63946] border border-zinc-800 hover:border-transparent text-white text-[11px] font-black uppercase rounded-xl tracking-wider transition-all shadow-2xl flex items-center gap-1.5 cursor-pointer"
              >
                <SkipForward size={12} />
                <span>Bỏ qua Intro (85s)</span>
              </button>
            )}

            {/* UPPER BIG AREA CLICK TO PLAY/PAUSE AND GESTURES */}
            <div 
              onClick={handleVideoAreaClick}
              onDoubleClick={handleDoubleClick}
              className="absolute inset-x-0 top-0 bottom-16 z-15 cursor-pointer flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors"
            >
              {!isPlaying && !isLoading && (
                <div className="p-4 sm:p-5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white scale-100 hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl">
                  <Play size={24} fill="currentColor" />
                </div>
              )}
            </div>

             {/* FULLY BUILT CUSTOM OVERLAY CONTROLS BAR */}
            <div 
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end transition-opacity duration-300 z-30 ${
                showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* DESKTOP LAYOUT (>= md): Single elegant row, exactly matching user's original screenshot */}
              <div 
                className={`hidden md:flex items-center bg-black/60 border-t border-zinc-900/40 w-full transition-all ${
                  isFullscreen ? 'p-6 gap-6 text-sm' : 'p-3 gap-3.5 text-xs'
                }`}
              >
                {/* [ Play/Pause ] */}
                <button 
                  onClick={togglePlay} 
                  className={`cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/5 active:scale-90 transition-all duration-150 ${
                    activeButton === 'play' 
                      ? 'scale-90 text-[#E63946] bg-white/10 shadow-[0_0_15px_rgba(230,57,70,0.6)]' 
                      : 'text-white hover:text-[#E63946]'
                  }`}
                >
                  {isPlaying ? (
                    <Pause size={isFullscreen ? 22 : 18} fill="currentColor" />
                  ) : (
                    <Play size={isFullscreen ? 22 : 18} fill="currentColor" />
                  )}
                </button>

                {/* [ Tua -10s ] */}
                <button 
                  onClick={() => seekRelative(-10)} 
                  className={`cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/5 active:scale-90 transition-all duration-150 ${
                    activeButton === 'backward' 
                      ? 'scale-90 text-[#E63946] bg-white/10 shadow-[0_0_15px_rgba(230,57,70,0.6)] border border-[#E63946]/30' 
                      : 'text-zinc-350 hover:text-white'
                  }`}
                  title="Tua lùi 10s"
                >
                  <RotateCcw size={isFullscreen ? 20 : 16} />
                </button>

                {/* [ Tua +10s ] */}
                <button 
                  onClick={() => seekRelative(10)} 
                  className={`cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/5 active:scale-90 transition-all duration-150 ${
                    activeButton === 'forward' 
                      ? 'scale-90 text-[#E63946] bg-white/10 shadow-[0_0_15px_rgba(230,57,70,0.6)] border border-[#E63946]/30' 
                      : 'text-zinc-350 hover:text-white'
                  }`}
                  title="Tua tiến 10s"
                >
                  <RotateCw size={isFullscreen ? 20 : 16} />
                </button>

                {/* [ Thời gian hiện tại / Tổng thời gian ] */}
                <span className="text-zinc-350 font-mono font-bold select-none shrink-0 tracking-tight">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* [ SeekBar (Thanh thời gian) ] */}
                <div className="flex-grow relative group/seek flex items-center h-5 cursor-pointer">
                  {/* Background track bar */}
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full relative overflow-hidden">
                    {/* Red progress accent line */}
                    <div 
                      className="bg-[#E63946] h-full rounded-full"
                      style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                  </div>
                  
                  {/* Circle red thumb - visible on hover */}
                  <div 
                    className="absolute w-3.5 h-3.5 bg-[#E63946] border border-white/20 rounded-full top-1/2 -translate-y-1/2 -ml-1.5 pointer-events-none scale-0 group-hover/seek:scale-100 transition-transform shadow-[0_0_10px_rgba(230,57,70,0.8)]"
                    style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                  />

                  {/* Hover timestamp tooltip */}
                  {hoverTime !== null && (
                    <div 
                      className="absolute bottom-6 bg-zinc-950 border border-zinc-800 text-white font-mono text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none -translate-x-1/2 z-50 shadow-2xl whitespace-nowrap"
                      style={{ left: `${hoverX}px` }}
                    >
                      {formatTime(hoverTime)}
                    </div>
                  )}

                  {/* Hidden input range for easy sliding dragging */}
                  <input
                    type="range"
                    min="0"
                    max={duration || 1}
                    value={currentTime}
                    onChange={handleSeekChange}
                    onMouseMove={handleSeekMouseMove}
                    onMouseLeave={handleSeekMouseLeave}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* [ Volume Icon + Slider ] */}
                <div className="flex items-center gap-1.5 group/volume shrink-0 relative">
                  <button 
                    onClick={toggleMute} 
                    className={`cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/5 active:scale-90 transition-all duration-150 ${
                      activeButton === 'mute' || activeButton === 'volume'
                        ? 'scale-90 text-[#E63946] bg-white/10 shadow-[0_0_15px_rgba(230,57,70,0.6)]' 
                        : 'text-zinc-200 hover:text-white'
                    }`}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={isFullscreen ? 21 : 17} />
                    ) : (
                      <Volume2 size={isFullscreen ? 21 : 17} />
                    )}
                  </button>
                  {/* Slide in volume width horizontal slider */}
                  <div className="w-0 overflow-hidden sm:group-hover/volume:w-20 transition-all duration-300 flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-18 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#E63946] outline-none"
                    />
                  </div>
                </div>

                {/* [ Zoom Aspect Ratio Toggle ] */}
                <button 
                  onClick={toggleVideoFit} 
                  className="text-zinc-350 hover:text-white transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider min-h-[44px]"
                  title="Phóng to màn hình / Tỷ lệ"
                >
                  <Maximize2 size={12} className="text-[#E63946]" />
                  <span>{videoFit === 'contain' ? 'Gốc' : videoFit === 'cover' ? 'Phóng To' : 'Giãn Đầy'}</span>
                </button>

                {/* [ Playback Speed Selection ] */}
                <div className="relative shrink-0">
                  <button 
                    onClick={() => setShowSpeedDropdown(!showSpeedDropdown)} 
                    className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-350 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
                  >
                    <span>{playbackSpeed === 1 ? 'Tốc độ (1.0x)' : `Tốc độ (${playbackSpeed}x)`}</span>
                  </button>
                  
                  {showSpeedDropdown && (
                    <div className="absolute bottom-full right-0 mb-2.5 bg-zinc-950 border border-zinc-850 rounded-2xl p-1.5 flex flex-col gap-0.5 w-28 shadow-2xl z-55">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          onClick={() => {
                            handleSpeedChange(speed);
                            setShowSpeedDropdown(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-left text-[11px] font-extrabold transition-colors cursor-pointer ${
                            playbackSpeed === speed 
                              ? 'text-white bg-[#E63946]' 
                              : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                          }`}
                        >
                          {speed === 1 ? '1.0x Mặc định' : `${speed}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* [ Chế độ xem rạp ] */}
                {onToggleTheaterMode && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTheaterMode();
                    }} 
                    className={`cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/5 active:scale-90 transition-all duration-150 ${
                      isTheaterMode 
                        ? 'scale-90 text-[#E63946] bg-white/10 shadow-[0_0_15px_rgba(230,57,70,0.6)]' 
                        : 'text-zinc-200 hover:text-white'
                    }`}
                    title={isTheaterMode ? "Thoát chế độ rạp" : "Chế độ xem rạp"}
                  >
                    <Clapperboard size={isFullscreen ? 20 : 16} className={isTheaterMode ? "text-[#E63946]" : ""} />
                  </button>
                )}

                {/* [ PiP (Picture-in-Picture) ] */}
                <button 
                  onClick={togglePiP} 
                  className="text-zinc-350 hover:text-white transition-colors cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Picture-in-Picture"
                >
                  <Monitor size={isFullscreen ? 20 : 16} />
                </button>

                {/* [ Fullscreen ] */}
                <button 
                  onClick={toggleFullscreen} 
                  className={`cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/5 active:scale-90 transition-all duration-150 ${
                    activeButton === 'fullscreen' 
                      ? 'scale-90 text-[#E63946] bg-white/10 shadow-[0_0_15px_rgba(230,57,70,0.6)]' 
                      : 'text-zinc-200 hover:text-white'
                  }`}
                  title="Toàn màn hình"
                >
                  {isFullscreen ? (
                    <Minimize2 size={isFullscreen ? 22 : 18} />
                  ) : (
                    <Maximize2 size={isFullscreen ? 22 : 18} />
                  )}
                </button>
              </div>

              {/* MOBILE LAYOUT (< md): Optimized layout specifically for smartphone and smaller viewport sizes */}
              <div className="flex md:hidden flex-col w-full bg-black/85 border-t border-zinc-900/60 p-2.5 gap-2 pb-3">
                {/* Row 1: Easy-to-drag full-width progress slider */}
                <div className="w-full h-5 flex items-center relative cursor-pointer px-1">
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full relative overflow-hidden">
                    <div 
                      className="bg-[#E63946] h-full rounded-full"
                      style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    />
                  </div>
                  <div 
                    className="absolute w-3.5 h-3.5 bg-[#E63946] border border-white/30 rounded-full top-1/2 -translate-y-1/2 -ml-1.5 shadow-[0_0_8px_rgba(230,57,70,0.9)] pointer-events-none"
                    style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={duration || 1}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* Row 2: Touch targets and crucial state buttons */}
                <div className="flex items-center justify-between w-full">
                  {/* Left Controls Group */}
                  <div className="flex items-center gap-1">
                    {/* Play Button */}
                    <button 
                      onClick={togglePlay} 
                      className="cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full bg-zinc-900/40 text-white hover:text-[#E63946]"
                    >
                      {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </button>

                    {/* Rewind */}
                    <button 
                      onClick={() => seekRelative(-10)} 
                      className="cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center rounded-full text-zinc-350"
                    >
                      <RotateCcw size={13} />
                    </button>

                    {/* Forward */}
                    <button 
                      onClick={() => seekRelative(10)} 
                      className="cursor-pointer min-w-[34px] min-h-[34px] flex items-center justify-center rounded-full text-zinc-350"
                    >
                      <RotateCw size={13} />
                    </button>

                    {/* Compact Timestamp */}
                    <span className="text-[9.5px] font-mono font-bold text-zinc-400 select-none ml-1 whitespace-nowrap shrink-0">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right Controls Group */}
                  <div className="flex items-center gap-1.5">
                    {/* Compact Fit Button */}
                    <button 
                      onClick={toggleVideoFit} 
                      className="bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest text-zinc-300 h-7 flex items-center justify-center min-w-[42px]"
                    >
                      {videoFit === 'contain' ? 'Gốc' : videoFit === 'cover' ? 'To' : 'Đầy'}
                    </button>

                    {/* Speed Selection */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowSpeedDropdown(!showSpeedDropdown)} 
                        className="text-[9px] font-black tracking-wider uppercase px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 h-7 flex items-center justify-center min-w-[42px]"
                      >
                        {playbackSpeed === 1 ? '1x' : `${playbackSpeed}x`}
                      </button>
                      
                      {showSpeedDropdown && (
                        <div className="absolute bottom-full right-0 mb-2 bg-zinc-950 border border-zinc-850 rounded-xl p-1 flex flex-col gap-0.5 w-24 shadow-2xl z-55">
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                            <button
                              key={speed}
                              onClick={() => {
                                handleSpeedChange(speed);
                                setShowSpeedDropdown(false);
                              }}
                              className={`px-2 py-1 rounded-lg text-left text-[10px] font-extrabold transition-colors cursor-pointer ${
                                playbackSpeed === speed 
                                  ? 'text-white bg-[#E63946]' 
                                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                              }`}
                            >
                              {speed === 1 ? '1.0x' : `${speed}x`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Fullscreen Toggle */}
                    <button 
                      onClick={toggleFullscreen} 
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-200 active:scale-95"
                    >
                      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  function resetControlsVisibility() {
    resetControlsTimer();
  }
}

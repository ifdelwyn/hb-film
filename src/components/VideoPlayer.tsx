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
  ShieldAlert 
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
}

export default function VideoPlayer({ 
  embedUrl, 
  m3u8Url, 
  title, 
  poster,
  onEnded, 
  onProgress,
  fullWidth
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
  
  // Custom indicator state for volume changes
  const [volumeIndicator, setVolumeIndicator] = useState<{ visible: boolean; value: number } | null>(null);

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
        if (playerType === 'native' && embedUrl && embedUrl.trim() !== '') {
          console.warn('Native loading timed out. Falling back to Embed player.');
          setPlayerType('embed');
          setIsLoading(true);
        } else {
          setLoadTimeoutError(true);
        }
      }, 10000);
    } else {
      setLoadTimeoutError(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, playerType, embedUrl]);

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
              if (embedUrl) {
                setPlayerType('embed');
                setIsLoading(false);
              }
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
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Playback failed:', err));
    }
    resetControlsTimer();
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
    resetControlsTimer();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = parseFloat(e.target.value);
    setVolume(val);
    videoRef.current.volume = val;
    setIsMuted(val === 0);
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
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Hotkey Control Handlers
  useEffect(() => {
    if (playerType !== 'native') return;

    const showHUD = (val: number) => {
      setVolumeIndicator({ visible: true, value: val });
      if (indicatorTimeoutRef.current) window.clearTimeout(indicatorTimeoutRef.current);
      indicatorTimeoutRef.current = window.setTimeout(() => {
        setVolumeIndicator(null);
      }, 1000);
    };

    const handleHotkeys = (e: KeyboardEvent) => {
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
            const next = Math.min(1, prev + 0.05);
            if (videoRef.current) videoRef.current.volume = next;
            showHUD(next);
            return next;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(prev => {
            const next = Math.max(0, prev - 0.05);
            if (videoRef.current) videoRef.current.volume = next;
            showHUD(next);
            return next;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleHotkeys);
    return () => {
      window.removeEventListener('keydown', handleHotkeys);
      if (indicatorTimeoutRef.current) window.clearTimeout(indicatorTimeoutRef.current);
    };
  }, [playerType, isPlaying, duration, isMuted]);

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
                if (embedUrl) {
                  setPlayerType('embed');
                  setIsLoading(false);
                }
              }}
              style={{ 
                position: 'absolute', 
                inset: 0, 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain', 
                background: '#000',
                pointerEvents: 'none' // REQUIRED BY USER
              }}
              playsInline
            />

            {/* UPPER BIG AREA CLICK TO PLAY/PAUSE */}
            <div 
              onClick={togglePlay}
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
              <div 
                className={`flex items-center bg-black/60 border-t border-zinc-900/40 w-full transition-all ${
                  isFullscreen ? 'p-6 gap-6 text-sm' : 'p-3 gap-3.5 text-xs'
                }`}
              >
                {/* [ Play/Pause ] */}
                <button 
                  onClick={togglePlay} 
                  className="text-white hover:text-[#E63946] transition-colors cursor-pointer shrink-0"
                >
                  {isPlaying ? (
                    <Pause size={isFullscreen ? 22 : 18} fill="currentColor" />
                  ) : (
                    <Play size={isFullscreen ? 22 : 18} fill="currentColor" />
                  )}
                </button>

                {/* [ Tua -10s ] */}
                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                    }
                  }} 
                  className="text-zinc-350 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Tua lùi 10s"
                >
                  <RotateCcw size={isFullscreen ? 20 : 16} />
                </button>

                {/* [ Tua +10s ] */}
                <button 
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
                    }
                  }} 
                  className="text-zinc-350 hover:text-white transition-colors cursor-pointer shrink-0"
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

                  {/* Hidden input range for easy sliding dragging */}
                  <input
                    type="range"
                    min="0"
                    max={duration || 1}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {/* [ Volume Icon + Slider ] */}
                <div className="flex items-center gap-2 group/volume shrink-0 relative">
                  <button 
                    onClick={toggleMute} 
                    className="text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={isFullscreen ? 21 : 17} />
                    ) : (
                      <Volume2 size={isFullscreen ? 21 : 17} />
                    )}
                  </button>
                  {/* Slide in volume width horizontal slider */}
                  <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 flex items-center">
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

                {/* [ Playback Speed Selection ] */}
                <div className="relative shrink-0">
                  <button 
                    onClick={() => setShowSpeedDropdown(!showSpeedDropdown)} 
                    className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-350 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
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

                {/* [ PiP (Picture-in-Picture) ] */}
                <button 
                  onClick={togglePiP} 
                  className="text-zinc-350 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Picture-in-Picture"
                >
                  <Monitor size={isFullscreen ? 20 : 16} />
                </button>

                {/* [ Fullscreen ] */}
                <button 
                  onClick={toggleFullscreen} 
                  className="text-zinc-200 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Toàn màn hình"
                >
                  {isFullscreen ? (
                    <Minimize2 size={isFullscreen ? 22 : 18} />
                  ) : (
                    <Maximize2 size={isFullscreen ? 22 : 18} />
                  )}
                </button>
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

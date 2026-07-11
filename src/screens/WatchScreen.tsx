import React, { useState, useEffect } from 'react';
import { fetchMovieDetail, getAbsoluteFrontEndImageUrl } from '../lib/api/vsmov';
import { Movie, EpisodeServer, EpisodeData } from '../types/movie';
import { useWatchHistory } from '../lib/hooks/useWatchHistory';
import VideoPlayer from '../components/VideoPlayer';
import { Play, Tv, ChevronRight, HelpCircle, Flame, Star, Compass, ArrowLeft, Sparkles, RefreshCw, Copy, Check, AlertTriangle } from 'lucide-react';
import { getCustomSourceName } from '../config/sourceDisplayMap';

interface WatchScreenProps {
  slug: string;
  initialEpisodeSlug?: string;
  initialServerIdx?: number;
  onNavigateToDetail: (slug: string) => void;
  onBack: () => void;
}

export default function WatchScreen({ 
  slug, 
  initialEpisodeSlug, 
  initialServerIdx = 0,
  onNavigateToDetail,
  onBack
}: WatchScreenProps) {
  const formatEpName = (name: string) => {
    if (!name) return '';
    const trimmed = name.trim();
    if (/^tập\s+/i.test(trimmed)) {
      return trimmed;
    }
    return `Tập ${trimmed}`;
  };

  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeServer[]>([]);
  const [activeServerIdx, setActiveServerIdx] = useState(initialServerIdx);
  const [activeEpisode, setActiveEpisode] = useState<EpisodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trailer' | 'movie'>('movie');

  // Watch history hook integration
  const { updateHistory, getMovieHistory } = useWatchHistory();

  // Watch Party Real-Time Synced states
  const [roomId, setRoomId] = useState<string | null>(() => {
    const hash = window.location.hash;
    const queryStr = hash.split('?')[1] || '';
    const urlParams = new URLSearchParams(queryStr);
    return urlParams.get('room');
  });
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [roomState, setRoomState] = useState<any>(null);
  const [partyUsername, setPartyUsername] = useState<string>(() => {
    return localStorage.getItem('watch_party_username') || `Người xem ${Math.floor(Math.random() * 900) + 100}`;
  });
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [lastExternalEvent, setLastExternalEvent] = useState<{ isPlaying: boolean; currentTime: number; lastUpdated: number } | null>(null);

  // Theater Mode state
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Watch Together premium additions state
  const [reactions, setReactions] = useState<{ id: string; emoji: string; username: string; x: number }[]>([]);
  const [showCopiedSuccess, setShowCopiedSuccess] = useState(false);

  // Send a synchronized reaction emoji to all room members
  const sendReaction = (emoji: string) => {
    if (!ws || !roomId || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      type: 'reaction',
      roomId,
      userId,
      username: partyUsername,
      data: { emoji }
    }));
  };

  // Synchronize player with room state immediately
  const syncPlaybackNow = () => {
    if (!roomState?.playback) return;
    const { isPlaying: extIsPlaying, currentTime: extTime, lastUpdated } = roomState.playback;
    
    // Estimate precise time based on elapsed time since last sync payload
    const elapsed = extIsPlaying ? (Date.now() - lastUpdated) / 1000 : 0;
    const estimatedTime = Math.max(0, extTime + elapsed);

    setLastExternalEvent({
      isPlaying: extIsPlaying,
      currentTime: estimatedTime,
      lastUpdated: Date.now()
    });
  };

  // AI recommendations states
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recPrompt, setRecPrompt] = useState('');
  const [isRecLoading, setIsRecLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // Fetch initial recommendations on load
  useEffect(() => {
    const fetchInitialRecs = async () => {
      setIsRecLoading(true);
      try {
        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            currentMovieSlug: slug,
            currentMovie: movie ? {
              name: movie.name,
              origin_name: movie.origin_name,
              content: movie.content,
              category: movie.category,
              type: movie.type,
              year: movie.year
            } : null
          })
        }).then(r => r.json());

        if (res.status && res.items) {
          setRecommendations(res.items);
          setIsAiGenerated(res.isAiGenerated);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setIsRecLoading(false);
      }
    };
    if (slug && movie && movie.slug === slug) {
      fetchInitialRecs();
    }
  }, [slug, movie]);

  const handleCustomRec = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecLoading || !movie) return;
    setIsRecLoading(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentMovieSlug: slug,
          currentMovie: {
            name: movie.name,
            origin_name: movie.origin_name,
            content: movie.content,
            category: movie.category,
            type: movie.type,
            year: movie.year
          },
          userPrompt: recPrompt.trim()
        })
      }).then(r => r.json());

      if (res.status && res.items) {
        setRecommendations(res.items);
        setIsAiGenerated(res.isAiGenerated);
      }
    } catch (err) {
      console.error('Failed to fetch custom recommendations:', err);
    } finally {
      setIsRecLoading(false);
    }
  };

  const [userId] = useState(() => {
    let id = localStorage.getItem('watch_party_user_id');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('watch_party_user_id', id);
    }
    return id;
  });

  const [userAvatar] = useState(() => {
    const colors = ['#E63946', '#4EA8DE', '#70E000', '#FFB703', '#9D4EDD', '#F72585'];
    const idx = Math.floor(Math.random() * colors.length);
    return colors[idx];
  });

  // Keep chat scrolled down to latest message
  useEffect(() => {
    if (roomState?.messages) {
      setTimeout(() => {
        const elem = document.getElementById('watch-party-messages');
        if (elem) {
          elem.scrollTop = elem.scrollHeight;
        }
      }, 100);
    }
  }, [roomState?.messages?.length]);

  // Sync active episode with room's active episode
  useEffect(() => {
    if (roomState && activeEpisode && roomState.episodeSlug !== activeEpisode.slug) {
      const dataList = episodes[activeServerIdx]?.server_data || [];
      const matched = dataList.find(ep => ep.slug === roomState.episodeSlug);
      if (matched) {
        setActiveEpisode(matched);
      }
    }
  }, [roomState?.episodeSlug, episodes, activeServerIdx]);

  // Handle room parameter change in URL hash externally (e.g. going back/forward)
  useEffect(() => {
    const handleHashRoomChange = () => {
      const hash = window.location.hash;
      const queryStr = hash.split('?')[1] || '';
      const urlParams = new URLSearchParams(queryStr);
      const room = urlParams.get('room');
      setRoomId(room);
    };
    window.addEventListener('hashchange', handleHashRoomChange);
    return () => window.removeEventListener('hashchange', handleHashRoomChange);
  }, []);

  // WebSocket Live Sync Connector effect
  useEffect(() => {
    if (!roomId || !movie) {
      if (ws) {
        ws.close();
        setWs(null);
      }
      setRoomState(null);
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.host;
    const socket = new WebSocket(`${wsProtocol}//${wsHost}`);

    socket.onopen = () => {
      console.log('Connected to Watch Party WebSocket Server');
      socket.send(JSON.stringify({
        type: 'join',
        roomId,
        userId,
        username: partyUsername,
        avatar: userAvatar,
        movieSlug: movie.slug,
        movieName: movie.name,
        movieThumb: movie.thumb_url || movie.poster_url,
        episodeSlug: activeEpisode?.slug || ''
      }));
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'room_state') {
          setRoomState(payload.room);
        } else if (payload.type === 'chat_message') {
          setRoomState(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: [...prev.messages, payload.message]
            };
          });
        } else if (payload.type === 'playback_sync') {
          setLastExternalEvent({
            isPlaying: payload.playback.isPlaying,
            currentTime: payload.playback.currentTime,
            lastUpdated: payload.playback.lastUpdated
          });
        } else if (payload.type === 'reaction') {
          const newReaction = {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            emoji: payload.emoji,
            username: payload.username,
            x: 10 + Math.random() * 80 // localized horizontal floating drift
          };
          setReactions(prev => [...prev, newReaction]);
          // Clean up floating element after animation finishes
          setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== newReaction.id));
          }, 2500);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onclose = () => {
      console.log('Watch Party WebSocket Connection Closed');
      setWs(null);
    };

    socket.onerror = (err) => {
      console.error('Watch Party WebSocket Error:', err);
    };

    return () => {
      socket.close();
    };
  }, [roomId, activeEpisode?.slug, movie?.slug]);

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetchMovieDetail(slug);
        if (res.status && res.movie) {
          setMovie(res.movie);
          const serverList = res.episodes || [];
          setEpisodes(serverList);

          // Find specific episode or default to first
          if (serverList.length > 0) {
            const currentServer = serverList[activeServerIdx] || serverList[0];
            const dataList = currentServer?.server_data || [];
            
            if (dataList.length > 0) {
              const matchedEp = initialEpisodeSlug 
                ? dataList.find(ep => ep.slug === initialEpisodeSlug) 
                : dataList[0];
                
              setActiveEpisode(matchedEp || dataList[0]);
            }
          }
        }
      } catch (e) {
        console.error('Failed to resolve episode streams for slug:', slug, e);
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, initialEpisodeSlug, activeServerIdx]);

  // Handle active tab state on movie payload load - always default to movie player
  useEffect(() => {
    setActiveTab('movie');
  }, [movie]);

  // Sync to history as soon as movie and episode are resolved
  useEffect(() => {
    if (movie && activeEpisode) {
      const existing = getMovieHistory(movie.slug);
      updateHistory({
        movieSlug: movie.slug,
        movieName: movie.name,
        posterUrl: getAbsoluteFrontEndImageUrl(movie.poster_url || movie.thumb_url),
        episodeName: activeEpisode.name,
        episodeSlug: activeEpisode.slug,
        progress: existing?.progress || 0,
        duration: existing?.duration || 0,
        currentTime: existing?.currentTime || 0
      });
    }
  }, [movie, activeEpisode]);

  // Sync progress updates to local storage
  const handleProgress = (currentTime: number, duration: number) => {
    if (!movie || !activeEpisode) return;
    const progressPercent = Math.min(100, Math.round((currentTime / duration) * 100)) || 0;
    
    updateHistory({
      movieSlug: movie.slug,
      movieName: movie.name,
      posterUrl: getAbsoluteFrontEndImageUrl(movie.poster_url || movie.thumb_url),
      episodeName: activeEpisode.name,
      episodeSlug: activeEpisode.slug,
      progress: progressPercent,
      duration: duration,
      currentTime: currentTime
    });
  };

  // Skip to next episode helper
  const handleNextEpisode = () => {
    if (episodes.length === 0) return;
    const dataList = episodes[activeServerIdx]?.server_data || [];
    if (dataList.length === 0 || !activeEpisode) return;

    const curIdx = dataList.findIndex(ep => ep.slug === activeEpisode.slug);
    if (curIdx !== -1 && curIdx < dataList.length - 1) {
      const nextEp = dataList[curIdx + 1];
      setActiveEpisode(nextEp);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading || !movie) {
    return (
      <div className="w-full min-h-screen bg-black text-white py-20 select-none flex flex-col items-center justify-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-[var(--color-brand)] animate-spin"></div>
          <Tv size={24} className="text-[var(--color-brand)] absolute animate-pulse" />
        </div>
        <div className="text-center max-w-sm px-4">
          <p className="text-sm font-black text-white uppercase tracking-wider">ĐANG KHỞI TẠO LUỒNG PHÁT</p>
          <p className="text-xs text-zinc-500 font-medium mt-1.5 leading-relaxed">
            Kết nối luồng truyền tải m3u8 và cấu hình hệ thống CDN tốc độ cao...
          </p>
        </div>
      </div>
    );
  }

  const currentServerList = episodes[activeServerIdx]?.server_data || [];

  return (
    <div className={`w-full min-h-screen bg-black text-white select-none font-sans transition-all duration-300 ${isTheaterMode ? 'pt-0 pb-12' : 'pt-20 pb-20'}`}>
      {isTheaterMode && (
        <style>{`
          header, footer, .global-header, .global-footer {
            display: none !important;
          }
        `}</style>
      )}

      {isTheaterMode && (
        <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
          <button
            onClick={() => setIsTheaterMode(false)}
            className="px-4 py-2 bg-black/80 hover:bg-[#E63946] border border-zinc-850 hover:border-transparent rounded-xl text-xs font-black uppercase text-white cursor-pointer transition-all shadow-2xl flex items-center gap-1.5"
          >
            <ArrowLeft size={12} />
            <span>Thoát Chế Độ Rạp</span>
          </button>
        </div>
      )}

      <div className={`${isTheaterMode ? 'max-w-full px-0' : 'max-w-7xl mx-auto px-4 md:px-8'}`}>
        
        {/* Navigation Breadcrumb Back trigger */}
        {!isTheaterMode && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 select-none border-b border-zinc-900/80 pb-4">
            <button 
              onClick={onBack}
              className="group flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-[var(--color-brand)]/45 text-zinc-400 hover:text-white transition-all duration-300 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.5)] active:scale-95"
            >
              <ArrowLeft size={16} className="text-zinc-500 group-hover:text-[var(--color-brand)] transition-all group-hover:-translate-x-1 duration-300" />
              <span className="text-xs font-extrabold uppercase tracking-widest">Quay Lại</span>
            </button>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <span className="hover:text-white transition-colors cursor-pointer" onClick={onBack}>Trang Trước</span>
              <ChevronRight size={12} className="text-zinc-600" />
              <span className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigateToDetail(movie.slug)}>
                {movie.name}
              </span>
              <ChevronRight size={12} className="text-zinc-600" />
              <span className="text-[var(--color-brand)] font-bold bg-[var(--color-brand)]/10 py-1 px-2.5 rounded-md border border-[var(--color-brand)]/15">Đang Xem</span>
            </div>
          </div>
        )}

        {/* 4A-4B. CUSTOM HYBRID VIDEO PLAYER MOUNTED */}
        <div className={`grid grid-cols-1 ${isTheaterMode ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-6 mb-8 items-start`}>
          <div className={`${(isTheaterMode || !roomId) ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-9'} flex flex-col gap-4`}>
            {activeEpisode ? (
              <div className={`shadow-3xl bg-black overflow-hidden relative border border-zinc-900 ${isTheaterMode ? 'rounded-none' : 'rounded-2xl'}`}>
                <VideoPlayer
                  key={`movie-player-${activeEpisode.link_embed || activeEpisode.slug || 'player'}`}
                  embedUrl={activeEpisode.link_embed}
                  m3u8Url={activeEpisode.link_m3u8}
                  title={`${movie.name} - ${formatEpName(activeEpisode.name)}`}
                  poster={movie.poster_url || movie.thumb_url}
                  onEnded={handleNextEpisode}
                  onProgress={handleProgress}
                  onLocalPlay={(time) => {
                    if (ws && roomId && ws.readyState === WebSocket.OPEN) {
                      ws.send(JSON.stringify({
                        type: 'playback',
                        roomId,
                        userId,
                        username: partyUsername,
                        data: { isPlaying: true, currentTime: time }
                      }));
                    }
                  }}
                  onLocalPause={(time) => {
                    if (ws && roomId && ws.readyState === WebSocket.OPEN) {
                      ws.send(JSON.stringify({
                        type: 'playback',
                        roomId,
                        userId,
                        username: partyUsername,
                        data: { isPlaying: false, currentTime: time }
                      }));
                    }
                  }}
                  onLocalSeek={(time) => {
                    if (ws && roomId && ws.readyState === WebSocket.OPEN) {
                      ws.send(JSON.stringify({
                        type: 'playback',
                        roomId,
                        userId,
                        username: partyUsername,
                        data: { isPlaying: true, currentTime: time }
                      }));
                    }
                  }}
                  externalPlayState={lastExternalEvent}
                  isTheaterMode={isTheaterMode}
                  onToggleTheaterMode={() => setIsTheaterMode(prev => !prev)}
                />

                {/* Real-time Floating reactions overlay */}
                {reactions.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                    {reactions.map((react) => (
                      <div
                        key={react.id}
                        className="absolute bottom-4 flex flex-col items-center animate-reaction-float"
                        style={{
                          left: `${react.x}%`,
                        }}
                      >
                        <span className="text-4xl filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] leading-none select-none">
                          {react.emoji}
                        </span>
                        <span className="bg-black/80 border border-zinc-800/60 text-white font-extrabold text-[9px] tracking-wide px-2 py-0.5 rounded-md mt-1 scale-90 whitespace-nowrap opacity-90 shadow-2xl">
                          {react.username}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="shadow-3xl bg-black rounded-2xl overflow-hidden aspect-video relative border border-zinc-900">
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-6 text-center select-none">
                  <Tv size={48} className="text-zinc-600 mb-4 animate-pulse" />
                  <p className="text-sm font-bold text-zinc-300">⚠️ CHƯA CÓ NGUỒN PHÁT CHO PHIM NÀY</p>
                  <p className="text-xs text-zinc-500 mt-2 max-w-md">
                    Server hiện chưa tìm được link phát chất lượng cao cho phim này. Bạn hãy xem thử Trailer ở tab bên cạnh hoặc chọn nguồn phát dự phòng bên dưới!
                  </p>
                </div>
              </div>
            )}

            {/* Watch Party Room Controls & Info */}
            {roomId && roomState && (
              <div className="bg-[#12121A]/85 border border-zinc-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative">
                    <span className="flex h-3 w-3 absolute -top-1 -right-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                    </span>
                    <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl text-teal-400 font-mono text-xs font-black">
                      ROOM
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-zinc-300 uppercase tracking-widest">PHÒNG XEM CHUNG</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Mã phòng: <span className="text-white font-black font-mono select-all bg-zinc-900 px-1.5 py-0.5 rounded">{roomId}</span></p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Force sync button */}
                  <button
                    onClick={syncPlaybackNow}
                    title="Đồng bộ ngay thời gian phát phim của bạn khớp với mọi người trong phòng"
                    className="px-4 py-2 bg-teal-950/50 hover:bg-teal-900/40 text-teal-300 text-xs font-bold rounded-xl border border-teal-900/40 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw size={12} />
                    <span>Đồng Bộ Ngay</span>
                  </button>

                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/#/xem/${movie?.slug}?tap=${activeEpisode?.slug || ''}&server=${activeServerIdx}&room=${roomId}`;
                      navigator.clipboard.writeText(shareUrl);
                      setShowCopiedSuccess(true);
                      setTimeout(() => setShowCopiedSuccess(false), 2000);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 ${
                      showCopiedSuccess
                        ? 'bg-emerald-950/60 hover:bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
                    }`}
                  >
                    {showCopiedSuccess ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span>Đã Copy!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Link Mời</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setRoomId(null);
                      window.location.hash = `#/xem/${movie?.slug}?tap=${activeEpisode?.slug || ''}&server=${activeServerIdx}`;
                    }}
                    className="px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs font-bold rounded-xl border border-red-900/50 cursor-pointer transition-all active:scale-95"
                  >
                    🚪 Rời Phòng
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat Sidebar Panel */}
          {roomId && !isTheaterMode && (
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl h-[400px] lg:h-[450px] xl:h-[480px]">
              {/* Header */}
              <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <h4 className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">Trò Chuyện</h4>
                </div>
                <span className="text-[10px] font-bold font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-full">
                  {roomState?.users?.length || 1} Đang xem
                </span>
              </div>

              {/* Members preview list */}
              {roomState?.users && (
                <div className="px-3 py-1.5 bg-zinc-900/20 border-b border-zinc-900/50 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase mr-1">Thành viên:</span>
                  {roomState.users.map((u: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1 text-[9px] font-bold bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-850">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: u.avatar || '#E63946' }} />
                      <span className="text-zinc-300">{u.username}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin" id="watch-party-messages">
                {roomState?.messages?.map((msg: any, idx: number) => {
                  const isSystem = msg.senderId === 'system';
                  const isSelf = msg.senderId === userId;
                  if (isSystem) {
                    return (
                      <div key={idx} className="text-center py-1">
                        <span className="text-[10px] text-zinc-500 font-semibold bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-850 leading-relaxed block max-w-[90%] mx-auto">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-[90%] ${isSelf ? 'self-end' : 'self-start'}`}>
                      {!isSelf && (
                        <span className="text-[9px] font-black text-zinc-500 mb-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: msg.senderAvatar || '#E63946' }} />
                          {msg.senderName}
                        </span>
                      )}
                      <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        isSelf 
                          ? 'bg-gradient-to-r from-[#E63946] to-[#C1121F] text-white rounded-tr-none shadow-md' 
                          : 'bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-850'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] font-mono text-zinc-600 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Emoji Reaction Quick Tray */}
              <div className="px-3 py-1.5 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between gap-1.5 select-none shrink-0">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Thả cảm xúc:</span>
                <div className="flex gap-2">
                  {['😂', '🔥', '❤️', '😮', '😢', '🎉'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => sendReaction(emoji)}
                      className="text-lg hover:scale-130 active:scale-95 transition-transform duration-150 cursor-pointer p-0.5 filter hover:drop-shadow-[0_0_4px_rgba(230,57,70,0.5)] focus:outline-none"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!chatInput.trim() || !ws || !roomId || ws.readyState !== WebSocket.OPEN) return;
                  ws.send(JSON.stringify({
                    type: 'chat',
                    roomId,
                    userId,
                    username: partyUsername,
                    avatar: userAvatar,
                    data: { text: chatInput.trim() }
                  }));
                  setChatInput('');
                  setTimeout(() => {
                    const elem = document.getElementById('watch-party-messages');
                    if (elem) elem.scrollTop = elem.scrollHeight;
                  }, 50);
                }}
                className="p-3 bg-zinc-900/40 border-t border-zinc-900 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-850 focus:border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="px-3 py-2 bg-[#E63946] hover:bg-red-600 disabled:opacity-40 text-white text-xs font-black rounded-xl transition-all active:scale-95 shrink-0"
                >
                  Gửi
                </button>
              </form>
            </div>
          )}
        </div>

        {/* 4C. SERVER SELECTOR PORT / GATE SELECT */}
        {!isTheaterMode && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
            
            {/* Broad description, tags */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900/40 pb-4">
                <div>
                  <span className="text-[10px] text-[var(--color-brand)] font-bold tracking-widest uppercase mb-1 block">
                    🎬 ĐANG PHÁT TRỰC TUYẾN
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold sm:font-black tracking-tighter text-white drop-shadow">
                    {movie.name} {activeEpisode && (<span>— <span className="text-[var(--color-brand)] font-black">{formatEpName(activeEpisode.name)}</span></span>)}
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium font-sans mt-1">
                    {movie.origin_name} • {movie.quality} • {movie.lang} • Lượt xem: {movie.view.toLocaleString()} views
                  </p>
                </div>

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-report-modal', { 
                    detail: { 
                      type: 'movie', 
                      movieName: movie.name,
                      episodeName: activeEpisode?.name ? formatEpName(activeEpisode.name) : undefined
                    } 
                  }))}
                  className="px-4 py-2 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-red-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors duration-200 cursor-pointer shadow-md select-none shrink-0 self-start sm:self-center"
                >
                  <AlertTriangle size={12} />
                  <span>Báo lỗi tập này</span>
                </button>
              </div>

              {/* Servers listing tags: Thiết kế Netflix-style, bo góc 999px, nền đỏ gradient, font Plus Jakarta Sans SemiBold, hover sáng nhẹ */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 p-4 rounded-2xl bg-[#12121A]/50 border border-zinc-900 shadow-xl backdrop-blur-sm transition-all">
                <span className="text-xs font-black text-zinc-300 uppercase tracking-widest flex items-center gap-1.5 shrink-0 select-none">
                  <Flame size={14} className="text-[#E63946] animate-pulse fill-[#E63946]/10" />
                  Nguồn phát:
                </span>
                
                <div className="flex flex-wrap gap-2.5">
                  {episodes.map((svr, idx) => {
                    const customName = getCustomSourceName(svr.server_name, idx);
                    const isActive = activeServerIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveServerIdx(idx);
                          // Reset to first episode of that server, matching same episode if possible
                          const otherServerList = episodes[idx]?.server_data || [];
                          const matchingep = otherServerList.find(e => e.slug === activeEpisode?.slug);
                          setActiveEpisode(matchingep || otherServerList[0]);
                        }}
                        className={`text-xs px-5 py-2.5 rounded-[999px] font-semibold tracking-wide transition-all duration-300 transform hover:scale-[1.03] cursor-pointer ${
                          isActive 
                            ? 'bg-gradient-to-r from-[#E63946] to-[#C1121F] text-white font-semibold border-none shadow-[0_0_15px_rgba(230,57,70,0.4)] hover:brightness-110' 
                            : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {customName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Watch Party Launcher Section */}
              {!roomId && (
                <div className="p-5 rounded-2xl bg-[#12121A]/85 border border-zinc-900 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-zinc-800/60">
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-1.5 text-[var(--color-brand)] font-black text-[10px] tracking-widest uppercase mb-1">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      TÍNH NĂNG XEM CHUNG MỚI
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">CÙNG XEM CHUNG VỚI BẠN BÈ</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      Bắt đầu một buổi xem chung thời gian thực! Đồng bộ hoàn toàn Play, Pause, Tua thời gian và trò chuyện trực tiếp cùng mọi người.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
                    <div className="flex flex-col gap-1 w-full sm:w-[150px]">
                      <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block ml-1">Biệt danh của bạn</span>
                      <input
                        type="text"
                        placeholder="Biệt danh..."
                        value={partyUsername}
                        onChange={(e) => {
                          setPartyUsername(e.target.value);
                          localStorage.setItem('watch_party_username', e.target.value);
                        }}
                        className="bg-zinc-950 border border-zinc-850 hover:border-zinc-800 text-xs px-3 py-2 rounded-xl text-white outline-none font-bold"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 items-stretch h-full mt-auto">
                      <button
                        onClick={() => {
                          const randomCode = 'WP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                          setRoomId(randomCode);
                          window.location.hash = `#/xem/${movie?.slug}?tap=${activeEpisode?.slug || ''}&server=${activeServerIdx}&room=${randomCode}`;
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#E63946] to-[#C1121F] text-white hover:brightness-110 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-red-650/20 cursor-pointer text-center"
                      >
                        🎉 Tạo Phòng Mới
                      </button>

                      <div className="flex items-center gap-1.5 border border-zinc-800 rounded-xl bg-zinc-950 p-1">
                        <input
                          type="text"
                          placeholder="Mã phòng..."
                          id="watch-party-join-code-input"
                          className="bg-transparent border-none text-xs px-2 py-1.5 text-white outline-none w-[90px] uppercase font-bold font-mono"
                        />
                        <button
                          onClick={async () => {
                            const input = document.getElementById('watch-party-join-code-input') as HTMLInputElement;
                            const code = input?.value?.trim()?.toUpperCase();
                            if (!code) return;

                            setIsJoiningRoom(true);
                            try {
                              const res = await fetch(`/api/watch-party/room/${code}`).then(r => r.json());
                              if (res.status && res.room) {
                                setRoomId(code);
                                window.location.hash = `#/xem/${res.room.movieSlug}?tap=${res.room.episodeSlug}&server=${activeServerIdx}&room=${code}`;
                              } else {
                                alert('Không tìm thấy phòng xem chung hoặc phòng đã hết hạn!');
                              }
                            } catch (err) {
                              alert('Lỗi khi tham gia phòng xem chung. Vui lòng thử lại!');
                            } finally {
                              setIsJoiningRoom(false);
                            }
                          }}
                          disabled={isJoiningRoom}
                          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-black rounded-lg cursor-pointer transition-all active:scale-95 border border-zinc-850"
                        >
                          {isJoiningRoom ? 'Đang vào...' : 'Vào'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* General Description content dropdown list */}
              <div className="flex flex-col gap-2 font-sans text-xs sm:text-sm">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-2 mb-2">
                  <Compass size={14} className="text-[var(--color-brand)]" />
                  Cốt truyện tiêu điểm
                </h3>
                <p className="text-zinc-400 leading-relaxed font-sans">{movie.content ? movie.content.replace(/<[^>]*>/g, '').trim() : ''}</p>
              </div>

            </div>

            {/* Collapsible Sidebar playlists episodes select */}
            <div className="lg:col-span-4 bg-[var(--color-bg-elevated)] border border-zinc-900 rounded-2xl p-5 select-none h-fit">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-900 pb-3 mb-4">
                <Tv size={14} className="text-[var(--color-brand)]" />
                Danh Sách Tập Phim
              </h3>

              {currentServerList.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center font-medium py-10">Kênh truyền tải chưa cập nhật tập phim nào.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-[11px] text-zinc-500 mb-1 leading-normal">
                    Bạn đang xem: <span className="text-white font-extrabold font-sans">{episodes[activeServerIdx] ? getCustomSourceName(episodes[activeServerIdx].server_name, activeServerIdx) : 'N/A'}</span>
                  </p>

                  {/* Episodes button grid list */}
                  <div className="grid grid-cols-4 gap-2.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                    {currentServerList.map((ep, idx) => {
                      const isWatching = activeEpisode && activeEpisode.slug === ep.slug;
                      return (
                        <button
                          key={`${ep.slug}-${idx}`}
                          id={`btn-ep-watch-select-${ep.slug}`}
                          onClick={() => {
                            setActiveEpisode(ep);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`text-xs p-2 rounded-md font-black text-center border cursor-pointer transition-all ${
                            isWatching 
                              ? 'bg-[var(--color-brand)] text-white border-[var(--color-brand)] shadow-lg shadow-red-650/15' 
                              : 'bg-zinc-900 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {ep.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* AI MOVIE RECOMMENDATIONS SYSTEM */}
        {!isTheaterMode && (
          <div className="mt-12 p-6 rounded-3xl bg-gradient-to-b from-[#12121A]/90 to-black border border-zinc-900 shadow-2xl relative overflow-hidden select-none">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--color-brand)]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-900 pb-6 mb-6">
              <div className="text-left">
                <div className="flex items-center gap-2 text-[var(--color-brand)] font-black text-xs tracking-widest uppercase mb-1.5">
                  <Sparkles size={16} className="text-amber-400 animate-pulse" />
                  <span>Trợ Lý Gợi Ý Phim AI</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
                  Có thể bạn muốn xem tiếp?
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Đề xuất thông minh cá nhân hóa từ Gemini AI dựa trên bộ phim bạn đang xem.
                </p>
              </div>

              {/* Chat-style custom recommendation prompt */}
              <form onSubmit={handleCustomRec} className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 focus-within:border-zinc-800 p-1.5 rounded-2xl w-full md:w-[450px] transition-all">
                <input
                  type="text"
                  placeholder="Tôi muốn xem phim hài hước giống phim này..."
                  value={recPrompt}
                  onChange={(e) => setRecPrompt(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xs px-3 py-1.5 text-white placeholder-zinc-600 outline-none"
                />
                <button
                  type="submit"
                  disabled={isRecLoading}
                  className="px-4 py-2 bg-gradient-to-r from-[#E63946] to-[#C1121F] text-white hover:brightness-110 disabled:opacity-50 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  Yêu Cầu AI
                </button>
              </form>
            </div>

            {/* Recommendations grid/list */}
            {isRecLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-zinc-900 border-t-[var(--color-brand)] animate-spin"></div>
                  <Sparkles size={18} className="text-amber-400 absolute animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-white uppercase tracking-wider">Trợ lý AI đang phân tích...</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Khám phá kho phim và biên soạn lý do đề xuất dành riêng cho bạn...</p>
                </div>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs font-semibold">
                Không tìm thấy gợi ý phù hợp vào lúc này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((recMovie) => (
                  <div
                    key={recMovie.slug}
                    onClick={() => onNavigateToDetail(recMovie.slug)}
                    className="flex flex-col bg-zinc-950/60 hover:bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group shadow-lg text-left relative"
                  >
                    {/* Glowing Accent for AI recommendations */}
                    {isAiGenerated && (
                      <div className="absolute top-2 right-2 z-10 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-full px-2 py-0.5 text-[8px] text-amber-400 font-extrabold flex items-center gap-1 uppercase tracking-wider">
                        <Sparkles size={8} className="fill-amber-400/20" />
                        <span>AI Đề Xuất</span>
                      </div>
                    )}

                    <div className="flex gap-4 p-4 items-start">
                      <img
                        src={recMovie.poster_url || recMovie.thumb_url}
                        alt={recMovie.name}
                        className="w-20 h-28 object-cover rounded-xl border border-white/5 shadow-md shrink-0 group-hover:scale-105 transition-transform duration-350"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-grow min-w-0 flex flex-col justify-between min-h-[112px]">
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-[var(--color-brand)] transition-colors truncate">
                            {recMovie.name}
                          </h4>
                          <p className="text-[10px] text-zinc-500 font-bold truncate mt-0.5">
                            {recMovie.origin_name} • {recMovie.year}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold">
                              {recMovie.quality || 'FHD'}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900/60 text-zinc-500 font-medium">
                              {recMovie.lang || 'Vietsub'}
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed bg-zinc-900/30 p-2 rounded-lg border border-zinc-900/40 font-medium italic">
                          "{recMovie.aiReason || "Bộ phim cực kỳ lôi cuốn cùng thể loại rất đáng để bạn thưởng thức."}"
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

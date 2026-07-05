import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, VolumeX,
  Search, Heart, Music, Flame, Disc, Globe, Compass, Sparkles, Mic, Coffee, Zap,
  ChevronRight, AlertCircle, Loader2, List, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define layout & models
interface Track {
  id: string;
  name: string;
  artist: string;
  artwork: string;
  previewUrl: string;
  duration: number; // in seconds
  source: string; // iTunes or Deezer
}

interface Playlist {
  id: string;
  name: string;
  query: string;
  country?: string;
  icon: string;
  description: string;
}

const PLAYLISTS: Playlist[] = [
  { id: 'nhac-viet-hot', name: '🔥 Nhạc Việt Hot', query: 'nhac viet hot 2024', country: 'VN', icon: 'Flame', description: 'Bảng xếp hạng nhạc Việt thịnh hành và nóng hổi nhất hiện nay.' },
  { id: 'v-pop', name: '💜 V-Pop', query: 'vpop', country: 'VN', icon: 'Heart', description: 'Những giai điệu nhạc Trẻ Việt Nam được yêu thích nhất.' },
  { id: 'son-tung-mtp', name: '🎤 Sơn Tùng M-TP', query: 'son tung mtp', icon: 'Music', description: 'Toàn bộ tuyển tập bản hit khẳng định tên tuổi của Sơn Tùng M-TP.' },
  { id: 'bolero', name: '🌹 Bolero', query: 'bolero viet nam', icon: 'Compass', description: 'Giai điệu Bolero trữ tình quê hương đằm thắm đi cùng năm tháng.' },
  { id: 'trinh-cong-son', name: '🕯️ Trịnh Công Sơn', query: 'trinh cong son', icon: 'Sparkles', description: 'Tuyển tập những ca khúc Trịnh ca sâu lắng mộc mạc triết lý.' },
  { id: 'rap-viet', name: '🎤 Rap Việt', query: 'rap viet 2024', icon: 'Mic', description: 'Các bản rap bùng nổ sân khấu của giới underground Việt.' },
  { id: 'k-pop', name: '🇰🇷 K-Pop', query: 'kpop bts blackpink', country: 'KR', icon: 'Disc', description: 'Những bản hit K-Pop đình đám thống trị các bảng xếp hạng thế giới.' },
  { id: 'pop-international', name: '🌍 Pop Quốc Tế', query: 'pop hits 2024', country: 'US', icon: 'Globe', description: 'Nhạc Pop Âu Mỹ dẫn đầu xu hướng nhạc số toàn cầu.' },
  { id: 'chill-lofi', name: '☕ Chill & Lo-Fi', query: 'lofi chill', icon: 'Coffee', description: 'Giai điệu nhẹ nhàng thư giãn cho những ngày mưa hay đêm muộn.' },
  { id: 'edm', name: '⚡ EDM', query: 'edm dance 2024', icon: 'Zap', description: 'Nhạc điện tử sôi động, căng cực năng lượng tiếp thêm sức mạnh.' }
];

// Simple Equalizer micro-animation
const AudioEqualizer = () => {
  return (
    <div className="flex items-end gap-[3px] w-4 h-[12px] overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="bg-[#E63946] w-[3px] rounded-full"
          initial={{ height: 4 }}
          animate={{
            height: [4, 12, 6, 12, 4],
          }}
          transition={{
            duration: 0.7 + i * 0.12,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default function MusicScreen() {
  const [activePlaylistId, setActivePlaylistId] = useState<string>('nhac-viet-hot');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Playback States
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const vol = localStorage.getItem('hb_music_volume');
      return vol ? parseFloat(vol) : 0.8;
    } catch {
      return 0.8;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchTracks, setSearchTracks] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Favorites States
  const [favorites, setFavorites] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem('hb_music_favorites_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Mobile navigation/ui state
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  // Audio HTML Element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load favorites on state change
  useEffect(() => {
    try {
      localStorage.setItem('hb_music_favorites_v1', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Handle active playlist loading (with cache)
  useEffect(() => {
    if (activePlaylistId === 'favorites') {
      setTracks(favorites);
      setErrorMsg(null);
      return;
    }

    const playlist = PLAYLISTS.find(p => p.id === activePlaylistId);
    if (!playlist) return;

    const loadPlaylist = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      
      // Try cache first (2 hours)
      const cacheKey = `hb_playlist_v2_${playlist.id}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 2 * 60 * 60 * 1000) {
            setTracks(data);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Cache read error', e);
      }

      // Fetch from API proxy
      const data = await fetchPlaylistTracks(playlist.query, playlist.country);
      if (data && data.length > 0) {
        setTracks(data);
        // Cache success data
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.error('Cache write error', e);
        }
      } else {
        setErrorMsg('Không thể tải danh sách bài hát. Vui lòng kiểm tra lại kết nối mạng!');
      }
      setIsLoading(false);
    };

    loadPlaylist();
  }, [activePlaylistId]);

  // Search Debounce handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchTracks([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounce = setTimeout(async () => {
      const results = await fetchPlaylistTracks(searchQuery);
      setSearchTracks(results);
      setIsSearching(false);
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Audio Player Event Listeners & Setup with Real-time Full-Length Stream Resolution
  useEffect(() => {
    // Recreate audio instance if currentTrack changes
    if (!currentTrack) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    let active = true;
    let audio: HTMLAudioElement | null = null;
    let onTimeUpdate: (() => void) | null = null;
    let onLoadedMetadata: (() => void) | null = null;
    let onEnded: (() => void) | null = null;

    const startPlayback = async () => {
      let playUrl = currentTrack.previewUrl;
      let durationLimit = currentTrack.duration || 30;
      let isFullLength = currentTrack.source === 'Zing MP3';

      // If it's an iTunes or Deezer track, automatically try to resolve a full-length Zing MP3 stream in the background
      if (!isFullLength) {
        try {
          const query = `${currentTrack.name} ${currentTrack.artist}`;
          const res = await fetch(`/api/music/zing-search?q=${encodeURIComponent(query)}`);
          if (res.ok) {
            const parsed = await res.json();
            if (parsed.results && parsed.results.length > 0) {
              const bestMatch = parsed.results[0];
              playUrl = bestMatch.previewUrl;
              durationLimit = bestMatch.duration || 240;
              isFullLength = true;
              console.log(`[Full Length Optimizer] Hot-swapped preview with Zing full version: "${bestMatch.name}" by "${bestMatch.artist}" (Duration: ${durationLimit}s)`);
            }
          }
        } catch (e) {
          console.error('Failed to resolve full track from Zing, playing preview:', e);
        }
      }

      if (!active) return;

      audio = new Audio(playUrl);
      audioRef.current = audio;
      audio.volume = isMuted ? 0 : volume;

      onTimeUpdate = () => {
        if (!audio) return;
        setCurrentTime(audio.currentTime);
        const limit = isFullLength ? (durationLimit || audio.duration || 240) : (audio.duration || 30);
        if (audio.currentTime >= limit) {
          audio.pause();
          handleNextTrack();
        }
      };

      onLoadedMetadata = () => {
        if (!audio) return;
        setDuration(audio.duration || durationLimit);
      };

      onEnded = () => {
        handleNextTrack();
      };

      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('ended', onEnded);

      audio.play()
        .then(() => {
          if (active) setIsPlaying(true);
        })
        .catch((err) => {
          console.error('Playback error:', err);
          if (active) setIsPlaying(false);
        });
    };

    startPlayback();

    return () => {
      active = false;
      if (audio) {
        if (onTimeUpdate) audio.removeEventListener('timeupdate', onTimeUpdate);
        if (onLoadedMetadata) audio.removeEventListener('loadedmetadata', onLoadedMetadata);
        if (onEnded) audio.removeEventListener('ended', onEnded);
        audio.pause();
      }
    };
  }, [currentTrack]);

  // Listen to volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    try {
      localStorage.setItem('hb_music_volume', volume.toString());
    } catch {}
  }, [volume, isMuted]);

  // API Call helper
  const fetchPlaylistTracks = async (query: string, country?: string): Promise<Track[]> => {
    // 1. Try Zing MP3 Search Proxy first for full-length tracks
    try {
      const res = await fetch(`/api/music/zing-search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const parsed = await res.json();
        if (parsed.results && parsed.results.length > 0) {
          return parsed.results;
        }
      }
    } catch (e) {
      console.error('Zing search failed, falling back to iTunes:', e);
    }

    // 2. Try iTunes Search Proxy as fallback
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=50${country ? `&country=${country}` : ''}`;
      const res = await fetch(`/api/music/itunes-proxy?url=${encodeURIComponent(itunesUrl)}`);
      if (res.ok) {
        const parsed = await res.json();
        if (parsed.results && parsed.results.length > 0) {
          const results = parsed.results
            .filter((t: any) => !!t.previewUrl) // Skip null/empty previews
            .map((t: any) => ({
              id: `itunes-${t.trackId || Math.random()}`,
              name: t.trackName,
              artist: t.artistName,
              artwork: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '500x500bb') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
              previewUrl: t.previewUrl,
              duration: 30,
              source: 'iTunes'
            }));
          if (results.length > 0) return results;
        }
      }
    } catch (e) {
      console.error('iTunes fetch failed, trying Deezer fallback:', e);
    }

    // 3. Fallback to Deezer API proxy
    try {
      const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=50`;
      const res = await fetch(`/api/music/deezer-proxy?url=${encodeURIComponent(deezerUrl)}`);
      if (res.ok) {
        const parsed = await res.json();
        if (parsed.data && parsed.data.length > 0) {
          return parsed.data
            .filter((t: any) => !!t.preview) // Skip null previews
            .map((t: any) => ({
              id: `deezer-${t.id || Math.random()}`,
              name: t.title,
              artist: t.artist?.name || 'Unknown Artist',
              artwork: t.album?.cover_xl || t.album?.cover_medium || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
              previewUrl: t.preview,
              duration: 30,
              source: 'Deezer'
            }));
        }
      }
    } catch (e) {
      console.error('Deezer fallback failed:', e);
    }

    return [];
  };

  // Playback Control Handlers
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const handleNextTrack = () => {
    const list = searchQuery.trim() ? searchTracks : tracks;
    if (list.length === 0) return;

    if (isRepeat && currentTrack) {
      // Seek to beginning and play
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
      return;
    }

    if (isShuffle) {
      const randIdx = Math.floor(Math.random() * list.length);
      setCurrentTrack(list[randIdx]);
      return;
    }

    if (!currentTrack) {
      setCurrentTrack(list[0]);
    } else {
      const currentIdx = list.findIndex(t => t.id === currentTrack.id);
      if (currentIdx === -1 || currentIdx === list.length - 1) {
        // Wrap to start
        setCurrentTrack(list[0]);
      } else {
        setCurrentTrack(list[currentIdx + 1]);
      }
    }
  };

  const handlePrevTrack = () => {
    const list = searchQuery.trim() ? searchTracks : tracks;
    if (list.length === 0) return;

    if (!currentTrack) {
      setCurrentTrack(list[0]);
    } else {
      const currentIdx = list.findIndex(t => t.id === currentTrack.id);
      if (currentIdx === -1 || currentIdx === 0) {
        // Wrap to end
        setCurrentTrack(list[list.length - 1]);
      } else {
        setCurrentTrack(list[currentIdx - 1]);
      }
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  // Favorites trigger handler
  const toggleFavorite = (track: Track, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isFav = favorites.some(f => f.id === track.id);
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.id !== track.id));
      // If we are currently displaying favorites playlist, also remove from visual active view immediately
      if (activePlaylistId === 'favorites') {
        setTracks(prev => prev.filter(f => f.id !== track.id));
      }
    } else {
      setFavorites(prev => [...prev, track]);
    }
  };

  // Helper formatting mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentPlaylist = PLAYLISTS.find(p => p.id === activePlaylistId);

  // Get icon component based on key name
  const getPlaylistIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame': return <Flame size={16} className="text-[#E63946]" />;
      case 'Heart': return <Heart size={16} className="text-pink-500 fill-pink-500/10" />;
      case 'Music': return <Music size={16} className="text-amber-400" />;
      case 'Compass': return <Compass size={16} className="text-teal-400" />;
      case 'Sparkles': return <Sparkles size={16} className="text-yellow-400 animate-pulse" />;
      case 'Mic': return <Mic size={16} className="text-purple-400" />;
      case 'Disc': return <Disc size={16} className="text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />;
      case 'Globe': return <Globe size={16} className="text-cyan-400" />;
      case 'Coffee': return <Coffee size={16} className="text-amber-600" />;
      case 'Zap': return <Zap size={16} className="text-[#E63946]" />;
      default: return <Music size={16} className="text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-zinc-100 flex flex-col md:flex-row pb-24 pt-16 sm:pt-20">
      
      {/* 1. LEFT SIDEBAR (MOCK SPOTIFY) */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-[#0E0E15]/95 md:bg-[#0E0E15]/60 backdrop-blur-xl border-r border-zinc-900/60 p-5 flex flex-col gap-6 transition-transform duration-300
        md:sticky md:top-20 md:h-[calc(100vh-80px)] md:z-10 shrink-0
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Mobile Sidebar Close Button */}
        <div className="flex md:hidden items-center justify-between">
          <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Danh mục</span>
          <button 
            onClick={() => setShowMobileSidebar(false)}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Logo Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-900/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E63946] to-[#C1121F] flex items-center justify-center shadow-lg shadow-[#E63946]/10 shrink-0">
            <Music size={20} className="text-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black tracking-tight text-white uppercase flex items-center gap-1.5">
              Bao Music <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full uppercase shrink-0">FREE</span>
            </h2>
            <p className="text-[10px] text-zinc-500 font-medium truncate">Muzik &amp; Lo-fi chillings</p>
          </div>
        </div>

        {/* Search Inputs block inside sidebar */}
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() && activePlaylistId !== 'search') {
                  setActivePlaylistId('search');
                }
              }}
              placeholder="Tìm kiếm bài hát, ca sĩ..."
              className="w-full bg-zinc-950 border border-zinc-900 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-white placeholder-zinc-600 outline-none focus:border-[#E63946]/50 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setActivePlaylistId('nhac-viet-hot');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-black text-zinc-500 hover:text-white"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Special Favorites Nav Item */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Thư viện của bạn</span>
          <button
            onClick={() => {
              setActivePlaylistId('favorites');
              setSearchQuery('');
              setShowMobileSidebar(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
              activePlaylistId === 'favorites' 
                ? 'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20' 
                : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/30'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow shrink-0">
                <Heart size={12} className="text-white fill-white" />
              </div>
              <span className="text-xs font-extrabold truncate">Bài hát yêu thích</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-500 border border-zinc-900">
              {favorites.length}
            </span>
          </button>
        </div>

        {/* Navigation Playlist block */}
        <div className="flex-grow flex flex-col gap-1.5 overflow-y-auto no-scrollbar pb-6">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-2">Playlists Đặc Sắc</span>
          <div className="flex flex-col gap-1">
            {PLAYLISTS.map((item) => {
              const isActive = activePlaylistId === item.id && !searchQuery.trim();
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePlaylistId(item.id);
                    setSearchQuery('');
                    setShowMobileSidebar(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-[#E63946]/10 text-white border border-[#E63946]/20' 
                      : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-zinc-950 border border-zinc-900/80 flex items-center justify-center shrink-0">
                      {getPlaylistIcon(item.icon)}
                    </div>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <ChevronRight size={12} className="text-zinc-600 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="p-3 bg-zinc-950 border border-zinc-900/80 rounded-2xl">
          <p className="text-[9px] font-black text-[#E63946] tracking-widest uppercase mb-1">💡 THÔNG TIN TIỆN ÍCH</p>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
            Tất cả các bản nhạc tại đây đều được liên kết trực tiếp tới nguồn chính thức từ iTunes VN và Deezer Global. Mỗi bản nghe thử kéo dài tối đa 30 giây chất lượng cao.
          </p>
        </div>
      </aside>

      {/* Background Dim for mobile sidebar */}
      {showMobileSidebar && (
        <div 
          onClick={() => setShowMobileSidebar(false)}
          className="fixed inset-0 bg-black/80 z-20 md:hidden animate-fade-in"
        />
      )}

      {/* 2. MAIN SONGS REGION */}
      <main className="flex-grow px-4 sm:px-8 py-4 flex flex-col gap-6 max-w-5xl mx-auto w-full">
        
        {/* Mobile header trigger for Sidebar */}
        <div className="flex md:hidden items-center justify-between bg-[#0E0E15]/50 border border-zinc-900 p-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <Music size={16} className="text-[#E63946]" />
            <span className="text-xs font-extrabold text-white">
              {activePlaylistId === 'favorites' ? '❤️ Bài hát yêu thích' : activePlaylistId === 'search' ? '🔍 Tìm kiếm nhạc' : currentPlaylist?.name}
            </span>
          </div>
          <button 
            onClick={() => setShowMobileSidebar(true)}
            className="px-3 py-1.5 bg-[#E63946] hover:bg-red-700 rounded-lg text-white font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer"
          >
            <List size={12} />
            <span>Mở playlist</span>
          </button>
        </div>

        {/* Active Playlist Header Detail Banner */}
        {activePlaylistId !== 'search' && (
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-zinc-900/60 rounded-3xl overflow-hidden shadow-xl flex flex-col sm:flex-row gap-5 items-center text-center sm:text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E63946]/10 blur-3xl rounded-full" />
            
            {/* Playlist Icon Badge */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0A0A0F] border border-zinc-800 shadow-inner flex items-center justify-center shrink-0">
              {activePlaylistId === 'favorites' ? (
                <Heart size={36} className="text-pink-500 fill-pink-500 animate-pulse" />
              ) : (
                <div className="scale-150">
                  {currentPlaylist ? getPlaylistIcon(currentPlaylist.icon) : <Music size={24} />}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-grow">
              <span className="text-[10px] font-black tracking-widest text-[#E63946] uppercase">PLAYLIST CHÍNH THỨC</span>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {activePlaylistId === 'favorites' ? 'Bài hát yêu thích' : currentPlaylist?.name}
              </h1>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {activePlaylistId === 'favorites' 
                  ? 'Tuyển tập những ca khúc bạn yêu mến và đã nhấp chuột thả tim. Lưu giữ vĩnh viễn trên trình duyệt này.' 
                  : currentPlaylist?.description}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 text-[10px] text-zinc-500 font-extrabold uppercase tracking-wide">
                <span>Số lượng: <strong className="text-white font-black">{(activePlaylistId === 'favorites' ? favorites : tracks).length}</strong> bài hát</span>
                <span>•</span>
                <span className="text-emerald-400">Không cần đăng ký</span>
              </div>
            </div>
            
            {/* Play Button on Header */}
            {((activePlaylistId === 'favorites' ? favorites : tracks).length > 0) && (
              <button
                onClick={() => {
                  const list = activePlaylistId === 'favorites' ? favorites : tracks;
                  setCurrentTrack(list[0]);
                }}
                className="px-5 py-3 bg-[#E63946] hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-[#E63946]/20 flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
              >
                <Play size={14} fill="currentColor" />
                <span>Phát ngẫu nhiên</span>
              </button>
            )}
          </div>
        )}

        {/* Dynamic Songs Content Area */}
        <div className="flex flex-col gap-4">
          
          {/* SEARCH ACTIVE STATE HEADER */}
          {activePlaylistId === 'search' && (
            <div className="border-b border-zinc-900 pb-3">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">KẾT QUẢ TÌM KIẾM CHO</span>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">"{searchQuery}"</h2>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 size={24} className="text-[#E63946] animate-spin" />
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Đang nạp danh sách nhạc...</p>
            </div>
          ) : errorMsg ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-red-950/10 border border-red-900/15 rounded-2xl p-6">
              <AlertCircle size={24} className="text-[#E63946]" />
              <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-sm">{errorMsg}</p>
              <button 
                onClick={() => {
                  setActivePlaylistId('nhac-viet-hot');
                  setSearchQuery('');
                }}
                className="mt-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-[10px] font-black uppercase text-zinc-300 transition-colors"
              >
                Quay lại mặc định
              </button>
            </div>
          ) : (activePlaylistId === 'search' ? searchTracks : tracks).length === 0 ? (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4 border border-dashed border-zinc-900 rounded-2xl p-8">
              <div className="w-12 h-12 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-center text-zinc-600">
                <Music size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-200">Không có bài hát nào</h4>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mt-1.5 mx-auto">
                  {activePlaylistId === 'favorites' 
                    ? 'Bạn chưa có bài hát yêu thích nào trong thư viện. Thả tim ngay trên khung phát để lưu trữ!' 
                    : 'Không tìm thấy dữ liệu bài hát phù hợp. Thử lại bằng từ khóa khác nhé.'}
                </p>
              </div>
            </div>
          ) : (
            /* SONGS GRID LIST */
            <div className="flex flex-col bg-[#0A0A0F] border border-zinc-900/40 rounded-2xl overflow-hidden divide-y divide-zinc-900/40">
              
              {/* Desktop Header row for table columns */}
              <div className="hidden sm:flex items-center gap-4 px-4 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/40 border-b border-zinc-900/40">
                <span className="w-8 text-center shrink-0">#</span>
                <span className="flex-grow">Tiêu đề bài hát / Nghệ sĩ</span>
                <span className="w-32 text-center shrink-0">Nguồn dữ liệu</span>
                <span className="w-24 text-center shrink-0">Thời gian</span>
                <span className="w-16 text-right shrink-0">Yêu thích</span>
              </div>

              {/* Loop track list */}
              {(activePlaylistId === 'search' ? searchTracks : tracks).map((track, index) => {
                const isCurrent = currentTrack?.id === track.id;
                const isFav = favorites.some(f => f.id === track.id);
                
                return (
                  <div
                    key={track.id}
                    onClick={() => setCurrentTrack(track)}
                    className={`group flex items-center gap-4 px-4 py-3 transition-colors cursor-pointer text-left ${
                      isCurrent 
                        ? 'bg-[#E63946]/5 hover:bg-[#E63946]/10' 
                        : 'hover:bg-zinc-900/30'
                    }`}
                  >
                    {/* Index or Equalizer Column */}
                    <div className="w-8 flex items-center justify-center shrink-0">
                      {isCurrent && isPlaying ? (
                        <AudioEqualizer />
                      ) : (
                        <span className={`text-xs font-mono font-bold transition-colors ${
                          isCurrent ? 'text-[#E63946]' : 'text-zinc-600 group-hover:text-zinc-400'
                        }`}>
                          {index < 9 ? `0${index + 1}` : index + 1}
                        </span>
                      )}
                    </div>

                    {/* Track Info (Poster, Title, Artist) */}
                    <div className="flex-grow min-w-0 flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300 shadow-md">
                        <img 
                          src={track.artwork} 
                          alt={track.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isCurrent && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            {isPlaying ? (
                              <Pause size={12} className="text-white" />
                            ) : (
                              <Play size={12} className="text-white" />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-xs sm:text-sm font-bold tracking-tight truncate transition-colors ${
                          isCurrent ? 'text-[#E63946]' : 'text-white group-hover:text-[#E63946]'
                        }`}>
                          {track.name}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-zinc-500 font-medium truncate mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    {/* Source Badge */}
                    <div className="hidden sm:flex w-32 justify-center items-center shrink-0">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 border rounded-full ${
                        track.source === 'iTunes'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                      }`}>
                        {track.source}
                      </span>
                    </div>

                    {/* Track Duration or Preview label */}
                    <div className="w-24 text-center shrink-0 flex flex-col items-center">
                      <span className="text-[10px] font-mono font-bold text-zinc-400">
                        {formatTime(track.duration)}
                      </span>
                      <span className="text-[8px] font-black uppercase mt-0.5 text-zinc-600">
                        Preview 30s
                      </span>
                    </div>

                    {/* Favorite heart action */}
                    <div className="w-16 flex justify-end shrink-0">
                      <button
                        onClick={(e) => toggleFavorite(track, e)}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${
                          isFav 
                            ? 'text-pink-500 bg-pink-500/10' 
                            : 'text-zinc-600 hover:text-pink-500 hover:bg-zinc-900/60'
                        }`}
                      >
                        <Heart size={14} className={isFav ? 'fill-pink-500' : ''} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </main>

      {/* 3. FIXED BOTTOM PLAYER BAR (SPOTIFY STYLE) */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div 
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-[#07070B]/90 backdrop-blur-xl border-t border-zinc-900/80 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              
              {/* Left Column: Cover + Track name + Artist + Favorite Heart */}
              <div className="flex items-center gap-3 w-1/4 min-w-0">
                <img 
                  src={currentTrack.artwork} 
                  alt={currentTrack.name} 
                  className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shadow-md animate-scale-in"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-grow">
                  <h4 className="text-xs sm:text-sm font-extrabold tracking-tight text-white truncate flex items-center gap-1.5">
                    {currentTrack.name}
                    <span className="text-[8px] font-black uppercase shrink-0 border px-1.5 py-0.5 rounded text-zinc-500 bg-zinc-900/80 border-zinc-800">
                      Preview 30s
                    </span>
                  </h4>
                  <p className="text-[10px] sm:text-xs text-zinc-500 truncate mt-0.5">
                    {currentTrack.artist}
                  </p>
                </div>
                <button
                  onClick={(e) => toggleFavorite(currentTrack, e)}
                  className={`p-1.5 rounded-full hover:bg-white/5 transition-all shrink-0 ${
                    favorites.some(f => f.id === currentTrack.id) 
                      ? 'text-pink-500' 
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Heart size={15} className={favorites.some(f => f.id === currentTrack.id) ? 'fill-pink-500' : ''} />
                </button>
              </div>

              {/* Center Column: Control keys + Seek Bar */}
              <div className="flex flex-col items-center gap-1.5 flex-grow max-w-xl">
                {/* Playback Buttons row */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <button 
                    onClick={() => setIsShuffle(!isShuffle)}
                    title="Trộn bài"
                    className={`p-1 transition-colors shrink-0 ${isShuffle ? 'text-[#E63946]' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <Shuffle size={14} />
                  </button>

                  <button 
                    onClick={handlePrevTrack}
                    title="Bài trước"
                    className="p-1 text-zinc-400 hover:text-white transition-colors shrink-0"
                  >
                    <SkipBack size={16} fill="currentColor" />
                  </button>

                  <button 
                    onClick={togglePlay}
                    className="w-9 h-9 bg-white text-black hover:bg-zinc-200 rounded-full flex items-center justify-center transition-all shadow-md transform active:scale-90 shrink-0 cursor-pointer"
                  >
                    {isPlaying ? (
                      <Pause size={16} fill="currentColor" className="ml-[0px]" />
                    ) : (
                      <Play size={16} fill="currentColor" className="ml-[2px]" />
                    )}
                  </button>

                  <button 
                    onClick={handleNextTrack}
                    title="Bài tiếp theo"
                    className="p-1 text-zinc-400 hover:text-white transition-colors shrink-0"
                  >
                    <SkipForward size={16} fill="currentColor" />
                  </button>

                  <button 
                    onClick={() => setIsRepeat(!isRepeat)}
                    title="Lặp lại bài này"
                    className={`p-1 transition-colors shrink-0 ${isRepeat ? 'text-[#E63946]' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    <Repeat size={14} />
                  </button>
                </div>

                {/* Progress bar timeline */}
                <div className="w-full flex items-center gap-2 text-[10px] font-mono text-zinc-500 font-bold">
                  <span>{formatTime(currentTime)}</span>
                  <div className="relative flex-grow h-1 group cursor-pointer">
                    {/* Background track line */}
                    <div className="absolute inset-0 bg-zinc-800 rounded-full" />
                    {/* Active completed path line */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-[#E63946] rounded-full group-hover:bg-red-500 transition-colors" 
                      style={{ width: `${(currentTime / (duration || 30)) * 100}%` }}
                    />
                    {/* Grab indicator point dot */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-zinc-800 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${(currentTime / (duration || 30)) * 100}% - 5px)` }}
                    />
                    {/* Hidden input for timeline seek click */}
                    <input 
                      type="range"
                      min={0}
                      max={duration || 30}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeekChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Column: Volume settings slider */}
              <div className="hidden sm:flex items-center gap-2.5 w-1/4 justify-end">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
                
                <div className="relative w-20 sm:w-24 h-1 group cursor-pointer">
                  {/* Background volume track */}
                  <div className="absolute inset-0 bg-zinc-800 rounded-full" />
                  {/* Fill volume path */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-[#E63946] rounded-full group-hover:bg-red-500 transition-colors"
                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                  />
                  {/* Grab dot indicator */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 4px)` }}
                  />
                  {/* Range input */}
                  <input 
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                      if (v > 0) setIsMuted(false);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

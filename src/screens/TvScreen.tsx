import React, { useState, useEffect } from 'react';
import { Menu, X, Tv, Info, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { parseM3u, Channel } from '../lib/parseM3u';
import ChannelList from '../components/tv/ChannelList';
import VideoPlayer from '../components/tv/VideoPlayer';

const CACHE_KEY = 'hb_tv_channels_v4';
const CACHE_TIME_KEY = 'hb_tv_channels_time_v4';
const CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

const HARDCODED_CHANNELS: Channel[] = [
  {
    id: 'vtv1-hd',
    name: 'VTV1 HD',
    group: 'VTV',
    streamUrl: 'https://vips-livecdn.fptplay.net/live/media/vtv1/live247-hls-avc/index.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_VTV1_2013.svg'
  },
  {
    id: 'vtv2-hd',
    name: 'VTV2 HD',
    group: 'VTV',
    streamUrl: 'https://vips-livecdn.fptplay.net/live/media/vtv2/live247-hls-avc/index.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Logo_VTV2_2013.svg'
  },
  {
    id: 'vtv3-hd',
    name: 'VTV3 HD',
    group: 'VTV',
    streamUrl: 'https://vips-livecdn.fptplay.net/live/media/vtv3/live247-hls-avc/index.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Logo_VTV3_2013.svg'
  },
  {
    id: 'vtv5-hd',
    name: 'VTV5 HD',
    group: 'VTV',
    streamUrl: 'https://vips-livecdn.fptplay.net/live/media/vtv5/live247-hls-avc/index.m3u8',
    logo: 'https://i.imgur.com/7qPKNFU.png'
  },
  {
    id: 'vtv8-hd',
    name: 'VTV8 HD',
    group: 'VTV',
    streamUrl: 'https://vips-livecdn.fptplay.net/live/media/vtv8/live247-hls-avc/index.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/df/VTV8_logo_2016.png'
  },
  {
    id: 'vtv9-hd',
    name: 'VTV9 HD',
    group: 'VTV',
    streamUrl: 'https://vips-livecdn.fptplay.net/live/media/vtv9/live247-hls-avc/index.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/VTV9_logo_2016.png'
  },
  {
    id: 'htv2-hd',
    name: 'HTV2 HD',
    group: 'HTV & VTC',
    streamUrl: 'https://e2.endpoint.cdn.sctvonline.vn/hls/htv2/index.m3u8',
    userAgent: 'ReactNativeVideo/3.4.4 (Linux;Android 9) ExoPlayerLib/2.13.3',
    logo: 'https://i.imgur.com/Yc3cmAi.png'
  },
  {
    id: 'htv7-hd',
    name: 'HTV7 HD',
    group: 'HTV & VTC',
    streamUrl: 'https://e2.endpoint.cdn.sctvonline.vn/hls/htv7/index.m3u8',
    userAgent: 'ReactNativeVideo/3.4.4 (Linux;Android 9) ExoPlayerLib/2.13.3',
    logo: 'https://i.imgur.com/PPFu7pv.png'
  },
  {
    id: 'htv9-hd',
    name: 'HTV9 HD',
    group: 'HTV & VTC',
    streamUrl: 'https://e2.endpoint.cdn.sctvonline.vn/hls/htv9/index.m3u8',
    userAgent: 'ReactNativeVideo/3.4.4 (Linux;Android 9) ExoPlayerLib/2.13.3',
    logo: 'https://i.imgur.com/1SgC1yo.png'
  },
  {
    id: 'vtc1-hd',
    name: 'VTC1 HD',
    group: 'HTV & VTC',
    streamUrl: 'https://1117141481.vnns.net/VTC1/playlist.m3u8',
    logo: 'https://i.imgur.com/7HD60aD.png'
  },
  {
    id: 'vtc3-hd',
    name: 'VTC3 HD',
    group: 'HTV & VTC',
    streamUrl: 'https://1117141481.vnns.net/VTC3/playlist.m3u8',
    logo: 'https://i.imgur.com/hS4bgHe.png'
  },
  {
    id: 'vtc14-hd',
    name: 'VTC14 HD',
    group: 'HTV & VTC',
    streamUrl: 'https://1117141481.vnns.net/VTC14/playlist.m3u8',
    logo: 'https://i.imgur.com/phXvB0t.png'
  },
  {
    id: 'nhk-world',
    name: 'NHK World Japan',
    group: 'Tin Tức Quốc Tế',
    streamUrl: 'https://nhkwlive-ojsp.akamaized.net/hls/live/2003459/nhkwlive-ojsp-bj/index.m3u8',
    logo: 'https://i.imgur.com/Et3vExm.png'
  },
  {
    id: 'dw-news',
    name: 'DW News English',
    group: 'Tin Tức Quốc Tế',
    streamUrl: 'https://dwstream72-lh.akamaihd.net/i/dwstream72_1@119309/index_1000_av-p.m3u8',
    logo: 'https://i.imgur.com/A1xzjOI.png'
  },
  {
    id: 'france-24',
    name: 'France 24 English',
    group: 'Tin Tức Quốc Tế',
    streamUrl: 'https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8',
    logo: 'https://i.imgur.com/CMgoCrh.png'
  },
  {
    id: 'bloomberg-tv',
    name: 'Bloomberg Television',
    group: 'Tin Tức Quốc Tế',
    streamUrl: 'https://live-bloomberg-tv.akamaized.net/hls/live/2034407/bloomberg/master.m3u8',
    logo: 'https://i.imgur.com/idRFfhY.png'
  },
  {
    id: 'cna-news',
    name: 'CNA News Asia',
    group: 'Tin Tức Quốc Tế',
    streamUrl: 'https://mediacorp-cna-live.akamaized.net/hls/live/2034404/cna/master.m3u8',
    logo: 'https://i.imgur.com/awIDugE.png'
  },
  {
    id: 'redbull-tv',
    name: 'Red Bull TV',
    group: 'Thể Thao',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590971/sports/master.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_Energy_Drink_logo.svg/1200px-Red_Bull_Energy_Drink_logo.svg.png'
  },
  {
    id: 'nasa-tv',
    name: 'NASA Science TV',
    group: 'Khoa Học & Khám Phá',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014027/NASA-NTV1-HLS/master.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg'
  },
  {
    id: 'fashion-tv',
    name: 'Fashion TV UHD',
    group: 'Giải Trí',
    streamUrl: 'https://fashiontv-fashiontv-1-us.samsung.wurl.com/manifest/playlist.m3u8',
    logo: 'https://i.imgur.com/vQuyyWO.png'
  }
];

const cleanGroup = (group: string, prefix: string): string => {
  if (!group || group === 'Khác') return 'Truyền Hình';
  
  let cleaned = group.replace(/🇻🇳\s*\|?\s*/g, '')
                     .replace(/🌏\s*\|?\s*/g, '')
                     .replace(/📰\s*\|?\s*/g, '')
                     .replace(/⚽\s*\|?\s*/g, '')
                     .replace(/🌈\s*\|?\s*/g, '')
                     .replace(/🎧\s*\|?\s*/g, '')
                     .replace(/🎬\s*\|?\s*/g, '')
                     .replace(/🌿\s*\|?\s*/g, '')
                     .replace(/🌐\s*\|?\s*/g, '')
                     .trim();

  const groupLower = cleaned.toLowerCase();
  if (groupLower.includes('vtv')) return 'VTV';
  if (groupLower.includes('htv') || groupLower.includes('vtc') || groupLower.includes('sctv')) return 'HTV & VTC';
  if (groupLower.includes('địa phương') || groupLower.includes('tỉnh')) return 'Truyền Hình Tỉnh';
  if (groupLower.includes('tin tức') || groupLower.includes('news')) return 'Tin Tức Quốc Tế';
  if (groupLower.includes('thể thao') || groupLower.includes('sport')) return 'Thể Thao';
  if (groupLower.includes('ca nhạc') || groupLower.includes('music') || groupLower.includes('âm nhạc')) return 'Ca Nhạc';
  if (groupLower.includes('hoạt hình') || groupLower.includes('kids') || groupLower.includes('thiếu nhi')) return 'Thiếu Nhi';
  if (groupLower.includes('phim') || groupLower.includes('movie')) return 'Phim Truyện';
  if (groupLower.includes('khám phá') || groupLower.includes('discovery')) return 'Khoa Học & Khám Phá';

  return prefix + cleaned;
};

export default function TvScreen() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);
  const [errorPlaylist, setErrorPlaylist] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setIsLoadingPlaylist(true);
        setErrorPlaylist(null);

        // 1. Check local Cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cachedData && cachedTime && (now - parseInt(cachedTime)) < CACHE_DURATION_MS) {
          try {
            const parsed = JSON.parse(cachedData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setChannels(parsed);
              setSelectedChannel(parsed[0]);
              setIsLoadingPlaylist(false);
              return;
            }
          } catch (e) {
            console.error('Failed parsing cached channels:', e);
          }
        }

        // 2. Load from parallel M3U playlist sources
        const sources = [
          { url: 'https://raw.githubusercontent.com/dangdvd/dangdvd.github.io/main/iptv', groupPrefix: '' },
          { url: 'https://iptv-org.github.io/iptv/categories/news.m3u', groupPrefix: 'Tin Tức ' },
          { url: 'https://iptv-org.github.io/iptv/categories/music.m3u', groupPrefix: 'Ca Nhạc ' },
          { url: 'https://iptv-org.github.io/iptv/categories/kids.m3u', groupPrefix: 'Thiếu Nhi ' },
          { url: 'https://iptv-org.github.io/iptv/categories/sports.m3u', groupPrefix: 'Thể Thao ' },
          { url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8', groupPrefix: 'Free TV ' }
        ];

        let allParsedChannels: Channel[] = [];

        const fetchPromises = sources.map(async (src) => {
          try {
            const proxyUrl = `/api/tv/proxy?url=${encodeURIComponent(src.url)}`;
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(id);

            if (response.ok) {
              const text = await response.text();
              const parsed = parseM3u(text);
              return parsed.map(c => ({
                ...c,
                group: cleanGroup(c.group, src.groupPrefix)
              }));
            }
          } catch (err) {
            console.warn(`Failed loading: ${src.url}`, err);
          }
          return [];
        });

        const results = await Promise.all(fetchPromises);
        allParsedChannels = results.flat();

        // 3. Deduplicate and merge with HARDCODED fallback
        const seenUrls = new Set<string>();
        const seenNames = new Set<string>();
        let uniqueChannels: Channel[] = [];

        // Seed with priority hardcoded channels
        for (const channel of HARDCODED_CHANNELS) {
          seenUrls.add(channel.streamUrl);
          seenNames.add(channel.name.toLowerCase());
          uniqueChannels.push(channel);
        }

        // Append parsed channels safely
        for (const channel of allParsedChannels) {
          if (!channel.name || !channel.streamUrl) continue;
          
          const cleanName = channel.name.replace(/[\s\-_]+/g, ' ').trim();
          const normalizedNameKey = cleanName.toLowerCase();

          if (!seenUrls.has(channel.streamUrl) && !seenNames.has(normalizedNameKey)) {
            seenUrls.add(channel.streamUrl);
            seenNames.add(normalizedNameKey);
            uniqueChannels.push({
              ...channel,
              name: cleanName
            });
          }
        }

        // Clean out radio streams
        uniqueChannels = uniqueChannels.filter(c => {
          const lg = c.group.toLowerCase();
          const ln = c.name.toLowerCase();
          return !lg.includes('radio') && !lg.includes('📻') && !ln.includes('radio');
        });

        if (uniqueChannels.length === 0) {
          throw new Error('All playlists returned empty data.');
        }

        setChannels(uniqueChannels);
        setSelectedChannel(uniqueChannels[0]);

        // Save to cache
        localStorage.setItem(CACHE_KEY, JSON.stringify(uniqueChannels));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

      } catch (err) {
        console.warn('IPTV M3U compilation failed, falling back to HARDCODED list:', err);
        setChannels(HARDCODED_CHANNELS);
        setSelectedChannel(HARDCODED_CHANNELS[0]);
      } finally {
        setIsLoadingPlaylist(false);
      }
    };

    loadPlaylist();
  }, []);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    // Close mobile guide menu upon selection
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#07070B] text-zinc-100 pt-20 pb-12 px-4 md:px-8 select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Live TV header banner with neon glow */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#13131A] to-[#0A0A0F] border border-zinc-900 rounded-[28px] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-40 bg-[#E63946]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-[#E63946] border border-red-500/20 flex items-center justify-center animate-pulse">
              <Tv size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                  KÊNH TV TRỰC TUYẾN
                </h1>
                <span className="hidden xs:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
                  IPTV Live
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-medium">
                Thưởng thức hàng trăm kênh truyền hình Việt Nam chất lượng cao băng thông siêu phẳng.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 z-10">
            {/* Mobile guide toggle */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-300 transition-colors cursor-pointer active:scale-95"
            >
              {mobileSidebarOpen ? <X size={14} /> : <Menu size={14} />}
              <span>Danh Sách Kênh</span>
            </button>
            
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E63946]/5 border border-[#E63946]/10 text-[10px] font-bold text-[#E63946]">
              <Sparkles size={11} className="animate-spin" />
              <span>Full Ultra HD 4K</span>
            </div>
          </div>
        </div>

        {isLoadingPlaylist ? (
          /* High-Fidelity IPTV Guide Loading State */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[500px]">
            <div className="lg:col-span-3 h-[500px] bg-[#13131A] border border-zinc-900 rounded-3xl animate-pulse p-4 space-y-4">
              <div className="h-10 bg-zinc-900 rounded-xl w-full" />
              <div className="h-6 bg-zinc-900 rounded-lg w-2/3" />
              <div className="space-y-2 pt-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-14 bg-zinc-900 rounded-xl w-full" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-9 aspect-video bg-[#13131A] border border-zinc-900 rounded-3xl animate-pulse flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
              <p className="text-xs text-zinc-500 font-bold tracking-widest uppercase">
                Đang nạp nguồn kênh Việt Nam...
              </p>
            </div>
          </div>
        ) : (
          /* Main Layout container */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative">
            
            {/* LEFT GUIDE COLUMN: SIDEBAR */}
            {/* Desktop View (Visible) */}
            <div className="hidden lg:block lg:col-span-4 h-[640px]">
              <ChannelList
                channels={channels}
                selected={selectedChannel}
                onSelect={handleChannelSelect}
              />
            </div>

            {/* Mobile View Drawer (Conditional Overlay) */}
            {mobileSidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden bg-black/75 backdrop-blur-sm animate-fade-in flex justify-end">
                <div className="w-full max-w-sm h-full bg-[#0A0A0F] shadow-2xl p-4 flex flex-col relative animate-slide-in">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-900">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Tv size={16} className="text-[#E63946]" />
                      <span>Chọn kênh truyền hình</span>
                    </h3>
                    <button
                      onClick={() => setMobileSidebarOpen(false)}
                      className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ChannelList
                      channels={channels}
                      selected={selectedChannel}
                      onSelect={handleChannelSelect}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT PLAYER COLUMN */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
              {selectedChannel ? (
                <>
                  <VideoPlayer
                    streamUrl={selectedChannel.streamUrl}
                    channelName={selectedChannel.name}
                    channelLogo={selectedChannel.logo}
                    userAgent={selectedChannel.userAgent}
                  />

                  {/* Channel information widget */}
                  <div className="p-6 bg-[#13131A] border border-zinc-900 rounded-[28px] relative overflow-hidden shadow-xl flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      {selectedChannel.logo ? (
                        <img
                          src={selectedChannel.logo}
                          alt={selectedChannel.name}
                          className="w-14 h-14 object-contain bg-white/5 border border-zinc-800 rounded-xl p-2 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 bg-[var(--color-brand)]/10 text-[var(--color-brand)] border border-[var(--color-brand)]/20 rounded-xl flex items-center justify-center shrink-0">
                          <Tv size={24} />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-black text-[#E63946] bg-red-500/5 border border-red-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {selectedChannel.group} Network
                        </span>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight mt-2 flex items-center gap-2">
                          <span>{selectedChannel.name}</span>
                        </h2>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
                          Kênh trực tiếp phát sóng 24/7. Bạn đang kết nối thông qua hạ tầng truyền dữ liệu được tối ưu và chống nghẽn luồng CORS Proxy thông minh.
                        </p>
                      </div>
                    </div>

                    <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-zinc-900/80 pt-6 md:pt-0 md:pl-6 flex flex-col gap-3 justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Trạng thái luồng</span>
                        <p className="text-xs font-bold text-green-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span>Mã hóa bảo mật cao</span>
                        </p>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                        Mẹo: Nếu hình ảnh không chuyển tải được, nhấn <strong className="text-zinc-300">Thử lại</strong> hoặc chọn một kênh khác để nạp lại tiến trình.
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-[#13131A] border border-zinc-900 rounded-3xl flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-zinc-500" />
                  <p className="text-sm font-bold text-zinc-400">Vui lòng chọn một kênh từ danh mục bên cạnh để bắt đầu phát sóng.</p>
                </div>
              )}
            </div>

          </div>
        )}
        
      </div>
    </div>
  );
}

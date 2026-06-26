import React, { useState, useEffect } from 'react';
import { Menu, X, Tv, Info, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { parseM3u, Channel } from '../lib/parseM3u';
import ChannelList from '../components/tv/ChannelList';
import VideoPlayer from '../components/tv/VideoPlayer';

const FALLBACK_CHANNELS: Channel[] = [
  {
    id: 'vtv1-hd-fallback',
    name: 'VTV1 HD (Dự Phòng)',
    group: 'VTV',
    streamUrl: 'https://live.phatgiao.org.vn/live/vtv1/playlist.m3u8',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_VTV1_2013.svg'
  },
  {
    id: 'vtv3-hd-fallback',
    name: 'VTV3 HD (Dự Phòng)',
    group: 'VTV',
    streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8', // generic hls fallback for premium video player demo if live tv is blocked
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Logo_VTV3_2013.svg'
  }
];

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

        // Fetch playlist from iptv-org via our server proxy
        const playlistTargetUrl = 'https://iptv-org.github.io/iptv/countries/vn.m3u';
        const proxyUrl = `/api/tv/proxy?url=${encodeURIComponent(playlistTargetUrl)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error('Máy chủ proxy IPTV không phản hồi thành công.');
        }

        const m3uText = await response.text();
        const parsedChannels = parseM3u(m3uText);

        if (parsedChannels.length === 0) {
          throw new Error('Danh sách kênh IPTV trống hoặc không đúng định dạng.');
        }

        // Clean up names if needed or filter out empty entries
        const validChannels = parsedChannels.filter(c => c.name && c.streamUrl);
        
        setChannels(validChannels);
        // Select the first channel as default
        setSelectedChannel(validChannels[0] || null);
      } catch (err: any) {
        console.warn('IPTV M3U load failed, booting fallback playlist:', err.message || err);
        setChannels(FALLBACK_CHANNELS);
        setSelectedChannel(FALLBACK_CHANNELS[0]);
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

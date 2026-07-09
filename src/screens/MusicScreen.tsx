import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Sparkles, 
  Youtube, 
  Heart, 
  Info, 
  Play, 
  Clock, 
  Flame, 
  ListVideo, 
  Search, 
  ThumbsUp, 
  Share2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ShareModal from '../components/ShareModal';

interface VideoTrack {
  id: string;
  title: string;
  creator: string;
  duration: string;
  embedUrl: string;
  thumbnail: string;
  views: string;
  uploadedAt: string;
  description: string;
}

export default function MusicScreen() {
  const tracks: VideoTrack[] = [
    {
      id: '82ZTNQNEQgE',
      title: 'tlinh - “ái” album | THE LISTENING EXPERIENCE',
      creator: 'tlinh',
      duration: '38:40',
      embedUrl: 'https://www.youtube.com/embed/82ZTNQNEQgE?si=IvQGANM1bEBJGOz2&autoplay=1',
      thumbnail: 'https://i.ytimg.com/vi/82ZTNQNEQgE/hqdefault.jpg',
      views: '4.8M lượt xem',
      uploadedAt: '1 năm trước',
      description: 'Album đầu tay đầy đột phá của tlinh mang tên "ái", mang lại không gian âm nhạc RnB vô cùng quyến rũ, hiện đại và tràn đầy cảm xúc đặc sắc.'
    },
    {
      id: 'lnJVF5TjbWs',
      title: '"Triệu" Album: Phase 1 of 3 (Full Album Audio)',
      creator: 'VSTRA',
      duration: '22:15',
      embedUrl: 'https://www.youtube.com/embed/lnJVF5TjbWs?si=3WE0cAQ70CdJCHzZ&autoplay=1',
      thumbnail: 'https://i.ytimg.com/vi/lnJVF5TjbWs/hqdefault.jpg',
      views: '820K lượt xem',
      uploadedAt: '9 tháng trước',
      description: 'Thưởng thức Phase 1 của dự án Album "Triệu" của nữ nghệ sĩ VSTRA đầy cá tính với giai điệu mộc mạc và giọng ca lôi cuốn đặc trưng.'
    },
    {
      id: 'BBytiT94y2A',
      title: '‘dreAMEE’ the debut album - AMEE | prod. by S•HUBE',
      creator: 'ST.319 Entertainment',
      duration: '31:37',
      embedUrl: 'https://www.youtube.com/embed/BBytiT94y2A?si=Vj2u77hTDj1xTA_b&autoplay=1',
      thumbnail: 'https://i.ytimg.com/vi/BBytiT94y2A/hqdefault.jpg',
      views: '17M lượt xem',
      uploadedAt: '4 năm trước',
      description: '‘dreAMEE’ - album phòng thu đầu tay của nữ ca sĩ AMEE với các ca khúc ngọt ngào được sản xuất bởi S•HUBE, mang phong cách tươi sáng, mơ mộng và cực kỳ lôi cuốn.'
    },
    {
      id: 'Gvs2UwzD6xw',
      title: 'chào buổi sáng cùng AMEE ☀️ | AMEE\'s playlist #1',
      creator: 'ST.319 Entertainment',
      duration: '17:41',
      embedUrl: 'https://www.youtube.com/embed/Gvs2UwzD6xw?si=g6-hFqhs8nyMGvrf&autoplay=1',
      thumbnail: 'https://i.ytimg.com/vi/Gvs2UwzD6xw/hqdefault.jpg',
      views: '8.5M lượt xem',
      uploadedAt: '3 năm trước',
      description: 'Playlist số 1 của AMEE mang giai điệu tươi sáng, tích cực để khởi đầu ngày mới ngập tràn niềm vui cùng giọng hát trong trẻo ngọt ngào.'
    },
    {
      id: 'TEeap2t1NMs',
      title: 'JUKY SAN - ĐẮM TÌNH | FULL ALBUM EXPERIENCE',
      creator: 'Juky San',
      duration: '36:12',
      embedUrl: 'https://www.youtube.com/embed/TEeap2t1NMs?si=6Z0A9luVB9ZLa2QP&autoplay=1',
      thumbnail: 'https://i.ytimg.com/vi/TEeap2t1NMs/hqdefault.jpg',
      views: '1.2M lượt xem',
      uploadedAt: '3 năm trước',
      description: 'ĐẮM TÌNH là full album đầu tay của Juky San. Thưởng thức toàn bộ album với trải nghiệm hình ảnh tuyệt vời, du dương.'
    },
    {
      id: 'nLhV82uk33o',
      title: 'ÁNH SÁNG • MÀN ĐÊM (side B) - GREY D | the first album',
      creator: 'ST.319 Entertainment',
      duration: '15:45',
      embedUrl: 'https://www.youtube.com/embed/nLhV82uk33o?si=tzbcDhylmFXQ3muN&autoplay=1',
      thumbnail: 'https://i.ytimg.com/vi/nLhV82uk33o/hqdefault.jpg',
      views: '2.4M lượt xem',
      uploadedAt: '2 năm trước',
      description: 'Phần 2 (Side B) trong album đầu tay của GREY D mang đến những thanh âm êm dịu, đầy cảm xúc và chiều sâu tâm hồn.'
    },
    {
      id: 'xVRwyJMy1Wc',
      title: 'MIN - \'Dear Min\' (Full Album Visual Stage)',
      creator: 'MIN OFFICIAL',
      duration: '28:10',
      embedUrl: 'https://www.youtube.com/embed/xVRwyJMy1Wc?si=qhYloY0hiXYPOLtz&autoplay=1',
      thumbnail: 'https://i.ytimg.com/vi/xVRwyJMy1Wc/hqdefault.jpg',
      views: '3.1M lượt xem',
      uploadedAt: '2 năm trước',
      description: 'Dear Min - dự án album đặc biệt từ MIN mang phong cách ngọt ngào, hiện đại kết hợp phần visual stage cực kỳ bắt mắt.'
    }
  ];

  const [activeVideo, setActiveVideo] = useState<VideoTrack>(tracks[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [likes, setLikes] = useState<Record<string, number>>({
    '82ZTNQNEQgE': 48000,
    'lnJVF5TjbWs': 12500,
    'BBytiT94y2A': 17400,
    'Gvs2UwzD6xw': 8900,
    'TEeap2t1NMs': 1200,
    'nLhV82uk33o': 2400,
    'xVRwyJMy1Wc': 3100
  });
  const [likedStatus, setLikedStatus] = useState<Record<string, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Filter tracks based on search query
  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLike = (id: string) => {
    setLikedStatus(prev => {
      const wasLiked = !!prev[id];
      setLikes(l => ({
        ...l,
        [id]: wasLiked ? l[id] - 1 : l[id] + 1
      }));
      return {
        ...prev,
        [id]: !wasLiked
      };
    });
  };

  const handleShare = () => {
    setIsShareOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#06060A] text-zinc-100 pb-24 pt-16 sm:pt-20 px-4 md:px-8 lg:px-12 relative overflow-x-hidden">
      {/* Premium background ambiance blobs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#E63946]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#3A86C8]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E63946] to-red-500 flex items-center justify-center shadow-lg shadow-[#E63946]/20 animate-pulse">
              <Music size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                Play Music
                <span className="text-[10px] font-bold bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 px-2 py-0.5 rounded-full lowercase tracking-normal">
                  v2.0
                </span>
              </h1>
              <p className="text-xs text-zinc-400">Trình phát nhạc giải trí chất lượng cao lấy cảm hứng từ YouTube</p>
            </div>
          </div>

          {/* Inline search playlist */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text"
              placeholder="Tìm kiếm bài hát..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/60 hover:bg-zinc-900 focus:bg-zinc-900 border border-zinc-800 focus:border-[#E63946]/50 rounded-full py-2 pl-10 pr-4 text-xs font-medium text-zinc-100 transition-all outline-none"
            />
          </div>
        </div>

        {/* Dynamic YouTube Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
          
          {/* Main Large Player Space (Left Column - occupies 2 columns on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* The Screen Player Container */}
            <motion.div 
              layoutId="mainPlayer"
              className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black border border-zinc-900 group"
            >
              {/* Ambiance glow */}
              <div className="absolute -inset-px bg-gradient-to-tr from-[#E63946]/15 via-transparent to-[#3A86C8]/15 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <iframe 
                width="100%" 
                height="100%" 
                src={activeVideo.embedUrl} 
                title={activeVideo.title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0 rounded-2xl"
              />
            </motion.div>

            {/* Video Details Card */}
            <div className="bg-[#0D0D14]/90 border border-zinc-900/60 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                    <Flame size={12} className="animate-bounce" /> Đang Phát
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                  {activeVideo.title}
                </h2>
              </div>

              {/* Stats and Action Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-y border-zinc-900/80 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E63946]/10 flex items-center justify-center text-[#E63946] border border-[#E63946]/20 font-black text-sm">
                    ST
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-zinc-100">{activeVideo.creator}</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Bản Quyền Độc Quyền</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Like Button */}
                  <button 
                    onClick={() => handleLike(activeVideo.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all text-xs font-bold cursor-pointer ${
                      likedStatus[activeVideo.id] 
                        ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20' 
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <ThumbsUp size={14} className={likedStatus[activeVideo.id] ? 'fill-white' : ''} />
                    <span>{likes[activeVideo.id].toLocaleString()}</span>
                  </button>

                  {/* Share Button */}
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition-all text-xs font-bold cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>{isCopied ? 'Đã sao chép!' : 'Chia sẻ'}</span>
                  </button>
                </div>
              </div>

              {/* Description box */}
              <div className="bg-zinc-950/50 rounded-xl p-3.5 border border-zinc-900/50">
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {activeVideo.description}
                </p>
              </div>
            </div>

          </div>

          {/* YouTube Playlist Column (Right Column) */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <ListVideo size={14} className="text-[#E63946]" /> Danh Sách Nhạc ({filteredTracks.length})
              </h3>
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Tự Động Chuyển Bài</span>
            </div>

            {/* Scrollable Playlist Cards container */}
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredTracks.map((track, idx) => {
                  const isActive = track.id === activeVideo.id;
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      onClick={() => setActiveVideo(track)}
                      className={`group p-3 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 cursor-pointer relative overflow-hidden ${
                        isActive 
                          ? 'bg-[#12121E]/80 border-[#E63946]/30 shadow-lg shadow-[#E63946]/5' 
                          : 'bg-[#0A0A0F]/60 border-zinc-900/80 hover:bg-zinc-900/40 hover:border-zinc-800'
                      }`}
                    >
                      {/* Interactive edge glow on active */}
                      {isActive && (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#E63946]" />
                      )}

                      {/* Video Thumbnail Wrapper */}
                      <div className="relative w-28 sm:w-32 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-950 border border-zinc-800 shadow-md">
                        <img 
                           src={track.thumbnail} 
                          alt={track.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide text-white flex items-center gap-0.5">
                          <Clock size={8} /> {track.duration}
                        </span>

                        {/* Active overlay indicator */}
                        {isActive && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="w-7 h-7 rounded-full bg-[#E63946] flex items-center justify-center text-white shadow-lg animate-bounce">
                              <Play size={10} className="fill-current ml-0.5" />
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Song Details */}
                      <div className="flex flex-col gap-1 min-w-0 justify-center">
                        <h4 className={`text-xs font-black leading-snug line-clamp-2 ${isActive ? 'text-[#E63946]' : 'text-zinc-100 group-hover:text-white'}`}>
                          {track.title}
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-bold tracking-wide">
                          {track.creator}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredTracks.length === 0 && (
                <div className="text-center py-12 bg-zinc-900/20 border border-dashed border-zinc-800/80 rounded-2xl flex flex-col items-center gap-2">
                  <Music size={24} className="text-zinc-600 animate-pulse" />
                  <p className="text-xs font-bold text-zinc-500">Không tìm thấy bài hát phù hợp</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Music Video Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        shareUrl={`${window.location.origin}/#/music?v=${activeVideo.id}`}
        title={activeVideo.title}
        imageUrl={activeVideo.thumbnail}
        description={activeVideo.description}
      />
    </div>
  );
}

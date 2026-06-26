import React, { useState, useMemo } from 'react';
import { Search, FolderOpen, Tv, CheckCircle } from 'lucide-react';
import { Channel } from '../../lib/parseM3u';

interface ChannelListProps {
  channels: Channel[];
  selected: Channel | null;
  onSelect: (channel: Channel) => void;
}

export default function ChannelList({ channels, selected, onSelect }: ChannelListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('Tất cả');

  // Extract unique groups dynamically from channels list
  const groups = useMemo(() => {
    const uniqueGroups = Array.from(new Set(channels.map((c) => c.group || 'Khác')));
    // Put "VTV" or popular networks first if present, otherwise alphabetical
    return ['Tất cả', ...uniqueGroups.sort((a, b) => {
      if (a === 'VTV') return -1;
      if (b === 'VTV') return 1;
      return a.localeCompare(b, 'vi');
    })];
  }, [channels]);

  // Filter channels based on search query and selected group chip
  const filteredChannels = useMemo(() => {
    return channels.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = activeGroup === 'Tất cả' || c.group === activeGroup;
      return matchesSearch && matchesGroup;
    });
  }, [channels, searchQuery, activeGroup]);

  return (
    <div className="flex flex-col h-full bg-[#13131A] border border-zinc-900 rounded-3xl overflow-hidden select-none">
      {/* Search Input Guide */}
      <div className="p-4 border-b border-zinc-900/80 bg-zinc-950/20">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Tìm tên kênh truyền hình..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/40 text-xs font-bold text-white placeholder-zinc-500 rounded-xl border border-zinc-900 focus:outline-none focus:border-[var(--color-brand)]/50 focus:bg-zinc-900/80 transition-all"
          />
        </div>
      </div>

      {/* Horizontal scrolling group filter list */}
      <div className="px-4 py-2 bg-zinc-950/40 border-b border-zinc-900/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {groups.map((group) => {
          const isActive = activeGroup === group;
          return (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                isActive
                  ? 'bg-[var(--color-brand)] text-white shadow-lg shadow-red-500/10'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {group}
            </button>
          );
        })}
      </div>

      {/* Channel count indicator */}
      <div className="px-4 py-2 bg-zinc-950/20 text-[10px] font-bold text-zinc-500 border-b border-zinc-900/30 flex justify-between">
        <span>KÊNH KHẢ DỤNG</span>
        <span className="text-[var(--color-brand)]">{filteredChannels.length} / {channels.length}</span>
      </div>

      {/* Channel List Scroll View */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800">
        {filteredChannels.length > 0 ? (
          filteredChannels.map((channel) => {
            const isSelected = selected?.id === channel.id || selected?.streamUrl === channel.streamUrl;
            return (
              <button
                key={`${channel.id}-${channel.streamUrl}`}
                onClick={() => onSelect(channel)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-gradient-to-r from-[var(--color-brand)]/10 to-transparent border-[var(--color-brand)]/30 shadow-lg shadow-red-500/5'
                    : 'bg-transparent border-transparent hover:bg-zinc-900/40 hover:border-zinc-900'
                }`}
                style={{ minHeight: '48px' }} // Touch target guidelines
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Logo or Fallback */}
                  {channel.logo ? (
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-zinc-800 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-[var(--color-brand)]/20 text-[var(--color-brand)] border-[var(--color-brand)]/30'
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}>
                      <Tv size={16} />
                    </div>
                  )}

                  {/* Channel Meta */}
                  <div className="min-w-0">
                    <p className={`text-xs font-extrabold truncate uppercase tracking-wider ${
                      isSelected ? 'text-white' : 'text-zinc-300'
                    }`}>
                      {channel.name}
                    </p>
                    <span className="text-[9px] text-zinc-500 font-bold block mt-0.5">
                      {channel.group || 'Truyền hình'}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                {isSelected && (
                  <span className="flex h-2 w-2 relative shrink-0 ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <FolderOpen className="w-8 h-8 text-zinc-600 mb-2.5 animate-pulse" />
            <p className="text-xs font-bold text-zinc-400">Không tìm thấy kênh truyền hình</p>
            <p className="text-[10px] text-zinc-500 mt-1">Vui lòng thay đổi từ khóa tìm kiếm hoặc lọc nhóm.</p>
          </div>
        )}
      </div>
    </div>
  );
}

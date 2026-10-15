import React from 'react';
import { ChevronLeft, ArrowDownToLine, Star, Sparkles, CheckCircle2, Play } from 'lucide-react';
import { UgandanVJ } from '../data/ugandanVjs';
import { MediaItem } from '../types';

interface VjDetailModalProps {
  vj: UgandanVJ;
  allItems: MediaItem[];
  onClose: () => void;
  onOpenItem: (item: MediaItem) => void;
  onPlayItem?: (item: MediaItem) => void;
  onDownloadItem?: (item: MediaItem) => void;
}

export const VjDetailModal: React.FC<VjDetailModalProps> = ({
  vj,
  allItems,
  onClose,
  onOpenItem,
  onPlayItem,
  onDownloadItem,
}) => {
  // Filter items attributed to this VJ: matching genre, or sample movie titles, or top items
  const vjMovies = React.useMemo(() => {
    // 1. Matches sample movie titles
    const sampleMatches = allItems.filter((item) =>
      vj.sampleMovies.some((m) =>
        item.title.toLowerCase().includes(m.toLowerCase()) ||
        m.toLowerCase().includes(item.title.toLowerCase())
      )
    );

    // 2. Matches genre
    const genreMatches = allItems.filter((item) =>
      item.genres?.some((g) => g.toLowerCase().includes(vj.genre.toLowerCase()))
    );

    // Combine and deduplicate
    const combined = [...sampleMatches, ...genreMatches];
    const uniqueMap = new Map<string, MediaItem>();
    combined.forEach((item) => uniqueMap.set(item.id, item));

    // If still less than 18, pad with general top items
    if (uniqueMap.size < 18) {
      allItems.slice(0, 30).forEach((item) => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });
    }

    return Array.from(uniqueMap.values());
  }, [vj, allItems]);

  return (
    <div
      id="vj-detail-modal"
      className="fixed inset-0 z-50 bg-[#07080e] flex flex-col max-w-md mx-auto overflow-hidden animate-in fade-in duration-200 text-white select-none"
    >
      {/* 1. TOP STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-md px-3.5 py-3 flex items-center justify-between border-b border-white/10 shadow-lg pt-[max(env(safe-area-inset-top,0px),12px)]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
            title="Back to Home"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-black text-white truncate flex items-center gap-1.5">
              <span>{vj.name} Movies</span>
              <CheckCircle2 className="w-4 h-4 text-[#00df82] shrink-0" />
            </h1>
            <p className="text-[10px] text-zinc-400 truncate">Luganda Translated Audio Dub</p>
          </div>
        </div>

        <span className="text-[10px] bg-[#00df82]/20 text-[#00df82] px-2.5 py-1 rounded-full font-extrabold border border-[#00df82]/30 shrink-0">
          {vj.badge || 'Luganda VJ'}
        </span>
      </div>

      {/* 2. SCROLLABLE SCREEN CONTENT: 3-COLUMNS GOING UP TO DOWN */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24 overscroll-contain">
        {/* VJ Profile Showcase Hero Card */}
        <div className="p-3.5 pb-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/80 via-[#131627] to-[#0a0c16] border border-[#00df82]/30 p-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <img
                  src={vj.avatar}
                  alt={vj.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#00df82] shadow-lg shadow-emerald-500/25"
                />
                <span className="absolute -bottom-1 -right-1 bg-[#00df82] text-black text-[9px] font-black px-1.5 py-0.2 rounded-md shadow">
                  PRO
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-extrabold text-white truncate">{vj.fullName}</h2>
                </div>
                <p className="text-xs text-zinc-300 line-clamp-2 mt-1 leading-snug">
                  {vj.tagline}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] bg-black/50 text-[#00df82] px-2 py-0.5 rounded font-bold border border-white/10">
                    {vj.genre} Specialist
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {vjMovies.length} Luganda Releases
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="px-3.5 pt-2 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#00df82]" />
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              {vj.name} Movie Catalog
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">3-Column Grid</span>
        </div>

        {/* 3-COLUMN MOVIE GRID (3 by 3 going up to down) */}
        <div className="grid grid-cols-3 gap-2.5 px-3.5 py-2">
          {vjMovies.map((item, idx) => (
            <div
              key={`vj-movie-${item.id}-${idx}`}
              onClick={() => onOpenItem(item)}
              className="group cursor-pointer flex flex-col space-y-1.5 active:scale-95 transition duration-150"
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shadow-md group-hover:ring-2 group-hover:ring-[#00df82] transition">
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Luganda Dub Pill */}
                <div className="absolute top-1.5 left-1.5 bg-[#00df82] text-black font-black text-[9px] px-1.5 py-0.2 rounded shadow">
                  {vj.name.split(' ')[1] || 'Luganda'}
                </div>

                {/* Rating Badge */}
                {item.rating !== undefined && (
                  <div className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-[#00df82] font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-[#00df82]" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Download / Save Button */}
                {onDownloadItem && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadItem(item);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white/80 hover:text-[#00df82] transition"
                    title="Download"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Title & Details */}
              <div className="px-0.5">
                <h4 className="text-xs font-bold text-zinc-200 line-clamp-1 group-hover:text-white">
                  {item.title}
                </h4>
                <p className="text-[10px] text-zinc-500 truncate">
                  {item.year ? `${item.year} • ` : ''}
                  {item.genres?.slice(0, 1).join('') || 'Movie'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

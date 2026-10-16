import React from 'react';
import { ChevronLeft, ArrowDownToLine, Star, Film, Play } from 'lucide-react';
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
  onDownloadItem,
}) => {
  // Filter items attributed to this VJ: matching genre, or sample movie titles, or top items
  const vjMovies = React.useMemo(() => {
    const sampleMatches = allItems.filter((item) =>
      vj.sampleMovies.some((m) =>
        item.title.toLowerCase().includes(m.toLowerCase()) ||
        m.toLowerCase().includes(item.title.toLowerCase())
      )
    );

    const genreMatches = allItems.filter((item) =>
      item.genres?.some((g) => g.toLowerCase().includes(vj.genre.toLowerCase()))
    );

    const combined = [...sampleMatches, ...genreMatches];
    const uniqueMap = new Map<string, MediaItem>();
    combined.forEach((item) => uniqueMap.set(item.id, item));

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
      {/* 1. TOP STICKY HEADER WITH BACK BUTTON & "VJ NAME MOVIE CATALOG" */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md px-3.5 py-3 flex items-center gap-3 border-b border-white/10 shadow-lg pt-[max(env(safe-area-inset-top,0px),12px)]">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
          title="Back to Home"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-base font-black text-white truncate tracking-tight">
            {vj.name} Movie Catalog
          </h1>
        </div>
      </div>

      {/* 2. SCROLLABLE CONTENT: 3-COLUMN MOVIE GRID GOING UP TO DOWN */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24 overscroll-contain pt-3">
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

                {/* Attractive Movie Icon / Play Badge on Thumbnail */}
                <div className="absolute top-1.5 left-1.5 bg-[#00df82]/90 backdrop-blur-xs text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                  <Film className="w-2.5 h-2.5 fill-black" />
                  <span>Movie</span>
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

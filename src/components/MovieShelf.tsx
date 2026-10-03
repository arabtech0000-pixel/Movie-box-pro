import React from 'react';
import { ChevronRight, ArrowDownToLine } from 'lucide-react';
import { MediaItem } from '../types';

interface MovieShelfProps {
  title: string;
  icon?: React.ReactNode;
  subtitle?: string;
  items: MediaItem[];
  onOpenItem: (item: MediaItem) => void;
  onDownloadItem: (item: MediaItem) => void;
  onMoreClick?: () => void;
  badge?: string;
}

export const MovieShelf: React.FC<MovieShelfProps> = ({
  title,
  icon,
  subtitle,
  items,
  onOpenItem,
  onDownloadItem,
  onMoreClick,
  badge,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-6 px-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#00df82] flex items-center">{icon}</span>}
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
              {badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#00df82]/15 text-[#00df82] border border-[#00df82]/25">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-[11px] text-zinc-400 font-normal">{subtitle}</p>}
          </div>
        </div>

        {onMoreClick && (
          <button
            onClick={onMoreClick}
            className="text-xs font-semibold text-zinc-400 hover:text-[#00df82] flex items-center gap-0.5 transition active:scale-95 py-1 px-1.5 rounded-lg hover:bg-white/5"
          >
            <span>More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5 scroll-smooth">
        {items.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            onClick={() => onOpenItem(item)}
            className="flex-shrink-0 w-28 group cursor-pointer select-none"
          >
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-md group-hover:ring-2 group-hover:ring-[#00df82]/60 transition">
              <img
                src={item.posterUrl}
                alt={item.title}
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* Top gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Rating badge */}
              {item.rating !== undefined && item.rating > 0 && (
                <div className="absolute bottom-1.5 left-1.5 bg-black/80 backdrop-blur-xs text-[#00df82] font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm border border-white/10">
                  <span>★</span>
                  <span>{item.rating.toFixed(1)}</span>
                </div>
              )}

              {/* Year badge if available */}
              {item.year && (
                <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-zinc-300 font-medium text-[9px] px-1 py-0.5 rounded border border-white/5">
                  {item.year}
                </div>
              )}

              {/* Download cut-in button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadItem(item);
                }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur-xs flex items-center justify-center text-white/80 hover:text-[#00df82] hover:bg-black/90 transition shadow-sm border border-white/10 active:scale-90"
                title="Download"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="text-xs font-medium text-zinc-200 mt-1.5 truncate group-hover:text-[#00df82] transition-colors">
              {item.title}
            </h3>

            {item.genres && item.genres.length > 0 && (
              <p className="text-[10px] text-zinc-500 truncate">
                {item.genres.slice(0, 2).join(' • ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

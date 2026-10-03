import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronUp,
  ChevronDown,
  ListFilter,
  Sparkles,
  Crown,
  ArrowDownToLine,
} from 'lucide-react';
import { ShortDramaItem, MediaItem } from '../types';

interface ShortPlayerModalProps {
  item: ShortDramaItem;
  onClose: () => void;
  onOpenPremium?: () => void;
  onDownloadItem?: (item: MediaItem) => void;
}

export const ShortPlayerModal: React.FC<ShortPlayerModalProps> = ({
  item,
  onClose,
  onOpenPremium,
  onDownloadItem,
}) => {
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24800);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showEpisodeSheet, setShowEpisodeSheet] = useState(false);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Auto advance episode if available
            if (currentEpisode < item.episodesCount) {
              setCurrentEpisode((e) => e + 1);
            }
            return 0;
          }
          return prev + 1;
        });
      }, 350);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentEpisode, item.episodesCount]);

  const handleToggleLike = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const nextEpisode = () => {
    if (currentEpisode < item.episodesCount) {
      setCurrentEpisode((prev) => prev + 1);
      setProgress(0);
    }
  };

  const prevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode((prev) => prev - 1);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between max-w-md mx-auto select-none overflow-hidden">
      {/* Vertical Video Stage */}
      <div
        onClick={() => setIsPlaying((p) => !p)}
        className="relative flex-1 w-full bg-zinc-950 flex items-center justify-center cursor-pointer"
      >
        <img
          src={item.posterUrl}
          alt={item.title}
          className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${
            isPlaying ? 'brightness-90 scale-102' : 'brightness-50'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />

        {/* Top Header */}
        <div
          className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-white bg-black/40 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00df82]" />
              ShortTV Original
            </span>
          </div>

          <button
            onClick={() => {
              if (onOpenPremium) {
                onClose();
                onOpenPremium();
              }
            }}
            className="flex items-center gap-1 text-xs font-bold text-black bg-[#00df82] hover:bg-[#00c975] px-3 py-1.5 rounded-full shadow"
          >
            <Crown className="w-3.5 h-3.5 fill-black" />
            Unlock All
          </button>
        </div>

        {/* Center Pause Icon */}
        {!isPlaying && (
          <div className="relative z-20 w-16 h-16 rounded-full bg-black/60 border border-white/20 text-[#00df82] flex items-center justify-center shadow-lg">
            <Play className="w-8 h-8 fill-[#00df82] ml-1" />
          </div>
        )}

        {/* Right Vertical Action Rail */}
        <div
          className="absolute right-3.5 bottom-24 flex flex-col items-center gap-5 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like */}
          <button
            onClick={handleToggleLike}
            className="flex flex-col items-center text-white group"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition backdrop-blur-md ${
                isLiked ? 'bg-red-500/20 text-red-500' : 'bg-black/50 text-white'
              }`}
            >
              <Heart
                className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
              />
            </div>
            <span className="text-[10px] font-bold mt-1">
              {(likeCount / 1000).toFixed(1)}k
            </span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => setIsBookmarked((b) => !b)}
            className="flex flex-col items-center text-white"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md ${
                isBookmarked ? 'bg-[#00df82]/20 text-[#00df82]' : 'bg-black/50 text-white'
              }`}
            >
              <Bookmark
                className={`w-6 h-6 ${isBookmarked ? 'fill-[#00df82] text-[#00df82]' : ''}`}
              />
            </div>
            <span className="text-[10px] font-bold mt-1">Save</span>
          </button>

          {/* Download */}
          {onDownloadItem && (
            <button
              onClick={() => {
                onDownloadItem({
                  id: `short-${item.id}-ep${currentEpisode}`,
                  title: `${item.title} - Ep ${currentEpisode}`,
                  posterUrl: item.posterUrl,
                  type: 'tv',
                  category: 'ShortTV',
                  genres: [item.category],
                  synopsis: item.description,
                  fileSize: '45.2 MB',
                });
              }}
              className="flex flex-col items-center text-white"
              title="Download episode"
            >
              <div className="w-11 h-11 rounded-full bg-[#00df82]/20 border border-[#00df82]/40 text-[#00df82] backdrop-blur-md flex items-center justify-center">
                <ArrowDownToLine className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold mt-1 text-[#00df82]">Save</span>
            </button>
          )}

          {/* Episode List */}
          <button
            onClick={() => setShowEpisodeSheet(true)}
            className="flex flex-col items-center text-white"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
              <ListFilter className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold mt-1">Episodes</span>
          </button>

          {/* Up/Down Quick Episode navigation */}
          <div className="flex flex-col gap-1.5 pt-1">
            <button
              onClick={prevEpisode}
              disabled={currentEpisode <= 1}
              className="w-8 h-8 rounded-full bg-black/40 text-white disabled:opacity-30 flex items-center justify-center"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={nextEpisode}
              disabled={currentEpisode >= item.episodesCount}
              className="w-8 h-8 rounded-full bg-black/40 text-white disabled:opacity-30 flex items-center justify-center"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Info Overlay */}
        <div
          className="absolute bottom-0 inset-x-0 p-4 pb-6 z-20 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden mb-2">
            <div
              className="bg-[#00df82] h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-black bg-[#00df82] px-2 py-0.5 rounded">
              Ep. {currentEpisode}/{item.episodesCount}
            </span>
            <span className="text-[11px] text-zinc-300 bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">
              {item.tag}
            </span>
          </div>

          <h2 className="text-base font-bold text-white leading-tight">
            {item.title}
          </h2>

          <p className="text-xs text-zinc-300 line-clamp-2 max-w-[85%]">
            {item.synopsis}
          </p>
        </div>
      </div>

      {/* Episode Drawer */}
      {showEpisodeSheet && (
        <div className="absolute inset-x-0 bottom-0 max-h-[70%] bg-[#12141e] rounded-t-2xl p-4 z-40 border-t border-white/10 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-xs text-[#00df82]">{item.episodesCount} Episodes in total</p>
            </div>
            <button
              onClick={() => setShowEpisodeSheet(false)}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 py-4 overflow-y-auto max-h-[360px]">
            {Array.from({ length: item.episodesCount }).map((_, i) => {
              const ep = i + 1;
              const isCurr = ep === currentEpisode;
              const isLocked = ep > 5;
              return (
                <button
                  key={ep}
                  onClick={() => {
                    setCurrentEpisode(ep);
                    setProgress(0);
                    setShowEpisodeSheet(false);
                  }}
                  className={`h-11 rounded-lg flex flex-col items-center justify-center font-bold text-xs transition relative ${
                    isCurr
                      ? 'bg-[#00df82] text-black ring-2 ring-[#00df82]/50'
                      : isLocked
                      ? 'bg-[#181a24] text-zinc-400 hover:bg-[#222533]'
                      : 'bg-[#1c1f2c] text-white hover:bg-[#282d3e]'
                  }`}
                >
                  <span>{ep}</span>
                  {isLocked && (
                    <Crown className="w-2.5 h-2.5 text-amber-400 absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

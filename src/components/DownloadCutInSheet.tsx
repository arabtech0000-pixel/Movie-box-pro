import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  ArrowDownToLine,
  Tv,
  CheckCircle2,
} from 'lucide-react';
import { MediaItem, TmdbEpisode } from '../types';

interface DownloadCutInSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: MediaItem;
  episodes?: TmdbEpisode[];
  onConfirmDownload: (downloads: Array<{ title: string; size: string; quality: string; audio: string }>) => void;
}

interface MovieResourceOption {
  id: string;
  quality: string;
  title: string;
  size: string;
  sizeMb: number;
  uploader: string;
}

const UPLOADERS = [
  'ednasale',
  'Timini',
  'babu ki ABCD😂😂',
  'user9416103087202',
  'Nancy Ajram',
  'Marie France 🇫🇷',
  'Dr Craze',
  'SAMO ZAEN سامو زين',
  'Cinemax_HD',
];

export const DownloadCutInSheet: React.FC<DownloadCutInSheetProps> = ({
  isOpen,
  onClose,
  item,
  episodes = [],
  onConfirmDownload,
}) => {
  const isTv = item.type === 'tv';

  // Audio track state
  const [selectedAudio, setSelectedAudio] = useState('Original Audio[Original]');
  const audioTracks = useMemo(() => {
    if (isTv) {
      return ['Original Audio[Original]', 'English dub', 'Hindi dub', 'pt dub', 'esla dub'];
    }
    return ['Original Audio[Original]', 'esla dub', 'English dub', 'Hindi dub'];
  }, [isTv]);

  // Video quality selector (mainly for TV)
  const [selectedQuality, setSelectedQuality] = useState<'480P' | '1080P' | '720P' | '360P'>('480P');

  // Movie resource items
  const movieResources: MovieResourceOption[] = useMemo(() => {
    return [
      {
        id: '360p',
        quality: '360P',
        title: `360P ${item.title}`,
        size: '193.7MB',
        sizeMb: 193.7,
        uploader: 'ednasale',
      },
      {
        id: '480p',
        quality: '480P',
        title: `480P ${item.title}`,
        size: '245.8MB',
        sizeMb: 245.8,
        uploader: 'Timini',
      },
      {
        id: '1080p',
        quality: '1080P',
        title: `1080P ${item.title}`,
        size: '1.1GB',
        sizeMb: 1126.4,
        uploader: 'babu ki ABCD😂😂',
      },
    ];
  }, [item.title]);

  // TV episodes mapped
  const tvEpisodeItems = useMemo(() => {
    if (!isTv) return [];
    const count = episodes.length > 0 ? episodes.length : 12;
    const items = [];
    for (let i = 1; i <= count; i++) {
      const epData = episodes[i - 1];
      const epNum = i < 10 ? `0${i}` : `${i}`;
      const epTitle = epData ? `S01 EP${epNum}` : `S01 EP${epNum}`;
      const mbSize = selectedQuality === '1080P' ? 180 + (i * 7) % 35 : 55 + (i * 3.7) % 15;
      const sizeStr = `${mbSize.toFixed(1)}MB`;
      const uploader = UPLOADERS[(i - 1) % UPLOADERS.length];
      items.push({
        id: `ep-${i}`,
        episodeNumber: i,
        title: epTitle,
        size: sizeStr,
        sizeMb: mbSize,
        uploader,
      });
    }
    return items;
  }, [isTv, episodes, selectedQuality]);

  // Selected items state
  // For movie: single or multiple (default selected 360P like screenshot 3)
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>(['360p']);
  // For TV: selected episode IDs (default S01 EP01 like screenshot 2)
  const [selectedTvIds, setSelectedTvIds] = useState<string[]>(['ep-1']);

  if (!isOpen) return null;

  // Toggle selection
  const handleToggleMovie = (id: string) => {
    setSelectedMovieIds((prev) => {
      if (prev.includes(id)) {
        // If clicking already selected, keep at least this or allow empty
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleToggleTv = (id: string) => {
    setSelectedTvIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Select all toggle
  const isAllSelected = isTv
    ? selectedTvIds.length === tvEpisodeItems.length && tvEpisodeItems.length > 0
    : selectedMovieIds.length === movieResources.length && movieResources.length > 0;

  const handleToggleSelectAll = () => {
    if (isTv) {
      if (isAllSelected) {
        setSelectedTvIds([]);
      } else {
        setSelectedTvIds(tvEpisodeItems.map((e) => e.id));
      }
    } else {
      if (isAllSelected) {
        setSelectedMovieIds([]);
      } else {
        setSelectedMovieIds(movieResources.map((m) => m.id));
      }
    }
  };

  // Calculate total selected size
  let totalSelectedMb = 0;
  if (isTv) {
    totalSelectedMb = tvEpisodeItems
      .filter((e) => selectedTvIds.includes(e.id))
      .reduce((acc, curr) => acc + curr.sizeMb, 0);
  } else {
    totalSelectedMb = movieResources
      .filter((m) => selectedMovieIds.includes(m.id))
      .reduce((acc, curr) => acc + curr.sizeMb, 0);
  }

  const formatTotalSize = (mb: number) => {
    if (mb <= 0) return '0MB';
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)}GB`;
    }
    return `${mb.toFixed(1)}MB`;
  };

  const handleDownloadClick = () => {
    if (isTv) {
      const selected = tvEpisodeItems.filter((e) => selectedTvIds.includes(e.id));
      if (selected.length === 0) return;
      onConfirmDownload(
        selected.map((ep) => ({
          title: `${item.title} - ${ep.title}`,
          size: ep.size,
          quality: selectedQuality,
          audio: selectedAudio,
        }))
      );
    } else {
      const selected = movieResources.filter((m) => selectedMovieIds.includes(m.id));
      if (selected.length === 0) return;
      onConfirmDownload(
        selected.map((m) => ({
          title: `${item.title} (${m.quality})`,
          size: m.size,
          quality: m.quality,
          audio: selectedAudio,
        }))
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#181a24] text-white rounded-t-3xl border-t border-white/10 shadow-2xl flex flex-col max-h-[88vh] animate-in slide-in-from-bottom duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Download Resources</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00df82]/15 text-[#00df82] border border-[#00df82]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00df82] animate-pulse" />
                Player Connected
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Movie Database Fast CDN • Saves to device & Downloads page
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-4 py-2 overflow-y-auto overscroll-contain space-y-4 no-scrollbar flex-1">
          {/* Settings Box (Audio + Video Quality) */}
          <div className="bg-[#212330] rounded-2xl p-3.5 space-y-3 border border-white/5">
            {/* Audio row */}
            <div>
              <span className="text-xs font-semibold text-zinc-300 block mb-2">
                Audio
              </span>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {audioTracks.map((track) => {
                  const isSelected = selectedAudio === track;
                  return (
                    <button
                      key={track}
                      onClick={() => setSelectedAudio(track)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                        isSelected
                          ? 'border border-[#00df82] text-[#00df82] bg-emerald-500/10'
                          : 'bg-[#292c3d] text-zinc-400 hover:text-zinc-200 border border-transparent'
                      }`}
                    >
                      {track}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video download quality row (for TV or multi-quality) */}
            {isTv && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-2">
                  <span className="border border-zinc-400 text-[10px] font-bold px-1 py-0.2 rounded text-zinc-300">
                    HD
                  </span>
                  <span>Video download quality</span>
                </div>

                <div className="flex items-center gap-2.5">
                  {(['480P', '1080P'] as const).map((q) => {
                    const isSelected = selectedQuality === q;
                    return (
                      <button
                        key={q}
                        onClick={() => setSelectedQuality(q)}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition active:scale-95 text-center ${
                          isSelected
                            ? 'border border-[#00df82] text-[#00df82] bg-emerald-500/10'
                            : 'bg-[#292c3d] text-zinc-400 hover:text-zinc-200 border border-transparent'
                        }`}
                      >
                        {q}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Resource Items List */}
          <div className="space-y-3 pt-1">
            {isTv ? (
              /* TV Series Episodes List */
              tvEpisodeItems.map((ep, idx) => {
                const isSelected = selectedTvIds.includes(ep.id);
                return (
                  <div
                    key={`cut-ep-${ep.id}-${idx}`}
                    onClick={() => handleToggleTv(ep.id)}
                    className="flex items-center gap-3.5 py-1.5 cursor-pointer select-none group"
                  >
                    {/* Circle Radio/Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-[#00df82] text-black shadow-sm'
                          : 'border-2 border-zinc-500 group-hover:border-zinc-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Episode info */}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">
                        {ep.title}
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{ep.size}</span>
                        <span>•</span>
                        <span className="truncate">Uploaded by {ep.uploader}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Movie Qualities List */
              movieResources.map((res, idx) => {
                const isSelected = selectedMovieIds.includes(res.id);
                return (
                  <div
                    key={`cut-res-${res.id}-${idx}`}
                    onClick={() => handleToggleMovie(res.id)}
                    className="flex items-center gap-3.5 py-2 cursor-pointer select-none group"
                  >
                    {/* Circle Radio/Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'bg-[#00df82] text-black shadow-sm'
                          : 'border-2 border-zinc-500 group-hover:border-zinc-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Movie info */}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">
                        {res.title}
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{res.size}</span>
                        <span>•</span>
                        <span className="truncate">Uploaded by {res.uploader}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Bar: Select All on left, Download Button on right */}
        <div className="p-4 border-t border-white/5 bg-[#181a24] flex items-center justify-between gap-4">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer select-none"
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition ${
                isAllSelected
                  ? 'bg-[#00df82] text-black'
                  : 'border-2 border-zinc-500'
              }`}
            >
              {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
            <span>Select All</span>
          </button>

          <button
            onClick={handleDownloadClick}
            disabled={totalSelectedMb <= 0}
            className="flex-1 flex items-center justify-center gap-2 bg-[#00df82] hover:bg-[#00c975] disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold text-sm py-3 px-5 rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-98 cursor-pointer"
          >
            <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
            <span>Download ({formatTotalSize(totalSelectedMb)}) • Save to Device</span>
          </button>
        </div>
      </div>
    </div>
  );
};

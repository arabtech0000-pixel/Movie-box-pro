import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  ListVideo,
  RefreshCw,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ArrowDownToLine,
  Film,
  Tv,
} from 'lucide-react';
import { MediaItem } from '../types';
import { searchMedia } from '../services/tmdb';

interface VideoPlayerModalProps {
  item: MediaItem;
  initialEpisode?: number;
  initialSeason?: number;
  onClose: () => void;
  onDownload?: (item: MediaItem, options?: { season?: number; episode?: number }) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  item,
  initialEpisode = 1,
  initialSeason = 1,
  onClose,
  onDownload,
}) => {
  // Parse initial TMDB ID
  const parseTmdbId = (media: MediaItem): number => {
    if (media.tmdbId && !isNaN(media.tmdbId) && media.tmdbId > 0) {
      return media.tmdbId;
    }
    const match = media.id.match(/tmdb-(?:movie|tv)-(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const digitMatch = media.id.match(/\d{3,}/);
    if (digitMatch) {
      const parsed = parseInt(digitMatch[0], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return media.type === 'tv' ? 66732 : 872585;
  };

  const [resolvedTmdbId, setResolvedTmdbId] = useState<number>(() => parseTmdbId(item));
  const mediaType = item.type === 'tv' ? 'tv' : 'movie';

  const [season, setSeason] = useState<number>(initialSeason);
  const [episode, setEpisode] = useState<number>(initialEpisode);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Local Device File Playback State
  const [localVideoUrl] = useState<string | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Dynamically resolve TMDB ID by title if tmdbId was not numeric
  useEffect(() => {
    let isMounted = true;
    const initialId = parseTmdbId(item);
    setResolvedTmdbId(initialId);

    if ((!item.tmdbId || isNaN(item.tmdbId)) && item.title) {
      searchMedia(item.title)
        .then((res) => {
          if (isMounted && res.length > 0 && res[0].tmdbId) {
            setResolvedTmdbId(res[0].tmdbId);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [item]);

  // Sync initial props
  useEffect(() => {
    setSeason(initialSeason || 1);
    setEpisode(initialEpisode || 1);
    setIframeKey((prev) => prev + 1);
    setIsLoading(true);
  }, [initialSeason, initialEpisode, item.id]);

  // Total Seasons calculation
  const totalSeasons = Math.max(
    item.numberOfSeasons || 1,
    item.seasons?.length || 1,
    season
  );

  // Total Episodes calculation for currently selected season
  const currentSeasonObj = item.seasons?.find((s) => s.season_number === season);
  const totalEpisodesForSeason =
    currentSeasonObj?.episode_count ||
    item.episodesCount ||
    (item.episodes && item.episodes.length > 0 ? item.episodes.length : 24);

  // VidSrc.sbs primary verified stream URL
  const streamUrl =
    mediaType === 'tv'
      ? `https://vidsrc.sbs/embed/tv/${resolvedTmdbId}/${season}/${episode}`
      : `https://vidsrc.sbs/embed/movie/${resolvedTmdbId}`;

  // Mobile / Browser Back Button Handling
  useEffect(() => {
    window.history.pushState({ modal: 'video_player_modal' }, '');
    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current
          .requestFullscreen?.()
          .then(() => {
            if ('orientation' in window.screen && 'lock' in window.screen.orientation) {
              (window.screen.orientation as any).lock('landscape').catch(() => {});
            }
          })
          .catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  };

  const handleSelectEpisode = (targetEpisode: number, targetSeason?: number) => {
    const nextSeason = targetSeason ?? season;
    setSeason(nextSeason);
    setEpisode(targetEpisode);
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
    setShowEpisodesDrawer(false);
  };

  const handlePrevEpisode = () => {
    if (episode > 1) {
      handleSelectEpisode(episode - 1);
    } else if (season > 1) {
      const prevSeason = season - 1;
      const prevSeasonObj = item.seasons?.find((s) => s.season_number === prevSeason);
      const prevSeasonMaxEp = prevSeasonObj?.episode_count || 12;
      handleSelectEpisode(prevSeasonMaxEp, prevSeason);
    }
  };

  const handleNextEpisode = () => {
    if (episode < totalEpisodesForSeason) {
      handleSelectEpisode(episode + 1);
    } else if (season < totalSeasons) {
      handleSelectEpisode(1, season + 1);
    }
  };

  return (
    <div
      id="video-player-modal"
      className="fixed inset-0 z-50 bg-[#06070d] flex flex-col overflow-hidden select-none"
    >
      {/* Clean, Non-Overlapping Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#090b14]/95 backdrop-blur-md border-b border-white/10 px-3.5 py-2.5 pt-[max(env(safe-area-inset-top,0px),12px)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Close Button + Single Clean Title/Subtitle */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate leading-tight">
                {item.title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                {mediaType === 'tv' ? (
                  <span className="text-[11px] font-semibold text-[#00df82] flex items-center gap-1">
                    <Tv className="w-3 h-3" /> Season {season} • Episode {episode}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                    <Film className="w-3 h-3" /> {item.year || 'Full Movie'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {mediaType === 'tv' && (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5">
                <button
                  onClick={handlePrevEpisode}
                  disabled={season === 1 && episode === 1}
                  className="p-1.5 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  title="Previous Episode"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold px-1.5 text-white">
                  E{episode}
                </span>
                <button
                  onClick={handleNextEpisode}
                  className="p-1.5 text-zinc-300 hover:text-white transition cursor-pointer"
                  title="Next Episode"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {onDownload && (
              <button
                onClick={() =>
                  onDownload(item, {
                    season,
                    episode,
                  })
                }
                className="w-8 h-8 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-[#00df82] border border-emerald-500/40 flex items-center justify-center transition active:scale-95 cursor-pointer shadow-sm"
                title="Download for offline"
              >
                <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}

            <button
              onClick={handleReload}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Reload Stream"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00df82]' : ''}`} />
            </button>

            <button
              onClick={handleToggleFullscreen}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-[#00df82]" />
            </button>

            {mediaType === 'tv' && (
              <button
                onClick={() => setShowEpisodesDrawer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#00df82] hover:bg-[#00c975] text-black transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <ListVideo className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Episodes</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Video Stream Container */}
      <main className="w-full max-w-5xl mx-auto p-2 sm:p-4 flex-1 flex flex-col justify-center items-center overflow-hidden">
        <div
          ref={playerContainerRef}
          className="relative aspect-video w-full max-h-[calc(100vh-100px)] rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl"
        >
          {localVideoUrl ? (
            <video
              src={localVideoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            >
              Your browser does not support local HTML5 video playback.
            </video>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 z-20 bg-zinc-950 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-10 h-10 border-4 border-[#00df82]/20 border-t-[#00df82] rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-zinc-300">
                    Loading {mediaType === 'tv' ? `Season ${season} Episode ${episode}` : item.title}...
                  </p>
                </div>
              )}

              <iframe
                key={`${iframeKey}-${season}-${episode}-${resolvedTmdbId}`}
                src={streamUrl}
                title={`${item.title} ${mediaType === 'tv' ? `S${season}E${episode}` : ''}`}
                className="w-full h-full border-0"
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setIsLoading(false)}
              />
            </>
          )}
        </div>
      </main>

      {/* Season & Episode Drawer Modal */}
      {showEpisodesDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#12141e] border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl p-4 max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <ListVideo className="w-4 h-4 text-[#00df82]" />
                <h4 className="text-sm font-bold text-white">Select Season & Episode</h4>
              </div>
              <button
                onClick={() => setShowEpisodesDrawer(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Season Selector Bar */}
            <div className="pt-3 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {Array.from({ length: totalSeasons }).map((_, idx) => {
                  const sNum = idx + 1;
                  const isSelectedSeason = season === sNum;
                  return (
                    <button
                      key={`drawer-season-${sNum}`}
                      onClick={() => {
                        setSeason(sNum);
                        setEpisode(1);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        isSelectedSeason
                          ? 'bg-[#00df82] text-black shadow-md shadow-emerald-500/20'
                          : 'bg-[#181b26] text-zinc-400 hover:text-white hover:bg-[#202433]'
                      }`}
                    >
                      Season {sNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Episode Cards Grid */}
            <div className="overflow-y-auto py-3 space-y-2 flex-1 no-scrollbar">
              {Array.from({ length: totalEpisodesForSeason }).map((_, i) => {
                const epNum = i + 1;
                const isCurr = episode === epNum;
                return (
                  <button
                    key={`ep-item-${season}-${epNum}`}
                    onClick={() => handleSelectEpisode(epNum)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition cursor-pointer ${
                      isCurr
                        ? 'bg-emerald-500/15 border border-[#00df82]/50 text-[#00df82]'
                        : 'bg-[#181b26] hover:bg-[#202433] text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs ${
                          isCurr ? 'bg-[#00df82] text-black' : 'bg-white/5 text-zinc-400'
                        }`}
                      >
                        {epNum}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">
                          Episode {epNum}: {item.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          Season {season} • Episode {epNum}
                        </div>
                      </div>
                    </div>
                    {isCurr ? (
                      <span className="text-[10px] font-bold bg-[#00df82] text-black px-2 py-0.5 rounded">
                        PLAYING
                      </span>
                    ) : (
                      <Play className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

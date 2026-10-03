import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  ArrowDownToLine,
  Bookmark,
  BookmarkCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  Film,
  Globe,
  Loader2,
  Tv,
  Volume2,
  VolumeX,
  Maximize2,
  PictureInPicture2,
  ZoomIn,
  HelpCircle,
  Captions,
  Users,
  Clapperboard,
  Layers,
  Sparkles,
  Building,
  DollarSign,
  Tag,
  Compass,
  Flame,
  ExternalLink,
} from 'lucide-react';
import {
  MediaItem,
  TmdbCastMember,
  TmdbCrewMember,
  TmdbEpisode,
  TmdbVideo,
} from '../types';
import {
  getMovieDetails,
  getTvDetails,
  getTvSeasonDetails,
  getTmdbImageUrl,
  getMediaVideos,
  getSimilarMedia,
  getRecommendedMedia,
  getMediaByGenre,
  formatCurrency,
  formatRuntime,
} from '../services/tmdb';
import { ActorDetailModal } from './ActorDetailModal';
import { FullCastCrewSheet } from './FullCastCrewSheet';
import { DownloadCutInSheet } from './DownloadCutInSheet';

interface MediaDetailModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlay: (item: MediaItem, episode?: number, season?: number) => void;
  onDownload: (
    item: MediaItem,
    options?: { quality?: string; season?: number; episode?: number }
  ) => void;
  isBookmarked: boolean;
  onToggleBookmark: (item: MediaItem) => void;
  isDownloaded: boolean;
  onOpenItem?: (item: MediaItem) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item: initialItem,
  onClose,
  onPlay,
  onDownload,
  isBookmarked,
  onToggleBookmark,
  isDownloaded,
  onOpenItem,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [item, setItem] = useState<MediaItem>(initialItem);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);

  // Recommendations and Similar titles state for "Others You Can Watch"
  const [recommendedItems, setRecommendedItems] = useState<MediaItem[]>([]);
  const [similarItems, setSimilarItems] = useState<MediaItem[]>([]);
  const [genreRelatedItems, setGenreRelatedItems] = useState<MediaItem[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  // TV episodes
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<TmdbEpisode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  // Sub-modals & sheets
  const [selectedPerson, setSelectedPerson] = useState<{ id: number; name: string } | null>(null);
  const [isFullCreditsOpen, setIsFullCreditsOpen] = useState(false);
  const [fullCreditsInitialTab, setFullCreditsInitialTab] = useState<'cast' | 'crew'>('cast');
  const [isPosterLightboxOpen, setIsPosterLightboxOpen] = useState(false);
  const [isDownloadCutInOpen, setIsDownloadCutInOpen] = useState(false);
  const [isSourceHelpOpen, setIsSourceHelpOpen] = useState(false);

  // Player controls state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [playerProgress, setPlayerProgress] = useState(25); // percentage
  const [currentTimeStr, setCurrentTimeStr] = useState('00:15');
  const [durationStr, setDurationStr] = useState('02:18');

  // Selected audio track
  const [selectedAudio, setSelectedAudio] = useState('Original Audio');

  // Phone / Browser Back Button Listener for MediaDetailModal
  useEffect(() => {
    window.history.pushState({ modal: 'media_detail_modal' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);
  const audioOptions = useMemo(() => {
    if (item.type === 'tv') {
      return ['Original Audio', 'English dub', 'Hindi dub', 'pt dub', 'esla dub'];
    }
    return ['Original Audio', 'esla dub', 'English dub', 'Hindi dub', 'French dub'];
  }, [item.type]);

  // When switching item, reset scroll to top
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [item.id]);

  // Fetch complete details whenever initialItem changes
  useEffect(() => {
    setItem(initialItem);
    let isMounted = true;

    // Check if we need to load full details (cast, crew, similar, etc.)
    const needsDetails =
      !initialItem.cast ||
      initialItem.cast.length === 0 ||
      !initialItem.crew ||
      initialItem.crew.length === 0 ||
      !initialItem.productionCompanies;

    if (needsDetails) {
      setIsLoadingDetails(true);
      const targetId = initialItem.tmdbId || initialItem.id;
      const fetcher = initialItem.type === 'tv' ? getTvDetails : getMovieDetails;

      fetcher(targetId, initialItem.title)
        .then((fullData) => {
          if (isMounted) {
            setItem((prev) => ({
              ...prev,
              ...fullData,
              videoUrl: prev.videoUrl || fullData.videoUrl,
              fileSize: prev.fileSize || fullData.fileSize,
            }));
            if (fullData.recommendations && fullData.recommendations.length > 0) {
              setRecommendedItems(fullData.recommendations);
            }
            if (fullData.similar && fullData.similar.length > 0) {
              setSimilarItems(fullData.similar);
            }
            setIsLoadingDetails(false);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch extra details from TMDB:', err);
          if (isMounted) setIsLoadingDetails(false);
        });
    } else {
      if (initialItem.recommendations && initialItem.recommendations.length > 0) {
        setRecommendedItems(initialItem.recommendations);
      }
      if (initialItem.similar && initialItem.similar.length > 0) {
        setSimilarItems(initialItem.similar);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [initialItem]);

  // Fetch trailers & videos
  useEffect(() => {
    if (!item.videos || item.videos.length === 0) {
      const targetId = item.tmdbId || item.id;
      if (targetId) {
        getMediaVideos(targetId, item.type)
          .then((vids) => {
            if (vids && vids.length > 0) {
              setItem((prev) => ({ ...prev, videos: vids }));
            }
          })
          .catch((err) => {
            console.warn('Could not fetch extra videos:', err);
          });
      }
    }
  }, [item.id, item.tmdbId, item.type, item.videos]);

  // Fetch "Others You Can Watch" fallback/supplementary data
  useEffect(() => {
    let isMounted = true;
    const targetId = item.tmdbId || item.id;

    async function loadOthersYouCanWatch() {
      setIsLoadingRelated(true);
      try {
        const promises = [];

        // 1. Recommended
        if (recommendedItems.length === 0 && targetId) {
          promises.push(
            getRecommendedMedia(targetId, item.type)
              .then((res) => {
                if (isMounted && res.length > 0) setRecommendedItems(res);
              })
              .catch(() => {})
          );
        }

        // 2. Similar
        if (similarItems.length === 0 && targetId) {
          promises.push(
            getSimilarMedia(targetId, item.type)
              .then((res) => {
                if (isMounted && res.length > 0) setSimilarItems(res);
              })
              .catch(() => {})
          );
        }

        // 3. Genre related
        promises.push(
          getMediaByGenre(28, item.type)
            .then((res) => {
              if (isMounted && res.length > 0) {
                setGenreRelatedItems(res.filter((r) => r.id !== item.id).slice(0, 12));
              }
            })
            .catch(() => {})
        );

        await Promise.allSettled(promises);
      } finally {
        if (isMounted) setIsLoadingRelated(false);
      }
    }

    loadOthersYouCanWatch();

    return () => {
      isMounted = false;
    };
  }, [item.id, item.tmdbId, item.type]);

  // Fetch TV season episodes
  useEffect(() => {
    if (item.type === 'tv') {
      let isMounted = true;
      setIsLoadingEpisodes(true);
      const tvId = item.tmdbId || item.id;

      getTvSeasonDetails(tvId, selectedSeason)
        .then((eps) => {
          if (isMounted && Array.isArray(eps)) {
            setEpisodes(eps);
          }
        })
        .catch((err) => {
          console.warn('Could not load season details:', err);
        })
        .finally(() => {
          if (isMounted) setIsLoadingEpisodes(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [item.id, item.tmdbId, item.type, selectedSeason]);

  // Find trailer for auto-play banner player
  const activeTrailer = useMemo(() => {
    if (!item.videos || item.videos.length === 0) return null;
    return (
      item.videos.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
      ) ||
      item.videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
      item.videos.find((v) => v.site === 'YouTube' && v.type === 'Teaser') ||
      item.videos.find((v) => v.site === 'YouTube') ||
      null
    );
  }, [item.videos]);

  const allCast: TmdbCastMember[] = useMemo(() => item.cast || [], [item.cast]);
  const allCrew: TmdbCrewMember[] = useMemo(() => item.crew || [], [item.crew]);

  // Extract key directors, writers, producers
  const keyDirectors = useMemo(() => {
    return allCrew.filter((c) => c.job === 'Director' || c.department === 'Directing');
  }, [allCrew]);

  const keyWriters = useMemo(() => {
    return allCrew.filter(
      (c) =>
        c.job === 'Screenplay' ||
        c.job === 'Writer' ||
        c.job === 'Story' ||
        c.department === 'Writing'
    );
  }, [allCrew]);

  const keyProducers = useMemo(() => {
    return allCrew.filter(
      (c) =>
        c.job === 'Producer' ||
        c.job === 'Executive Producer' ||
        c.department === 'Production'
    );
  }, [allCrew]);

  const productionCountry = useMemo(() => {
    if (item.productionCountries && item.productionCountries.length > 0) {
      return item.productionCountries.map((c) => c.name).join(', ');
    }
    if (item.originalLanguage === 'ja') return 'Japan';
    if (item.originalLanguage === 'ko') return 'South Korea';
    if (item.originalLanguage === 'fr') return 'France';
    if (item.originalLanguage === 'es') return 'Spain';
    if (item.originalLanguage === 'en') return 'United States';
    return 'United States';
  }, [item.productionCountries, item.originalLanguage]);

  const handleSelectMovie = (newMedia: MediaItem) => {
    if (onOpenItem) {
      onOpenItem(newMedia);
    } else {
      setItem(newMedia);
    }
  };

  // Movie resource items for the Resources Detector cards
  const movieResourceCards = useMemo(() => {
    const formattedRuntime = item.duration || formatRuntime(item.runtimeMinutes) || '01:55:39';
    return [
      {
        id: '360p',
        title: `360P ${item.title}`,
        size: '193.7MB',
        duration: formattedRuntime,
        uploader: 'Timini',
      },
      {
        id: '480p',
        title: `480P ${item.title}`,
        size: '245.8MB',
        duration: formattedRuntime,
        uploader: 'Timini',
      },
      {
        id: '1080p',
        title: `1080P ${item.title}`,
        size: '1.1GB',
        duration: formattedRuntime,
        uploader: 'babu ki ABCD😂😂',
      },
      {
        id: '720p',
        title: `720P ${item.title}`,
        size: '680.4MB',
        duration: formattedRuntime,
        uploader: 'ednasale',
      },
    ];
  }, [item.title, item.duration, item.runtimeMinutes]);

  // TV episode resources for TV series
  const tvResourceCards = useMemo(() => {
    const uploaders = [
      'user9416103087202',
      'Nancy Ajram',
      'Marie France 🇫🇷',
      'Dr Craze',
      'SAMO ZAEN سامو زين',
    ];
    const items = [];
    const count = episodes.length > 0 ? Math.min(episodes.length, 6) : 5;
    for (let i = 1; i <= count; i++) {
      const epNum = i < 10 ? `0${i}` : `${i}`;
      const mbSize = (55 + (i * 3.7) % 15).toFixed(1);
      items.push({
        id: `ep-${i}`,
        title: `S01 EP${epNum}`,
        size: `${mbSize}MB`,
        duration: '00:24:15',
        uploader: uploaders[(i - 1) % uploaders.length],
      });
    }
    return items;
  }, [episodes]);

  const handleConfirmBatchDownload = (
    downloads: Array<{ title: string; size: string; quality: string; audio: string }>
  ) => {
    downloads.forEach((d) => {
      onDownload(
        {
          ...item,
          title: d.title,
          fileSize: d.size,
        },
        {
          quality: d.quality,
        }
      );
    });
  };

  const displayTitleWithLang =
    item.type === 'tv'
      ? `${item.title} [English]`
      : item.title;

  return (
    <div
      id="media-detail-modal"
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#07080d] flex flex-col max-w-md mx-auto overflow-y-auto overscroll-contain animate-in fade-in duration-200 text-white pb-24 no-scrollbar select-none"
    >
      {/* 1. TOP HEADER BAR */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-md px-3.5 py-2.5 flex items-center justify-between border-b border-white/5 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 hover:text-white transition active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-sm font-semibold text-white truncate pr-2">
            {displayTitleWithLang}
          </h1>
        </div>

        <button
          onClick={() => onToggleBookmark(item)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 hover:text-white transition active:scale-95"
          title="Bookmark"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-[#00df82]" />
          ) : (
            <Bookmark className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* 2. VIDEO / BACKDROP PLAYER BANNER (Auto-playing Trailer / Stream Player) */}
      <div className="relative aspect-video w-full bg-black shrink-0 overflow-hidden group select-none">
        {activeTrailer ? (
          <div className="relative w-full h-full bg-black">
            <iframe
              key={`${activeTrailer.key}-${isMuted}`}
              src={`https://www.youtube.com/embed/${activeTrailer.key}?autoplay=1&mute=${
                isMuted ? 1 : 0
              }&enablejsapi=1&controls=1&playsinline=1&rel=0`}
              title={`${item.title} Official Trailer`}
              className="w-full h-full border-0 pointer-events-auto"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              referrerPolicy="origin"
            />

            {/* Top-Right Mute / Unmute Audio Toggle */}
            <div className="absolute top-2.5 right-2.5 z-30 flex items-center gap-1.5 pointer-events-auto">
              {isMuted ? (
                <button
                  onClick={() => setIsMuted(false)}
                  className="px-2.5 py-1 rounded-lg bg-black/85 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20 shadow transition active:scale-95 cursor-pointer"
                  title="Unmute trailer audio"
                >
                  <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Unmute</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsMuted(true)}
                  className="px-2.5 py-1 rounded-lg bg-black/85 hover:bg-black text-[#00df82] text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-md border border-[#00df82]/30 shadow transition active:scale-95 cursor-pointer"
                  title="Mute audio"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Muted</span>
                </button>
              )}
            </div>

            {/* Bottom Floating Play Stream Button */}
            <div className="absolute bottom-2.5 right-2.5 z-30 flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => onPlay(item, 1, selectedSeason)}
                className="px-4 py-1.5 rounded-full bg-[#00df82] hover:bg-[#00c975] text-black font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-xl shadow-emerald-500/30 active:scale-95 transition cursor-pointer"
                title="Play Full Stream"
              >
                <Play className="w-4 h-4 fill-black stroke-[3]" />
                <span>Play Full {item.type === 'tv' ? 'Series' : 'Movie'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onPlay(item, 1, selectedSeason)}
            className="relative w-full h-full bg-zinc-950 cursor-pointer"
          >
            <img
              src={item.backdropUrl || item.posterUrl}
              alt={item.title}
              className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition duration-500"
            />
            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-black/40 to-black/30" />

            {/* Centered Single Play Hub */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 z-20">
              <button
                id="banner-play-stream-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(item, 1, selectedSeason);
                }}
                className="flex items-center gap-3 px-7 py-3 rounded-full bg-[#00df82] hover:bg-[#00c975] text-black font-extrabold text-sm sm:text-base shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition cursor-pointer"
                title="Play Stream Now"
              >
                <Play className="w-5 h-5 fill-black stroke-[3]" />
                <span>Play {item.type === 'tv' ? 'Series' : 'Movie'}</span>
              </button>
            </div>

            {/* Bottom Status Pill */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-400 z-20 pointer-events-none">
              <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs font-medium text-white/90">
                {item.type === 'tv' ? 'HD Series' : '1080p Feature Film'}
              </span>
              <span className="bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs text-zinc-300">
                {item.year || '2024'} • {item.rating ? `★ ${item.rating.toFixed(1)}` : 'Top Rated'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. MEDIA HEADER CARD */}
      <div className="p-3.5 space-y-4">
        <div className="flex gap-3.5">
          {/* Left: Mini poster with Zoom In Magnifying Glass Badge */}
          <div
            onClick={() => setIsPosterLightboxOpen(true)}
            className="relative w-22 h-32 rounded-lg overflow-hidden shrink-0 shadow-lg border border-white/10 bg-zinc-900 group cursor-pointer"
          >
            <img
              src={item.posterUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            {/* Magnifier Glass Zoom badge in bottom-right */}
            <div
              className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/80 backdrop-blur-xs border border-white/25 flex items-center justify-center text-white shadow-md group-hover:bg-[#00df82] group-hover:text-black transition"
              title="View full image"
            >
              <ZoomIn className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>

          {/* Right: Title, rating/year/duration, country/genre, subtitles */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight line-clamp-2">
                {displayTitleWithLang}
              </h2>

              {/* Rating / Release Date / Runtime */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-300 mt-1.5 flex-wrap">
                <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{item.rating ? item.rating.toFixed(1) : '7.8'}</span>
                </span>
                {item.voteCount && (
                  <span className="text-[10px] text-zinc-400 font-normal">
                    ({item.voteCount.toLocaleString()} votes)
                  </span>
                )}
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-300">{item.releaseDate || item.year || '2024'}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">
                  {item.type === 'tv'
                    ? `${item.numberOfSeasons || 1} Seasons`
                    : item.duration || formatRuntime(item.runtimeMinutes) || '1h 55m'}
                </span>
              </div>

              {/* Country & Genres */}
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1.5 truncate">
                <Film className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">
                  {productionCountry} / {item.genres.slice(0, 3).join(', ') || 'Action'}
                </span>
              </div>
            </div>

            {/* Subtitles row */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-2 truncate">
              <Captions className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate text-zinc-400">
                Subtitles: English, Español, Français, Hindi, Indonesian, Arabic
              </span>
            </div>

            {/* Primary In-Page Action Buttons: Play Stream & Download */}
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/5">
              <button
                id="detail-card-play-btn"
                onClick={() => onPlay(item, 1, selectedSeason)}
                className="w-full flex items-center justify-center gap-2 bg-[#00df82] hover:bg-[#00c975] text-black font-black text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-lg shadow-emerald-500/25 transition active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black stroke-[3]" />
                <span>Play Stream</span>
              </button>

              <button
                id="detail-card-download-btn"
                onClick={() => setIsDownloadCutInOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-[#1b1e2c] hover:bg-[#23273a] text-white border border-white/10 font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
              >
                <ArrowDownToLine className="w-4 h-4 text-[#00df82] stroke-[2.8]" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. AUDIO TRACK SELECTION */}
        <div>
          <h3 className="text-xs font-bold text-white mb-2 tracking-tight">Audio Tracks</h3>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {audioOptions.map((audio) => {
              const isActive = selectedAudio === audio;
              return (
                <button
                  key={audio}
                  onClick={() => setSelectedAudio(audio)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                    isActive
                      ? 'border border-[#00df82] text-[#00df82] bg-emerald-500/10'
                      : 'bg-[#181a24] hover:bg-[#202330] text-zinc-300 border border-transparent'
                  }`}
                >
                  {audio}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. RESOURCES DETECTOR SECTION */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-white tracking-tight">
              Resources Detector
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 relative">
              <span>Source: fzmovies.cms</span>
              <button
                onClick={() => setIsSourceHelpOpen(!isSourceHelpOpen)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {/* Tooltip Help Box */}
              {isSourceHelpOpen && (
                <div className="absolute right-0 top-5 z-50 w-52 bg-[#1f222e] text-zinc-300 text-[10px] p-2.5 rounded-lg shadow-xl border border-white/10 animate-in fade-in">
                  Verified direct high-speed CDN and peer sources for high-definition streaming and offline download.
                </div>
              )}
            </div>
          </div>

          {/* Detected Resource Cards */}
          <div className="space-y-2">
            {item.type === 'tv'
              ? tvResourceCards.map((res, idx) => (
                  <div
                    key={`tv-res-${res.id}-${idx}`}
                    onClick={() => setIsDownloadCutInOpen(true)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#141620] hover:bg-[#1b1e2c] border border-white/5 transition cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="text-xs font-bold text-white group-hover:text-[#00df82] transition truncate">
                        {res.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{res.size}</span>
                        <span>•</span>
                        <span>{res.duration}</span>
                        <span>•</span>
                        <span className="truncate">Uploaded by {res.uploader}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDownloadCutInOpen(true);
                      }}
                      className="flex items-center gap-1 text-[#00df82] hover:text-[#00c975] text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition shrink-0 active:scale-95"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Download</span>
                    </button>
                  </div>
                ))
              : movieResourceCards.map((res, idx) => (
                  <div
                    key={`mov-res-${res.id}-${idx}`}
                    onClick={() => setIsDownloadCutInOpen(true)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#141620] hover:bg-[#1b1e2c] border border-white/5 transition cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="text-xs font-bold text-white group-hover:text-[#00df82] transition truncate">
                        {res.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{res.size}</span>
                        <span>•</span>
                        <span>{res.duration}</span>
                        <span>•</span>
                        <span className="truncate">Uploaded by {res.uploader}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDownloadCutInOpen(true);
                      }}
                      className="flex items-center gap-1 text-[#00df82] hover:text-[#00c975] text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition shrink-0 active:scale-95"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
          </div>
        </div>

        {/* 6. STORYLINE, SYNOPSIS & TAGLINE */}
        <div className="bg-[#12141c] p-3.5 rounded-xl border border-white/5 space-y-2 mt-2">
          {item.tagline && (
            <div className="text-xs italic text-[#00df82] border-l-2 border-[#00df82] pl-2 py-0.5">
              "{item.tagline}"
            </div>
          )}

          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Storyline
          </h3>
          <p
            className={`text-xs text-zinc-300 leading-relaxed transition-all ${
              !isOverviewExpanded && item.synopsis.length > 220 ? 'line-clamp-3' : ''
            }`}
          >
            {item.synopsis || 'An exciting motion picture filled with action, drama and memorable characters.'}
          </p>
          {item.synopsis && item.synopsis.length > 220 && (
            <button
              onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
              className="text-xs font-bold text-[#00df82] hover:underline pt-0.5 inline-block"
            >
              {isOverviewExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>

        {/* 7. FULL CAST & CREW SECTION */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00df82]" />
              <h3 className="text-xs font-bold text-white">Cast</h3>
              <span className="text-[10px] text-zinc-400">({allCast.length || 'Featured'})</span>
            </div>

            {(allCast.length > 0 || allCrew.length > 0) && (
              <button
                onClick={() => {
                  setFullCreditsInitialTab('cast');
                  setIsFullCreditsOpen(true);
                }}
                className="text-xs font-semibold text-[#00df82] hover:underline flex items-center gap-0.5"
              >
                <span>View All ({allCast.length + allCrew.length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {isLoadingDetails && allCast.length === 0 ? (
            <div className="py-6 flex items-center justify-center gap-2 text-zinc-400 text-xs">
              <Loader2 className="w-4 h-4 text-[#00df82] animate-spin" />
              <span>Loading cast & crew credits...</span>
            </div>
          ) : allCast.length > 0 ? (
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {allCast.slice(0, 12).map((actor, idx) => (
                <div
                  key={`cast-${actor.id}-${actor.order ?? idx}-${idx}`}
                  onClick={() => setSelectedPerson({ id: actor.id, name: actor.name })}
                  className="w-20 flex-shrink-0 cursor-pointer group"
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900 border border-white/5 group-hover:ring-1 group-hover:ring-[#00df82] transition shadow-md">
                    <img
                      src={getTmdbImageUrl(actor.profile_path, 'w185')}
                      alt={actor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-white mt-1 truncate group-hover:text-[#00df82]">
                    {actor.name}
                  </p>
                  <p className="text-[9px] text-zinc-400 truncate">
                    {actor.character || 'Self'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">No cast details available.</p>
          )}

          {/* Key Crew Members (Directors, Writers, Producers) */}
          {allCrew.length > 0 && (
            <div className="bg-[#12141c] p-3 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <Clapperboard className="w-3.5 h-3.5 text-[#00df82]" />
                  Key Crew & Filmmakers
                </span>
                <button
                  onClick={() => {
                    setFullCreditsInitialTab('crew');
                    setIsFullCreditsOpen(true);
                  }}
                  className="text-[11px] text-[#00df82] hover:underline"
                >
                  Full Crew
                </button>
              </div>

              {keyDirectors.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 w-20 shrink-0 font-medium">Director:</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {keyDirectors.slice(0, 3).map((d, idx) => (
                      <span
                        key={`dir-${d.id}-${idx}`}
                        onClick={() => setSelectedPerson({ id: d.id, name: d.name })}
                        className="text-white hover:text-[#00df82] cursor-pointer font-medium"
                      >
                        {d.name}{idx < Math.min(keyDirectors.length, 3) - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {keyWriters.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 w-20 shrink-0 font-medium">Writer:</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {keyWriters.slice(0, 3).map((w, idx) => (
                      <span
                        key={`writer-${w.id}-${idx}`}
                        onClick={() => setSelectedPerson({ id: w.id, name: w.name })}
                        className="text-white hover:text-[#00df82] cursor-pointer font-medium"
                      >
                        {w.name}{idx < Math.min(keyWriters.length, 3) - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {keyProducers.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-zinc-400 w-20 shrink-0 font-medium">Producer:</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {keyProducers.slice(0, 3).map((p, idx) => (
                      <span
                        key={`prod-${p.id}-${idx}`}
                        onClick={() => setSelectedPerson({ id: p.id, name: p.name })}
                        className="text-white hover:text-[#00df82] cursor-pointer font-medium"
                      >
                        {p.name}{idx < Math.min(keyProducers.length, 3) - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 8. DETAILED MOVIE SPECIFICATIONS & DESCRIPTIONS */}
        <div className="bg-[#12141c] p-3.5 rounded-xl border border-white/5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[#00df82]" />
            <span>Movie Details & Information</span>
          </h3>

          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Original Title</span>
              <span className="text-zinc-200 font-medium">{item.originalTitle || item.title}</span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Status</span>
              <span className="text-emerald-400 font-medium">{item.status || 'Released'}</span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Release Date</span>
              <span className="text-zinc-200 font-medium">{item.releaseDate || item.year || '2024'}</span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Duration / Runtime</span>
              <span className="text-zinc-200 font-medium">
                {item.type === 'tv'
                  ? `${item.numberOfSeasons || 1} Seasons`
                  : item.duration || formatRuntime(item.runtimeMinutes) || '1h 55m'}
              </span>
            </div>

            {item.budget && item.budget > 0 ? (
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Budget</span>
                <span className="text-zinc-200 font-medium">{formatCurrency(item.budget)}</span>
              </div>
            ) : null}

            {item.revenue && item.revenue > 0 ? (
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Box Office / Revenue</span>
                <span className="text-emerald-400 font-medium">{formatCurrency(item.revenue)}</span>
              </div>
            ) : null}

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Origin Country</span>
              <span className="text-zinc-200 font-medium">{productionCountry}</span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Original Language</span>
              <span className="text-zinc-200 font-medium uppercase">{item.originalLanguage || 'English (EN)'}</span>
            </div>
          </div>

          {/* Production Companies */}
          {item.productionCompanies && item.productionCompanies.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-1.5">
                Production Companies & Studios
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.productionCompanies.map((comp, idx) => (
                  <span
                    key={`comp-${comp.id}-${idx}`}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] text-zinc-300 font-medium"
                  >
                    {comp.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords / Topic Tags */}
          {item.keywords && item.keywords.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <span className="text-zinc-500 block text-[10px] uppercase font-semibold mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#00df82]" />
                <span>Tags & Keywords</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {item.keywords.slice(0, 8).map((kw, idx) => (
                  <span
                    key={`kw-${kw.id}-${idx}`}
                    className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-[#00df82] font-semibold"
                  >
                    #{kw.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 9. TV SEASONS BREAKDOWN (If series) */}
        {item.type === 'tv' && (
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#00df82]" />
                <span>Episodes & Seasons</span>
              </h3>

              {item.seasons && item.seasons.length > 1 ? (
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="bg-[#171a28] text-white text-xs font-semibold px-2 py-0.5 rounded border border-white/10 outline-none"
                >
                  {item.seasons.map((s, idx) => (
                    <option key={`season-${s.id}-${s.season_number}-${idx}`} value={s.season_number}>
                      {s.name} ({s.episode_count} eps)
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-zinc-400">Season {selectedSeason}</span>
              )}
            </div>

            {isLoadingEpisodes ? (
              <div className="py-4 flex justify-center items-center gap-2 text-xs text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#00df82]" />
                <span>Fetching episodes...</span>
              </div>
            ) : episodes.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar pr-1">
                {episodes.map((ep, idx) => (
                  <div
                    key={`ep-${ep.id || ep.episode_number}-${idx}`}
                    onClick={() => onPlay(item, ep.episode_number, selectedSeason)}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#141620] hover:bg-[#1a1d2c] cursor-pointer transition border border-white/5 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        <img
                          src={getTmdbImageUrl(
                            ep.still_path,
                            'w342',
                            item.backdropUrl || item.posterUrl
                          )}
                          alt={ep.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-3 h-3 fill-white text-white" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate group-hover:text-[#00df82]">
                          E{ep.episode_number}: {ep.name}
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>{ep.runtime ? `${ep.runtime}m` : '45m'}</span>
                          {ep.vote_average ? (
                            <span className="text-[#00df82]">★ {ep.vote_average.toFixed(1)}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDownloadCutInOpen(true);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-[#00df82] rounded-lg transition"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar pr-1">
                {Array.from({ length: item.episodesCount || (item.seasons?.[0]?.episode_count) || 12 }).map((_, idx) => {
                  const epNum = idx + 1;
                  return (
                    <div
                      key={`ep-fallback-${epNum}`}
                      onClick={() => onPlay(item, epNum, selectedSeason)}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#141620] hover:bg-[#1a1d2c] cursor-pointer transition border border-white/5 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#00df82]/10 border border-[#00df82]/20 flex items-center justify-center font-bold text-xs text-[#00df82] shrink-0">
                          {epNum}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white truncate group-hover:text-[#00df82]">
                            Episode {epNum}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Season {selectedSeason} • Episode {epNum}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#00df82] bg-emerald-500/10 px-2 py-0.5 rounded">
                          PLAY
                        </span>
                        <Play className="w-3.5 h-3.5 text-[#00df82] fill-[#00df82]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 10. CATEGORY OF OTHERS YOU CAN WATCH (Bottom of the page) */}
        <div className="pt-4 border-t border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00df82]" />
              <span>Others You Can Watch</span>
            </h3>
            <span className="text-[11px] text-zinc-400">Curated recommendations</span>
          </div>

          {/* Category Shelf 1: Recommended For You */}
          {recommendedItems.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#00df82]" />
                  <span>Recommended For You</span>
                </h4>
              </div>

              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {recommendedItems.map((rec, idx) => (
                  <div
                    key={`rec-${rec.id}-${idx}`}
                    onClick={() => handleSelectMovie(rec)}
                    className="flex-shrink-0 w-28 group cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:ring-2 group-hover:ring-[#00df82]/60 transition shadow-md">
                      <img
                        src={rec.posterUrl}
                        alt={rec.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {rec.rating !== undefined && (
                        <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-[#00df82] font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          ★ {rec.rating.toFixed(1)}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(rec);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white/80 hover:text-[#00df82] transition"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h5 className="text-xs font-medium text-zinc-200 mt-1.5 truncate group-hover:text-white">
                      {rec.title}
                    </h5>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {rec.year ? `${rec.year} • ` : ''}
                      {rec.genres?.slice(0, 1).join('') || rec.category}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Shelf 2: More Like This (Similar Titles) */}
          {similarItems.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-[#00df82]" />
                  <span>More Like This</span>
                </h4>
              </div>

              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {similarItems.map((sim, idx) => (
                  <div
                    key={`sim-${sim.id}-${idx}`}
                    onClick={() => handleSelectMovie(sim)}
                    className="flex-shrink-0 w-28 group cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:ring-2 group-hover:ring-[#00df82]/60 transition shadow-md">
                      <img
                        src={sim.posterUrl}
                        alt={sim.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {sim.rating !== undefined && (
                        <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-[#00df82] font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          ★ {sim.rating.toFixed(1)}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(sim);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white/80 hover:text-[#00df82] transition"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h5 className="text-xs font-medium text-zinc-200 mt-1.5 truncate group-hover:text-white">
                      {sim.title}
                    </h5>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {sim.year ? `${sim.year} • ` : ''}
                      {sim.genres?.slice(0, 1).join('') || sim.category}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Shelf 3: Popular in this genre */}
          {genreRelatedItems.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                  <Film className="w-3.5 h-3.5 text-[#00df82]" />
                  <span>Popular in {item.genres[0] || 'Movies'}</span>
                </h4>
              </div>

              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {genreRelatedItems.map((genItem, idx) => (
                  <div
                    key={`gen-${genItem.id}-${idx}`}
                    onClick={() => handleSelectMovie(genItem)}
                    className="flex-shrink-0 w-28 group cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:ring-2 group-hover:ring-[#00df82]/60 transition shadow-md">
                      <img
                        src={genItem.posterUrl}
                        alt={genItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {genItem.rating !== undefined && (
                        <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-[#00df82] font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          ★ {genItem.rating.toFixed(1)}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(genItem);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white/80 hover:text-[#00df82] transition"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h5 className="text-xs font-medium text-zinc-200 mt-1.5 truncate group-hover:text-white">
                      {genItem.title}
                    </h5>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {genItem.year ? `${genItem.year} • ` : ''}
                      {genItem.genres?.slice(0, 1).join('') || genItem.category}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING BOTTOM PILL BUTTONS: "▶ Play Stream" & "↓ Download" */}
      <div className="fixed bottom-4 inset-x-0 flex justify-center gap-2.5 z-40 pointer-events-none px-4 max-w-md mx-auto">
        <button
          onClick={() => onPlay(item, 1, selectedSeason)}
          className="pointer-events-auto flex-1 flex items-center justify-center gap-2 bg-[#00df82] hover:bg-[#00c975] text-black font-extrabold text-sm py-2.5 rounded-full shadow-2xl shadow-emerald-500/40 transition active:scale-95 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-black stroke-[2.8]" />
          <span>Play Stream</span>
        </button>

        <button
          onClick={() => setIsDownloadCutInOpen(true)}
          className="pointer-events-auto flex-1 flex items-center justify-center gap-2 bg-[#1b1e2c] hover:bg-[#23273a] text-white border border-white/10 font-extrabold text-sm py-2.5 rounded-full shadow-xl transition active:scale-95 cursor-pointer"
        >
          <ArrowDownToLine className="w-4 h-4 stroke-[2.8]" />
          <span>Download</span>
        </button>
      </div>

      {/* POSTER LIGHTBOX MODAL */}
      {isPosterLightboxOpen && (
        <div
          onClick={() => setIsPosterLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-sm max-h-[85vh] flex flex-col items-center">
            <button
              onClick={() => setIsPosterLightboxOpen(false)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={item.posterUrl}
              alt={item.title}
              className="max-h-[80vh] w-auto rounded-2xl shadow-2xl border border-white/10 object-contain"
            />
          </div>
        </div>
      )}

      {/* DOWNLOAD CUT-IN SHEET */}
      <DownloadCutInSheet
        isOpen={isDownloadCutInOpen}
        onClose={() => setIsDownloadCutInOpen(false)}
        item={item}
        episodes={episodes}
        onConfirmDownload={handleConfirmBatchDownload}
      />

      {/* ACTOR MODAL */}
      {selectedPerson && (
        <ActorDetailModal
          personId={selectedPerson.id}
          personName={selectedPerson.name}
          onClose={() => setSelectedPerson(null)}
          onSelectMovie={handleSelectMovie}
        />
      )}

      {/* FULL CREDITS SHEET */}
      {isFullCreditsOpen && (
        <FullCastCrewSheet
          movieTitle={item.title}
          cast={allCast}
          crew={allCrew}
          initialTab={fullCreditsInitialTab}
          onClose={() => setIsFullCreditsOpen(false)}
          onSelectPerson={(id, name) => {
            setIsFullCreditsOpen(false);
            setSelectedPerson({ id, name });
          }}
        />
      )}
    </div>
  );
};

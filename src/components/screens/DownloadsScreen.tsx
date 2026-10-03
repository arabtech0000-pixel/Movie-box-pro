import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  ArrowDownToLine,
  Play,
  Trash2,
  Flame,
  Loader2,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { DownloadItem, MediaItem, AdBannerItem } from '../../types';
import { getTrendingMedia, getPopularMovies } from '../../services/tmdb';
import { triggerDeviceDownload, getProviderDownloadData } from '../../services/downloadService';
import { subscribeAdBanners } from '../../services/adService';
import { AdBannerCard } from '../AdBannerCard';

interface DownloadsScreenProps {
  downloads: DownloadItem[];
  onDownloadItem: (item: MediaItem) => void;
  onPlayMedia: (item: MediaItem) => void;
  onOpenTransfer: () => void;
  onRemoveDownload: (id: string) => void;
  onOpenItem?: (item: MediaItem) => void;
}

export const DownloadsScreen: React.FC<DownloadsScreenProps> = ({
  downloads,
  onDownloadItem,
  onPlayMedia,
  onRemoveDownload,
  onOpenItem,
}) => {
  // Real TMDB Free Downloads state
  const [trendingFreeItems, setTrendingFreeItems] = useState<MediaItem[]>([]);
  const [isLoadingTmdb, setIsLoadingTmdb] = useState(true);

  // Real-time Ad Banners state
  const [adBanners, setAdBanners] = useState<AdBannerItem[]>([]);

  useEffect(() => {
    const unsubAds = subscribeAdBanners((banners) => {
      setAdBanners(banners.filter((b) => b.active));
    });
    return () => unsubAds();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadTrendingFree() {
      try {
        // Fetch real trending movies from TMDB
        const results = await getTrendingMedia('movie', 'day');
        if (!isMounted) return;

        if (results && results.length > 0) {
          setTrendingFreeItems(results.slice(0, 12));
        } else {
          // Fallback to popular movies if day trending is empty
          const popular = await getPopularMovies();
          if (isMounted && popular.length > 0) {
            setTrendingFreeItems(popular.slice(0, 12));
          }
        }
      } catch (err) {
        console.warn('Failed to load TMDB trending downloads:', err);
      } finally {
        if (isMounted) setIsLoadingTmdb(false);
      }
    }

    loadTrendingFree();

    return () => {
      isMounted = false;
    };
  }, []);

  // Local device file selection ref
  const localFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImportDeviceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      onPlayMedia({
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        posterUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect width="300" height="450" fill="%231a1c28"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2300df82" font-family="sans-serif" font-size="18" font-weight="bold"%3EDevice Video%3C/text%3E%3C/svg%3E',
        type: 'movie',
        category: 'Local Storage',
        genres: ['Offline'],
        synopsis: `Local device file: ${file.name}`,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    }
  };

  return (
    <div
      id="downloads-screen-view"
      className="flex-1 flex flex-col min-h-0 h-full overflow-hidden text-white"
    >
      {/* Hidden local device file picker */}
      <input
        type="file"
        ref={localFileInputRef}
        accept="video/*,.mp4,.mkv,.webm,.avi"
        onChange={handleImportDeviceFile}
        className="hidden"
      />
      {/* STATIC TOP HEADER: Clean MovieBox Downloads Title */}
      <div className="shrink-0 z-30 bg-[#090a0f]/95 backdrop-blur-md border-b border-white/5 select-none px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[#00df82]">
            <ArrowDownToLine className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-tight">MovieBox Downloads</h1>
            <p className="text-[11px] text-zinc-400">Offline Media Storage & Playback</p>
          </div>
        </div>

        <button
          onClick={() => localFileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00df82] hover:bg-[#00c975] text-black text-xs font-bold transition active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
          title="Play downloaded video file from device"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Device Video</span>
        </button>
      </div>

      {/* SCROLLABLE DOWNLOADS CONTENT: Swipes up smoothly */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar px-4 pt-4 pb-28 overscroll-contain">
        {/* If no downloads in current view, show empty state */}
        {downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#181b28] flex items-center justify-center text-zinc-500 mb-2.5 border border-white/5">
              <ArrowDownToLine className="w-6 h-6 text-[#00df82]" />
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              No active downloads. Browse trending movies below to save offline!
            </p>
            <div className="flex items-center gap-2 justify-center">
              <button
                onClick={() => localFileInputRef.current?.click()}
                className="flex items-center gap-1.5 bg-[#00df82] hover:bg-[#00c975] text-black text-xs font-bold px-4 py-2 rounded-full transition shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Play File from Device Storage</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active / Completed Downloads list */
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
              <span>My Downloaded Media ({downloads.length})</span>
              <button
                onClick={() => localFileInputRef.current?.click()}
                className="text-[10px] bg-[#00df82]/15 text-[#00df82] hover:bg-[#00df82]/25 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30 transition cursor-pointer flex items-center gap-1"
              >
                <FolderOpen className="w-3 h-3" />
                <span>Play File from Device</span>
              </button>
            </div>

            {downloads.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#141622] border border-white/5 shadow-sm hover:border-white/10 transition"
              >
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-12 h-16 object-cover rounded-lg shrink-0 bg-zinc-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <h4 className="text-xs font-bold text-white truncate max-w-[170px] sm:max-w-xs">{item.title}</h4>
                    {item.quality && (
                      <span className="px-1 py-0.2 rounded bg-emerald-500/15 text-[#00df82] text-[9px] font-extrabold">
                        {item.quality}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1 flex-wrap">
                    <span>
                      {item.downloadedSize} / {item.totalSize}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold capitalize">{item.status}</span>
                    {item.speed && (
                      <>
                        <span>•</span>
                        <span className="text-zinc-300 font-mono">{item.speed}</span>
                      </>
                    )}
                  </div>

                  {/* Provider & Device saved metadata */}
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-zinc-400">
                    <span className="text-zinc-400 truncate max-w-[130px]">
                      {item.provider || 'Movie Database'}
                    </span>
                    <span className="text-[#00df82] flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Device Saved
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-[#00df82] h-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Save to Device trigger button */}
                  <button
                    onClick={() => {
                      triggerDeviceDownload(
                        getProviderDownloadData(
                          {
                            id: item.mediaId,
                            title: item.title,
                            posterUrl: item.posterUrl,
                            type: (item.type as any) || 'movie',
                            category: 'Hollywood',
                            genres: [],
                            synopsis: '',
                            fileSize: item.totalSize,
                          },
                          item.quality || '1080P'
                        )
                      );
                    }}
                    title="Save or export to physical device storage"
                    className="p-1.5 text-zinc-400 hover:text-[#00df82] hover:bg-white/5 rounded-lg transition active:scale-95 cursor-pointer"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                  </button>

                  {item.status === 'completed' && (
                    <button
                      onClick={() =>
                        onPlayMedia({
                          id: item.mediaId,
                          title: item.title,
                          posterUrl: item.posterUrl,
                          type: 'movie',
                          category: 'Hollywood',
                          genres: ['Offline'],
                          synopsis: 'Offline downloaded title.',
                        })
                      }
                      className="w-8 h-8 rounded-full bg-[#00df82] text-black flex items-center justify-center shadow hover:scale-105 active:scale-95 transition cursor-pointer"
                      title="Play Offline Video"
                    >
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onRemoveDownload(item.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition active:scale-95 cursor-pointer"
                    title="Remove Download"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* "Download for Free - Trending Now" Shelf */}
        <section className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#00df82]" />
              <span>Download for Free - Trending Movies</span>
            </h2>
            <span className="text-[10px] bg-emerald-500/10 text-[#00df82] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/20">
              Free to Watch
            </span>
          </div>

          {/* Optional Top Ad Banner before grid */}
          {adBanners.length > 0 && (
            <AdBannerCard banners={adBanners} variant="shelf" className="my-3" />
          )}

          {isLoadingTmdb ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#00df82]" />
              <span className="text-xs">Loading trending titles...</span>
            </div>
          ) : trendingFreeItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No trending movies found currently.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {trendingFreeItems.map((item, idx) => (
                <React.Fragment key={`${item.id}-${idx}`}>
                  {/* Insert Ad Banner into movie posters grid after 4th item */}
                  {idx === 4 && adBanners.length > 0 && (
                    <AdBannerCard banners={adBanners} variant="grid" className="my-2" />
                  )}

                  <div className="flex flex-col">
                    {/* Poster Card */}
                    <div
                      onClick={() => onOpenItem && onOpenItem(item)}
                      className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow cursor-pointer group"
                    >
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />

                      {/* TMDB Rating badge bottom-right */}
                      {item.rating !== undefined && (
                        <div className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-[#00df82] font-bold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-[#00df82]" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Small DL icon bottom-left */}
                      <div className="absolute bottom-1 left-1 bg-black/50 backdrop-blur-xs p-1 rounded-full">
                        <ArrowDownToLine className="w-2.5 h-2.5 text-white/90" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onOpenItem && onOpenItem(item)}
                      className="text-[11px] font-semibold text-zinc-200 mt-1 truncate cursor-pointer hover:text-[#00df82] transition"
                    >
                      {item.title}
                    </h3>

                    {/* Green Download Pill Button under each card */}
                    <button
                      onClick={() => onDownloadItem(item)}
                      className="mt-1 flex items-center justify-center gap-1 py-1 rounded-md bg-[#132a1e] hover:bg-[#193a29] text-[#00df82] font-bold text-[10px] border border-emerald-500/30 transition active:scale-95 shadow-xs"
                    >
                      <ArrowDownToLine className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Bottom Ad Banner if available */}
          {adBanners.length > 0 && (
            <AdBannerCard banners={adBanners} variant="shelf" className="mt-5" />
          )}
        </section>
      </div>
    </div>
  );
};


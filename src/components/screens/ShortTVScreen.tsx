import React, { useState, useEffect } from 'react';
import {
  Play,
  ArrowDownToLine,
  Star,
  Flame,
  Award,
  Calendar,
  Loader2,
  Tv,
  Sparkles,
  Layers,
} from 'lucide-react';
import { MediaItem, AdBannerItem } from '../../types';
import {
  getTrendingMedia,
  getTopRatedTv,
  getAiringTodayTv,
  getKoreanDramas,
  getAnimeMedia,
  getMediaByGenre,
} from '../../services/tmdb';
import { subscribeAdBanners } from '../../services/adService';
import { AdBannerCard } from '../AdBannerCard';

interface ShortTVScreenProps {
  onOpenItem?: (item: MediaItem) => void;
  onPlayItem?: (item: MediaItem) => void;
  onDownloadItem?: (item: MediaItem) => void;
  onOpenShortDrama?: (item: any) => void;
}

export const ShortTVScreen: React.FC<ShortTVScreenProps> = ({
  onOpenItem,
  onPlayItem,
  onDownloadItem,
}) => {
  const [topTab, setTopTab] = useState<'Discover' | 'For You'>('Discover');
  const [activeGenre, setActiveGenre] = useState<string>('All');

  const [heroSeries, setHeroSeries] = useState<MediaItem[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  const [trendingSeries, setTrendingSeries] = useState<MediaItem[]>([]);
  const [topRatedSeries, setTopRatedSeries] = useState<MediaItem[]>([]);
  const [airingToday, setAiringToday] = useState<MediaItem[]>([]);
  const [koreanDramas, setKoreanDramas] = useState<MediaItem[]>([]);
  const [animeSeries, setAnimeSeries] = useState<MediaItem[]>([]);
  const [genreFiltered, setGenreFiltered] = useState<MediaItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingGenre, setIsLoadingGenre] = useState(false);

  // Real-time Ad Banners state
  const [adBanners, setAdBanners] = useState<AdBannerItem[]>([]);

  useEffect(() => {
    const unsubAds = subscribeAdBanners((banners) => {
      setAdBanners(banners.filter((b) => b.active));
    });
    return () => unsubAds();
  }, []);

  // Initial load of TMDB TV Feeds
  useEffect(() => {
    let isMounted = true;

    async function loadSeriesData() {
      try {
        const [trending, topRated, airing, kdramas, anime] = await Promise.all([
          getTrendingMedia('tv', 'week'),
          getTopRatedTv(),
          getAiringTodayTv(),
          getKoreanDramas(),
          getAnimeMedia(),
        ]);

        if (!isMounted) return;

        if (trending && trending.length > 0) {
          setTrendingSeries(trending);
          const heroes = trending
            .filter((i) => i.backdropUrl && i.synopsis && i.synopsis.length > 25)
            .slice(0, 5);
          setHeroSeries(heroes.length > 0 ? heroes : trending.slice(0, 5));
        }

        if (topRated && topRated.length > 0) {
          setTopRatedSeries(topRated);
        }

        if (airing && airing.length > 0) {
          setAiringToday(airing);
        }

        if (kdramas && kdramas.length > 0) {
          setKoreanDramas(kdramas);
        }

        if (anime && anime.length > 0) {
          setAnimeSeries(anime);
        }
      } catch (err) {
        console.warn('Failed to load series data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSeriesData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Genre filtering
  useEffect(() => {
    if (activeGenre === 'All') {
      setGenreFiltered([]);
      return;
    }

    let isMounted = true;
    setIsLoadingGenre(true);

    async function loadByGenre() {
      try {
        let genreId = 18; // Drama default
        if (activeGenre === 'Sci-Fi & Fantasy') genreId = 10765;
        if (activeGenre === 'Action & Adventure') genreId = 10759;
        if (activeGenre === 'Comedy') genreId = 35;
        if (activeGenre === 'Crime') genreId = 80;
        if (activeGenre === 'Mystery') genreId = 9648;
        if (activeGenre === 'Animation') genreId = 16;

        const results = await getMediaByGenre(genreId, 'tv');
        if (isMounted) {
          setGenreFiltered(results);
          setIsLoadingGenre(false);
        }
      } catch (err) {
        console.warn('Failed to load TV genre:', err);
        if (isMounted) setIsLoadingGenre(false);
      }
    }

    loadByGenre();

    return () => {
      isMounted = false;
    };
  }, [activeGenre]);

  // Auto-rotate hero spotlight every 6 seconds
  useEffect(() => {
    if (heroSeries.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSeries.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSeries.length]);

  const currentHero = heroSeries[heroIndex];

  const GENRE_CHIPS = [
    'All',
    'Drama',
    'Sci-Fi & Fantasy',
    'Crime',
    'Action & Adventure',
    'Comedy',
    'Mystery',
    'Animation',
  ];

  return (
    <div
      id="series-tv-screen-view"
      className="flex-1 flex flex-col min-h-0 h-full overflow-hidden text-white"
    >
      {/* STATIC TOP HEADER: Discover / For You + Series Genre Chips - completely static */}
      <div className="shrink-0 z-30 bg-[#090a0f]/95 backdrop-blur-md pt-3 pb-2 px-4 border-b border-white/5 space-y-2 select-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setTopTab('Discover')}
              className={`text-base font-extrabold transition relative pb-1 flex items-center gap-1.5 ${
                topTab === 'Discover' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Tv className="w-4 h-4 text-[#00df82]" />
              <span>Series & Shows</span>
              {topTab === 'Discover' && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00df82] rounded-full shadow-sm shadow-[#00df82]/50" />
              )}
            </button>

            <button
              onClick={() => setTopTab('For You')}
              className={`text-base font-extrabold transition relative pb-1 ${
                topTab === 'For You' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>For You</span>
              {topTab === 'For You' && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00df82] rounded-full shadow-sm shadow-[#00df82]/50" />
              )}
            </button>
          </div>

          <span className="text-[10px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
            TV Hub
          </span>
        </div>

        {/* Filter Chips row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {GENRE_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveGenre(chip)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition border ${
                activeGenre === chip
                  ? 'bg-[#00df82] text-black font-extrabold border-transparent shadow-sm'
                  : 'bg-[#151825] text-zinc-400 hover:text-white border-white/5'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* SCROLLABLE CONTENT: Swipes up smoothly */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24 overscroll-contain">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#00df82]" />
            <span className="text-xs font-semibold">Loading TV Series catalog...</span>
          </div>
        ) : activeGenre !== 'All' ? (
          /* Specific Genre Filter Results */
          <div className="p-3.5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{activeGenre} Series</span>
                <span className="text-xs text-zinc-400 font-normal">
                  ({genreFiltered.length} shows)
                </span>
              </h2>

              <button
                onClick={() => setActiveGenre('All')}
                className="text-xs font-semibold text-[#00df82] hover:underline"
              >
                Show All
              </button>
            </div>

            {isLoadingGenre ? (
              <div className="py-20 flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#00df82]" />
              </div>
            ) : genreFiltered.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500">
                No series currently found in {activeGenre}.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {genreFiltered.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={() => onOpenItem && onOpenItem(item)}
                    className="group cursor-pointer space-y-1.5"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:ring-2 group-hover:ring-[#00df82] transition shadow-md">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      {item.rating !== undefined && (
                        <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-[#00df82] font-bold text-[9px] px-1.5 py-0.5 rounded">
                          ★ {item.rating.toFixed(1)}
                        </div>
                      )}
                      {onDownloadItem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadItem(item);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white/80 hover:text-[#00df82] transition"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {item.year ? `${item.year}` : 'TV Series'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Full Series & Shows Feed */
          <>
            {/* Spotlight Featured TV Series Hero */}
            {currentHero && (
              <div className="relative w-full aspect-[4/5] max-h-[440px] overflow-hidden select-none">
                <img
                  src={currentHero.backdropUrl || currentHero.posterUrl}
                  alt={currentHero.title}
                  onClick={() => onOpenItem && onOpenItem(currentHero)}
                  className="w-full h-full object-cover object-top cursor-pointer transition-all duration-700 brightness-85 hover:scale-102"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/30 to-black/60 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 left-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded shadow">
                    FEATURED SERIES
                  </span>
                  <span className="bg-black/60 backdrop-blur-sm text-zinc-200 text-[11px] font-medium px-2 py-0.5 rounded border border-white/10">
                    {currentHero.genres?.slice(0, 2).join(' • ') || 'Series'}
                  </span>
                </div>

                {/* Bottom Overlay Title & Action Buttons */}
                <div className="absolute bottom-5 inset-x-4 flex items-end justify-between z-10">
                  <div
                    className="max-w-[62%] cursor-pointer"
                    onClick={() => onOpenItem && onOpenItem(currentHero)}
                  >
                    <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md leading-tight line-clamp-2">
                      {currentHero.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-300">
                      {currentHero.rating && (
                        <span className="flex items-center gap-0.5 text-[#00df82] font-bold">
                          <Star className="w-3.5 h-3.5 fill-[#00df82]" />
                          {currentHero.rating.toFixed(1)}
                        </span>
                      )}
                      <span>•</span>
                      <span>{currentHero.year || '2024'}</span>
                      <span>•</span>
                      <span className="text-[#00df82] font-semibold">TV Series</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onDownloadItem && (
                      <button
                        onClick={() => onDownloadItem(currentHero)}
                        className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-2 rounded-full border border-white/15 transition active:scale-95 shadow-md"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5 text-[#00df82]" />
                        <span>Save</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (onPlayItem) onPlayItem(currentHero);
                        else if (onOpenItem) onOpenItem(currentHero);
                      }}
                      className="flex items-center gap-1.5 bg-[#00df82] hover:bg-[#00c975] text-black text-xs font-extrabold px-3.5 py-2 rounded-full shadow-lg shadow-emerald-500/30 transition active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Play E1</span>
                    </button>
                  </div>
                </div>

                {/* Swipe Indicator Dots */}
                <div className="absolute bottom-1.5 inset-x-0 flex items-center justify-center gap-1.5 z-10">
                  {heroSeries.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setHeroIndex(idx)}
                      className={`transition-all duration-300 rounded-full ${
                        heroIndex === idx
                          ? 'w-4 h-1.5 bg-[#00df82]'
                          : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Shelf 1: Trending TV Series */}
            <section className="mt-6 px-3.5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[#00df82]" />
                  <span>Trending TV Series</span>
                </h2>
                <span className="text-xs text-zinc-400 font-medium">This Week</span>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5">
                {trendingSeries.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={() => onOpenItem && onOpenItem(item)}
                    className="flex-shrink-0 w-28 group cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-md group-hover:ring-2 group-hover:ring-[#00df82]/60 transition">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {item.rating !== undefined && (
                        <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-[#00df82] font-bold text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          ★ {item.rating.toFixed(1)}
                        </div>
                      )}
                      {onDownloadItem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDownloadItem(item);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white/80 hover:text-[#00df82] transition"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-200 mt-1.5 truncate group-hover:text-white">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {item.genres?.slice(0, 1).join('') || 'Series'}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* AD BANNER SLOT IN SERIES SCREEN */}
            {adBanners.length > 0 && (
              <div className="px-3.5 mt-5">
                <AdBannerCard banners={adBanners} variant="shelf" />
              </div>
            )}

            {/* Shelf 2: Top Rated TV Shows of All Time */}
            <section className="mt-6 px-3.5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#f5c518]" />
                  <span>Top Rated TV Shows</span>
                </h2>
                <span className="text-xs text-zinc-400 font-medium">All-Time</span>
              </div>

              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5">
                {topRatedSeries.map((item, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    onClick={() => onOpenItem && onOpenItem(item)}
                    className="flex-shrink-0 w-28 group cursor-pointer"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-md group-hover:ring-2 group-hover:ring-[#00df82]/60 transition">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-[#f5c518] text-black font-black text-[10px] px-1.5 py-0.5 rounded shadow">
                        #{idx + 1}
                      </div>
                      {item.rating !== undefined && (
                        <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-[#00df82] font-bold text-[10px] px-1.5 py-0.5 rounded">
                          ★ {item.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-200 mt-1.5 truncate group-hover:text-white">
                      {item.title}
                    </h3>
                  </div>
                ))}
              </div>
            </section>

            {/* Shelf 3: Airing Today / New Episodes */}
            {airingToday.length > 0 && (
              <section className="mt-6 px-3.5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#00df82]" />
                    <span>Airing Today & New Episodes</span>
                  </h2>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5">
                  {airingToday.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => onOpenItem && onOpenItem(item)}
                      className="flex-shrink-0 w-32 group cursor-pointer"
                    >
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-md group-hover:ring-2 group-hover:ring-[#00df82]/60 transition">
                        <img
                          src={item.backdropUrl || item.posterUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-[#00df82] text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                          NEW EP
                        </div>
                      </div>
                      <h3 className="text-xs font-semibold text-zinc-200 mt-1.5 truncate group-hover:text-white">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-zinc-500 truncate">
                        {item.genres?.slice(0, 1).join('') || 'Series'}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Shelf 4: Popular Korean Dramas (K-Drama) */}
            {koreanDramas.length > 0 && (
              <section className="mt-6 px-3.5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Popular K-Dramas</span>
                  </h2>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5">
                  {koreanDramas.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => onOpenItem && onOpenItem(item)}
                      className="flex-shrink-0 w-28 group cursor-pointer"
                    >
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-md group-hover:ring-2 group-hover:ring-purple-400/60 transition">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {item.rating !== undefined && (
                          <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-[#00df82] font-bold text-[10px] px-1.5 py-0.5 rounded">
                            ★ {item.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xs font-semibold text-zinc-200 mt-1.5 truncate group-hover:text-white">
                        {item.title}
                      </h3>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Shelf 5: Top Anime Series */}
            {animeSeries.length > 0 && (
              <section className="mt-6 px-3.5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#00df82]" />
                    <span>Top Anime Series</span>
                  </h2>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5">
                  {animeSeries.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => onOpenItem && onOpenItem(item)}
                      className="flex-shrink-0 w-28 group cursor-pointer"
                    >
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 shadow-md group-hover:ring-2 group-hover:ring-[#00df82]/60 transition">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {item.rating !== undefined && (
                          <div className="absolute bottom-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-[#00df82] font-bold text-[10px] px-1.5 py-0.5 rounded">
                            ★ {item.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xs font-semibold text-zinc-200 mt-1.5 truncate group-hover:text-white">
                        {item.title}
                      </h3>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  ArrowDownToLine,
  Star,
  Flame,
  Film,
  Loader2,
  Tv,
  Rocket,
  Laugh,
  Ghost,
  Heart,
  ShieldAlert,
  Trophy,
  Compass,
  Smile,
  Zap,
  Eye,
  Layers,
  Crown,
  Sparkles,
} from 'lucide-react';
import { MediaItem, AdBannerItem } from '../../types';
import { HeaderSearch } from '../HeaderSearch';
import { DownloadCutInSheet } from '../DownloadCutInSheet';
import { MovieShelf } from '../MovieShelf';
import { subscribeAdBanners } from '../../services/adService';
import { AdBannerCard } from '../AdBannerCard';
import { UGANDAN_VJS, UgandanVJ } from '../../data/ugandanVjs';
import { VjDetailModal } from '../VjDetailModal';

import {
  getTrendingMedia,
  getPopularTv,
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getAnimeMedia,
  getKidsMedia,
  getKoreanDramas,
  getMediaByGenre,
} from '../../services/tmdb';
import { MUMO_SERVER_MOVIES } from '../../services/mumoServer';

interface HomeScreenProps {
  onOpenItem: (item: MediaItem) => void;
  onPlayItem: (item: MediaItem) => void;
  onDownloadItem: (item: MediaItem) => void;
  onSelectCategory: (cat: string) => void;
  activeCategory: string;
  allItems: MediaItem[];
}

export const CATEGORY_TABS = [
  'Trending',
  'Series',
  'Movies',
  'Top Rated',
  'Action',
  'Sci-Fi',
  'Animation',
  'Thriller',
  'Comedy',
  'Horror',
  'Romance',
  'Adventure',
  'Crime',
  'Mystery',
  'Kids',
  'K-Drama',
  'Anime',
  'Drama',
  'Documentary',
  'Fantasy',
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenItem,
  onPlayItem,
  onDownloadItem,
  onSelectCategory,
  activeCategory,
  allItems,
}) => {
  const [heroIndex, setHeroIndex] = useState(0);
  const [downloadCutInItem, setDownloadCutInItem] = useState<MediaItem | null>(null);
  const [selectedVj, setSelectedVj] = useState<UgandanVJ | null>(null);
  const [activeVjModal, setActiveVjModal] = useState<UgandanVJ | null>(null);

  // Dynamic catalog states for movies, series, and hero banners populated from MumoWatch server
  const [heroItems, setHeroItems] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.slice(0, 8));
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.type !== 'tv'));
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => (m.rating || 0) >= 8));
  const [nowPlaying, setNowPlaying] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.year === 2024 || m.year === 2023));
  const [popularSeries, setPopularSeries] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.type === 'tv'));
  const [actionMovies, setActionMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Action')));
  const [sciFiMovies, setSciFiMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Sci-Fi')));
  const [animationMovies, setAnimationMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Animation')));
  const [thrillerMovies, setThrillerMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Thriller')));
  const [comedyMovies, setComedyMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Comedy')));
  const [horrorMovies, setHorrorMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Horror') || m.genres?.includes('Thriller')));
  const [romanceMovies, setRomanceMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Romance') || m.genres?.includes('Drama')));
  const [adventureMovies, setAdventureMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Adventure')));
  const [crimeMovies, setCrimeMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Crime')));
  const [mysteryMovies, setMysteryMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Mystery') || m.genres?.includes('Crime')));
  const [familyMovies, setFamilyMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('Family') || m.genres?.includes('Animation')));
  const [koreanMedia, setKoreanMedia] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.filter((m) => m.genres?.includes('K-Drama') || m.type === 'tv'));
  const [upcomingMovies, setUpcomingMovies] = useState<MediaItem[]>(() => MUMO_SERVER_MOVIES.slice(4, 12));
  const [categoryItems, setCategoryItems] = useState<MediaItem[]>([]);

  const [isLoadingHome, setIsLoadingHome] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);

  // Real-time Ad Banners state
  const [adBanners, setAdBanners] = useState<AdBannerItem[]>([]);

  useEffect(() => {
    const unsubAds = subscribeAdBanners((banners) => {
      setAdBanners(banners.filter((b) => b.active));
    });
    return () => unsubAds();
  }, []);

  // Fetch initial TMDB data for Home with expanded pool of new movie banners
  useEffect(() => {
    let isMounted = true;

    async function loadHomeTmdb() {
      try {
        const [
          trendingAll,
          nowPlay,
          upcoming,
          popMovies,
          popTv,
          topRated,
          action,
          scifi,
          animation,
          thriller,
          comedy,
          horror,
          romance,
          adventure,
          crime,
          mystery,
          family,
          kdrama,
        ] = await Promise.all([
          getTrendingMedia('all', 'day').catch(() => []),
          getNowPlayingMovies().catch(() => []),
          getUpcomingMovies().catch(() => []),
          getPopularMovies().catch(() => []),
          getPopularTv().catch(() => []),
          getTopRatedMovies().catch(() => []),
          getMediaByGenre(28, 'movie').catch(() => []),
          getMediaByGenre(878, 'movie').catch(() => []),
          getMediaByGenre(16, 'movie').catch(() => []),
          getMediaByGenre(53, 'movie').catch(() => []),
          getMediaByGenre(35, 'movie').catch(() => []),
          getMediaByGenre(27, 'movie').catch(() => []),
          getMediaByGenre(10749, 'movie').catch(() => []),
          getMediaByGenre(12, 'movie').catch(() => []),
          getMediaByGenre(80, 'movie').catch(() => []),
          getMediaByGenre(9648, 'movie').catch(() => []),
          getKidsMedia().catch(() => []),
          getKoreanDramas().catch(() => []),
        ]);

        if (!isMounted) return;

        // Collect rich pool of new movie banners (20+ high-definition banners)
        const combinedBannersMap = new Map<string, MediaItem>();
        [...nowPlay, ...trendingAll, ...upcoming, ...popMovies, ...popTv].forEach((item) => {
          if (
            item &&
            item.id &&
            item.backdropUrl &&
            item.backdropUrl.startsWith('http') &&
            item.title &&
            !combinedBannersMap.has(item.id)
          ) {
            combinedBannersMap.set(item.id, item);
          }
        });

        const expandedHeroBanners = Array.from(combinedBannersMap.values()).slice(0, 20);
        if (expandedHeroBanners.length > 0) {
          setHeroItems(expandedHeroBanners);
        }

        if (trendingAll?.length) setTrendingMovies(trendingAll.slice(0, 18));
        if (nowPlay?.length) setNowPlaying(nowPlay.slice(0, 18));
        if (upcoming?.length) setUpcomingMovies(upcoming.slice(0, 18));
        if (topRated?.length) setTopRatedMovies(topRated.slice(0, 18));
        if (popTv?.length) setPopularSeries(popTv.slice(0, 18));
        if (action?.length) setActionMovies(action.slice(0, 18));
        if (scifi?.length) setSciFiMovies(scifi.slice(0, 18));
        if (animation?.length) setAnimationMovies(animation.slice(0, 18));
        if (thriller?.length) setThrillerMovies(thriller.slice(0, 18));
        if (comedy?.length) setComedyMovies(comedy.slice(0, 18));
        if (horror?.length) setHorrorMovies(horror.slice(0, 18));
        if (romance?.length) setRomanceMovies(romance.slice(0, 18));
        if (adventure?.length) setAdventureMovies(adventure.slice(0, 18));
        if (crime?.length) setCrimeMovies(crime.slice(0, 18));
        if (mystery?.length) setMysteryMovies(mystery.slice(0, 18));
        if (family?.length) setFamilyMovies(family.slice(0, 18));
        if (kdrama?.length) setKoreanMedia(kdrama.slice(0, 18));
      } catch (err) {
        console.warn('Failed to load TMDB categories:', err);
      } finally {
        if (isMounted) setIsLoadingHome(false);
      }
    }

    loadHomeTmdb();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch categorized items when tab changes
  useEffect(() => {
    if (activeCategory === 'Trending') {
      setCategoryItems([]);
      return;
    }

    let isMounted = true;
    setIsLoadingCategory(true);

    async function loadCategoryMedia() {
      try {
        let results: MediaItem[] = [];

        if (activeCategory === 'Series' || activeCategory === 'TV') {
          results = await getPopularTv();
        } else if (activeCategory === 'Movies' || activeCategory === 'Movie') {
          results = await getPopularMovies();
        } else if (activeCategory === 'Top Rated') {
          results = await getTopRatedMovies();
        } else if (activeCategory === 'Action') {
          results = await getMediaByGenre(28, 'movie');
        } else if (activeCategory === 'Sci-Fi') {
          results = await getMediaByGenre(878, 'movie');
        } else if (activeCategory === 'Animation') {
          results = await getMediaByGenre(16, 'movie');
        } else if (activeCategory === 'Anime') {
          results = await getAnimeMedia();
        } else if (activeCategory === 'Thriller') {
          results = await getMediaByGenre(53, 'movie');
        } else if (activeCategory === 'Comedy') {
          results = await getMediaByGenre(35, 'movie');
        } else if (activeCategory === 'Horror') {
          results = await getMediaByGenre(27, 'movie');
        } else if (activeCategory === 'Romance') {
          results = await getMediaByGenre(10749, 'movie');
        } else if (activeCategory === 'Adventure') {
          results = await getMediaByGenre(12, 'movie');
        } else if (activeCategory === 'Crime') {
          results = await getMediaByGenre(80, 'movie');
        } else if (activeCategory === 'Mystery') {
          results = await getMediaByGenre(9648, 'movie');
        } else if (activeCategory === 'Kids' || activeCategory === 'Family') {
          results = await getKidsMedia();
        } else if (activeCategory === 'K-Drama' || activeCategory === 'Korean') {
          results = await getKoreanDramas();
        } else if (activeCategory === 'Drama') {
          results = await getMediaByGenre(18, 'movie');
        } else if (activeCategory === 'Fantasy') {
          results = await getMediaByGenre(14, 'movie');
        } else if (activeCategory === 'Documentary') {
          results = await getMediaByGenre(99, 'movie');
        } else {
          results = allItems.filter(
            (i) =>
              i.category?.toLowerCase() === activeCategory.toLowerCase() ||
              i.genres?.some((g) => g.toLowerCase().includes(activeCategory.toLowerCase()))
          );
        }

        if (isMounted) {
          setCategoryItems(results.length > 0 ? results : MUMO_SERVER_MOVIES);
          setIsLoadingCategory(false);
        }
      } catch (err) {
        console.warn('Category fetch error:', err);
        if (isMounted) {
          setCategoryItems(MUMO_SERVER_MOVIES);
          setIsLoadingCategory(false);
        }
      }
    }

    loadCategoryMedia();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, allItems]);

  // Reset banner index when switching categories
  useEffect(() => {
    setHeroIndex(0);
  }, [activeCategory]);

  // Compute active hero banners specifically matching the selected category
  const activeHeroItems: MediaItem[] = useMemo(() => {
    if (activeCategory === 'Trending') {
      return heroItems.length > 0 ? heroItems : trendingMovies;
    }
    if (activeCategory === 'Series' || activeCategory === 'TV') {
      const seriesHeroes = popularSeries.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return seriesHeroes.length >= 3 ? seriesHeroes : popularSeries.slice(0, 12);
    }
    if (activeCategory === 'Action') {
      const actionHeroes = actionMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return actionHeroes.length >= 3 ? actionHeroes : actionMovies.slice(0, 12);
    }
    if (activeCategory === 'Sci-Fi') {
      const sciFiHeroes = sciFiMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return sciFiHeroes.length >= 3 ? sciFiHeroes : sciFiMovies.slice(0, 12);
    }
    if (activeCategory === 'Animation' || activeCategory === 'Anime') {
      const animHeroes = animationMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return animHeroes.length >= 3 ? animHeroes : animationMovies.slice(0, 12);
    }
    if (activeCategory === 'Movies' || activeCategory === 'Movie') {
      const movieHeroes = [...nowPlaying, ...trendingMovies].filter(
        (i) => i.type === 'movie' && i.backdropUrl && i.backdropUrl.startsWith('http')
      );
      return movieHeroes.length >= 3 ? movieHeroes : trendingMovies.slice(0, 12);
    }
    if (activeCategory === 'Top Rated') {
      const topHeroes = topRatedMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return topHeroes.length >= 3 ? topHeroes : topRatedMovies.slice(0, 12);
    }
    if (activeCategory === 'Thriller') {
      const thrillerHeroes = thrillerMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return thrillerHeroes.length >= 3 ? thrillerHeroes : thrillerMovies.slice(0, 12);
    }
    if (activeCategory === 'Comedy') {
      const comedyHeroes = comedyMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return comedyHeroes.length >= 3 ? comedyHeroes : comedyMovies.slice(0, 12);
    }
    if (activeCategory === 'Horror') {
      const horrorHeroes = horrorMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return horrorHeroes.length >= 3 ? horrorHeroes : horrorMovies.slice(0, 12);
    }
    if (activeCategory === 'Romance') {
      const romanceHeroes = romanceMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return romanceHeroes.length >= 3 ? romanceHeroes : romanceMovies.slice(0, 12);
    }
    if (activeCategory === 'Adventure') {
      const advHeroes = adventureMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return advHeroes.length >= 3 ? advHeroes : adventureMovies.slice(0, 12);
    }
    if (activeCategory === 'Crime') {
      const crimeHeroes = crimeMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return crimeHeroes.length >= 3 ? crimeHeroes : crimeMovies.slice(0, 12);
    }
    if (activeCategory === 'Mystery') {
      const mysteryHeroes = mysteryMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return mysteryHeroes.length >= 3 ? mysteryHeroes : mysteryMovies.slice(0, 12);
    }
    if (activeCategory === 'Kids' || activeCategory === 'Family') {
      const kidsHeroes = familyMovies.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return kidsHeroes.length >= 3 ? kidsHeroes : familyMovies.slice(0, 12);
    }
    if (activeCategory === 'K-Drama' || activeCategory === 'Korean') {
      const kdramaHeroes = koreanMedia.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
      return kdramaHeroes.length >= 3 ? kdramaHeroes : koreanMedia.slice(0, 12);
    }

    // Dynamic category fallback
    const fromCat = categoryItems.filter((i) => i.backdropUrl && i.backdropUrl.startsWith('http'));
    if (fromCat.length >= 2) return fromCat;
    if (categoryItems.length > 0) return categoryItems.slice(0, 12);
    return heroItems;
  }, [
    activeCategory,
    heroItems,
    trendingMovies,
    popularSeries,
    actionMovies,
    sciFiMovies,
    animationMovies,
    nowPlaying,
    topRatedMovies,
    thrillerMovies,
    comedyMovies,
    horrorMovies,
    romanceMovies,
    adventureMovies,
    crimeMovies,
    mysteryMovies,
    familyMovies,
    koreanMedia,
    categoryItems,
  ]);

  // Auto rotate active hero carousel every 5.5 seconds
  useEffect(() => {
    if (activeHeroItems.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % activeHeroItems.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [activeHeroItems.length]);

  const currentHero = activeHeroItems[heroIndex % (activeHeroItems.length || 1)] || activeHeroItems[0] || null;

  return (
    <div
      id="home-screen-view"
      className="flex-1 flex flex-col min-h-0 h-full overflow-hidden text-white relative"
    >
      {/* Scrollable Screen Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24 overscroll-contain relative">
        {/* Sticky Top Header Floating Over Hero Banner */}
        <div className="sticky top-0 z-40">
          <HeaderSearch
            allItems={allItems}
            onOpenItem={onOpenItem}
            categories={CATEGORY_TABS}
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
          />
        </div>

        {/* Full-Bleed Hero Carousel: Pushed up into background to overlap header area */}
        <div className="-mt-[110px] sm:-mt-[120px]">
          {!currentHero ? (
            <div className="relative w-full aspect-[4/5] max-h-[520px] bg-[#11131c] animate-pulse flex flex-col justify-end p-6 pt-32">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-zinc-800 rounded" />
                <div className="h-8 w-56 bg-zinc-800 rounded" />
                <div className="h-4 w-36 bg-zinc-800 rounded" />
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-[4/5] max-h-[520px] overflow-hidden select-none pt-24">
              <img
                src={currentHero.backdropUrl || currentHero.posterUrl}
                alt={currentHero.title}
                onClick={() => onOpenItem(currentHero)}
                className="w-full h-full object-cover object-top cursor-pointer transition-all duration-700 brightness-90 hover:scale-102"
              />

            {/* Ambient Vignette Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/20 to-black/60 pointer-events-none" />

            {/* Top Badges */}
            <div className="absolute top-3 left-4 flex items-center gap-2">
              <span className="bg-[#00df82] text-black font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
                {activeCategory === 'Trending' ? 'TOP 10' : activeCategory.toUpperCase()}
              </span>
              <span className="bg-black/60 backdrop-blur-sm text-zinc-200 text-[11px] font-medium px-2 py-0.5 rounded border border-white/10 truncate max-w-[200px]">
                {currentHero.genres?.slice(0, 2).join(' • ') || activeCategory}
              </span>
            </div>

            {/* Bottom Title & CTA Row */}
            <div className="absolute bottom-5 inset-x-4 flex items-end justify-between z-10">
              <div className="max-w-[62%] cursor-pointer" onClick={() => onOpenItem(currentHero)}>
                <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md leading-tight line-clamp-2">
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
                  <span>{currentHero.year || currentHero.duration || '2024'}</span>
                  {currentHero.type === 'tv' && (
                    <>
                      <span>•</span>
                      <span className="text-[#00df82] font-semibold">Series</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDownloadItem(currentHero)}
                  className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-2 rounded-full border border-white/15 transition active:scale-95 shadow-md cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5 text-[#00df82]" />
                  <span>Free DL</span>
                </button>

                <button
                  onClick={() => onPlayItem(currentHero)}
                  className="flex items-center gap-1.5 bg-[#00df82] hover:bg-[#00c975] text-black text-xs font-extrabold px-3.5 py-2 rounded-full shadow-lg shadow-emerald-500/30 transition active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Play</span>
                </button>
              </div>
            </div>

            {/* Carousel Dots Indicator */}
            <div className="absolute bottom-1.5 inset-x-0 flex items-center justify-center gap-1 z-10">
              {activeHeroItems.slice(0, 10).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    heroIndex % Math.min(activeHeroItems.length, 10) === idx
                      ? 'w-4 h-1.5 bg-[#00df82]'
                      : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        </div>

        {/* Ugandan VJ Movie Translators Row (Replacing previous category buttons) */}
        <div className="px-3.5 pt-3 pb-1 select-none">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00df82] animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-100">
                Available VJs
              </h2>
            </div>
            {selectedVj && (
              <button
                onClick={() => setSelectedVj(null)}
                className="text-[11px] text-[#00df82] font-bold hover:underline cursor-pointer"
              >
                Show All
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1.5">
            {UGANDAN_VJS.map((vj) => {
              return (
                <button
                  key={vj.id}
                  onClick={() => {
                    setActiveVjModal(vj);
                  }}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition active:scale-95 shrink-0 cursor-pointer border shadow-sm bg-[#151724] hover:bg-[#1e2133] text-zinc-200 hover:text-white border-white/10"
                >
                  <img
                    src={vj.avatar}
                    alt={vj.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 ring-1.5 ring-white/20"
                  />
                  <span className="text-xs font-extrabold">{vj.name}</span>
                  {vj.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-black bg-white/10 text-[#00df82]">
                      {vj.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT BELOW THE BANNER */}
        {activeCategory !== 'Trending' ? (
          /* Specific Category View (NO "Back to Home" button, banner is kept, rich information displayed below) */
          <div className="space-y-4 pt-2">
            {isLoadingCategory ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-2 text-zinc-400">
                <Loader2 className="w-7 h-7 animate-spin text-[#00df82]" />
                <span className="text-xs font-medium">Loading {activeCategory} collection...</span>
              </div>
            ) : (
              <>
                {/* Horizontal Shelf: Top Featured in Category */}
                {categoryItems.length > 0 && (
                  <MovieShelf
                    title={`Top Featured ${activeCategory}`}
                    icon={<Sparkles className="w-4 h-4 text-[#00df82]" />}
                    items={categoryItems.slice(0, 10)}
                    onOpenItem={onOpenItem}
                    onDownloadItem={(item) => onDownloadItem(item)}
                    badge="Popular"
                  />
                )}

                {/* Optional Ad Banner */}
                {adBanners.length > 0 && (
                  <AdBannerCard banners={adBanners} variant="shelf" className="my-2 px-3.5" />
                )}

                {/* Horizontal Shelf 2: Trending in Category */}
                {categoryItems.length > 10 && (
                  <MovieShelf
                    title={`Trending ${activeCategory} Now`}
                    icon={<Flame className="w-4 h-4 text-[#00df82]" />}
                    items={categoryItems.slice(10, 20)}
                    onOpenItem={onOpenItem}
                    onDownloadItem={(item) => onDownloadItem(item)}
                  />
                )}

                {/* Full Grid: All Category Collection */}
                <div className="px-3.5 pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      All {activeCategory} ({categoryItems.length} titles)
                    </h3>
                    <span className="text-xs text-zinc-400">1080P Ultra HD</span>
                  </div>

                  {categoryItems.length === 0 ? (
                    <div className="py-16 text-center text-zinc-500 text-xs">
                      No titles found in this category.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {categoryItems.map((item, idx) => (
                        <div
                          key={`${item.id}-${idx}`}
                          onClick={() => onOpenItem(item)}
                          className="group cursor-pointer flex flex-col"
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDownloadItem(item);
                              }}
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white/80 hover:text-[#00df82] transition cursor-pointer"
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <h4 className="text-xs font-medium text-zinc-200 mt-1.5 truncate group-hover:text-white">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-zinc-500 truncate">
                            {item.year ? `${item.year} • ` : ''}
                            {item.genres?.slice(0, 1).join('') || item.category || activeCategory}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Default Main Trending Feed with Extensive Shelves */
          <>
            {/* CATEGORY SHELF 1: Trending Movies */}
            <MovieShelf
              title="Trending Movies"
              icon={<Flame className="w-4 h-4" />}
              items={trendingMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Movies')}
              badge="Hot"
            />

            {/* AD BANNER SLOT 1 */}
            {adBanners.length > 0 && (
              <AdBannerCard banners={adBanners} variant="shelf" className="my-2" />
            )}

            {/* CATEGORY SHELF 2: Blockbusters */}
            <MovieShelf
              title="Blockbusters"
              icon={<Trophy className="w-4 h-4" />}
              items={topRatedMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Top Rated')}
              badge="Top Rated"
            />

            {/* CATEGORY SHELF 3: Action and High */}
            <MovieShelf
              title="Action and High"
              icon={<Sparkles className="w-4 h-4" />}
              items={nowPlaying}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              badge="Cinema"
            />

            {/* CATEGORY SHELF 4: Binge-Worthy TV Series */}
            <MovieShelf
              title="Binge-Worthy TV Series"
              icon={<Tv className="w-4 h-4" />}
              items={popularSeries}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Series')}
              badge="Series"
            />

            {/* CATEGORY SHELF 5: Action & High-Octane */}
            <MovieShelf
              title="Action & High-Octane"
              icon={<ShieldAlert className="w-4 h-4" />}
              items={actionMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Action')}
            />

            {/* CATEGORY SHELF 6: Sci-Fi & Cosmic Worlds */}
            <MovieShelf
              title="Sci-Fi & Cosmic Worlds"
              icon={<Rocket className="w-4 h-4" />}
              items={sciFiMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Sci-Fi')}
            />

            {/* CATEGORY SHELF 7: Animation & Anime Hits */}
            <MovieShelf
              title="Animation & Anime Marvels"
              icon={<Sparkles className="w-4 h-4" />}
              items={animationMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Animation')}
            />

            {/* CATEGORY SHELF 8: Heart-Pounding Thrillers & Suspense */}
            <MovieShelf
              title="Psychological Thrillers & Suspense"
              icon={<Zap className="w-4 h-4" />}
              items={thrillerMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Thriller')}
            />

            {/* CATEGORY SHELF 9: Comedy & Laugh-Out-Loud */}
            <MovieShelf
              title="Comedy & Feel-Good Laughs"
              icon={<Laugh className="w-4 h-4" />}
              items={comedyMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Comedy')}
            />

            {/* CATEGORY SHELF 10: Chilling Horror & Supernatural */}
            <MovieShelf
              title="Chilling Horror & Supernatural"
              icon={<Ghost className="w-4 h-4" />}
              items={horrorMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Horror')}
            />

            {/* CATEGORY SHELF 11: Romance & Heartfelt Drama */}
            <MovieShelf
              title="Romance & Heartfelt Stories"
              icon={<Heart className="w-4 h-4" />}
              items={romanceMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Romance')}
            />

            {/* CATEGORY SHELF 12: Epic Adventure & Quests */}
            <MovieShelf
              title="Epic Adventure & Quests"
              icon={<Compass className="w-4 h-4" />}
              items={adventureMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Adventure')}
            />

            {/* CATEGORY SHELF 13: Crime, Mafia & Heists */}
            <MovieShelf
              title="Crime, Mafia & High-Stakes Heists"
              icon={<Eye className="w-4 h-4" />}
              items={crimeMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Crime')}
            />

            {/* CATEGORY SHELF 14: Mind-Bending Mystery */}
            <MovieShelf
              title="Mind-Bending Whodunits & Mystery"
              icon={<Layers className="w-4 h-4" />}
              items={mysteryMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Mystery')}
            />

            {/* CATEGORY SHELF 15: Family & Kids Night */}
            <MovieShelf
              title="Family & Kids Movie Night"
              icon={<Smile className="w-4 h-4" />}
              items={familyMovies}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('Kids')}
            />

            {/* CATEGORY SHELF 16: Korean Cinema & K-Drama Hits */}
            <MovieShelf
              title="Korean Cinema & Asian Hits"
              icon={<Crown className="w-4 h-4" />}
              items={koreanMedia}
              onOpenItem={onOpenItem}
              onDownloadItem={(item) => onDownloadItem(item)}
              onMoreClick={() => onSelectCategory('K-Drama')}
            />

            {/* Category Grid Tiles (Explore by Genre) */}
            <section className="mt-8 px-3.5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Explore by Movie Genre</h2>
                  <p className="text-[11px] text-zinc-400">Jump directly into curated genre catalogs</p>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {[
                  { name: 'Series', gradient: 'from-purple-950/70 via-zinc-900 to-black', border: 'border-purple-500/20' },
                  { name: 'Action', gradient: 'from-red-950/70 via-zinc-900 to-black', border: 'border-red-500/20' },
                  { name: 'Sci-Fi', gradient: 'from-blue-950/70 via-zinc-900 to-black', border: 'border-blue-500/20' },
                  { name: 'Animation', gradient: 'from-emerald-950/70 via-zinc-900 to-black', border: 'border-emerald-500/20' },
                  { name: 'Top Rated', gradient: 'from-amber-950/70 via-zinc-900 to-black', border: 'border-amber-500/20' },
                  { name: 'Thriller', gradient: 'from-cyan-950/70 via-zinc-900 to-black', border: 'border-cyan-500/20' },
                  { name: 'Horror', gradient: 'from-purple-950/70 via-zinc-900 to-black', border: 'border-purple-500/20' },
                  { name: 'Comedy', gradient: 'from-yellow-950/70 via-zinc-900 to-black', border: 'border-yellow-500/20' },
                  { name: 'Romance', gradient: 'from-rose-950/70 via-zinc-900 to-black', border: 'border-rose-500/20' },
                  { name: 'Adventure', gradient: 'from-orange-950/70 via-zinc-900 to-black', border: 'border-orange-500/20' },
                  { name: 'Crime', gradient: 'from-zinc-800 via-zinc-900 to-black', border: 'border-zinc-500/20' },
                  { name: 'Mystery', gradient: 'from-teal-950/70 via-zinc-900 to-black', border: 'border-teal-500/20' },
                  { name: 'Kids', gradient: 'from-lime-950/70 via-zinc-900 to-black', border: 'border-lime-500/20' },
                  { name: 'K-Drama', gradient: 'from-indigo-950/70 via-zinc-900 to-black', border: 'border-indigo-500/20' },
                  { name: 'Drama', gradient: 'from-fuchsia-950/70 via-zinc-900 to-black', border: 'border-fuchsia-500/20' },
                ].map((genre) => (
                  <button
                    key={genre.name}
                    onClick={() => onSelectCategory(genre.name)}
                    className={`h-16 rounded-xl bg-gradient-to-b ${genre.gradient} border ${genre.border} p-2 flex flex-col justify-end text-left transition hover:scale-102 active:scale-95 cursor-pointer shadow-md`}
                  >
                    <span className="text-xs font-bold text-white leading-tight">{genre.name}</span>
                    <span className="text-[9px] text-[#00df82] font-semibold mt-0.5">Explore &gt;</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Download Options Cut-in Sheet */}
      {downloadCutInItem && (
        <DownloadCutInSheet
          isOpen={true}
          item={downloadCutInItem}
          onClose={() => setDownloadCutInItem(null)}
          onConfirmDownload={(options) => {
            onDownloadItem(downloadCutInItem);
            setDownloadCutInItem(null);
          }}
        />
      )}

      {/* Dedicated VJ Movies Page (3-Column Vertical Scroll) */}
      {activeVjModal && (
        <VjDetailModal
          vj={activeVjModal}
          allItems={allItems.length > 0 ? allItems : trendingMovies}
          onClose={() => setActiveVjModal(null)}
          onOpenItem={onOpenItem}
          onPlayItem={onPlayItem}
          onDownloadItem={onDownloadItem}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Film, ArrowLeft, Loader2, Star, Tv, TrendingUp } from 'lucide-react';
import { MediaItem } from '../types';
import { searchMedia, getTrendingMedia, getPopularMovies, getPopularTv } from '../services/tmdb';

interface HeaderSearchProps {
  onSearchSelect?: (query: string) => void;
  onOpenItem?: (item: MediaItem) => void;
  allItems: MediaItem[];
  categories?: string[];
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const DEFAULT_REAL_SUGGESTIONS = [
  'Dune: Part Two',
  'Deadpool & Wolverine',
  'Inside Out 2',
  'Gladiator II',
  'Avatar: The Way of Water',
  'Interstellar',
  'Oppenheimer',
  'Shōgun',
  'The Batman',
  'Spider-Man: Across the Spider-Verse',
  'John Wick: Chapter 4',
  'Top Gun: Maverick',
];

export const HeaderSearch: React.FC<HeaderSearchProps> = ({
  onOpenItem,
  allItems,
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_REAL_SUGGESTIONS);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load real trending search titles from TMDB streaming catalog
  useEffect(() => {
    let isMounted = true;
    Promise.all([getTrendingMedia(), getPopularMovies(), getPopularTv()])
      .then(([trending, movies, tv]) => {
        if (!isMounted) return;
        const realTitles = [...trending, ...movies, ...tv]
          .map((m) => m.title)
          .filter((t): t is string => Boolean(t && t.length > 2 && t.length < 35));
        const unique = Array.from(new Set(realTitles));
        if (unique.length >= 6) {
          setSuggestions(unique.slice(0, 16));
        }
      })
      .catch((err) => {
        console.warn('Real search suggestions note:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cycle placeholder suggestions every 3 seconds
  useEffect(() => {
    if (suggestions.length === 0) return;
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % suggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [suggestions.length]);

  const currentPlaceholder = suggestions[suggestionIndex] || 'Dune: Part Two';

  // Debounced TMDB search
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimeout.current = setTimeout(() => {
      searchMedia(searchQuery.trim())
        .then((tmdbResults) => {
          if (tmdbResults && tmdbResults.length > 0) {
            setSearchResults(tmdbResults);
          } else {
            const localFiltered = allItems.filter(
              (item) =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(localFiltered);
          }
          setIsSearching(false);
        })
        .catch((err) => {
          console.warn('TMDB search error:', err);
          const localFiltered = allItems.filter(
            (item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          setSearchResults(localFiltered);
          setIsSearching(false);
        });
    }, 320);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery, allItems]);

  return (
    <>
      {/* Top Static Header: Search bar + Category pills joined together */}
      <div
        id="top-search-and-category-header"
        className="shrink-0 z-30 bg-[#090a0f]/95 backdrop-blur-md border-b border-white/5 select-none"
      >
        {/* Search Bar Input Trigger */}
        <div className="px-3.5 pt-3 pb-1.5">
          <div
            onClick={() => {
              setIsSearchOpen(true);
            }}
            className="flex items-center gap-2.5 bg-[#1a1c24] hover:bg-[#222530] text-zinc-400 px-3.5 py-2 rounded-full cursor-pointer transition border border-white/5 shadow-inner group"
          >
            <Search className="w-4 h-4 text-zinc-400 group-hover:text-[#00df82] transition-colors shrink-0" />
            <div className="text-sm font-normal text-zinc-300 truncate select-none flex-1 flex items-center">
              <span className="text-zinc-500 mr-1.5 font-medium">Search</span>
              <span className="text-white font-semibold transition-opacity duration-300">
                "{currentPlaceholder}"
              </span>
            </div>
          </div>
        </div>

        {/* Joined Category Tabs */}
        {categories && onSelectCategory && (
          <div className="px-3.5 pt-0.5 pb-2">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              {categories.map((tab) => {
                const isActive = activeCategory === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => onSelectCategory(tab)}
                    className={`relative text-sm font-semibold whitespace-nowrap transition-colors py-1 cursor-pointer ${
                      isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00df82] rounded-full shadow-sm shadow-[#00df82]/50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Full-Screen Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-[#08090f] flex flex-col max-w-md mx-auto animate-in fade-in duration-150">
          {/* Top Bar with Input */}
          <div className="p-3.5 flex items-center gap-2 border-b border-white/5 bg-[#10121c]">
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-1.5 text-zinc-400 hover:text-white rounded-full transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search real titles like "${currentPlaceholder}"...`}
                className="w-full bg-[#181b28] text-white text-sm pl-9 pr-8 py-2 rounded-full outline-none focus:ring-1 focus:ring-[#00df82] placeholder:text-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-[#00df82] px-2 py-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Search Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
            {searchQuery.trim() === '' ? (
              <>
                {/* Real Trending Searches */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-2.5 uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-[#00df82]" />
                    <span>Real Trending Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((title, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(title)}
                        className="text-xs bg-[#141624] hover:bg-[#1f2233] text-zinc-300 hover:text-white px-3 py-1.5 rounded-full border border-white/5 transition flex items-center gap-1.5 cursor-pointer hover:border-[#00df82]/30"
                      >
                        <span className="text-[10px] text-[#00df82] font-bold">
                          #{idx + 1}
                        </span>
                        {title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Genres */}
                <div>
                  <div className="text-xs font-semibold text-zinc-400 mb-2.5 uppercase tracking-wider">
                    Popular Genres
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['Action', 'Sci-Fi', 'Horror', 'Animation', 'Comedy', 'Drama', 'Thriller', 'Romance'].map(
                      (cat) => (
                        <button
                          key={cat}
                          onClick={() => setSearchQuery(cat)}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#121420] hover:bg-[#1a1d2e] text-left border border-white/5 transition cursor-pointer"
                        >
                          <span className="text-xs font-medium text-zinc-200">{cat}</span>
                          <span className="text-[10px] text-[#00df82]">Search &gt;</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-zinc-400 mb-3">
                  <span>Results for "{searchQuery}"</span>
                  {isSearching ? (
                    <span className="flex items-center gap-1 text-[#00df82]">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Searching TMDB...
                    </span>
                  ) : (
                    <span>{searchResults.length} found</span>
                  )}
                </div>

                {/* Results List */}
                <div className="space-y-3">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        if (onOpenItem) onOpenItem(item);
                      }}
                      className="flex gap-3 bg-[#131522] hover:bg-[#1b1e30] p-2.5 rounded-2xl border border-white/5 cursor-pointer transition"
                    >
                      <div className="w-16 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 mb-1">
                          {item.type === 'tv' ? (
                            <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Tv className="w-2.5 h-2.5" /> Series
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-500/20 text-[#00df82] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Film className="w-2.5 h-2.5" /> Movie
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400">{item.releaseDate?.slice(0, 4) || '2024'}</span>
                          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 ml-auto">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {item.rating?.toFixed(1) || '8.2'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {item.genres?.slice(0, 3).join(' • ') || 'Action, Drama'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {!isSearching && searchResults.length === 0 && (
                    <div className="text-center py-12 text-zinc-500 text-xs">
                      No movies or shows found for "{searchQuery}".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

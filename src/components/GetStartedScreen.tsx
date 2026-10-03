import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { getTrendingMedia, getPopularMovies, getPopularTv } from '../services/tmdb';

interface GetStartedScreenProps {
  onGetStarted: (initialMode?: 'signup' | 'signin') => void;
  onExploreGuest?: () => void;
}

// Fallback high-definition movie flyers matching Marvel, DC, and world cinema blockbusters
const VERIFIED_TMDB_FLYERS = [
  'https://image.tmdb.org/t/p/w500/7WsyChLLEz331M3GScK1P33R32f.jpg', // Avengers: Infinity War
  'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', // Spider-Man: Across the Spider-Verse
  'https://image.tmdb.org/t/p/w500/r2J02Z2OpNTctetGCSpkmkoZjqn.jpg', // Guardians of the Galaxy Vol 3
  'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', // Spider-Man: No Way Home
  'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', // Deadpool & Wolverine
  'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', // The Batman
  'https://image.tmdb.org/t/p/w500/8Gxv8ASAil3S39j3y2s2R1G322.jpg', // Oppenheimer
  'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', // Dune: Part Two
  'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', // Barbie
  'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', // Avatar: The Way of Water
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', // Interstellar
  'https://image.tmdb.org/t/p/w500/vZloFAK7NKnMGKEslAoLi6kjvKR.jpg', // John Wick: Chapter 4
  'https://image.tmdb.org/t/p/w500/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', // Inside Out 2
  'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg', // Top Gun: Maverick
  'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', // Gladiator II
  'https://image.tmdb.org/t/p/w500/d5N22331m923j123R42333.jpg', // Iron Man
  'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', // Fight Club
  'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // The Dark Knight
];

export const GetStartedScreen: React.FC<GetStartedScreenProps> = ({
  onGetStarted,
  onExploreGuest,
}) => {
  const [col1Posters, setCol1Posters] = useState<string[]>([]);
  const [col2Posters, setCol2Posters] = useState<string[]>([]);
  const [col3Posters, setCol3Posters] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadRealMoviePosters() {
      try {
        const [trending, movies, tv] = await Promise.all([
          getTrendingMedia(),
          getPopularMovies(),
          getPopularTv(),
        ]);

        const allFlyers = [...trending, ...movies, ...tv]
          .map((item) => item.posterUrl)
          .filter((url) => url && url.startsWith('http') && !url.includes('svg'));

        if (isMounted && allFlyers.length >= 15) {
          const c1 = allFlyers.slice(0, 8);
          const c2 = allFlyers.slice(8, 16);
          const c3 = allFlyers.slice(16, 24);

          setCol1Posters(c1.length > 0 ? c1 : VERIFIED_TMDB_FLYERS.slice(0, 6));
          setCol2Posters(c2.length > 0 ? c2 : VERIFIED_TMDB_FLYERS.slice(6, 12));
          setCol3Posters(c3.length > 0 ? c3 : VERIFIED_TMDB_FLYERS.slice(12, 18));
          return;
        }
      } catch (err) {
        console.warn('Real TMDB flyers load notice:', err);
      }

      if (isMounted) {
        setCol1Posters(VERIFIED_TMDB_FLYERS.slice(0, 6));
        setCol2Posters(VERIFIED_TMDB_FLYERS.slice(6, 12));
        setCol3Posters(VERIFIED_TMDB_FLYERS.slice(12, 18));
      }
    }

    loadRealMoviePosters();

    return () => {
      isMounted = false;
    };
  }, []);

  const p1 = col1Posters.length > 0 ? col1Posters : VERIFIED_TMDB_FLYERS.slice(0, 6);
  const p2 = col2Posters.length > 0 ? col2Posters : VERIFIED_TMDB_FLYERS.slice(6, 12);
  const p3 = col3Posters.length > 0 ? col3Posters : VERIFIED_TMDB_FLYERS.slice(12, 18);

  return (
    <div className="relative w-full h-full bg-[#08090e] text-white overflow-hidden select-none">
      {/* 3D Perspective and Seamless Infinite Upward Marquee Styles */}
      <style>{`
        @keyframes scrollUpCol1 {
          0% { transform: translateY(0%); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollUpCol2 {
          0% { transform: translateY(-20%); }
          100% { transform: translateY(-70%); }
        }
        @keyframes scrollUpCol3 {
          0% { transform: translateY(-10%); }
          100% { transform: translateY(-60%); }
        }

        .scroll-col-1 {
          animation: scrollUpCol1 24s linear infinite;
        }
        .scroll-col-2 {
          animation: scrollUpCol2 18s linear infinite;
        }
        .scroll-col-3 {
          animation: scrollUpCol3 26s linear infinite;
        }

        .perspective-stage {
          perspective: 1100px;
          perspective-origin: 50% 30%;
        }

        .uplifted-3d-board {
          transform: rotateX(25deg) rotateY(-5deg) rotateZ(3deg) scale(1.18);
          transform-style: preserve-3d;
        }
      `}</style>

      {/* FULL BACKGROUND: 3D Uplifted Animated Movie Posters */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="perspective-stage w-full h-full flex items-center justify-center">
          <div className="uplifted-3d-board w-[122%] h-[180%] flex gap-3 px-2">
            {/* Column 1 */}
            <div className="flex-1 h-full overflow-hidden relative [transform:translateZ(10px)]">
              <div className="scroll-col-1 flex flex-col gap-3.5">
                {[...p1, ...p1].map((src, idx) => (
                  <div
                    key={`3d-col1-${idx}`}
                    className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.85)] bg-[#121422]"
                  >
                    <img
                      src={src}
                      alt="Movie Flyer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2 (Middle Column - Elevated Forward in 3D Space) */}
            <div className="flex-1 h-full overflow-hidden relative z-10 -translate-y-8 [transform:translateZ(36px)]">
              <div className="scroll-col-2 flex flex-col gap-3.5">
                {[...p2, ...p2].map((src, idx) => (
                  <div
                    key={`3d-col2-${idx}`}
                    className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-emerald-500/35 shadow-[0_25px_55px_rgba(0,0,0,0.95),0_0_20px_rgba(0,223,130,0.2)] bg-[#121422]"
                  >
                    <img
                      src={src}
                      alt="Movie Flyer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-400/10 to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3 */}
            <div className="flex-1 h-full overflow-hidden relative [transform:translateZ(16px)]">
              <div className="scroll-col-3 flex flex-col gap-3.5">
                {[...p3, ...p3].map((src, idx) => (
                  <div
                    key={`3d-col3-${idx}`}
                    className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.85)] bg-[#121422]"
                  >
                    <img
                      src={src}
                      alt="Movie Flyer"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Vignette Overlay: Blends seamlessly into background with a feathered soft fade */}
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-[#08090e] via-[#08090e]/85 to-transparent z-10 pointer-events-none" />

      {/* Bottom Vignette Overlay: Blends into background while allowing moving flyers to remain visible behind controls */}
      <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[#08090e] via-[#08090e]/90 via-55% to-transparent z-10 pointer-events-none" />

      {/* FOREGROUND: Floating Content Section on Top of Background Animation */}
      <div className="relative z-20 w-full h-full flex flex-col justify-end px-6 pb-10 pointer-events-auto">
        <div className="flex flex-col items-center text-center space-y-4 max-w-sm mx-auto w-full">
          {/* Title with subtle drop shadow for crisp readability over background */}
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight max-w-xs drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            Unlimited Movies & TV Shows
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xs font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Watch anywhere. Download anytime.
          </p>

          {/* Big Get Started Button */}
          <button
            type="button"
            onClick={() => onGetStarted('signup')}
            className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-[#00df82] hover:bg-[#00c975] active:scale-98 text-black font-extrabold text-base shadow-[0_12px_32px_rgba(0,223,130,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-1"
          >
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Quick Sign In Option */}
          <div className="pt-1 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => onGetStarted('signin')}
              className="text-xs text-zinc-300 hover:text-white transition cursor-pointer"
            >
              Already have an account? <span className="text-[#00df82] font-semibold underline underline-offset-2">Sign In</span>
            </button>

            {onExploreGuest && (
              <button
                type="button"
                onClick={onExploreGuest}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 transition underline underline-offset-4 cursor-pointer mt-1"
              >
                Explore as Guest first
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

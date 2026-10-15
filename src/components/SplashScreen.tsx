import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
}

/**
 * 100% Local Vector App Icon for Free Movie.
 * Stored directly in local disk / code bundle - NO network fetching required.
 */
const LocalFreeMovieAppIcon: React.FC<{ className?: string }> = ({ className = 'w-36 h-36' }) => (
  <svg
    viewBox="0 0 512 512"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter id="splashIconShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" floodColor="#00df82" floodOpacity="0.25" />
      </filter>

      <linearGradient id="splashBlueWave" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00b4d8" />
        <stop offset="35%" stopColor="#0077b6" />
        <stop offset="100%" stopColor="#023e8a" />
      </linearGradient>

      <linearGradient id="splashGreenWave" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#80ed99" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#57cc99" stopOpacity="0.95" />
      </linearGradient>

      <linearGradient id="splashPlayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f5d4" />
        <stop offset="40%" stopColor="#00bbf9" />
        <stop offset="100%" stopColor="#2a6fdb" />
      </linearGradient>

      <linearGradient id="splashFilmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00bbf9" />
        <stop offset="100%" stopColor="#00f5d4" />
      </linearGradient>

      <linearGradient id="splashArrowLight" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#74c69d" />
        <stop offset="100%" stopColor="#25a244" />
      </linearGradient>

      <clipPath id="splashCardClip">
        <rect width="496" height="496" x="8" y="8" rx="110" />
      </clipPath>
    </defs>

    {/* Base Card with Smooth Squircle */}
    <rect width="496" height="496" x="8" y="8" rx="110" fill="#ffffff" filter="url(#splashIconShadow)" />

    {/* Wave Gradient Layers in Bottom Half */}
    <g clipPath="url(#splashCardClip)">
      <path d="M 8 315 C 120 275, 360 355, 504 305 L 504 504 L 8 504 Z" fill="url(#splashGreenWave)" />
      <path d="M 8 335 C 130 305, 350 365, 504 325 L 504 504 L 8 504 Z" fill="url(#splashBlueWave)" />
    </g>

    {/* Central 3D Play & Download Reel Emblem */}
    <g transform="translate(256, 175)">
      {/* Outer Play Triangle */}
      <path
        d="M -90 -100 L 110 0 L -90 100 Z"
        fill="url(#splashPlayGrad)"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinejoin="round"
      />

      {/* Left Film Strip Perforated Strip */}
      <path
        d="M -90 -100 L -40 -100 L -40 100 L -90 100 Z"
        fill="url(#splashFilmGrad)"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Film Strip Perforation Notches */}
      <rect x="-72" y="-80" width="12" height="18" rx="4" fill="#003566" opacity="0.8" />
      <rect x="-72" y="-45" width="12" height="18" rx="4" fill="#003566" opacity="0.8" />
      <rect x="-72" y="-10" width="12" height="18" rx="4" fill="#003566" opacity="0.8" />
      <rect x="-72" y="25" width="12" height="18" rx="4" fill="#003566" opacity="0.8" />
      <rect x="-72" y="60" width="12" height="18" rx="4" fill="#003566" opacity="0.8" />

      {/* Prominent Center Green Download Arrow */}
      <path
        d="M -30 -60 L 30 -60 L 30 10 L 65 10 L 0 85 L -65 10 L -30 10 Z"
        fill="url(#splashArrowLight)"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </g>

    {/* 'Free Movie' Typography on Bottom Wave */}
    <g clipPath="url(#splashCardClip)">
      <text
        x="256"
        y="440"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="54"
        fontStyle="italic"
        fill="#ffffff"
        letterSpacing="-1"
      >
        Free Movie
      </text>
    </g>
  </svg>
);

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Stage 1: App icon displayed in center
  // Stage 2: Animated brand "FREE MOVIES" with glowing wave loading progress for 7.5 seconds
  const [stage, setStage] = useState<'icon' | 'loading'>('icon');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Stage 1 duration: 4.5 seconds for the icon in center
    const iconStageDuration = 4500;
    // Stage 2 duration: exactly 7.5 seconds (7500ms) as requested
    const loadingStageDuration = 7500;

    const iconTimer = setTimeout(() => {
      setStage('loading');
    }, iconStageDuration);

    return () => clearTimeout(iconTimer);
  }, []);

  useEffect(() => {
    if (stage !== 'loading') return;

    const loadingStageDuration = 7500; // 7.5 seconds
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / loadingStageDuration) * 100, 100);
      setLoadingProgress(pct);

      if (elapsed >= loadingStageDuration - 400) {
        setFadingOut(true);
      }

      if (elapsed >= loadingStageDuration) {
        clearInterval(progressInterval);
        if (onFinish) onFinish();
      }
    }, 25);

    return () => clearInterval(progressInterval);
  }, [stage, onFinish]);

  return (
    <div
      id="app-splash-screen"
      className={`fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-between py-12 px-6 select-none transition-opacity duration-400 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Spacer */}
      <div className="w-full h-8" />

      {/* Main Center Stage */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        {stage === 'icon' ? (
          /* STEP 1: App Icon directly from local disk / code bundle in center */
          <div className="flex flex-col items-center justify-center animate-in zoom-in-90 duration-500">
            <div className="relative p-2">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
              <LocalFreeMovieAppIcon className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_0_35px_rgba(0,223,130,0.35)]" />
            </div>
          </div>
        ) : (
          /* STEP 2: Matching Screenshot_20261015_192939.jpg - FREE in white, MOVIES in green + 7.5s Wavy Progress */
          <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-400 w-full">
            {/* FREE in White, MOVIES in Green */}
            <div className="text-4xl sm:text-5xl font-black tracking-wider text-center flex items-center justify-center drop-shadow-md">
              <span className="text-white">FREE</span>
              <span className="text-[#00df82]">MOVIES</span>
            </div>

            {/* Glowing Green Animated Wavy Progress Bar running for 7.5 seconds */}
            <div className="w-64 h-12 relative flex items-center justify-center mt-8">
              <svg viewBox="0 0 200 30" className="w-full h-full overflow-visible">
                {/* Background Dim Guide Track */}
                <path
                  d="M 10 15 Q 35 5, 60 15 T 110 15 T 160 15 T 190 15"
                  fill="none"
                  stroke="#1c1f28"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Active Neon-Green Wave with Glow progressing over 7.5 seconds */}
                <path
                  d="M 10 15 Q 35 5, 60 15 T 110 15 T 160 15 T 190 15"
                  fill="none"
                  stroke="#00df82"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="200"
                  strokeDashoffset={200 - (loadingProgress * 2)}
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(0, 223, 130, 0.9))',
                  }}
                />

                {/* Moving Glowing Green Dot riding the sine wave */}
                <circle
                  cx={10 + (loadingProgress / 100) * 180}
                  cy={15 + Math.sin((loadingProgress / 100) * Math.PI * 4) * 6}
                  r="4.5"
                  fill="#00df82"
                  style={{
                    filter: 'drop-shadow(0 0 10px #00df82)',
                  }}
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Description matching Screenshot_20261015_192939.jpg */}
      <div className="w-full text-center pb-4 animate-in fade-in duration-600">
        <p className="text-xs sm:text-sm font-semibold text-zinc-300 tracking-wide">
          FreeWatch, free entertainment, free everywhere.
        </p>
      </div>
    </div>
  );
};

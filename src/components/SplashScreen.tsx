import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 3800,
}) => {
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawPct = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(Math.floor(rawPct));

      if (elapsed >= durationMs - 450) {
        setFadingOut(true);
      }

      if (elapsed >= durationMs) {
        clearInterval(interval);
        if (onFinish) onFinish();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [durationMs, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0c0d14] flex flex-col items-center justify-between py-16 px-6 select-none transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Empty Spacer */}
      <div className="w-full h-8" />

      {/* Center Brand Emblem Logo matching Screenshot */}
      <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          {/* Ambient Pulse Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00df82]/20 via-blue-500/15 to-transparent blur-2xl animate-pulse" />

          {/* MovieBox Emblem Vector matching original logo */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,223,130,0.25)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Play Button Outer Blue 3D Gradient */}
              <linearGradient id="mbPlayBg" x1="30" y1="20" x2="175" y2="165" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="35%" stopColor="#0088ff" />
                <stop offset="100%" stopColor="#1565c0" />
              </linearGradient>

              {/* Green Down Arrow Vivid Gradient */}
              <linearGradient id="mbArrowGreen" x1="100" y1="50" x2="100" y2="150" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3bf39d" />
                <stop offset="100%" stopColor="#00c853" />
              </linearGradient>
            </defs>

            {/* Play Button Curved 3D Body */}
            <path
              d="M52 28 C42 28, 36 35, 36 45 L36 155 C36 165, 42 172, 52 172 C60 172, 78 158, 104 140 L162 108 C174 100, 174 84, 162 76 L104 44 C78 26, 60 28, 52 28 Z"
              fill="url(#mbPlayBg)"
            />

            {/* Film Reel Perforations on Left Curved Edge */}
            <rect x="42" y="42" width="6" height="10" rx="1.5" fill="#0c0d14" fillOpacity="0.45" />
            <rect x="42" y="64" width="6" height="10" rx="1.5" fill="#0c0d14" fillOpacity="0.45" />
            <rect x="42" y="86" width="6" height="10" rx="1.5" fill="#0c0d14" fillOpacity="0.45" />
            <rect x="42" y="108" width="6" height="10" rx="1.5" fill="#0c0d14" fillOpacity="0.45" />
            <rect x="42" y="130" width="6" height="10" rx="1.5" fill="#0c0d14" fillOpacity="0.45" />
            <rect x="42" y="148" width="6" height="8" rx="1.5" fill="#0c0d14" fillOpacity="0.45" />

            {/* Center Downward Green Arrow */}
            <path
              d="M74 48 L126 48 L126 94 L148 94 L100 152 L52 94 L74 94 Z"
              fill="url(#mbArrowGreen)"
              stroke="#0c0d14"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Bottom Brand Title, Subtitle & Progressive Loading Bar */}
      <div className="flex flex-col items-center justify-center text-center space-y-2 w-full max-w-xs px-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-200 tracking-tight font-sans">
          MovieBox
        </h1>
        <p className="text-xs sm:text-sm font-normal text-zinc-500 tracking-wide">
          Box of Movies and TV shows
        </p>

        {/* Dynamic Progressive Loading Bar */}
        <div className="w-full max-w-[200px] flex flex-col items-center gap-1.5 pt-3">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-[#00e5ff] to-[#00df82] rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(0,223,130,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-medium text-zinc-500 tracking-wider">
            Loading... {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};


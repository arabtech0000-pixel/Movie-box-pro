import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish?: () => void;
}

/**
 * Official MovieBox / Free Movies Real Vector Emblem
 * Exact vector paths matching Screenshot_20261016_181923_MovieBox.jpg
 */
export const OfficialMovieBoxVector: React.FC<{ className?: string }> = ({
  className = 'w-28 h-32 sm:w-36 sm:h-40',
}) => (
  <svg
    viewBox="0 0 32 36"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M25.041 14.0856C28.0935 15.8026 28.0935 20.1974 25.041 21.9144L6.69311 32.2351C3.69923 33.9192 0 31.7557 0 28.3207V7.67932C0 4.24431 3.69923 2.08082 6.6931 3.76487L25.041 14.0856Z"
      fill="url(#officialPaint0_linear)"
    />
    <mask
      id="officialMask0"
      style={{ maskType: 'luminance' }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="3"
      width="28"
      height="30"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M25.041 14.0856C28.0935 15.8026 28.0935 20.1974 25.041 21.9144L6.69311 32.2351C3.69923 33.9192 0 31.7557 0 28.3207V7.67932C0 4.24431 3.69923 2.08082 6.6931 3.76487L25.041 14.0856Z"
        fill="white"
      />
    </mask>
    <g mask="url(#officialMask0)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M-6.87988 26.1088L26.8293 7.38881L32.9839 17.6425L-0.725237 36.3625L-6.87988 26.1088Z"
        fill="url(#officialPaint1_linear)"
      />
      <g filter="url(#officialFilter0_d)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M-11.4053 18.4275L22.3039 -0.292501L28.4585 9.96124L-5.25063 28.6812L-11.4053 18.4275Z"
          fill="url(#officialPaint2_linear)"
        />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M-15.3184 11.2009L18.3908 -7.51909L24.5454 2.73465L-9.16371 21.4546L-15.3184 11.2009Z"
        fill="url(#officialPaint3_linear)"
      />
    </g>
    {/* Film Strip Perforations */}
    <path
      d="M2.43262 28.4404C2.74267 28.4404 2.99414 28.6919 2.99414 29.002V30.3984C2.99414 30.7085 2.74267 30.96 2.43262 30.96H2.05859C1.74854 30.96 1.49707 30.7085 1.49707 30.3984V29.002C1.49707 28.6919 1.74854 28.4404 2.05859 28.4404H2.43262ZM2.43262 23.7598C2.74262 23.7598 2.99405 24.0113 2.99414 24.3213V25.7188C2.99408 26.0288 2.74264 26.2803 2.43262 26.2803H2.05859C1.74858 26.2803 1.49713 26.0288 1.49707 25.7188V24.3213C1.49716 24.0113 1.74859 23.7598 2.05859 23.7598H2.43262ZM2.43262 19.0801C2.74267 19.0801 2.99414 19.3315 2.99414 19.6416V21.0391C2.9939 21.3489 2.74252 21.5996 2.43262 21.5996H2.05859C1.74869 21.5996 1.49731 21.3489 1.49707 21.0391V19.6416C1.49707 19.3315 1.74854 19.0801 2.05859 19.0801H2.43262ZM2.43262 14.4004C2.74252 14.4004 2.9939 14.6511 2.99414 14.9609V16.3584C2.99414 16.6685 2.74267 16.9199 2.43262 16.9199H2.05859C1.74854 16.9199 1.49707 16.6685 1.49707 16.3584V14.9609C1.49731 14.6511 1.74869 14.4004 2.05859 14.4004H2.43262ZM2.43262 9.71973C2.7426 9.71973 2.99402 9.9713 2.99414 10.2813V11.6787C2.99412 11.9887 2.74266 12.2402 2.43262 12.2402H2.05859C1.74855 12.2402 1.49709 11.9887 1.49707 11.6787V10.2813C1.49719 9.9713 1.74861 9.71973 2.05859 9.71973H2.43262ZM2.43262 5.04004C2.74267 5.04004 2.99414 5.29151 2.99414 5.60156V6.99903C2.99393 7.3089 2.74254 7.55957 2.43262 7.55957H2.05859C1.74867 7.55957 1.49728 7.3089 1.49707 6.99903V5.60156C1.49707 5.29151 1.74854 5.04004 2.05859 5.04004H2.43262Z"
      fill="#00351E"
    />
    <mask
      id="officialMask1"
      style={{ maskType: 'luminance' }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="3"
      width="31"
      height="33"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M28.5789 16.0756C30.5382 17.1777 31.38 19.5558 30.4321 21.5943C28.6889 25.343 25.7771 30.8735 23.1878 32.33C20.4626 33.8629 10.7673 35.0047 4.81043 35.5808C2.21235 35.832 0 33.7765 0 31.1663L0 7.67932C0 4.24431 3.69923 2.08082 6.6931 3.76487L28.5789 16.0756Z"
        fill="white"
      />
    </mask>
    <g mask="url(#officialMask1)">
      <g filter="url(#officialFilter1_d)">
        <path
          d="M4.18848 3.21651C5.92668 3.16474 6.52147 3.66261 8.46875 4.75947C10.2264 5.7495 12.2245 6.86957 13.7363 7.71943C14.1588 7.95696 14.8322 8.33788 15.3369 8.62373C15.7537 8.85979 16.0106 9.302 16.0107 9.78096V17.6101H19.4834C19.7107 17.6101 19.8502 17.8596 19.7314 18.0534L12.0186 30.6423L4.30566 18.0534C4.18691 17.8596 4.32639 17.6101 4.55371 17.6101H8.02637V8.13838C8.13738 3.89342 5.25342 3.21651 4.18848 3.21651Z"
          fill="url(#officialPaint4_linear)"
        />
      </g>
    </g>
    <defs>
      <filter
        id="officialFilter0_d"
        x="-14.6053"
        y="-3.98481"
        width="46.2643"
        height="35.3737"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset dy="-0.492308" />
        <feGaussianBlur stdDeviation="1.6" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.0568691 0 0 0 0 0.270805 0 0 0 0.1 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
      <filter
        id="officialFilter1_d"
        x="0.496168"
        y="-0.479456"
        width="22.9706"
        height="34.8141"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
        <feOffset />
        <feGaussianBlur stdDeviation="1.84615" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.117216 0 0 0 0 0.0665166 0 0 0 0.2 0" />
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
      </filter>
      <linearGradient id="officialPaint0_linear" x1="54.9622" y1="23.858" x2="15.6753" y2="-13.0111" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00E069" />
        <stop offset="0.500067" stopColor="#00E069" />
        <stop offset="1" stopColor="#336FFF" />
      </linearGradient>
      <linearGradient id="officialPaint1_linear" x1="34.4023" y1="27.6458" x2="31.2958" y2="5.56584" gradientUnits="userSpaceOnUse">
        <stop stopColor="#32CCFE" />
        <stop offset="1" stopColor="#0F23C8" />
        <stop offset="1" stopColor="#0C359E" />
      </linearGradient>
      <linearGradient id="officialPaint2_linear" x1="17.2343" y1="29.4902" x2="26.062" y2="6.29222" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFFD" />
        <stop offset="1" stopColor="#3752FF" />
      </linearGradient>
      <linearGradient id="officialPaint3_linear" x1="18.1712" y1="7.32326" x2="13.7759" y2="-1.71327" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA1" />
        <stop offset="1" stopColor="#0AB0FF" />
      </linearGradient>
      <linearGradient id="officialPaint4_linear" x1="7.02861" y1="6.98321" x2="7.02861" y2="28.0488" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00C4C4" />
        <stop offset="1" stopColor="#89FF5A" />
      </linearGradient>
    </defs>
  </svg>
);

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Exactly 6 seconds total as requested by user
    const totalDuration = 6000;
    const fadeDuration = 500;

    const fadeTimer = setTimeout(() => {
      setFadingOut(true);
    }, totalDuration - fadeDuration);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, totalDuration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      id="app-splash-screen"
      onClick={() => {
        setFadingOut(true);
        setTimeout(() => {
          if (onFinish) onFinish();
        }, 300);
      }}
      className={`fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-between py-14 px-6 select-none transition-opacity duration-500 cursor-pointer ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Spacer */}
      <div className="w-full h-6" />

      {/* Main Center: Official Free Movies Icon (Slightly larger, matching the user's reference image) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
        <div className="flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
          <div className="relative p-3 flex items-center justify-center">
            {/* Ambient soft glow */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="absolute -inset-4 rounded-full bg-cyan-500/10 blur-2xl" />
            <OfficialMovieBoxVector className="w-36 h-40 sm:w-44 sm:h-48 md:w-48 md:h-52 drop-shadow-[0_16px_36px_rgba(0,0,0,0.95)]" />
          </div>
        </div>
      </div>

      {/* Bottom Branding: Free Movies & Tagline */}
      <div className="w-full text-center pb-10 animate-in fade-in duration-700">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Free Movies
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
            Box of Movies and TV shows
          </p>
        </div>
      </div>
    </div>
  );
};

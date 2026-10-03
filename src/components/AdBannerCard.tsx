import React, { useState, useEffect } from 'react';
import { Play, Crown, Tv, Film, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdBannerItem } from '../types';

interface AdBannerCardProps {
  banner?: AdBannerItem;
  banners?: AdBannerItem[];
  variant?: 'shelf' | 'grid' | 'compact';
  className?: string;
  autoPlayInterval?: number;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80';

export const AdBannerCard: React.FC<AdBannerCardProps> = ({
  banner,
  banners,
  className = '',
  autoPlayInterval = 6500,
}) => {
  const activeBanners = (banners || (banner ? [banner] : [])).filter((b) => b && b.active);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [imgSrcMap, setImgSrcMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentIndex >= activeBanners.length && activeBanners.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused, autoPlayInterval]);

  if (activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentBanner) return;

    const link = (currentBanner.linkUrl || '').trim();
    if (!link) return;

    const lowerLink = link.toLowerCase();

    // Internal in-app navigation
    if (
      lowerLink === 'premium' ||
      lowerLink === '#premium' ||
      lowerLink === '/premium' ||
      lowerLink === 'app://premium' ||
      lowerLink.startsWith('internal:premium')
    ) {
      window.dispatchEvent(new CustomEvent('mb_navigate_tab', { detail: 'premium' }));
      return;
    }

    if (
      lowerLink === 'series' ||
      lowerLink === '#series' ||
      lowerLink === 'tv' ||
      lowerLink === 'category:series'
    ) {
      window.dispatchEvent(new CustomEvent('mb_navigate_category', { detail: 'Series' }));
      return;
    }

    if (
      lowerLink === 'movies' ||
      lowerLink === '#movies' ||
      lowerLink === 'film' ||
      lowerLink === 'category:movies'
    ) {
      window.dispatchEvent(new CustomEvent('mb_navigate_category', { detail: 'Movies' }));
      return;
    }

    if (
      lowerLink === 'explore' ||
      lowerLink === '#explore' ||
      lowerLink === 'category:explore'
    ) {
      window.dispatchEvent(new CustomEvent('mb_navigate_tab', { detail: 'explore' }));
      return;
    }

    if (lowerLink.startsWith('category:')) {
      const cat = link.split(':')[1];
      window.dispatchEvent(new CustomEvent('mb_navigate_category', { detail: cat }));
      return;
    }

    // External URL navigation
    let targetUrl = link;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      try {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {}
    }
  };

  const isMultiSlide = activeBanners.length > 1;
  const lowerLink = (currentBanner.linkUrl || '').toLowerCase();

  const isVip =
    lowerLink === 'premium' ||
    lowerLink === '#premium' ||
    currentBanner.badgeText?.toUpperCase().includes('VIP');

  const isSeries =
    lowerLink === 'series' ||
    lowerLink === '#series' ||
    currentBanner.badgeText?.toUpperCase().includes('SERIES');

  const isMovie =
    lowerLink === 'movies' ||
    lowerLink === '#movies' ||
    currentBanner.badgeText?.toUpperCase().includes('MOVIE');

  const slideVariants = {
    initial: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 30 : -30,
    }),
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -30 : 30,
      transition: { duration: 0.25, ease: 'easeIn' },
    }),
  };

  const currentImage = imgSrcMap[currentBanner.id] || currentBanner.imageUrl || FALLBACK_IMAGE;

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full rounded-2xl overflow-hidden bg-[#10121d] border border-white/10 shadow-2xl cursor-pointer group hover:border-[#00df82]/60 transition-all duration-300 select-none ${className}`}
    >
      <div className="relative min-h-[105px] sm:min-h-[115px] w-full flex items-center overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentBanner.id}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {/* 1. Full Rich Background Image (vivid, clear, high-resolution) */}
            <img
              src={currentImage}
              alt={currentBanner.title}
              onError={() => {
                setImgSrcMap((prev) => ({ ...prev, [currentBanner.id]: FALLBACK_IMAGE }));
              }}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />

            {/* 2. Left-sided Cinematic Gradient for crystal-clear foreground text */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b12] via-[#0a0b12]/85 to-transparent w-[75%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b12]/60 via-transparent to-black/20" />
          </motion.div>
        </AnimatePresence>

        {/* 3. Foreground Content: Words clearly in the front with brand logo & single balanced button */}
        <div className="relative z-10 w-full px-4 py-3 flex items-center justify-between gap-3">
          {/* Left Text Block */}
          <div className="min-w-0 flex-1 space-y-1">
            {/* Branding Pill */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-white/15 text-white flex items-center gap-1 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00df82]" />
                <span>MOVIE<span className="text-[#00df82]">BOX</span></span>
              </span>

              <span
                className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded shadow ${
                  isVip
                    ? 'bg-amber-500 text-black'
                    : isSeries
                    ? 'bg-sky-500 text-black'
                    : 'bg-[#00df82] text-black'
                }`}
              >
                {currentBanner.badgeText || 'FEATURED'}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight line-clamp-1 drop-shadow-md group-hover:text-[#00df82] transition">
              {currentBanner.title}
            </h3>

            {/* Subtitle */}
            {currentBanner.subtitle && (
              <p className="text-[10px] sm:text-[11px] text-zinc-200 line-clamp-1 font-medium drop-shadow">
                {currentBanner.subtitle}
              </p>
            )}
          </div>

          {/* Right Action Button (Clean, balanced, single button) */}
          <div className="shrink-0 flex flex-col items-end gap-1.5">
            <button
              type="button"
              className={`px-3.5 py-1.5 rounded-xl font-black text-[11px] shadow-xl flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer ${
                isVip
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-amber-500/25'
                  : 'bg-[#00df82] hover:bg-[#00c975] text-black shadow-emerald-500/25'
              }`}
            >
              {isVip ? (
                <>
                  <Crown className="w-3.5 h-3.5 fill-black text-black" />
                  <span>Get VIP</span>
                </>
              ) : isSeries ? (
                <>
                  <Tv className="w-3.5 h-3.5 text-black" />
                  <span>Explore</span>
                </>
              ) : isMovie ? (
                <>
                  <Film className="w-3.5 h-3.5 text-black" />
                  <span>Watch</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black text-black" />
                  <span>Stream</span>
                </>
              )}
              <ChevronRight className="w-3 h-3 stroke-[3]" />
            </button>

            {/* Multi-slide Indicators */}
            {isMultiSlide && (
              <div className="flex items-center gap-1 pr-1">
                {activeBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleDotClick(e, idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      currentIndex === idx
                        ? 'w-4 h-1 bg-[#00df82]'
                        : 'w-1.5 h-1 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

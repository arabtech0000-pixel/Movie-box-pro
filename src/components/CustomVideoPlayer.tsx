import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  Gauge,
  Lock,
  Unlock,
  ChevronLeft,
  Expand,
  Shrink,
  Film,
  Volume2,
  VolumeX,
  Loader2,
} from 'lucide-react';
import { MediaItem } from '../types';

interface CustomVideoPlayerProps {
  item: MediaItem;
  streamUrl?: string;
  isLandscape: boolean;
  onToggleLandscape: () => void;
  onBack: () => void;
  onBookmarkToggle?: () => void;
  isBookmarked?: boolean;
  autoPlay?: boolean;
}

// Reliable, high-performance MP4 video streams
const SAMPLE_STREAMS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
];

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  item,
  streamUrl,
  isLandscape,
  onToggleLandscape,
  onBack,
  onBookmarkToggle,
  isBookmarked,
  autoPlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Pick deterministic stream based on item ID or passed streamUrl
  const resolvedStreamUrl = React.useMemo(() => {
    if (streamUrl) return streamUrl;
    if (item.videoUrl) return item.videoUrl;
    const num = Math.abs(
      item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );
    return SAMPLE_STREAMS[num % SAMPLE_STREAMS.length];
  }, [item.id, item.videoUrl, streamUrl]);

  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(22); // initial placeholder matching 00:22 from screenshot
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // Show temporary HUD toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 1500);
  };

  // Reset controls hide timer
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (!isLocked && isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  }, [isLocked, isPlaying]);

  // Handle user interaction with container
  const handleContainerClick = () => {
    if (isLocked) {
      setShowControls((prev) => !prev);
      return;
    }
    if (showControls) {
      setShowControls(false);
    } else {
      resetControlsTimer();
    }
  };

  // Toggle play/pause
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          resetControlsTimer();
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  // Skip time forward or backward
  const skipTime = (seconds: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    resetControlsTimer();
    triggerToast(seconds > 0 ? `+${seconds}s` : `${seconds}s`);
  };

  // Scrubber drag / click
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
    resetControlsTimer();
  };

  // Detect screen orientation
  const [isPortraitScreen, setIsPortraitScreen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsPortraitScreen(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Handle Fullscreen & Screen Orientation for Landscape
  const handleToggleLandscape = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextLandscape = !isLandscape;
    onToggleLandscape();

    try {
      if (nextLandscape) {
        const el = containerRef.current;
        if (el) {
          if (el.requestFullscreen) {
            await el.requestFullscreen().catch(() => {});
          } else if ((el as any).webkitRequestFullscreen) {
            await (el as any).webkitRequestFullscreen();
          }
        }
        if (window.screen?.orientation && 'lock' in window.screen.orientation) {
          await (window.screen.orientation as any).lock('landscape').catch(() => {});
        }
        triggerToast('Landscape Mode');
      } else {
        if (window.screen?.orientation && 'unlock' in window.screen.orientation) {
          try {
            (window.screen.orientation as any).unlock();
          } catch {}
        }
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitFullscreenElement) {
          await (document as any).webkitExitFullscreen().catch(() => {});
        }
        triggerToast('Portrait Mode');
      }
    } catch (err) {
      // Browser permissions or user gesture constraints
    }
  };

  // Picture in picture
  const handlePIP = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        triggerToast('Exited Picture-in-Picture');
      } else if (videoRef.current) {
        if (document.pictureInPictureEnabled && videoRef.current.requestPictureInPicture) {
          await videoRef.current.requestPictureInPicture();
          triggerToast('Playing in Picture-in-Picture');
        } else if ((videoRef.current as any).webkitSetPresentationMode) {
          (videoRef.current as any).webkitSetPresentationMode('picture-in-picture');
          triggerToast('Playing in Picture-in-Picture');
        } else {
          triggerToast('PIP not supported on this device');
        }
      }
    } catch (err) {
      triggerToast('PIP not supported on this browser');
    }
    resetControlsTimer();
  };

  // Cycle playback speed
  const cycleSpeed = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const curIdx = speedOptions.indexOf(playbackSpeed);
    const nextSpeed = speedOptions[(curIdx + 1) % speedOptions.length];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    triggerToast(`Speed: ${nextSpeed}X`);
    resetControlsTimer();
  };

  // Cycle fit mode (contain vs cover)
  const toggleFit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextFit = fitMode === 'contain' ? 'cover' : 'contain';
    setFitMode(nextFit);
    triggerToast(nextFit === 'cover' ? 'Fill Screen' : 'Original Ratio');
    resetControlsTimer();
  };

  // Toggle lock
  const toggleLock = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newLock = !isLocked;
    setIsLocked(newLock);
    triggerToast(newLock ? 'Screen Locked' : 'Screen Unlocked');
    setShowControls(true);
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  };

  // Sync video event listeners
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onTimeUpdate = () => {
      setCurrentTime(vid.currentTime);
      if (vid.duration && !isNaN(vid.duration)) {
        setDuration(vid.duration);
      }
    };

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const onLoadedMetadata = () => {
      if (vid.duration && !isNaN(vid.duration)) {
        setDuration(vid.duration);
      }
      setIsBuffering(false);
      if (autoPlay) {
        vid.play().catch(() => setIsPlaying(false));
      }
    };

    vid.addEventListener('timeupdate', onTimeUpdate);
    vid.addEventListener('waiting', onWaiting);
    vid.addEventListener('playing', onPlaying);
    vid.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      vid.removeEventListener('timeupdate', onTimeUpdate);
      vid.removeEventListener('waiting', onWaiting);
      vid.removeEventListener('playing', onPlaying);
      vid.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [autoPlay, resolvedStreamUrl]);

  // Keep screen wake lock or landscape orientation hints if requested
  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isLandscape, resetControlsTimer]);

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      style={
        isLandscape && isPortraitScreen
          ? {
              position: 'fixed',
              top: 0,
              left: '100vw',
              width: '100vh',
              height: '100vw',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
              zIndex: 99999,
            }
          : undefined
      }
      className={`relative bg-black select-none overflow-hidden ${
        isLandscape
          ? isPortraitScreen
            ? 'flex flex-col justify-between'
            : 'fixed inset-0 z-[99999] w-screen h-screen flex flex-col justify-between'
          : 'aspect-[16/11] sm:aspect-[16/10] min-h-[250px] w-full shrink-0 shadow-2xl'
      }`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={resolvedStreamUrl}
        playsInline
        className={`w-full h-full ${
          fitMode === 'cover' ? 'object-cover' : 'object-contain'
        }`}
        preload="metadata"
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Loader2 className="w-6 h-6 text-[#00df82] animate-spin" />
          </div>
        </div>
      )}

      {/* Temporary HUD Toast Message */}
      {toastMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-black/85 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/15 pointer-events-none shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {toastMessage}
        </div>
      )}

      {/* ========================================================= */}
      {/* LANDSCAPE / FULLSCREEN MODE CONTROLS (Screenshot 1)       */}
      {/* ========================================================= */}
      {isLandscape && (
        <>
          {/* Top Bar (Title + Back) */}
          <div
            className={`absolute top-0 inset-x-0 z-30 transition-opacity duration-300 bg-gradient-to-b from-black/85 via-black/40 to-transparent p-4 flex items-center justify-between ${
              showControls && !isLocked ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => handleToggleLandscape(e)}
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 flex items-center justify-center text-white transition border border-white/10 cursor-pointer shadow-lg"
                title="Exit Landscape"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#00df82] to-blue-500 flex items-center justify-center shadow-sm">
                  <Play className="w-3.5 h-3.5 fill-black text-black" />
                </div>
                <h2 className="text-base font-extrabold text-white tracking-tight drop-shadow truncate max-w-md sm:max-w-xl">
                  {item.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Left-Side Lock / Unlock Button (Matches Screenshot 1) */}
          <div
            className={`absolute left-5 top-1/2 -translate-y-1/2 z-40 transition-opacity duration-300 ${
              showControls || isLocked ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <button
              onClick={toggleLock}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl backdrop-blur-md border transition cursor-pointer active:scale-95 shadow-2xl ${
                isLocked
                  ? 'bg-[#00df82]/20 border-[#00df82] text-[#00df82]'
                  : 'bg-black/60 hover:bg-black/80 border-white/15 text-white'
              }`}
              title={isLocked ? 'Tap to Unlock' : 'Tap to Lock Screen'}
            >
              {isLocked ? (
                <Lock className="w-5 h-5 text-[#00df82]" />
              ) : (
                <>
                  <Unlock className="w-5 h-5 text-white" />
                  <span className="text-xs font-semibold tracking-wide">Tap to Lock</span>
                </>
              )}
            </button>
          </div>

          {/* Center Playback Controls (-10s, Play/Pause, +10s) */}
          <div
            className={`absolute inset-0 flex items-center justify-center gap-12 z-30 transition-opacity duration-300 pointer-events-none ${
              showControls && !isLocked ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Skip -10s */}
            <button
              onClick={(e) => skipTime(-10, e)}
              className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/15 text-white flex flex-col items-center justify-center cursor-pointer pointer-events-auto transition active:scale-90 shadow-xl"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="text-[9px] font-black leading-none mt-0.5">10</span>
            </button>

            {/* Large Center Play/Pause */}
            <button
              onClick={(e) => togglePlay(e)}
              className="w-16 h-16 rounded-full bg-[#00df82] hover:bg-[#00c975] text-black flex items-center justify-center cursor-pointer pointer-events-auto transition active:scale-95 shadow-2xl shadow-emerald-500/40"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-black" />
              ) : (
                <Play className="w-8 h-8 fill-black ml-1" />
              )}
            </button>

            {/* Skip +10s */}
            <button
              onClick={(e) => skipTime(10, e)}
              className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/15 text-white flex flex-col items-center justify-center cursor-pointer pointer-events-auto transition active:scale-90 shadow-xl"
              title="Fast Forward 10 seconds"
            >
              <RotateCw className="w-5 h-5" />
              <span className="text-[9px] font-black leading-none mt-0.5">10</span>
            </button>
          </div>

          {/* Bottom Controls Bar (Matches Screenshot 1) */}
          <div
            className={`absolute bottom-0 inset-x-0 z-30 transition-opacity duration-300 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-6 pb-6 pt-10 flex flex-col gap-3 ${
              showControls && !isLocked ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Timeline Row: Play button + Current Time + Progress Bar + Total Time */}
            <div className="flex items-center gap-4 w-full">
              {/* Play / Pause toggle */}
              <button
                onClick={(e) => togglePlay(e)}
                className="w-8 h-8 flex items-center justify-center text-white hover:text-[#00df82] transition active:scale-90 cursor-pointer shrink-0"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-white" />
                ) : (
                  <Play className="w-6 h-6 fill-white" />
                )}
              </button>

              {/* Current Time (e.g. 00:15) */}
              <span className="text-xs font-mono font-bold text-zinc-300 shrink-0">
                {formatTime(currentTime)}
              </span>

              {/* Scrubber Progress Bar */}
              <div className="relative flex-1 flex items-center h-5 group/slider">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00df82] focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #00df82 0%, #00df82 ${
                      (currentTime / (duration || 1)) * 100
                    }%, #27272a ${(currentTime / (duration || 1)) * 100}%, #27272a 100%)`,
                  }}
                />
              </div>

              {/* Total Duration (e.g. 00:22) */}
              <span className="text-xs font-mono font-bold text-zinc-400 shrink-0">
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom Actions Row: PIP, Fit, Speed, and Shrink */}
            <div className="flex items-center justify-end gap-3 pt-1">
              {/* PIP Button */}
              <button
                onClick={handlePIP}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-zinc-200 hover:text-white border border-white/10 text-xs font-bold transition active:scale-95 cursor-pointer backdrop-blur-sm"
              >
                <PictureInPicture2 className="w-4 h-4 text-[#00df82]" />
                <span>PIP</span>
              </button>

              {/* Fit Button */}
              <button
                onClick={toggleFit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-zinc-200 hover:text-white border border-white/10 text-xs font-bold transition active:scale-95 cursor-pointer backdrop-blur-sm"
              >
                <Expand className="w-4 h-4 text-[#00df82]" />
                <span>Fit</span>
              </button>

              {/* Speed Button (1X) */}
              <button
                onClick={cycleSpeed}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-zinc-200 hover:text-white border border-white/10 text-xs font-bold transition active:scale-95 cursor-pointer backdrop-blur-sm"
              >
                <Gauge className="w-4 h-4 text-[#00df82]" />
                <span>{playbackSpeed}X</span>
              </button>

              {/* Exit Landscape Button */}
              <button
                onClick={(e) => handleToggleLandscape(e)}
                className="p-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-zinc-200 hover:text-white border border-white/10 text-xs font-bold transition active:scale-95 cursor-pointer backdrop-blur-sm"
                title="Exit Landscape"
              >
                <Shrink className="w-4 h-4 text-[#00df82]" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* INLINE / PORTRAIT MODE CONTROLS (Screenshot 2)            */}
      {/* ========================================================= */}
      {!isLandscape && (
        <>
          {/* Top Floating Buttons (Back + Favorite) */}
          <div
            className={`absolute top-3 inset-x-3 z-30 flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95 shadow-lg cursor-pointer pointer-events-auto"
              title="Back"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {onBookmarkToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkToggle();
                }}
                className="w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95 shadow-lg cursor-pointer pointer-events-auto"
                title="Favorite"
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    isBookmarked ? 'bg-[#00df82]' : 'bg-white/40'
                  }`}
                />
              </button>
            )}
          </div>

          {/* Center Play/Pause on Tap */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
              !isPlaying || showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              onClick={(e) => togglePlay(e)}
              className="w-14 h-14 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer pointer-events-auto transition active:scale-95 shadow-2xl"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white ml-1" />
              )}
            </button>
          </div>

          {/* Bottom Player Control Bar (Matches Screenshot 2) */}
          <div
            className={`absolute bottom-0 inset-x-0 z-30 transition-opacity duration-300 bg-gradient-to-t from-black/95 via-black/70 to-transparent px-3 py-2 flex items-center gap-2.5 ${
              showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Play/Pause Button */}
            <button
              onClick={(e) => togglePlay(e)}
              className="w-6 h-6 flex items-center justify-center text-white hover:text-[#00df82] transition active:scale-90 cursor-pointer shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
            </button>

            {/* Timeline Scrubber */}
            <div className="relative flex-1 flex items-center h-4">
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00df82] focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #00df82 0%, #00df82 ${
                    (currentTime / (duration || 1)) * 100
                  }%, #27272a ${(currentTime / (duration || 1)) * 100}%, #27272a 100%)`,
                }}
              />
            </div>

            {/* Time Stamp (00:02/00:22) */}
            <span className="text-[11px] font-mono font-medium text-zinc-300 shrink-0">
              {formatTime(currentTime)}/{formatTime(duration)}
            </span>

            {/* PIP Button */}
            <button
              onClick={handlePIP}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition cursor-pointer shrink-0"
              title="Picture in Picture"
            >
              <PictureInPicture2 className="w-4 h-4 text-zinc-300 hover:text-white" />
            </button>

            {/* Fullscreen / Landscape Expand Box (Small box in right corner matching Screenshot 2) */}
            <button
              onClick={(e) => handleToggleLandscape(e)}
              className="p-1 rounded-lg hover:bg-white/10 text-white hover:text-[#00df82] transition active:scale-90 cursor-pointer shrink-0"
              title="Expand to Landscape"
            >
              {/* Distinctive corner bracket box icon matching screenshot 2 */}
              <Maximize2 className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

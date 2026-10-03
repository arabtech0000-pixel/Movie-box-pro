import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    if (variant === 'compact') return null;
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold ${className}`}>
        <Check className="w-3.5 h-3.5" />
        <span>MovieBox App Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback for browsers that don't trigger beforeinstallprompt automatically
      alert("To install MovieBox Pro App on your device:\n\n• On Chrome/Android: Tap menu (⋮) -> 'Install app' or 'Add to Home screen'.\n• On Desktop: Click the Install icon in the browser address bar.");
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className={`relative overflow-hidden bg-gradient-to-r from-emerald-950/80 via-[#121422] to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${className}`}>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm sm:text-base flex items-center gap-2">
                Install MovieBox Pro App
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500 text-black">Official</span>
              </h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Enjoy fast streaming, full-screen player, push notifications & offline downloads.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Install App Now</span>
          </button>
        </div>

        {/* iOS Guided Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-sm rounded-2xl bg-[#121422] border border-emerald-500/30 p-6 shadow-2xl text-white">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  iOS
                </div>
                <div>
                  <h3 className="font-bold text-base">Install on iPhone / iPad</h3>
                  <p className="text-xs text-slate-400">Add to Home Screen in 2 steps</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 bg-black/40 p-3.5 rounded-xl border border-white/5">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                  <p>Tap the <strong className="text-white flex items-center gap-1 inline-flex"><Share2 className="w-3.5 h-3.5 text-blue-400 inline" /> Share</strong> icon in your Safari browser bar.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                  <p>Scroll down and tap <strong className="text-white flex items-center gap-1 inline-flex"><PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> Add to Home Screen</strong>.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Standard Button / Compact
  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition shadow-sm active:scale-95 ${className}`}
        title="Install MovieBox Pro App on device"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>

      {/* iOS Guided Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#121422] border border-emerald-500/30 p-6 shadow-2xl text-white">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                iOS
              </div>
              <div>
                <h3 className="font-bold text-base">Install on iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Add to Home Screen in 2 steps</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 bg-black/40 p-3.5 rounded-xl border border-white/5">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                <p>Tap the <strong className="text-white flex items-center gap-1 inline-flex"><Share2 className="w-3.5 h-3.5 text-blue-400 inline" /> Share</strong> icon in Safari toolbar.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                <p>Scroll down and tap <strong className="text-white flex items-center gap-1 inline-flex"><PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" /> Add to Home Screen</strong>.</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

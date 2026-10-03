import React, { useEffect, useState } from 'react';
import { Bell, Film, Zap, Crown, X } from 'lucide-react';
import { AppNotification } from '../services/notificationService';

interface TopPushNotificationBannerProps {
  onOpenNotifications?: () => void;
}

export const TopPushNotificationBanner: React.FC<TopPushNotificationBannerProps> = ({
  onOpenNotifications,
}) => {
  const [activePush, setActivePush] = useState<AppNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handlePushReceived = (e: Event) => {
      const custom = e as CustomEvent<AppNotification>;
      if (custom.detail) {
        setActivePush(custom.detail);
        setIsVisible(true);

        // Auto dismiss after 6.5 seconds
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 6500);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('mb_push_received', handlePushReceived);
    return () => {
      window.removeEventListener('mb_push_received', handlePushReceived);
    };
  }, []);

  if (!activePush || !isVisible) return null;

  const getIcon = (type?: string) => {
    switch (type) {
      case 'film':
        return <Film className="w-3.5 h-3.5 text-[#00df82]" />;
      case 'zap':
        return <Zap className="w-3.5 h-3.5 text-sky-400" />;
      case 'crown':
        return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-[#00df82]" />;
    }
  };

  return (
    <div className="fixed top-2 inset-x-3 max-w-sm mx-auto z-50 animate-in slide-in-from-top-full duration-300">
      <div
        onClick={() => {
          setIsVisible(false);
          if (onOpenNotifications) onOpenNotifications();
        }}
        className="w-full bg-[#121422]/95 backdrop-blur-md border border-[#00df82]/40 rounded-2xl p-3 shadow-2xl shadow-black/80 flex items-start gap-3 cursor-pointer hover:border-[#00df82] transition select-none"
      >
        {/* App Icon badge */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00df82]/20 to-emerald-500/10 border border-[#00df82]/30 flex items-center justify-center shrink-0 mt-0.5">
          {getIcon(activePush.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] font-black tracking-wider text-[#00df82] uppercase flex items-center gap-1">
              <span>MOVIEBOX</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400 font-normal">JUST NOW</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00df82] animate-ping" />
          </div>

          <h4 className="text-xs font-bold text-white truncate leading-snug">
            {activePush.title}
          </h4>

          <p className="text-[11px] text-zinc-300 line-clamp-2 mt-0.5 leading-tight">
            {activePush.desc}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="p-1 -mr-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

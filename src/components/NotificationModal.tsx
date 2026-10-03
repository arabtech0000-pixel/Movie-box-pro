import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  Film,
  Zap,
  Crown,
  CheckCheck,
  Trash2,
  Clock,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import {
  AppNotification,
  subscribeNotifications,
  saveLocalNotifications,
  requestDeviceNotificationPermission,
  getDeviceNotificationPermission,
} from '../services/notificationService';

interface NotificationModalProps {
  onClose: () => void;
  onOpenItem?: (title: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ onClose, onOpenItem }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'releases' | 'system' | 'promos'>('all');
  const [devicePerm, setDevicePerm] = useState<NotificationPermission>('default');

  useEffect(() => {
    setDevicePerm(getDeviceNotificationPermission());

    const unsub = subscribeNotifications((list) => {
      if (!list || list.length === 0) {
        const defaultNotifs: AppNotification[] = [
          {
            id: 'n-1',
            title: 'Dune: Part Two Now Available in 4K',
            desc: 'The epic sci-fi sequel is now streaming in 1080P Ultra HD and 4K HDR with surround audio.',
            time: '15m ago',
            unread: true,
            type: 'film',
          },
          {
            id: 'n-2',
            title: 'VidSrc Ultra Stream Online',
            desc: 'High-speed cloud servers connected with zero buffering. Enjoy seamless movie playback.',
            time: '2h ago',
            unread: true,
            type: 'zap',
          },
          {
            id: 'n-3',
            title: 'New DC & Marvel Character Avatars Added',
            desc: 'Customize your profile with official Batman, Superman, Wonder Woman, Spider-Man and Iron Man avatars.',
            time: 'Yesterday',
            unread: false,
            type: 'bell',
          },
        ];
        setNotifications(defaultNotifs);
        saveLocalNotifications(defaultNotifs);
      } else {
        setNotifications(list);
      }
    });
    return () => unsub();
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestDeviceNotificationPermission();
    setDevicePerm(res);
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'film':
        return <Film className="w-4 h-4 text-[#00df82]" />;
      case 'zap':
        return <Zap className="w-4 h-4 text-sky-400" />;
      case 'crown':
        return <Crown className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-[#00df82]" />;
    }
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    setNotifications(updated);
    saveLocalNotifications(updated);
  };

  const handleClearAll = () => {
    setNotifications([]);
    saveLocalNotifications([]);
  };

  const handleMarkSingleRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, unread: false } : n));
    setNotifications(updated);
    saveLocalNotifications(updated);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'releases') return n.type === 'film';
    if (filter === 'system') return n.type === 'zap';
    if (filter === 'promos') return n.type === 'crown' || n.type === 'bell';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#090a10] flex flex-col max-w-md mx-auto text-white animate-in slide-in-from-right duration-200">
      {/* Top Header Bar */}
      <div className="px-4 py-3.5 border-b border-white/10 bg-[#10121c] flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 text-zinc-300 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-[#00df82] text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400">Updates, new movies & announcements</p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleMarkAllRead}
              title="Mark all as read"
              className="p-1.5 text-zinc-400 hover:text-[#00df82] transition rounded-lg hover:bg-white/5 cursor-pointer flex items-center gap-1 text-xs"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearAll}
              title="Clear all notifications"
              className="p-1.5 text-zinc-400 hover:text-red-400 transition rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="px-4 py-2.5 bg-[#0d0f18] border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'releases', label: 'Releases' },
            { id: 'system', label: 'System' },
            { id: 'promos', label: 'Announcements' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filter === tab.id
                ? 'bg-[#00df82] text-black font-bold shadow-sm'
                : 'bg-[#181b2a] text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-10">
        {filteredNotifications.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mb-3 border border-white/5">
              <Bell className="w-8 h-8 opacity-40" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300">No notifications</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
              You're all caught up! Check back later for movie releases, system alerts, and offers.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkSingleRead(n.id)}
              className={`p-3.5 rounded-2xl border transition-all relative cursor-pointer ${
                n.unread
                  ? 'bg-[#151929] border-[#00df82]/35 shadow-md shadow-emerald-500/5'
                  : 'bg-[#10121d] border-white/5 opacity-85 hover:opacity-100 hover:border-white/10'
              }`}
            >
              {n.unread && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#00df82] animate-pulse ring-2 ring-black" />
              )}

              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-white truncate leading-tight">
                      {n.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {n.desc}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {n.time}
                    </span>
                    <span className="capitalize text-zinc-400 font-medium">
                      {n.type || 'Notice'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

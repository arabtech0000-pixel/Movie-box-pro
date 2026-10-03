import React, { useState } from 'react';
import {
  X,
  User,
  Sliders,
  Database,
  Wifi,
  Radio,
  Bell,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Check,
  Smartphone,
  Globe,
  Film,
  UserCircle2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { AVATAR_CATEGORIES } from './SignUpScreen';
import { isAuthorizedAdmin } from '../lib/adminAuth';
import {
  getDeviceNotificationPermission,
  requestAndEnablePushNotifications,
} from '../services/notificationService';

interface SettingsModalProps {
  user: UserProfile;
  onClose: () => void;
  onLogout?: () => void;
  onOpenGetStarted?: () => void;
  onOpenAdminScreen?: () => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  showToast: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  onClose,
  onLogout,
  onOpenGetStarted,
  onOpenAdminScreen,
  onUpdateUser,
  showToast,
}) => {
  const [streamQuality, setStreamQuality] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [downloadQuality, setDownloadQuality] = useState<'1080p' | '720p'>('1080p');
  const [wifiOnlyDownload, setWifiOnlyDownload] = useState(true);
  const [cellularWarning, setCellularWarning] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState('English');
  const [cacheSize, setCacheSize] = useState('42.8 MB');
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  const isAdminUser = isAuthorizedAdmin(user);

  const handleClearCache = () => {
    setIsClearingCache(true);
    setTimeout(() => {
      setCacheSize('0.0 MB');
      setIsClearingCache(false);
      showToast('Cache cleared successfully (42.8 MB freed)');
    }, 600);
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    if (onUpdateUser) {
      onUpdateUser({ avatarUrl });
    }
    setIsAvatarPickerOpen(false);
    showToast('Profile avatar updated');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center max-w-md mx-auto animate-in fade-in duration-200">
      <div className="w-full h-full sm:h-[90vh] bg-[#0c0e17] text-white flex flex-col sm:rounded-3xl border-t sm:border border-white/10 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#121522] sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00df82]/15 text-[#00df82] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Settings</h2>
              <p className="text-[11px] text-zinc-400">Account, playback & storage preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
          {/* User Profile Summary & Avatar Change */}
          <div className="bg-[#151827] rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={user.avatarUrl || '/avatars/simba.webp'}
                  alt={user.username}
                  className="w-13 h-13 rounded-full object-cover border-2 border-[#00df82] bg-zinc-900 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(true)}
                  className="absolute -bottom-1 -right-1 bg-[#00df82] text-black w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow ring-1 ring-black cursor-pointer hover:scale-105"
                  title="Change Avatar"
                >
                  ✎
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">{user.username}</h3>
                  {user.isLoggedIn ? (
                    <span className="text-[10px] bg-[#00df82]/20 text-[#00df82] px-1.5 py-0.5 rounded font-semibold shrink-0">
                      Logged In
                    </span>
                  ) : (
                    <span className="text-[10px] bg-zinc-700/50 text-zinc-300 px-1.5 py-0.5 rounded font-semibold shrink-0">
                      Guest
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">
                  {user.email || `MovieBox ID: ${user.movieBoxId}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAvatarPickerOpen(true)}
                className="text-xs text-[#00df82] hover:underline font-semibold cursor-pointer shrink-0"
              >
                Change Avatar
              </button>
            </div>
          </div>

          {/* Playback & Streaming */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
              Playback & Video Quality
            </div>
            <div className="bg-[#151827] rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Default Streaming Quality</div>
                  <div className="text-[11px] text-zinc-400">Higher quality uses more network bandwidth</div>
                </div>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  {(['720p', '1080p', '4k'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setStreamQuality(q);
                        showToast(`Streaming quality set to ${q.toUpperCase()}`);
                      }}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition cursor-pointer ${
                        streamQuality === q
                          ? 'bg-[#00df82] text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {q.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Cellular Data Warning</div>
                  <div className="text-[11px] text-zinc-400">Prompt before streaming over mobile data</div>
                </div>
                <button
                  type="button"
                  onClick={() => setCellularWarning(!cellularWarning)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    cellularWarning ? 'bg-[#00df82]' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      cellularWarning ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Default Audio & Subtitles</div>
                  <div className="text-[11px] text-zinc-400">Preferred language for video playback</div>
                </div>
                <select
                  value={subtitleLang}
                  onChange={(e) => {
                    setSubtitleLang(e.target.value);
                    showToast(`Language set to ${e.target.value}`);
                  }}
                  className="bg-black/40 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Español</option>
                  <option value="French">Français</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Arabic">Arabic (العربية)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Downloads & Storage */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
              Downloads & Storage
            </div>
            <div className="bg-[#151827] rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Download Quality</div>
                  <div className="text-[11px] text-zinc-400">Preset for one-click offline downloads</div>
                </div>
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
                  {(['720p', '1080p'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setDownloadQuality(q);
                        showToast(`Download quality set to ${q.toUpperCase()}`);
                      }}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition cursor-pointer ${
                        downloadQuality === q
                          ? 'bg-[#00df82] text-black'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {q.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Download Over Wi-Fi Only</div>
                  <div className="text-[11px] text-zinc-400">Prevent using your cellular mobile data</div>
                </div>
                <button
                  type="button"
                  onClick={() => setWifiOnlyDownload(!wifiOnlyDownload)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    wifiOnlyDownload ? 'bg-[#00df82]' : 'bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      wifiOnlyDownload ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div
                onClick={handleClearCache}
                className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer transition"
              >
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#00df82]" />
                    <span>Clear Cached Stream Data</span>
                  </div>
                  <div className="text-[11px] text-zinc-400">Frees local storage without deleting downloads</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#00df82]">
                    {isClearingCache ? 'Clearing...' : cacheSize}
                  </span>
                  <span className="block text-[10px] text-zinc-400 underline">Tap to clear</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
              Notifications & Device Alerts
            </div>
            <div className="bg-[#151827] rounded-2xl border border-white/10 p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#00df82]" />
                  <span>Phone Status Bar Push Notifications</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  {pushEnabled
                    ? 'Active: Receives new releases & alerts on mobile status bar'
                    : 'Disabled on this device'}
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!pushEnabled) {
                    const res = await requestAndEnablePushNotifications();
                    if (res === 'granted') {
                      setPushEnabled(true);
                      showToast('Phone status bar notifications enabled!');
                    } else {
                      setPushEnabled(false);
                      showToast('Notification permission denied by browser/device');
                    }
                  } else {
                    setPushEnabled(false);
                    showToast('Device notifications paused');
                  }
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  pushEnabled ? 'bg-[#00df82]' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    pushEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* System & Administrative Controls */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
              System & Actions
            </div>
            <div className="bg-[#151827] rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
              {isAdminUser && onOpenAdminScreen && (
                <div
                  onClick={() => {
                    onClose();
                    onOpenAdminScreen();
                  }}
                  className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer bg-amber-500/10"
                >
                  <div className="flex items-center gap-2.5 text-xs text-amber-300 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Open Admin Control Center</span>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded font-black">
                    SuperAdmin
                  </span>
                </div>
              )}

              {onOpenGetStarted && (
                <div
                  onClick={() => {
                    onClose();
                    onOpenGetStarted();
                  }}
                  className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <Sparkles className="w-4 h-4 text-[#00df82]" />
                    <span>Replay Get Started Animation</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              )}

              {onLogout && (
                <div
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 text-xs text-red-400 group-hover:text-red-300 font-bold">
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Log Out Account</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              )}
            </div>
          </div>

          <div className="text-center pt-3 text-[10px] text-zinc-500">
            MovieBox Streaming App • Version 8.1.4 (Official 2026 Build)
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal inside Settings */}
      {isAvatarPickerOpen && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#101322] border border-white/20 rounded-3xl p-5 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCircle2 className="w-4 h-4 text-[#00df82]" />
                <span>Select New Avatar</span>
              </h3>
              <button
                onClick={() => setIsAvatarPickerOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-xl hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pt-3 no-scrollbar">
              {AVATAR_CATEGORIES.map((cat) => (
                <div key={cat.title}>
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    {cat.title}
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {cat.items.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => handleAvatarSelect(av.url)}
                        className="group flex flex-col items-center gap-1 p-1 rounded-xl transition cursor-pointer hover:scale-105"
                      >
                        <div
                          className={`w-13 h-13 rounded-full overflow-hidden p-0.5 border ${
                            user.avatarUrl === av.url
                              ? 'border-[#00df82] ring-2 ring-[#00df82]'
                              : 'border-white/20 group-hover:border-white/50'
                          }`}
                        >
                          <img
                            src={av.url}
                            alt={av.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <span className="text-[9px] text-zinc-300 truncate max-w-[56px] text-center">
                          {av.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

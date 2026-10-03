import React, { useState } from 'react';
import {
  Bell,
  Settings,
  Database,
  Sliders,
  ChevronRight,
  Sparkles,
  Crown,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { UserProfile, MediaItem, DownloadItem } from '../../types';
import { SettingsModal } from '../SettingsModal';
import { isAuthorizedAdmin } from '../../lib/adminAuth';

interface ProfileScreenProps {
  user: UserProfile;
  downloads: DownloadItem[];
  bookmarks: MediaItem[];
  isRtdbConnected?: boolean;
  onOpenAuth: () => void;
  onOpenTransfer: () => void;
  onOpenDownloadsTab: () => void;
  onOpenNotifications: () => void;
  onOpenScanner?: () => void;
  onOpenAdminScreen?: () => void;
  onOpenGetStarted?: () => void;
  onLogout?: () => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
  showToast?: (msg: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  downloads,
  bookmarks,
  isRtdbConnected,
  onOpenAuth,
  onOpenTransfer,
  onOpenDownloadsTab,
  onOpenNotifications,
  onOpenAdminScreen,
  onOpenGetStarted,
  onLogout,
  onUpdateUser,
  showToast = (_msg: string) => {},
}) => {
  const [activeTab, setActiveTab] = useState<'Posts' | 'Likes'>('Posts');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // SuperAdmin access: Strictly granted ONLY to authorized admin email
  const isAdminUser = isAuthorizedAdmin(user);

  const userAvatarSource = user.avatarUrl && !user.avatarUrl.startsWith('data:image/svg')
    ? user.avatarUrl
    : '/avatars/simba.webp';

  return (
    <div id="profile-me-screen-view" className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-28 text-white overscroll-contain">
      {/* Gradient Header with Avatar & Top Action Icons */}
      <div className="relative pt-6 pb-6 px-4 bg-gradient-to-b from-[#00df82]/35 via-[#005a38]/20 to-[#090a0f] border-b border-white/5">
        {/* Top Header Row: RTDB Badge + Notification & Settings buttons only */}
        <div className="flex items-center justify-between gap-3.5 mb-4">
          {/* Realtime Database Sync Badge */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/5 text-[10px]">
            <span className={`w-2 h-2 rounded-full ${isRtdbConnected ? 'bg-[#00df82] animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-zinc-300 font-medium">
              {isRtdbConnected ? 'Firebase RTDB Synced' : 'Firebase Offline Sync'}
            </span>
          </div>

          {/* Action Buttons: Only Notification and Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNotifications}
              title="Notifications"
              className="p-2 text-zinc-200 hover:text-white rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs relative transition cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00df82] ring-2 ring-black" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
              className="p-2 text-zinc-200 hover:text-white rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs transition cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Selected Avatar + Name + ID */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="relative">
            <div className="w-15 h-15 rounded-full bg-gradient-to-tr from-[#00df82] via-emerald-400 to-teal-300 p-0.5 shadow-xl shadow-emerald-500/20">
              <img
                src={userAvatarSource}
                alt={user.username}
                className="w-full h-full rounded-full bg-zinc-900 object-cover"
              />
            </div>
            {user.plan === 'VIP Premium' && (
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black text-[9px] font-black px-1 rounded shadow">
                VIP
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2 truncate">
              <span className="truncate">{user.username}</span>
              {isAdminUser && (
                <span className="shrink-0 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> SuperAdmin
                </span>
              )}
              {user.isLoggedIn && !isAdminUser && (
                <span className="shrink-0 text-[10px] bg-emerald-500/20 text-[#00df82] px-1.5 py-0.5 rounded font-semibold">
                  Verified
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-300 mt-0.5 font-medium truncate">
              {user.email ? user.email : `MovieBox ID: ${user.movieBoxId}`}
            </p>
            {user.email && (
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                ID: {user.movieBoxId}
              </p>
            )}
          </div>
        </div>

        {/* Log in / Sign up & Admin Panel Buttons */}
        <div className="space-y-2">
          <button
            onClick={onOpenAuth}
            className="w-full py-2.5 rounded-full bg-white hover:bg-zinc-100 text-[#00df82] font-black text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{user.isLoggedIn ? 'Manage Account / Cloud Sync' : 'Log in / Sign up'}</span>
          </button>

          {user.isLoggedIn && onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out & Reset Session</span>
            </button>
          )}

          {isAdminUser && onOpenAdminScreen && (
            <button
              onClick={onOpenAdminScreen}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-emerald-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-extrabold text-xs shadow-lg transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Open Admin Control Center</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Stat Cards: Communities, Downloads, My List */}
      <div className="px-4 mt-3">
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Communities */}
          <div className="bg-[#151722] p-3 rounded-2xl border border-white/5 shadow flex flex-col justify-between h-28">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">Communities</span>
              <span className="text-xl font-black text-white mt-0.5 block">
                {user.communitiesCount}
              </span>
            </div>
            <button
              onClick={() => showToast('Community groups: Join film clubs & discuss episodes with fans!')}
              className="w-full py-1 rounded-lg border border-[#00df82] text-[#00df82] hover:bg-emerald-500/10 font-bold text-[10px] transition text-center cursor-pointer"
            >
              Explore
            </button>
          </div>

          {/* Card 2: Downloads */}
          <div
            onClick={onOpenDownloadsTab}
            className="bg-[#151722] hover:bg-[#1a1d2c] p-3 rounded-2xl border border-white/5 shadow flex flex-col justify-between h-28 cursor-pointer transition"
          >
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">Downloads</span>
              <span className="text-xl font-black text-white mt-0.5 block">
                {downloads.length}
              </span>
            </div>

            <div className="flex gap-1">
              {downloads.length > 0 ? (
                downloads.slice(0, 3).map((dl, idx) => (
                  <img
                    key={`prof-dl-${dl.id}-${idx}`}
                    src={dl.posterUrl}
                    alt="poster"
                    className="w-6 h-8 object-cover rounded bg-zinc-800"
                  />
                ))
              ) : (
                <>
                  <div className="w-6 h-8 rounded border border-dashed border-zinc-700 bg-zinc-800/40" />
                  <div className="w-6 h-8 rounded border border-dashed border-zinc-700 bg-zinc-800/40" />
                  <div className="w-6 h-8 rounded border border-dashed border-zinc-700 bg-zinc-800/40" />
                </>
              )}
            </div>
          </div>

          {/* Card 3: My List */}
          <div className="bg-[#151722] p-3 rounded-2xl border border-white/5 shadow flex flex-col justify-between h-28">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">My list</span>
              <span className="text-xl font-black text-white mt-0.5 block">
                {bookmarks.length}
              </span>
            </div>

            <div className="flex gap-1">
              {bookmarks.length > 0 ? (
                bookmarks.slice(0, 3).map((bm, idx) => (
                  <img
                    key={`prof-bm-${bm.id}-${idx}`}
                    src={bm.posterUrl}
                    alt="poster"
                    className="w-6 h-8 object-cover rounded bg-zinc-800"
                  />
                ))
              ) : (
                <>
                  <div className="w-6 h-8 rounded border border-dashed border-zinc-700 bg-zinc-800/40" />
                  <div className="w-6 h-8 rounded border border-dashed border-zinc-700 bg-zinc-800/40" />
                  <div className="w-6 h-8 rounded border border-dashed border-zinc-700 bg-zinc-800/40" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Only Posts and Likes */}
      <div className="mt-5 px-4">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('Posts')}
            className={`flex-1 py-2 text-xs font-bold transition text-center relative cursor-pointer ${
              activeTab === 'Posts' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Posts
            {activeTab === 'Posts' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00df82] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('Likes')}
            className={`flex-1 py-2 text-xs font-bold transition text-center relative cursor-pointer ${
              activeTab === 'Likes' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Likes
            {activeTab === 'Likes' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00df82] rounded-full" />
            )}
          </button>
        </div>

        {/* Empty State */}
        <div className="py-12 text-center">
          <p className="text-xs text-zinc-500">No {activeTab.toLowerCase()} yet</p>
        </div>
      </div>

      {/* Settings Section (Preferences removed as requested) */}
      <div className="px-4 space-y-2 pt-2">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-1">
          Settings
        </div>

        <div className="bg-[#141622] rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
          <div
            onClick={() => setIsSettingsOpen(true)}
            className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer"
          >
            <div className="flex items-center gap-2.5 text-xs text-zinc-200">
              <Sliders className="w-4 h-4 text-[#00df82]" />
              <span>App Settings & Preferences</span>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>

          {isAdminUser && onOpenAdminScreen && (
            <div
              onClick={onOpenAdminScreen}
              className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer bg-gradient-to-r from-amber-500/10 to-transparent"
            >
              <div className="flex items-center gap-2.5 text-xs text-amber-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Dashboard</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                SuperAdmin
              </span>
            </div>
          )}

          {onOpenGetStarted && (
            <div
              onClick={onOpenGetStarted}
              className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-xs text-zinc-200">
                <Sparkles className="w-4 h-4 text-[#00df82]" />
                <span>Replay Get Started Onboarding</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
          )}

          {onLogout && (
            <div
              onClick={onLogout}
              className="p-3.5 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 text-xs text-red-400 group-hover:text-red-300 font-medium">
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Log Out Every Account & Return to Get Started</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </div>
          )}
        </div>

        <div className="text-center pt-4 text-[10px] text-zinc-600">
          MovieBox Streaming v8.1.4 (Build 2026) • All Rights Reserved
        </div>
      </div>

      {/* Full Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          user={{
            ...user,
            avatarUrl: userAvatarSource,
          }}
          onClose={() => setIsSettingsOpen(false)}
          onLogout={onLogout}
          onOpenGetStarted={onOpenGetStarted}
          onOpenAdminScreen={onOpenAdminScreen}
          onUpdateUser={onUpdateUser}
          showToast={showToast}
        />
      )}
    </div>
  );
};

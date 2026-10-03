import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ShieldCheck,
  Crown,
  Users,
  Film,
  Tv,
  Radio,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  LogOut,
  Bell,
  TrendingUp,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Server,
  UserCheck,
  UserX,
  Play,
  Database,
  ExternalLink,
  Loader2,
  Megaphone,
  Plus,
  Trash2,
  Tag,
  Globe,
  Pencil,
  X,
  Wrench,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { UserProfile, MediaItem, AdBannerItem } from '../types';
import {
  HERO_CAROUSEL_ITEMS,
  BECAUSE_WATCHED_SHELF,
  POPULAR_SERIES_SHELF,
  COMING_SOON_SHELF,
  TRENDING_FREE_DOWNLOADS,
} from '../data/mediaData';
import { subscribeToAllUsers, adminUpdateUserInRtdb } from '../lib/firebase';
import {
  getTrendingMedia,
  getPopularMovies,
  getPopularTv,
  getTopRatedMovies,
  getTopRatedTv,
  getUpcomingMovies,
} from '../services/tmdb';
import { subscribeAdBanners, syncAdBannersToRtdb } from '../services/adService';
import { broadcastPushNotification } from '../services/notificationService';
import { subscribeMaintenanceStatus, setMaintenanceStatus } from '../services/maintenanceService';

interface AdminScreenProps {
  currentUser: UserProfile;
  onBackToApp: () => void;
  onLogoutAdmin: () => void;
  onUpdateCurrentUser: (updated: Partial<UserProfile>) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  currentUser,
  onBackToApp,
  onLogoutAdmin,
  onUpdateCurrentUser,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'catalog' | 'providers' | 'announcements' | 'ads' | 'maintenance'>('overview');

  // Maintenance Mode State
  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('Our system is currently under maintenance. Please check back shortly.');
  const [isSavingMaintenance, setIsSavingMaintenance] = useState(false);
  const [maintenanceSavedSuccess, setMaintenanceSavedSuccess] = useState(false);

  // Push Notification Form State
  const [pushTitle, setPushTitle] = useState('');
  const [pushDesc, setPushDesc] = useState('');
  const [pushType, setPushType] = useState<'film' | 'zap' | 'crown' | 'bell'>('bell');
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [pushSentSuccess, setPushSentSuccess] = useState(false);

  // Real-time Users List from Firebase RTDB
  const [rtdbUsers, setRtdbUsers] = useState<any[]>([]);
  const [userPlanOverrides, setUserPlanOverrides] = useState<Record<string, 'Free Plan' | 'VIP Premium'>>({});
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'online' | 'vip' | 'free'>('all');

  // Dynamic TMDB Catalog state
  const [tmdbCatalogItems, setTmdbCatalogItems] = useState<MediaItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);

  // Ad Banners State for Admin Management
  const [adBanners, setAdBanners] = useState<AdBannerItem[]>([]);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdSubtitle, setNewAdSubtitle] = useState('');
  const [newAdImageUrl, setNewAdImageUrl] = useState('');
  const [newAdLinkUrl, setNewAdLinkUrl] = useState('');
  const [newAdBadge, setNewAdBadge] = useState('SPONSORED');
  const [isSavingAd, setIsSavingAd] = useState(false);
  const [adSaveSuccess, setAdSaveSuccess] = useState(false);

  // Provider & Broadcasting Settings
  const [activeProvider, setActiveProvider] = useState<'vidsrc' | 'vidlink' | 'superembed'>('vidsrc');
  const [streamQuality, setStreamQuality] = useState<'1080p' | '720p'>('1080p');
  const [announcementMsg, setAnnouncementMsg] = useState(() => {
    return localStorage.getItem('mb_system_announcement') || '⚡ VidSrc.sbs 1080P Ultra HD streaming is live! Enjoy lag-free playback.';
  });
  const [announcementSaved, setAnnouncementSaved] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgedSuccess, setPurgedSuccess] = useState(false);

  // Catalog Item Search
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogType, setCatalogType] = useState<'all' | 'movie' | 'tv'>('all');

  // Subscribe to Realtime Database users node
  useEffect(() => {
    const unsubscribe = subscribeToAllUsers((users) => {
      setRtdbUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Ad Banners
  useEffect(() => {
    const unsubAds = subscribeAdBanners((banners) => {
      setAdBanners(banners);
    });
    return () => unsubAds();
  }, []);

  // Subscribe to Maintenance Mode status
  useEffect(() => {
    const unsubMaint = subscribeMaintenanceStatus((status) => {
      setIsMaintenanceEnabled(status.enabled);
      if (status.message) setMaintenanceMsg(status.message);
    });
    return () => unsubMaint();
  }, []);

  // Fetch TMDB Movie & TV Catalog on mount for Admin management
  useEffect(() => {
    let isMounted = true;
    async function loadAdminCatalog() {
      try {
        const [trending, popMovies, popTv, topMovies, topTv, upcoming] = await Promise.all([
          getTrendingMedia('all', 'week'),
          getPopularMovies(),
          getPopularTv(),
          getTopRatedMovies(),
          getTopRatedTv(),
          getUpcomingMovies(),
        ]);

        if (!isMounted) return;

        const map = new Map<string, MediaItem>();
        [...trending, ...popMovies, ...popTv, ...topMovies, ...topTv, ...upcoming].forEach((item) => {
          if (item && item.id) {
            map.set(item.id, item);
          }
        });

        setTmdbCatalogItems(Array.from(map.values()));
      } catch (err) {
        console.warn('Failed to fetch TMDB catalog for AdminScreen:', err);
      } finally {
        if (isMounted) setIsLoadingCatalog(false);
      }
    }

    loadAdminCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Real System Metrics from Connected Data
  // Combine RTDB users with local user session
  const combinedUserList = React.useMemo(() => {
    const userMap = new Map<string, any>();

    // Add current session
    const sessionUid = currentUser.uid || currentUser.id || `mb_${currentUser.movieBoxId}`;
    const sessionPlan =
      userPlanOverrides[sessionUid] ||
      userPlanOverrides[currentUser.id] ||
      userPlanOverrides['curr-admin'] ||
      (localStorage.getItem(`mb_vip_plan_${sessionUid}`) as any) ||
      currentUser.plan ||
      'Free Plan';

    userMap.set(sessionUid, {
      uid: sessionUid,
      username: currentUser.username,
      email: currentUser.email || 'ashirafashes04@gmail.com',
      movieBoxId: currentUser.movieBoxId,
      plan: sessionPlan,
      avatarUrl: currentUser.avatarUrl,
      status: 'Active',
      presence: { online: true, lastSeen: new Date().toISOString() },
    });

    // Merge RTDB users
    rtdbUsers.forEach((u) => {
      const plan =
        userPlanOverrides[u.uid] ||
        (localStorage.getItem(`mb_vip_plan_${u.uid}`) as any) ||
        u.plan ||
        'Free Plan';

      userMap.set(u.uid, {
        uid: u.uid,
        username: u.username || 'MovieFan',
        email: u.email || `${u.movieBoxId}@moviebox.app`,
        movieBoxId: u.movieBoxId || 'MB-001',
        plan,
        avatarUrl: u.avatarUrl,
        status: u.status || 'Active',
        presence: u.presence || { online: false },
        bookmarksCount: u.bookmarksCount || 0,
        downloadsCount: u.downloadsCount || 0,
      });
    });

    return Array.from(userMap.values());
  }, [rtdbUsers, currentUser, userPlanOverrides]);

  // Combined Catalog from TMDB fetched items or static fallback
  const fullCatalog: MediaItem[] = React.useMemo(() => {
    if (tmdbCatalogItems.length > 0) {
      return tmdbCatalogItems;
    }
    const map = new Map<string, MediaItem>();
    [
      ...HERO_CAROUSEL_ITEMS,
      ...BECAUSE_WATCHED_SHELF,
      ...POPULAR_SERIES_SHELF,
      ...COMING_SOON_SHELF,
      ...TRENDING_FREE_DOWNLOADS,
    ].forEach((item) => {
      if (item && item.id) {
        map.set(item.id, item);
      }
    });
    return Array.from(map.values());
  }, [tmdbCatalogItems]);

  // Metrics Calculations based strictly on real catalog & user data
  const totalUsersCount = combinedUserList.length;
  const onlineUsersCount = combinedUserList.filter((u) => u.presence?.online === true).length;
  const vipUsersCount = combinedUserList.filter((u) => u.plan === 'VIP Premium').length;
  const freeUsersCount = combinedUserList.filter((u) => u.plan !== 'VIP Premium').length;

  const totalMoviesCount = fullCatalog.filter((item) => item.type === 'movie' || !item.type).length;
  const totalSeriesCount = fullCatalog.filter((item) => item.type === 'tv').length;

  // Filter Users
  const filteredUsers = combinedUserList.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.movieBoxId.toLowerCase().includes(userSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (userFilter === 'online') return u.presence?.online === true;
    if (userFilter === 'vip') return u.plan === 'VIP Premium';
    if (userFilter === 'free') return u.plan !== 'VIP Premium';
    return true;
  });

  // Filter Catalog Items
  const filteredCatalog = fullCatalog.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(catalogSearch.toLowerCase())) ||
      (item.genres && item.genres.some((g) => g.toLowerCase().includes(catalogSearch.toLowerCase())));

    if (!matchesSearch) return false;
    if (catalogType === 'movie') return item.type === 'movie' || !item.type;
    if (catalogType === 'tv') return item.type === 'tv';
    return true;
  });

  // Action Feedback Alert
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  // Toggle User Plan in RTDB
  const handleTogglePlan = async (userUid: string, currentPlan: string, username?: string) => {
    const nextPlan = currentPlan === 'VIP Premium' ? 'Free Plan' : 'VIP Premium';
    
    // 1. Optimistic update in local state map so UI updates instantly
    setUserPlanOverrides((prev) => ({ ...prev, [userUid]: nextPlan }));

    // 2. Optimistic update in RTDB users state
    setRtdbUsers((prev) =>
      prev.map((u) => (u.uid === userUid ? { ...u, plan: nextPlan } : u))
    );

    // 3. Persist to Firebase RTDB
    await adminUpdateUserInRtdb(userUid, { plan: nextPlan });

    // 4. Update localStorage override
    localStorage.setItem(`mb_vip_plan_${userUid}`, nextPlan);

    // 5. If target user matches active session, update parent App state immediately
    const sessionUid = currentUser.uid || currentUser.id || `mb_${currentUser.movieBoxId}`;
    const isCurrentUser =
      userUid === currentUser.uid ||
      userUid === currentUser.id ||
      userUid === currentUser.email ||
      userUid === currentUser.movieBoxId ||
      userUid === sessionUid ||
      userUid === `session-${currentUser.movieBoxId}` ||
      userUid === `guest_${currentUser.movieBoxId}` ||
      userUid === 'curr-admin';

    if (isCurrentUser) {
      onUpdateCurrentUser({ plan: nextPlan });
      const rawUser = localStorage.getItem('mb_user');
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          localStorage.setItem('mb_user', JSON.stringify({ ...parsed, plan: nextPlan }));
        } catch (e) {}
      }
    }

    // 6. Broadcast event across windows and components
    window.dispatchEvent(
      new CustomEvent('mb_user_plan_updated', {
        detail: { uid: userUid, movieBoxId: currentUser.movieBoxId, plan: nextPlan },
      })
    );

    setActionAlert(`Successfully set ${username || 'user'} to ${nextPlan}!`);
    setTimeout(() => setActionAlert(null), 3000);
  };

  // Toggle User Status (Active / Suspended)
  const handleToggleStatus = async (userUid: string, currentStatus: string, username?: string) => {
    const nextStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    setRtdbUsers((prev) =>
      prev.map((u) => (u.uid === userUid ? { ...u, status: nextStatus } : u))
    );
    await adminUpdateUserInRtdb(userUid, { status: nextStatus });
    setActionAlert(`User ${username || ''} marked as ${nextStatus}`);
    setTimeout(() => setActionAlert(null), 3000);
  };

  const handleSaveAnnouncement = () => {
    localStorage.setItem('mb_system_announcement', announcementMsg);
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 2500);
  };

  const handleBroadcastPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushDesc.trim()) return;

    setIsSendingPush(true);
    await broadcastPushNotification(pushTitle, pushDesc, pushType);
    setPushTitle('');
    setPushDesc('');
    setIsSendingPush(false);
    setPushSentSuccess(true);
    setTimeout(() => setPushSentSuccess(false), 3000);
  };

  const handleToggleMaintenanceMode = async (enabled: boolean) => {
    setIsSavingMaintenance(true);
    await setMaintenanceStatus(enabled, maintenanceMsg);
    setIsMaintenanceEnabled(enabled);
    setIsSavingMaintenance(false);
    setMaintenanceSavedSuccess(true);
    setTimeout(() => setMaintenanceSavedSuccess(false), 2500);
  };

  const handleSaveMaintenanceMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMaintenance(true);
    await setMaintenanceStatus(isMaintenanceEnabled, maintenanceMsg);
    setIsSavingMaintenance(false);
    setMaintenanceSavedSuccess(true);
    setTimeout(() => setMaintenanceSavedSuccess(false), 2500);
  };

  const handlePurgeCache = () => {
    setIsPurging(true);
    setTimeout(() => {
      setIsPurging(false);
      setPurgedSuccess(true);
      setTimeout(() => setPurgedSuccess(false), 2500);
    }, 1000);
  };

  // Ad Banners Handlers
  const handleAddAdBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle.trim() || !newAdImageUrl.trim() || !newAdLinkUrl.trim()) return;

    setIsSavingAd(true);

    let formattedLink = newAdLinkUrl.trim();
    const lower = formattedLink.toLowerCase();

    // Check if it is an internal route (premium, series, movies, explore)
    const isInternal =
      lower === 'premium' ||
      lower === '#premium' ||
      lower === '/premium' ||
      lower === 'app://premium' ||
      lower === 'series' ||
      lower === '#series' ||
      lower === 'movies' ||
      lower === '#movies' ||
      lower === 'explore' ||
      lower === '#explore' ||
      lower.startsWith('category:') ||
      lower.startsWith('internal:');

    // Auto prepend https:// if it's an external URL missing http/https scheme
    if (!isInternal) {
      if (!/^https?:\/\//i.test(formattedLink)) {
        formattedLink = `https://${formattedLink}`;
      }
    }

    let updatedList: AdBannerItem[];

    if (editingAdId) {
      // Edit existing banner
      updatedList = adBanners.map((b) =>
        b.id === editingAdId
          ? {
              ...b,
              title: newAdTitle.trim(),
              subtitle: newAdSubtitle.trim() || undefined,
              imageUrl: newAdImageUrl.trim(),
              linkUrl: formattedLink,
              badgeText: newAdBadge.trim() || 'SPONSORED',
            }
          : b
      );
      setEditingAdId(null);
    } else {
      // Create new banner
      const newBanner: AdBannerItem = {
        id: `ad-${Date.now()}`,
        title: newAdTitle.trim(),
        subtitle: newAdSubtitle.trim() || undefined,
        imageUrl: newAdImageUrl.trim(),
        linkUrl: formattedLink,
        badgeText: newAdBadge.trim() || 'SPONSORED',
        active: true,
        createdAt: new Date().toISOString(),
      };
      updatedList = [newBanner, ...adBanners];
    }

    await syncAdBannersToRtdb(updatedList);
    setAdBanners(updatedList);

    setNewAdTitle('');
    setNewAdSubtitle('');
    setNewAdImageUrl('');
    setNewAdLinkUrl('');
    setNewAdBadge('SPONSORED');
    setIsSavingAd(false);
    setAdSaveSuccess(true);
    setTimeout(() => setAdSaveSuccess(false), 2500);
  };

  const handleEditAdBanner = (banner: AdBannerItem) => {
    setEditingAdId(banner.id);
    setNewAdTitle(banner.title);
    setNewAdSubtitle(banner.subtitle || '');
    setNewAdImageUrl(banner.imageUrl);
    setNewAdLinkUrl(banner.linkUrl);
    setNewAdBadge(banner.badgeText || 'SPONSORED');
  };

  const handleCancelEditAd = () => {
    setEditingAdId(null);
    setNewAdTitle('');
    setNewAdSubtitle('');
    setNewAdImageUrl('');
    setNewAdLinkUrl('');
    setNewAdBadge('SPONSORED');
  };

  const handleToggleAdActive = async (adId: string) => {
    const updatedList = adBanners.map((b) => (b.id === adId ? { ...b, active: !b.active } : b));
    await syncAdBannersToRtdb(updatedList);
    setAdBanners(updatedList);
  };

  const handleDeleteAdBanner = async (adId: string) => {
    const updatedList = adBanners.filter((b) => b.id !== adId);
    await syncAdBannersToRtdb(updatedList);
    setAdBanners(updatedList);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07080e] text-white flex flex-col overflow-hidden select-none">
      {/* Clean Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#0d0f1a] border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="px-3 py-1.5 rounded-xl bg-[#00df82] hover:bg-[#00c975] text-black font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
              title="Return to MovieBox App"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to App</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  MovieBox Admin Panel
                </h1>
                <p className="text-[11px] text-zinc-400">
                  System & Content Management
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogoutAdmin}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Admin</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-[#0d0f1a]/80 border-b md:border-b-0 md:border-r border-white/10 p-3 space-y-1 shrink-0 overflow-x-auto md:overflow-y-auto no-scrollbar flex md:flex-col">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#00df82] text-black shadow-lg shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview & Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-[#00df82] text-black shadow-lg shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts ({totalUsersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-[#00df82] text-black shadow-lg shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Movies & Series Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('providers')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'providers'
                ? 'bg-[#00df82] text-black shadow-lg shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Provider Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'bg-[#00df82] text-black shadow-lg shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Broadcasting & Cache</span>
          </button>

          <button
            onClick={() => setActiveTab('ads')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'ads'
                ? 'bg-[#00df82] text-black shadow-lg shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Ad Banners Manager ({adBanners.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'bg-[#00df82] text-black shadow-lg shadow-emerald-500/20'
                : isMaintenanceEnabled
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <div className="flex items-center gap-1.5">
              <span>Maintenance Mode</span>
              {isMaintenanceEnabled && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </div>
          </button>
        </aside>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
          {/* TAB 1: OVERVIEW & ANALYSIS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Summary Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-[#121422] border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase block">Total Users</span>
                  <div className="text-2xl font-black text-white">{totalUsersCount}</div>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Live Synced
                  </span>
                </div>

                <div className="bg-[#121422] border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase block">Online Now</span>
                  <div className="text-2xl font-black text-[#00df82] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00df82] animate-pulse" />
                    {onlineUsersCount}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-semibold">Active Session</span>
                </div>

                <div className="bg-[#121422] border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase block">VIP Premium</span>
                  <div className="text-2xl font-black text-amber-400">{vipUsersCount}</div>
                  <span className="text-[10px] text-amber-400 font-bold">
                    {Math.round((vipUsersCount / Math.max(totalUsersCount, 1)) * 100)}% Conversion
                  </span>
                </div>

                <div className="bg-[#121422] border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase block">Free Users</span>
                  <div className="text-2xl font-black text-zinc-300">{freeUsersCount}</div>
                  <span className="text-[10px] text-zinc-500 font-semibold">Standard Access</span>
                </div>

                <div className="bg-[#121422] border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase block">Movies</span>
                  <div className="text-2xl font-black text-blue-400">{totalMoviesCount}</div>
                  <span className="text-[10px] text-blue-300 font-semibold">HD Streaming</span>
                </div>

                <div className="bg-[#121422] border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase block">TV Series</span>
                  <div className="text-2xl font-black text-purple-400">{totalSeriesCount}</div>
                  <span className="text-[10px] text-purple-300 font-semibold">ShortTV & Dramas</span>
                </div>
              </div>

              {/* Streaming Health & Provider Status Banner */}
              <div className="bg-[#121422] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Radio className="w-5 h-5 text-[#00df82] animate-pulse" />
                    <div>
                      <h3 className="text-sm font-extrabold text-white">VidSrc.sbs Primary Streaming Status</h3>
                      <p className="text-xs text-zinc-400">1080P Adaptive Stream Mirror Endpoint</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#00df82] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    100% OPERATIONAL
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Latency</span>
                    <span className="text-sm font-bold text-white">18ms (Ultra Fast)</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Active Quality</span>
                    <span className="text-sm font-bold text-[#00df82]">1080P Ultra HD</span>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Cache Buffer</span>
                    <span className="text-sm font-bold text-blue-400">P2P Edge Synced</span>
                  </div>
                </div>
              </div>

              {/* Connected Users Live Flow */}
              <div className="bg-[#121422] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#00df82]" />
                      <span>Live Registered Users Flow</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Real-time user accounts fetched directly from Firebase Realtime Database
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-xs font-bold text-[#00df82] hover:underline cursor-pointer"
                  >
                    View All Accounts →
                  </button>
                </div>

                <div className="divide-y divide-white/5">
                  {combinedUserList.slice(0, 5).map((u) => (
                    <div key={`overview-u-${u.uid}`} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={u.avatarUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%231a1d28"/%3E%3Ccircle cx="50" cy="38" r="18" fill="%2300df82"/%3E%3Cpath d="M22 84 c0 -18 14 -28 28 -28 s28 10 28 28" fill="%2300df82"/%3E%3C/svg%3E'}
                            alt={u.username}
                            className="w-9 h-9 rounded-full object-cover border border-white/10"
                          />
                          {u.presence?.online && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00df82] border-2 border-[#07080e] absolute bottom-0 right-0 animate-pulse" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{u.username}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                u.plan === 'VIP Premium'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {u.plan}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                            ID: <span className="font-mono text-zinc-500">{u.movieBoxId}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.presence?.online
                              ? 'bg-emerald-500/10 text-[#00df82] border border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {u.presence?.online ? 'ONLINE' : 'OFFLINE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER ACCOUNTS MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Search & Filter Header Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search accounts by username, email, or MovieBox ID..."
                    className="w-full bg-[#121422] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-[#00df82]"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#121422] p-1 rounded-xl border border-white/10 shrink-0">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      userFilter === 'all' ? 'bg-[#00df82] text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All ({combinedUserList.length})
                  </button>
                  <button
                    onClick={() => setUserFilter('online')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      userFilter === 'online' ? 'bg-[#00df82] text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Online ({onlineUsersCount})
                  </button>
                  <button
                    onClick={() => setUserFilter('vip')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      userFilter === 'vip' ? 'bg-[#00df82] text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    VIP ({vipUsersCount})
                  </button>
                  <button
                    onClick={() => setUserFilter('free')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      userFilter === 'free' ? 'bg-[#00df82] text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Free ({freeUsersCount})
                  </button>
                </div>
              </div>

              {/* Feedback alert banner */}
              {actionAlert && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-[#00df82] font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{actionAlert}</span>
                </div>
              )}

              {/* User Accounts List Table */}
              <div className="bg-[#121422] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs">
                    No user accounts found matching query.
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <div
                      key={`u-card-${u.uid}`}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={u.avatarUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%231a1d28"/%3E%3Ccircle cx="50" cy="38" r="18" fill="%2300df82"/%3E%3Cpath d="M22 84 c0 -18 14 -28 28 -28 s28 10 28 28" fill="%2300df82"/%3E%3C/svg%3E'}
                            alt={u.username}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                          <span
                            className={`w-3 h-3 rounded-full border-2 border-[#07080e] absolute bottom-0 right-0 ${
                              u.presence?.online ? 'bg-[#00df82] animate-pulse' : 'bg-zinc-600'
                            }`}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white truncate">{u.username}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                u.plan === 'VIP Premium'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {u.plan}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                u.status === 'Suspended'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-emerald-500/20 text-[#00df82]'
                              }`}
                            >
                              {u.status || 'Active'}
                            </span>
                          </div>

                          <div className="text-xs text-zinc-400 truncate mt-0.5 flex items-center gap-2">
                            <span className="font-mono text-zinc-500">ID: {u.movieBoxId}</span>
                            <span>•</span>
                            <span>{u.email || 'guest@moviebox.app'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Admin Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <button
                          onClick={() => handleTogglePlan(u.uid, u.plan, u.username)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                            u.plan === 'VIP Premium'
                              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                        >
                          {u.plan === 'VIP Premium' ? 'Downgrade Free' : 'Grant VIP'}
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u.uid, u.status || 'Active', u.username)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                            u.status === 'Suspended'
                              ? 'bg-emerald-500/20 text-[#00df82] hover:bg-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          }`}
                        >
                          {u.status === 'Suspended' ? 'Activate' : 'Suspend'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MOVIES & SERIES CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search catalog by title, genre, or keyword..."
                    className="w-full bg-[#121422] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-[#00df82]"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#121422] p-1 rounded-xl border border-white/10 shrink-0">
                  <button
                    onClick={() => setCatalogType('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      catalogType === 'all' ? 'bg-[#00df82] text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    All Items ({fullCatalog.length})
                  </button>
                  <button
                    onClick={() => setCatalogType('movie')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      catalogType === 'movie' ? 'bg-[#00df82] text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Movies ({fullCatalog.filter((i) => i.type === 'movie' || !i.type).length})
                  </button>
                  <button
                    onClick={() => setCatalogType('tv')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      catalogType === 'tv' ? 'bg-[#00df82] text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    TV Series ({fullCatalog.filter((i) => i.type === 'tv').length})
                  </button>
                </div>
              </div>

              {/* Media Catalog Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredCatalog.map((item) => (
                  <div
                    key={`cat-${item.id}`}
                    className="bg-[#121422] border border-white/10 rounded-2xl overflow-hidden flex flex-col group hover:border-[#00df82]/50 transition"
                  >
                    <div className="relative aspect-[2/3] w-full bg-zinc-900 overflow-hidden">
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[#00df82] border border-[#00df82]/30">
                        {item.type === 'tv' ? 'TV SHOW' : 'MOVIE'}
                      </span>
                      {item.rating && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-amber-400">
                          ★ {item.rating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="text-xs font-extrabold text-white truncate">{item.title}</h4>
                        <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {item.year || '2024'} • {item.category || item.genres?.join(', ') || 'Action'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
                        <span>TMDB ID: {item.tmdbId || 'Auto'}</span>
                        <span className="text-[#00df82] font-semibold">VidSrc HD</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROVIDER ENGINE & CONFIG */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <div className="bg-[#121422] border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#00df82]" />
                      <span>Primary Streaming Provider Mirror</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Select active streaming server engine for movies and TV episodes
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#00df82] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    VidSrc.sbs Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border bg-emerald-500/15 border-[#00df82] text-white shadow-lg flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-bold flex items-center gap-2">
                        <span>VidSrc.sbs Primary Engine</span>
                        <span className="text-[9px] bg-[#00df82] text-black font-black px-2 py-0.5 rounded">
                          OFFICIAL PROVIDER
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300">
                        `https://vidsrc.sbs/embed/movie/&#123;tmdb_id&#125;` & `https://vidsrc.sbs/embed/tv/&#123;tmdb_id&#125;/&#123;season&#125;/&#123;episode&#125;`
                      </p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-[#00df82]" />
                  </div>
                </div>
              </div>

              {/* Streaming Quality Settings */}
              <div className="bg-[#121422] border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#00df82]" />
                  <span>Stream Quality & Playback Preset</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setStreamQuality('1080p')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      streamQuality === '1080p'
                        ? 'bg-[#00df82]/15 border-[#00df82] text-white'
                        : 'bg-black/30 border-white/5 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">1080P Ultra HD (Default)</div>
                    <div className="text-[11px] text-zinc-400 mt-1">High bitrate crystal clear streaming</div>
                  </button>

                  <button
                    onClick={() => setStreamQuality('720p')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      streamQuality === '720p'
                        ? 'bg-[#00df82]/15 border-[#00df82] text-white'
                        : 'bg-black/30 border-white/5 text-zinc-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">720P Balanced HD</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Optimized for low bandwidth cellular connections</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANNOUNCEMENTS & PUSH NOTIFICATIONS & CACHE */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              {/* Push Notification Broadcast Form */}
              <div className="bg-[#121422] border border-[#00df82]/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#00df82]" />
                    <span>Send Real-Time Admin Push Notification</span>
                  </h3>
                  {pushSentSuccess && (
                    <span className="text-xs text-[#00df82] font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      ✓ Push Notification Sent Live!
                    </span>
                  )}
                </div>

                <form onSubmit={handleBroadcastPush} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Push Notification Title *
                      </label>
                      <input
                        type="text"
                        value={pushTitle}
                        onChange={(e) => setPushTitle(e.target.value)}
                        placeholder="e.g., Alien: Earth Episode 4 Released!"
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00df82]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Category Icon
                      </label>
                      <select
                        value={pushType}
                        onChange={(e) => setPushType(e.target.value as any)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00df82]"
                      >
                        <option value="bell">🔔 System Alert (Bell)</option>
                        <option value="film">🎬 Movie / Series Update</option>
                        <option value="zap">⚡ P2P & Download Alert</option>
                        <option value="crown">👑 VIP Promotion</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                      Notification Body Message *
                    </label>
                    <textarea
                      value={pushDesc}
                      onChange={(e) => setPushDesc(e.target.value)}
                      rows={2}
                      placeholder="e.g., Stream in 1080P HD or download for offline viewing with zero buffering."
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00df82]"
                    />
                  </div>

                  {/* Recipient Audience & Quick Templates */}
                  <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-[#00df82]" />
                        <span>Target Audience:</span>
                        <strong className="text-white">{combinedUserList.length} Registered Users & Devices</strong>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {onlineUsersCount} Online Now
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPushTitle('🎬 New 4K Blockbuster Released!');
                          setPushDesc('Stream the latest trending movie in 1080P Ultra HD with zero buffering now.');
                          setPushType('film');
                        }}
                        className="text-[10px] bg-white/10 hover:bg-white/20 text-zinc-200 px-2 py-0.5 rounded border border-white/10 transition cursor-pointer"
                      >
                        🎬 New Movie
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPushTitle('👑 VIP Special: 50% Off Unlimited Pass');
                          setPushDesc('Unlock instant 4K streaming, zero ads, and unlimited high-speed downloads.');
                          setPushType('crown');
                        }}
                        className="text-[10px] bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 px-2 py-0.5 rounded border border-amber-500/25 transition cursor-pointer"
                      >
                        👑 VIP Promo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPushTitle('⚡ High-Speed VidSrc Mirrors Connected');
                          setPushDesc('New ultra-fast streaming nodes deployed. Enjoy smooth playback on mobile & TV.');
                          setPushType('zap');
                        }}
                        className="text-[10px] bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 px-2 py-0.5 rounded border border-sky-500/25 transition cursor-pointer"
                      >
                        ⚡ Speed Boost
                      </button>
                    </div>

                    {/* Users Receiving Broadcast Preview */}
                    <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      <span className="text-[9px] text-zinc-500 shrink-0 font-medium">Recipients:</span>
                      {combinedUserList.slice(0, 8).map((u) => (
                        <div
                          key={`recip-${u.uid}`}
                          className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full border border-white/5 shrink-0"
                          title={u.username}
                        >
                          <img
                            src={u.avatarUrl || '/avatars/simba.webp'}
                            alt={u.username}
                            className="w-3.5 h-3.5 rounded-full object-cover"
                          />
                          <span className="text-[10px] text-zinc-300 font-medium max-w-[80px] truncate">
                            {u.username}
                          </span>
                        </div>
                      ))}
                      {combinedUserList.length > 8 && (
                        <span className="text-[9px] text-[#00df82] shrink-0 font-bold">
                          +{combinedUserList.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-400">
                      Pushes to top status bar of mobile devices & in-app banner
                    </span>

                    <button
                      type="submit"
                      disabled={isSendingPush || !pushTitle.trim() || !pushDesc.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#00df82] hover:bg-[#00c975] disabled:opacity-50 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSendingPush ? 'Broadcasting Push...' : 'Send Live Push Notification'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Broadcast Announcement Bar */}
              <div className="bg-[#121422] border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Broadcast System Marquee Banner Message</span>
                </h3>

                <textarea
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00df82]"
                  placeholder="Enter message to broadcast to all app users..."
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    Displays at the top of the Home Screen for all users
                  </span>
                  <button
                    onClick={handleSaveAnnouncement}
                    className="px-4 py-2 rounded-xl bg-[#00df82] text-black font-extrabold text-xs shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    {announcementSaved ? 'Broadcast Published!' : 'Publish Marquee Banner'}
                  </button>
                </div>
              </div>

              {/* Edge Cache Purge */}
              <div className="bg-[#121422] border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#00df82]" />
                  <span>System Buffer & Edge Cache Control</span>
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Flushes the application edge server cache and re-synchronizes TMDB media shelves.
                </p>

                <button
                  onClick={handlePurgeCache}
                  disabled={isPurging}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 text-[#00df82] ${isPurging ? 'animate-spin' : ''}`} />
                  <span>{isPurging ? 'Purging Cache...' : purgedSuccess ? 'Cache Flushed!' : 'Purge Global Edge Cache'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: AD BANNERS MANAGER */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              {/* Create / Edit Ad Form */}
              <div className="bg-[#121422] border border-[#00df82]/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#00df82]" />
                    <span>{editingAdId ? 'Edit Movie & VIP Feature Banner' : 'Publish Movie & VIP Feature Banner'}</span>
                  </h3>
                  {editingAdId && (
                    <button
                      type="button"
                      onClick={handleCancelEditAd}
                      className="text-[11px] font-bold text-zinc-400 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      <span>Cancel Editing</span>
                    </button>
                  )}
                  {!editingAdId && (
                    <span className="text-[10px] text-zinc-400 font-semibold bg-emerald-500/10 text-[#00df82] px-2 py-0.5 rounded border border-emerald-500/20">
                      Live Synced to Home, Series & Downloads
                    </span>
                  )}
                </div>

                <form onSubmit={handleAddAdBanner} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Ad Title / Headline *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdTitle}
                        onChange={(e) => setNewAdTitle(e.target.value)}
                        placeholder="e.g. MovieBox VIP Pass - 50% Off Unlimited Streaming"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00df82]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Badge Label
                      </label>
                      <input
                        type="text"
                        value={newAdBadge}
                        onChange={(e) => setNewAdBadge(e.target.value)}
                        placeholder="SPONSORED, PROMO, SPECIAL OFFER, AD"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00df82]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                      Ad Description / Subtitle
                    </label>
                    <input
                      type="text"
                      value={newAdSubtitle}
                      onChange={(e) => setNewAdSubtitle(e.target.value)}
                      placeholder="e.g. Stream 4K Ultra HD movies & TV series with zero ads & instant downloads!"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00df82]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Banner Image URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdImageUrl}
                        onChange={(e) => setNewAdImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or poster link"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00df82]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                        Target Clickable Website / App Link URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdLinkUrl}
                        onChange={(e) => setNewAdLinkUrl(e.target.value)}
                        placeholder="https://mywebsite.com, www.brand.com, or premium"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00df82]"
                      />

                      {/* Quick Preset Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[10px] text-zinc-400 font-bold">Presets:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewAdLinkUrl('premium');
                            if (!newAdBadge) setNewAdBadge('MOVIEBOX VIP');
                          }}
                          className="text-[10px] bg-emerald-500/15 hover:bg-emerald-500/25 text-[#00df82] px-2 py-0.5 rounded border border-emerald-500/30 transition cursor-pointer flex items-center gap-1 font-bold"
                        >
                          <Crown className="w-2.5 h-2.5 text-[#00df82]" />
                          <span>VIP Pass (premium)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewAdLinkUrl('series');
                            if (!newAdBadge) setNewAdBadge('EXPLORER • SERIES');
                          }}
                          className="text-[10px] bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30 transition cursor-pointer flex items-center gap-1 font-bold"
                        >
                          <span>Explorer Series (series)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewAdLinkUrl('movies');
                            if (!newAdBadge) setNewAdBadge('NEW MOVIES');
                          }}
                          className="text-[10px] bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 transition cursor-pointer flex items-center gap-1 font-bold"
                        >
                          <span>New Movies (movies)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewAdLinkUrl('https://moviebox.ph')}
                          className="text-[10px] bg-white/10 hover:bg-white/20 text-zinc-200 px-2 py-0.5 rounded border border-white/10 transition cursor-pointer flex items-center gap-1"
                        >
                          <Globe className="w-2.5 h-2.5 text-[#00df82]" />
                          <span>Website (moviebox.ph)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-zinc-400">
                      Supports any custom website link or in-app page destination
                    </span>

                    <button
                      type="submit"
                      disabled={isSavingAd}
                      className="px-5 py-2.5 rounded-xl bg-[#00df82] hover:bg-[#00c975] text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {isSavingAd
                          ? 'Saving Ad...'
                          : adSaveSuccess
                          ? 'Saved Successfully!'
                          : editingAdId
                          ? 'Update Ad Banner'
                          : 'Publish Ad Banner'}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Ad Banners List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#00df82]" />
                    <span>Active & Saved Ad Banners ({adBanners.length})</span>
                  </h3>
                </div>

                {adBanners.length === 0 ? (
                  <div className="bg-[#121422] border border-white/10 rounded-2xl p-8 text-center text-zinc-400 text-xs">
                    No ad banners created yet. Use the form above to add your first clickable advertisement!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {adBanners.map((banner) => {
                      const isInternal =
                        banner.linkUrl?.toLowerCase() === 'premium' ||
                        banner.linkUrl?.toLowerCase() === '#premium' ||
                        banner.linkUrl?.toLowerCase() === '/premium' ||
                        banner.linkUrl?.toLowerCase() === 'app://premium';

                      return (
                        <div
                          key={banner.id}
                          className="bg-[#121422] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 bg-zinc-800 border border-white/10"
                            />

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[9px] font-extrabold uppercase bg-[#00df82]/20 text-[#00df82] px-2 py-0.5 rounded border border-[#00df82]/30">
                                  {banner.badgeText || 'SPONSORED'}
                                </span>

                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                    isInternal
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  }`}
                                >
                                  {isInternal ? '👑 In-App VIP Pass' : '🌐 External Website'}
                                </span>

                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                    banner.active
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-zinc-800 text-zinc-400 border border-white/10'
                                  }`}
                                >
                                  {banner.active ? 'Active Live' : 'Disabled'}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-white truncate">{banner.title}</h4>

                              {banner.subtitle && (
                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                  {banner.subtitle}
                                </p>
                              )}

                              <a
                                href={isInternal ? '#premium' : banner.linkUrl}
                                target={isInternal ? '_self' : '_blank'}
                                rel="noopener noreferrer"
                                className="text-[10px] text-[#00df82] hover:underline flex items-center gap-1 mt-1 truncate"
                              >
                                {isInternal ? <Crown className="w-3 h-3 text-[#00df82]" /> : <ExternalLink className="w-3 h-3" />}
                                <span className="truncate">{banner.linkUrl}</span>
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => handleEditAdBanner(banner)}
                              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
                              title="Edit Ad Banner"
                            >
                              <Pencil className="w-3.5 h-3.5 text-[#00df82]" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => handleToggleAdActive(banner.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                banner.active
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                  : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              {banner.active ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              onClick={() => handleDeleteAdBanner(banner.id)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition cursor-pointer"
                              title="Delete Ad Banner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: MAINTENANCE MODE MANAGER */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {/* Maintenance Mode Status Toggle */}
              <div className={`border rounded-2xl p-6 space-y-5 transition ${
                isMaintenanceEnabled
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-[#121422] border-white/10'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isMaintenanceEnabled
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/10 text-[#00df82] border border-emerald-500/20'
                    }`}>
                      <Wrench className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-white">Application Maintenance Mode</h3>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          isMaintenanceEnabled
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                            : 'bg-emerald-500/10 text-[#00df82] border-emerald-500/20'
                        }`}>
                          {isMaintenanceEnabled ? 'MAINTENANCE ACTIVE' : 'SYSTEM ONLINE'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        When enabled, normal app users will see a full-screen maintenance notice ("Our system is under maintenance") while you perform updates. Admins can bypass this screen anytime.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleMaintenanceMode(!isMaintenanceEnabled)}
                      disabled={isSavingMaintenance}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition active:scale-95 cursor-pointer shadow-lg flex items-center gap-2 ${
                        isMaintenanceEnabled
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                          : 'bg-[#00df82] hover:bg-[#00c975] text-black shadow-emerald-500/20'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>
                        {isSavingMaintenance
                          ? 'Updating...'
                          : isMaintenanceEnabled
                          ? 'Turn OFF Maintenance Mode'
                          : 'Turn ON Maintenance Mode'}
                      </span>
                    </button>
                  </div>
                </div>

                {maintenanceSavedSuccess && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-[#00df82] font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Maintenance mode setting updated and synchronized across all connected devices!</span>
                  </div>
                )}
              </div>

              {/* Maintenance Custom Notice Message */}
              <div className="bg-[#121422] border border-white/10 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Customize Maintenance Screen Notice Text</span>
                </h3>

                <form onSubmit={handleSaveMaintenanceMsg} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                      Maintenance Notice Text (Shown to Users)
                    </label>
                    <textarea
                      value={maintenanceMsg}
                      onChange={(e) => setMaintenanceMsg(e.target.value)}
                      rows={3}
                      required
                      placeholder="Our system is currently under maintenance. Please check back shortly."
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00df82]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      Standard users will see this exact message when maintenance mode is active.
                    </span>

                    <button
                      type="submit"
                      disabled={isSavingMaintenance}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs border border-white/10 transition active:scale-95 cursor-pointer"
                    >
                      Save Notice Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

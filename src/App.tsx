import React, { useState, useEffect, useRef } from 'react';
import { TabType, MediaItem, ShortDramaItem, DownloadItem, UserProfile } from './types';
import {
  HERO_CAROUSEL_ITEMS,
  BECAUSE_WATCHED_SHELF,
  POPULAR_SERIES_SHELF,
  COMING_SOON_SHELF,
  TRENDING_FREE_DOWNLOADS,
} from './data/mediaData';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/screens/HomeScreen';
import { ShortTVScreen } from './components/screens/ShortTVScreen';
import { PremiumScreen } from './components/screens/PremiumScreen';
import { DownloadsScreen } from './components/screens/DownloadsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SplashScreen } from './components/SplashScreen';
import { AdminScreen } from './components/AdminScreen';
import { MediaDetailModal } from './components/MediaDetailModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ShortPlayerModal } from './components/ShortPlayerModal';
import { TransferModal } from './components/TransferModal';
import { AuthModal } from './components/AuthModal';
import { NotificationModal } from './components/NotificationModal';
import { ScannerModal } from './components/ScannerModal';
import { GetStartedScreen } from './components/GetStartedScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { CheckCircle2, ArrowDownToLine, Database, Wrench, ShieldCheck, Bell } from 'lucide-react';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getProviderDownloadData, triggerDeviceDownload } from './services/downloadService';
import { subscribeMaintenanceStatus } from './services/maintenanceService';
import { AppNotification, subscribeLivePushBroadcasts } from './services/notificationService';
import { TopPushNotificationBanner } from './components/TopPushNotificationBanner';
import { isAuthorizedAdmin } from './lib/adminAuth';
import {
  auth,
  onAuthStateChanged,
  fbSignOut,
  subscribeToUserData,
  subscribeToConnectionStatus,
  saveUserProfileToRtdb,
  syncBookmarksToRtdb,
  syncDownloadsToRtdb,
  trackUserPresence,
} from './lib/firebase';

const INITIAL_USER: UserProfile = {
  id: 'usr-1',
  username: 'Tourist XSb5pX',
  movieBoxId: '816054230',
  avatarUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%231a1d28"/%3E%3Ccircle cx="50" cy="38" r="18" fill="%2300df82"/%3E%3Cpath d="M22 84 c0 -18 14 -28 28 -28 s28 10 28 28" fill="%2300df82"/%3E%3C/svg%3E',
  plan: 'Free Plan',
  isLoggedIn: false,
  communitiesCount: 0,
  downloadsCount: 0,
  myListCount: 0,
};

export default function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [isAdminScreenOpen, setIsAdminScreenOpen] = useState(false);
  // User Profile with persistent session retrieval
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mb_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...INITIAL_USER, ...parsed };
        }
      } catch (e) {
        // Fallback to initial
      }
    }
    return INITIAL_USER;
  });

  // One-time onboarding: Only show Get Started & Sign Up if new install / no account created yet
  const [showGetStarted, setShowGetStarted] = useState<boolean>(() => {
    const hasAccountCreated = localStorage.getItem('mb_account_created') === 'true';
    const hasSeenOnboarding = localStorage.getItem('mb_get_started_seen') === 'true';
    return !hasAccountCreated && !hasSeenOnboarding;
  });
  const [showSignUpPage, setShowSignUpPage] = useState<boolean>(false);
  const [signUpInitialMode, setSignUpInitialMode] = useState<'signup' | 'signin'>('signup');

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [activeCategory, setActiveCategory] = useState<string>('Trending');
  const [isRtdbConnected, setIsRtdbConnected] = useState<boolean>(true);

  // Downloads List
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    const saved = localStorage.getItem('mb_downloads');
    return saved ? JSON.parse(saved) : [];
  });

  // My List / Bookmarks
  const [bookmarks, setBookmarks] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('mb_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Keep a ref to avoid stale closures in listeners
  const currentUidRef = useRef<string | undefined>(user.uid);
  currentUidRef.current = user.uid;

  // Active Modals State
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [playingMedia, setPlayingMedia] = useState<{ item: MediaItem; episode?: number; season?: number } | null>(null);
  const [playingShortDrama, setPlayingShortDrama] = useState<ShortDramaItem | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Maintenance Mode state
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState('Our system is currently under maintenance. Please check back shortly.');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Subscribe to Maintenance Mode Status
  useEffect(() => {
    const unsub = subscribeMaintenanceStatus((status) => {
      setIsMaintenanceActive(status.enabled);
      if (status.message) setMaintenanceNotice(status.message);
    });
    return () => unsub();
  }, []);

  // Listen for Live Admin Push Notifications across all devices
  useEffect(() => {
    const unsubLivePush = subscribeLivePushBroadcasts((notif) => {
      showToast(`🔔 ${notif.title}`);
    });

    const handlePushReceived = (e: Event) => {
      const custom = e as CustomEvent<AppNotification>;
      if (custom.detail) {
        showToast(`🔔 ${custom.detail.title}`);
      }
    };
    window.addEventListener('mb_push_received', handlePushReceived);

    return () => {
      unsubLivePush();
      window.removeEventListener('mb_push_received', handlePushReceived);
    };
  }, []);

  // Sync user profile & track presence in RTDB so Admin can track all users
  useEffect(() => {
    const userKey = user.uid || user.id || `mb_${user.movieBoxId}`;

    saveUserProfileToRtdb(userKey, {
      username: user.username,
      email: user.email || `${user.movieBoxId}@moviebox.app`,
      movieBoxId: user.movieBoxId,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
    }).catch(console.warn);

    trackUserPresence(userKey, true).catch(console.warn);

    const handleBeforeUnload = () => {
      trackUserPresence(userKey, false).catch(console.warn);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Listen to real-time Admin VIP Plan Updates
    const handlePlanEvent = (e: Event) => {
      const custom = e as CustomEvent<{ uid?: string; movieBoxId?: string; plan: 'Free Plan' | 'VIP Premium' }>;
      if (custom.detail) {
        const { uid, movieBoxId, plan } = custom.detail;
        const isTarget =
          !uid ||
          uid === userKey ||
          uid === user.id ||
          uid === user.uid ||
          (movieBoxId && movieBoxId === user.movieBoxId) ||
          uid === 'curr-admin' ||
          uid === `mb_${user.movieBoxId}`;

        if (isTarget) {
          setUser((prev) => {
            const updated = { ...prev, plan };
            localStorage.setItem('mb_user', JSON.stringify(updated));
            return updated;
          });
          showToast(
            plan === 'VIP Premium'
              ? '👑 You have been granted VIP Premium by Admin!'
              : 'Plan updated to Free Plan'
          );
        }
      }
    };
    window.addEventListener('mb_user_plan_updated', handlePlanEvent);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('mb_user_plan_updated', handlePlanEvent);
    };
  }, [user.id, user.uid, user.movieBoxId, user.username, user.plan, user.avatarUrl, user.email]);

  // 1. Listen to global tab & category navigation events (e.g. from internal banner clicks)
  useEffect(() => {
    const handleNavigateTab = (e: Event) => {
      const customEvent = e as CustomEvent<TabType>;
      if (customEvent.detail) {
        setCurrentTab(customEvent.detail);
      }
    };
    const handleNavigateCategory = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setCurrentTab('home');
        setActiveCategory(customEvent.detail);
      }
    };
    window.addEventListener('mb_navigate_tab', handleNavigateTab);
    window.addEventListener('mb_navigate_category', handleNavigateCategory);
    return () => {
      window.removeEventListener('mb_navigate_tab', handleNavigateTab);
      window.removeEventListener('mb_navigate_category', handleNavigateCategory);
    };
  }, []);

  // 2. Listen to Firebase Realtime Database connection status
  useEffect(() => {
    const unsubscribe = subscribeToConnectionStatus((connected) => {
      setIsRtdbConnected(connected);
    });
    return () => unsubscribe();
  }, []);

  // 3. Listen to Firebase Auth state changes & sync with Realtime Database
  useEffect(() => {
    let unsubscribeRtdb: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // Track user presence in RTDB
        trackUserPresence(fbUser.uid, true);

        // User is logged in with Firebase
        setUser((prev) => ({
          ...prev,
          uid: fbUser.uid,
          email: fbUser.email || undefined,
          username: fbUser.displayName || prev.username || 'MovieFan',
          isLoggedIn: true,
        }));

        // Subscribe to this user's data from Firebase Realtime Database
        if (unsubscribeRtdb) {
          unsubscribeRtdb();
        }

        unsubscribeRtdb = subscribeToUserData(fbUser.uid, {
          onProfile: (rtdbProfile) => {
            if (rtdbProfile) {
              setUser((prev) => ({
                ...prev,
                username: rtdbProfile.username || prev.username,
                movieBoxId: rtdbProfile.movieBoxId || prev.movieBoxId,
                plan: rtdbProfile.plan || prev.plan,
                avatarUrl: rtdbProfile.avatarUrl || prev.avatarUrl,
                email: rtdbProfile.email || prev.email,
              }));
            }
          },
          onBookmarks: (rtdbBookmarks) => {
            if (Array.isArray(rtdbBookmarks) && rtdbBookmarks.length > 0) {
              setBookmarks(rtdbBookmarks);
            }
          },
          onDownloads: (rtdbDownloads) => {
            if (Array.isArray(rtdbDownloads) && rtdbDownloads.length > 0) {
              setDownloads(rtdbDownloads);
            }
          },
        });
      } else {
        // User logged out
        if (unsubscribeRtdb) {
          unsubscribeRtdb();
          unsubscribeRtdb = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRtdb) {
        unsubscribeRtdb();
      }
    };
  }, []);

  // Sync state to localStorage as fast offline backup
  useEffect(() => {
    localStorage.setItem('mb_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('mb_downloads', JSON.stringify(downloads));
  }, [downloads]);

  useEffect(() => {
    localStorage.setItem('mb_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Aggregate all items for search lookup
  const allMediaItems: MediaItem[] = [
    ...HERO_CAROUSEL_ITEMS,
    ...BECAUSE_WATCHED_SHELF,
    ...POPULAR_SERIES_SHELF,
    ...COMING_SOON_SHELF,
    ...TRENDING_FREE_DOWNLOADS,
  ];

  // Handlers with Realtime Database synchronization & Guest Protection
  const requireAuth = (actionLabel: string = 'watch and stream'): boolean => {
    if (!user.isLoggedIn) {
      setSelectedMedia(null);
      setPlayingMedia(null);
      setPlayingShortDrama(null);
      setShowSignUpPage(true);
      showToast(`Please sign in or create an account to ${actionLabel}`);
      return false;
    }
    return true;
  };

  const handleDownload = (
    item: MediaItem,
    _options?: { quality?: string; season?: number; episode?: number }
  ) => {
    if (!requireAuth('download movies')) return;
    showToast(`Downloading "${item?.title || 'movie'}" in background`);
  };

  const handleToggleBookmark = (item: MediaItem) => {
    const exists = bookmarks.some((b) => b.id === item.id);
    let nextBookmarks: MediaItem[];
    if (exists) {
      nextBookmarks = bookmarks.filter((b) => b.id !== item.id);
      showToast(`Removed "${item.title}" from My List`);
    } else {
      nextBookmarks = [item, ...bookmarks];
      showToast(`Added "${item.title}" to My List`);
    }
    setBookmarks(nextBookmarks);

    // Sync to Realtime Database if authenticated
    if (user.uid) {
      syncBookmarksToRtdb(user.uid, nextBookmarks).catch((err) => {
        console.warn('Could not sync bookmark to Realtime Database:', err);
      });
    }
  };

  const handleUpgradePlan = (_duration: string) => {
    const updatedUser = {
      ...user,
      plan: 'VIP Premium' as const,
    };
    setUser(updatedUser);
    showToast('Payment coming soon! You are already a VIP user.');

    if (user.uid) {
      saveUserProfileToRtdb(user.uid, {
        username: updatedUser.username,
        email: updatedUser.email,
        movieBoxId: updatedUser.movieBoxId,
        avatarUrl: updatedUser.avatarUrl,
        plan: 'VIP Premium',
      }).catch((err) => {
        console.warn('Could not sync upgraded plan to Realtime Database:', err);
      });
    }
  };

  const handleSimulateReceive = (title: string, size: string) => {
    const receivedItem: DownloadItem = {
      id: 'p2p-' + Date.now(),
      mediaId: 'p2p-file',
      title,
      posterUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect width="300" height="450" fill="%231a1c28"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2300df82" font-family="sans-serif" font-size="18" font-weight="bold"%3EFile Transfer%3C/text%3E%3C/svg%3E',
      type: 'movie',
      totalSize: size,
      downloadedSize: size,
      progress: 100,
      status: 'completed',
      dateAdded: 'Just now (P2P)',
    };
    const nextDownloads = [receivedItem, ...downloads];
    setDownloads(nextDownloads);
    showToast(`Received "${title}" via P2P Transfer!`);

    if (user.uid) {
      syncDownloadsToRtdb(user.uid, nextDownloads).catch(console.warn);
    }
  };

  const handleRemoveDownload = (id: string) => {
    const nextDownloads = downloads.filter((d) => d.id !== id);
    setDownloads(nextDownloads);
    showToast('Download removed');

    if (user.uid) {
      syncDownloadsToRtdb(user.uid, nextDownloads).catch(console.warn);
    }
  };

  // Helper to strictly identify Authorized SuperAdmin
  const isSuperAdminUser = isAuthorizedAdmin(user);

  const handleLogout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out note:', e);
    }
    localStorage.removeItem('mb_user');
    localStorage.removeItem('mb_account_created');
    localStorage.removeItem('mb_get_started_seen');
    localStorage.removeItem('mb_admin_unlocked');
    setUser(INITIAL_USER);
    setShowGetStarted(true);
    setShowSignUpPage(false);
    showToast('Logged out of session');
  };

  if (isAdminScreenOpen && isSuperAdminUser) {
    return (
      <AdminScreen
        currentUser={user}
        onBackToApp={() => setIsAdminScreenOpen(false)}
        onLogoutAdmin={() => {
          localStorage.removeItem('mb_admin_unlocked');
          setUser(INITIAL_USER);
          setIsAdminScreenOpen(false);
          showToast('Admin logged out successfully');
        }}
        onUpdateCurrentUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
      />
    );
  }

  return (
    <div className="h-screen h-[100dvh] bg-[#050608] text-white flex justify-center overflow-hidden">
      <OfflineIndicator />
      {/* Mobile-first frame container */}
      <div className="w-full max-w-md h-full bg-[#090a0f] relative shadow-2xl flex flex-col border-x border-white/5 overflow-hidden">
        {/* Onboarding Get Started Screen */}
        {showGetStarted ? (
          <GetStartedScreen
            onGetStarted={(mode = 'signup') => {
              setSignUpInitialMode(mode);
              setShowGetStarted(false);
              setShowSignUpPage(true);
            }}
            onExploreGuest={() => {
              setShowGetStarted(false);
              setShowSignUpPage(false);
              localStorage.setItem('mb_account_created', 'true');
              localStorage.setItem('mb_get_started_seen', 'true');
            }}
          />
        ) : showSignUpPage ? (
          <SignUpScreen
            initialMode={signUpInitialMode}
            onBackToGetStarted={() => {
              setShowSignUpPage(false);
              setShowGetStarted(true);
            }}
            onAuthSuccess={(profile) => {
              setUser((prev) => ({ ...prev, ...profile, isLoggedIn: true }));
              setShowSignUpPage(false);
              setShowGetStarted(false);
              localStorage.setItem('mb_account_created', 'true');
              localStorage.setItem('mb_get_started_seen', 'true');
              showToast(`Welcome ${profile.username || 'MovieFan'}!`);
            }}
            onGuestContinue={() => {
              setShowSignUpPage(false);
              setShowGetStarted(false);
              localStorage.setItem('mb_account_created', 'true');
              localStorage.setItem('mb_get_started_seen', 'true');
            }}
          />
        ) : (
          <>
            {/* Tab Views */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {currentTab === 'home' && (
            <HomeScreen
              allItems={allMediaItems}
              onOpenItem={(item) => setSelectedMedia(item)}
              onPlayItem={(item) => {
                if (!requireAuth('stream and watch movies')) return;
                setPlayingMedia({ item });
              }}
              onDownloadItem={handleDownload}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                if (cat === 'ShortTV') setCurrentTab('shorttv');
              }}
              activeCategory={activeCategory}
            />
          )}

          {currentTab === 'shorttv' && (
            <ShortTVScreen
              onOpenItem={(item) => setSelectedMedia(item)}
              onPlayItem={(item) => {
                if (!requireAuth('watch series')) return;
                setPlayingMedia({ item });
              }}
              onDownloadItem={handleDownload}
            />
          )}

          {currentTab === 'premium' && (
            <PremiumScreen
              user={user}
              onUpgradePlan={handleUpgradePlan}
            />
          )}

          {currentTab === 'downloads' && (
            <DownloadsScreen
              downloads={downloads}
              onDownloadItem={handleDownload}
              onPlayMedia={(item) => {
                if (!requireAuth('play downloaded movies')) return;
                setPlayingMedia({ item });
              }}
              onOpenTransfer={() => setIsTransferOpen(true)}
              onRemoveDownload={handleRemoveDownload}
              onOpenItem={(item) => setSelectedMedia(item)}
            />
          )}

          {currentTab === 'me' && (
            <ProfileScreen
              user={user}
              downloads={downloads}
              bookmarks={bookmarks}
              isRtdbConnected={isRtdbConnected}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenTransfer={() => setIsTransferOpen(true)}
              onOpenDownloadsTab={() => setCurrentTab('downloads')}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenAdminScreen={() => setIsAdminScreenOpen(true)}
              onOpenGetStarted={() => {
                setShowGetStarted(true);
                setShowSignUpPage(false);
              }}
              onLogout={handleLogout}
              onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
              showToast={showToast}
            />
          )}
        </main>

        {/* Top Push Notification Drawer Banner (Slides down when push is broadcast) */}
        <TopPushNotificationBanner onOpenNotifications={() => setIsNotificationsOpen(true)} />

        {/* Bottom Navigation with Real Selected Avatar on Me Icon */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          downloadCount={downloads.length}
          userAvatar={user.avatarUrl && !user.avatarUrl.startsWith('data:image/svg') ? user.avatarUrl : '/avatars/simba.webp'}
        />

        {/* Floating In-App Toast */}
        {toastMessage && (
          <div className="fixed bottom-20 inset-x-4 max-w-sm mx-auto bg-[#181a26] border border-[#00df82]/40 text-white px-4 py-2.5 rounded-2xl shadow-xl z-50 flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#00df82] shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Maintenance Mode Full Screen Overlay for Standard Non-Admin Users */}
        {isMaintenanceActive && !isSuperAdminUser && !isAdminScreenOpen && (
            <div className="fixed inset-0 z-50 bg-[#07080e] text-white flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-200">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-6 shadow-2xl shadow-amber-500/20 animate-pulse">
                <Wrench className="w-10 h-10" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight max-w-md">
                System Under Maintenance
              </h1>

              <p className="text-sm text-zinc-400 max-w-md mt-3 leading-relaxed">
                {maintenanceNotice || 'Our system is under maintenance. Please check back shortly.'}
              </p>

              <div className="mt-8 flex flex-col items-center gap-3">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white border border-white/10 text-xs font-bold transition cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00df82]" />
                  <span>Admin Login Access</span>
                </button>

                <p className="text-[10px] text-zinc-600">
                  MovieBox Platform • Realtime Maintenance Mode
                </p>
              </div>
            </div>
          )}

        {/* Media Details Modal */}
        {selectedMedia && (
          <MediaDetailModal
            item={selectedMedia}
            onClose={() => setSelectedMedia(null)}
            onPlay={(item, ep, season) => {
              if (!requireAuth('stream and watch movies')) return;
              setSelectedMedia(null);
              setPlayingMedia({ item, episode: ep, season });
            }}
            onDownload={(item, opts) => handleDownload(item, opts)}
            isBookmarked={bookmarks.some((b) => b.id === selectedMedia.id)}
            onToggleBookmark={handleToggleBookmark}
            isDownloaded={downloads.some((d) => d.mediaId === selectedMedia.id)}
            onOpenItem={(item) => setSelectedMedia(item)}
          />
        )}

        {/* Video Player Modal */}
        {playingMedia && (
          <VideoPlayerModal
            item={playingMedia.item}
            initialEpisode={playingMedia.episode || 1}
            initialSeason={playingMedia.season || 1}
            onClose={() => setPlayingMedia(null)}
            onDownload={(item, opts) => handleDownload(item, opts)}
          />
        )}

        {/* Short Drama Vertical Player Modal */}
        {playingShortDrama && (
          <ShortPlayerModal
            item={playingShortDrama}
            onClose={() => setPlayingShortDrama(null)}
            onOpenPremium={() => {
              setPlayingShortDrama(null);
              setCurrentTab('premium');
            }}
            onDownloadItem={handleDownload}
          />
        )}

        {/* P2P Transfer Modal */}
        {isTransferOpen && (
          <TransferModal
            onClose={() => setIsTransferOpen(false)}
            onSimulateReceive={handleSimulateReceive}
          />
        )}

        {/* User Auth Modal */}
        {isAuthOpen && (
          <AuthModal
            currentUser={user}
            onClose={() => setIsAuthOpen(false)}
            onLoginSuccess={(updated) => {
              setUser((prev) => ({ ...prev, ...updated }));
              showToast(`Logged in as ${updated.username || 'User'}`);
            }}
          />
        )}

        {/* Notifications Modal */}
        {isNotificationsOpen && (
          <NotificationModal onClose={() => setIsNotificationsOpen(false)} />
        )}

        {/* Scanner Modal */}
        {isScannerOpen && (
          <ScannerModal
            onClose={() => setIsScannerOpen(false)}
            onScanFound={(result) => {
              handleSimulateReceive(result, '1.2 GB');
            }}
          />
        )}
          </>
        )}
      </div>
    </div>
  );
}

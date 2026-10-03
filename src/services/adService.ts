import { ref, onValue, set } from 'firebase/database';
import { database } from '../lib/firebase';
import { AdBannerItem } from '../types';

const STORAGE_KEY = 'mb_admin_ad_banners_v3';

export const DEFAULT_AD_BANNERS: AdBannerItem[] = [
  {
    id: 'banner-vip-pass',
    title: 'MovieBox VIP Pass • 4K Ultra HD',
    subtitle: 'Unlimited fast streaming, zero ads & instant offline downloads.',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'premium',
    badgeText: 'MOVIEBOX VIP',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-explore-series',
    title: 'Explorer • Trending TV Series',
    subtitle: 'Binge all seasons of top-rated drama, action & sci-fi series in HD.',
    imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'series',
    badgeText: 'EXPLORER • SERIES',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-new-movies',
    title: 'Newly Added Blockbusters',
    subtitle: 'Fresh 2025 theatrical box office releases and daily cinema drops.',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'movies',
    badgeText: 'NEW MOVIES',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-4k-cinema',
    title: 'MovieBox 4K Cinema Club',
    subtitle: 'Experience Dolby Atmos sound and crystal-clear 60FPS streaming.',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    linkUrl: 'premium',
    badgeText: '4K CINEMA',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Gets cached ad banners from localStorage or defaults
 */
export function getLocalAdBanners(): AdBannerItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const clean = parsed.filter(
          (b) =>
            b &&
            b.title &&
            b.imageUrl &&
            !b.title.toLowerCase().includes('netflix') &&
            !b.subtitle?.toLowerCase().includes('netflix')
        );
        if (clean.length > 0) return clean;
      }
    }
  } catch (err) {
    console.warn('Failed to parse local ad banners:', err);
  }
  return DEFAULT_AD_BANNERS;
}

/**
 * Saves ad banners to localStorage and dispatches sync event
 */
export function saveLocalAdBanners(banners: AdBannerItem[], notifyEvent = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
    if (notifyEvent) {
      window.dispatchEvent(new Event('mb_ads_updated'));
    }
  } catch (err) {
    console.warn('Failed to save local ad banners:', err);
  }
}

/**
 * Subscribes to real-time ad banners from Firebase Realtime Database with local fallback
 */
export function subscribeAdBanners(callback: (banners: AdBannerItem[]) => void): () => void {
  // Initial return from local cache
  callback(getLocalAdBanners());

  // Listen to window event for local updates
  const handleLocalUpdate = () => {
    callback(getLocalAdBanners());
  };
  window.addEventListener('mb_ads_updated', handleLocalUpdate);

  // Subscribe to Firebase RTDB node `ads/banners`
  try {
    const adsRef = ref(database, 'ads/banners');
    const unsubscribe = onValue(
      adsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          let list: AdBannerItem[] = [];
          if (Array.isArray(val)) {
            list = val.filter(Boolean);
          } else if (typeof val === 'object') {
            list = Object.values(val);
          }
          if (list.length > 0) {
            saveLocalAdBanners(list, false);
            callback(list);
          }
        }
      },
      (err) => {
        console.warn('RTDB ads permission or network notice:', err);
      }
    );

    return () => {
      window.removeEventListener('mb_ads_updated', handleLocalUpdate);
      unsubscribe();
    };
  } catch (err) {
    return () => {
      window.removeEventListener('mb_ads_updated', handleLocalUpdate);
    };
  }
}

/**
 * Admin action to save / publish updated ad banners list to Firebase RTDB & local storage
 */
export async function syncAdBannersToRtdb(banners: AdBannerItem[]): Promise<void> {
  saveLocalAdBanners(banners);
  try {
    const adsRef = ref(database, 'ads/banners');
    await set(adsRef, banners);
  } catch (err) {
    console.warn('Failed to sync ad banners to Firebase RTDB:', err);
  }
}

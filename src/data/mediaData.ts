import { MediaItem, ShortDramaItem } from '../types';

// All catalog items are fetched dynamically from the live streaming service.
export const HERO_CAROUSEL_ITEMS: MediaItem[] = [];
export const BECAUSE_WATCHED_SHELF: MediaItem[] = [];
export const POPULAR_SERIES_SHELF: MediaItem[] = [];
export const COMING_SOON_SHELF: MediaItem[] = [];
export const TRENDING_FREE_DOWNLOADS: MediaItem[] = [];

export const SHORT_TV_FEATURED: ShortDramaItem | null = null;
export const SHORT_TV_NEW_ARRIVALS: ShortDramaItem[] = [];
export const SHORT_TV_TOP_SEARCHES: ShortDramaItem[] = [];

export const SEARCH_SUGGESTIONS = [
  'Avatar: The Way of Water',
  'Interstellar',
  'Dune: Part Two',
  'Inception',
  'Breaking Bad',
  'Stranger Things',
  'The Dark Knight',
  'Oppenheimer',
  'Shōgun',
  'Squid Game'
];

export const PREMIUM_PLANS = [
  {
    id: 'plan-1m',
    duration: '1 month',
    price: 'USh 7,562',
    usdPrice: '$1.99',
    monthlyBreakdown: '7,562 / month',
    badge: 'Popular',
    savings: ''
  },
  {
    id: 'plan-1m-promo',
    duration: '1 month (Student)',
    price: 'USh 2,091',
    usdPrice: '$0.59',
    monthlyBreakdown: '2,091 / month',
    badge: 'Student Offer',
    savings: 'Save 70%'
  },
  {
    id: 'plan-3m',
    duration: '3 month',
    price: 'USh 18,962',
    usdPrice: '$4.99',
    monthlyBreakdown: '6,320.67 / month',
    badge: 'Best Value',
    savings: 'Save 20%'
  },
  {
    id: 'plan-3m-light',
    duration: '3 month (Lite)',
    price: 'USh 5,226',
    usdPrice: '$1.39',
    monthlyBreakdown: '1,742 / month',
    badge: 'Limited Promo',
    savings: 'Save 75%'
  },
  {
    id: 'plan-12m',
    duration: '12 month VIP',
    price: 'USh 54,900',
    usdPrice: '$14.99',
    monthlyBreakdown: '4,575 / month',
    badge: 'Ultimate VIP',
    savings: 'Save 45%'
  }
];

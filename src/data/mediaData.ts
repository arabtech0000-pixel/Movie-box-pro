import { MediaItem, ShortDramaItem } from '../types';
import { MUMO_SERVER_MOVIES } from '../services/mumoServer';

export { MUMO_SERVER_MOVIES };

export const HERO_CAROUSEL_ITEMS: MediaItem[] = MUMO_SERVER_MOVIES.filter((m) => m.type !== 'tv').slice(0, 8);
export const BECAUSE_WATCHED_SHELF: MediaItem[] = MUMO_SERVER_MOVIES.filter((m) => m.type !== 'tv');
export const POPULAR_SERIES_SHELF: MediaItem[] = MUMO_SERVER_MOVIES.filter((m) => m.type === 'tv');
export const COMING_SOON_SHELF: MediaItem[] = MUMO_SERVER_MOVIES.filter((m) => m.type !== 'tv').slice(2, 8);
export const TRENDING_FREE_DOWNLOADS: MediaItem[] = MUMO_SERVER_MOVIES;

export const SHORT_TV_FEATURED: ShortDramaItem | null = null;
export const SHORT_TV_NEW_ARRIVALS: ShortDramaItem[] = [];
export const SHORT_TV_TOP_SEARCHES: ShortDramaItem[] = [];

export const SEARCH_SUGGESTIONS = [
  'Deadpool & Wolverine',
  'John Wick: Chapter 4',
  'Bad Boys: Ride or Die',
  'Extraction 2',
  'Dune: Part Two',
  'Squid Game',
  'Money Heist',
  'Avatar: The Way of Water',
  'The Batman',
  'Top Gun: Maverick',
  'The Beekeeper',
  'Gladiator II',
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

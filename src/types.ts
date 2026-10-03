export interface TmdbCastMember {
  id: number;
  name: string;
  original_name?: string;
  character: string;
  profile_path: string | null;
  cast_id?: number;
  order: number;
  known_for_department?: string;
  popularity?: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  original_name?: string;
  job: string;
  department: string;
  profile_path: string | null;
  known_for_department?: string;
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at?: string;
}

export interface TmdbProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TmdbProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TmdbSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TmdbKeyword {
  id: number;
  name: string;
}

export interface TmdbCollection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

export interface TmdbSeason {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  vote_average: number;
  runtime?: number;
}

export interface TmdbPersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
  gender: number;
  popularity: number;
  homepage: string | null;
  also_known_as?: string[];
  combined_credits?: {
    cast: {
      id: number;
      title?: string;
      name?: string;
      character?: string;
      poster_path: string | null;
      media_type: 'movie' | 'tv';
      release_date?: string;
      first_air_date?: string;
      vote_average?: number;
    }[];
    crew?: {
      id: number;
      title?: string;
      name?: string;
      job?: string;
      department?: string;
      poster_path: string | null;
      media_type: 'movie' | 'tv';
      release_date?: string;
    }[];
  };
}

export interface MediaItem {
  id: string;
  tmdbId?: number;
  title: string;
  originalTitle?: string;
  tagline?: string;
  posterUrl: string;
  backdropUrl?: string;
  rating?: number;
  voteCount?: number;
  popularity?: number;
  type: 'movie' | 'tv' | 'short';
  category: string;
  genres: string[];
  year?: number;
  releaseDate?: string;
  firstAirDate?: string;
  lastAirDate?: string;
  episodesCount?: number;
  numberOfSeasons?: number;
  runtimeMinutes?: number;
  duration?: string;
  synopsis: string;
  tag?: string;
  isTrending?: boolean;
  isPopular?: boolean;
  videoUrl?: string;
  fileSize?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  originalLanguage?: string;
  homepage?: string | null;
  imdbId?: string | null;
  productionCompanies?: TmdbProductionCompany[];
  productionCountries?: TmdbProductionCountry[];
  spokenLanguages?: TmdbSpokenLanguage[];
  keywords?: TmdbKeyword[];
  collection?: TmdbCollection | null;
  cast?: TmdbCastMember[];
  crew?: TmdbCrewMember[];
  videos?: TmdbVideo[];
  backdrops?: string[];
  seasons?: TmdbSeason[];
  similar?: MediaItem[];
  recommendations?: MediaItem[];
}


export interface ShortDramaItem {
  id: string;
  title: string;
  posterUrl: string;
  tag: string;
  episodesCount: number;
  views: string;
  rating: number;
  synopsis: string;
  badge?: string; // "EXCLUSIVE", "HOT", "NEW"
  isFeatured?: boolean;
  category: string;
}

export interface DownloadItem {
  id: string;
  mediaId: string;
  title: string;
  posterUrl: string;
  type: string;
  totalSize: string;
  downloadedSize: string;
  progress: number; // 0 - 100
  status: 'downloading' | 'completed' | 'paused';
  dateAdded: string;
  provider?: string;
  quality?: string;
  streamUrl?: string;
  localFileUrl?: string;
  deviceSaved?: boolean;
  speed?: string;
}

export interface UserProfile {
  id: string;
  uid?: string;
  username: string;
  email?: string;
  movieBoxId: string;
  avatarUrl: string;
  plan: 'Free Plan' | 'VIP Premium';
  planExpiry?: string;
  isLoggedIn: boolean;
  communitiesCount: number;
  downloadsCount: number;
  myListCount: number;
}

export type TabType = 'home' | 'shorttv' | 'premium' | 'downloads' | 'me';

export interface AdBannerItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  badgeText?: string; // e.g., 'SPONSORED', 'PROMO', 'SPECIAL OFFER', 'AD'
  active: boolean;
  createdAt: string;
}

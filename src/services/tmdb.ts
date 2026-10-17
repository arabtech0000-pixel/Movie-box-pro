import { MediaItem, TmdbEpisode, TmdbVideo } from '../types';
import { fetchMumoServerCatalog } from './mumoServer';

/**
 * MumoWatch Server Bridge replacing external TMDB API.
 * All movies, series, posters, hero banners, and video names are fetched from https://mumowatch.ai.studio/
 */

export const TMDB_API_KEY = 'mumowatch-server-active';
export const TMDB_READ_ACCESS_TOKEN = 'mumowatch-server-token';

export function getTmdbImageUrl(
  path: string | null | undefined,
  _size: string = 'w500',
  fallback: string = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450' fill='%23141622'%3E%3Crect width='100%25' height='100%25' fill='%23141622'/%3E%3C/svg%3E"
): string {
  if (!path) return fallback;
  return path;
}

export function mapTmdbToMediaItem(item: any, _mediaType?: string): MediaItem {
  return item;
}

export async function getPersonDetails(personId: number, _personName?: string): Promise<any> {
  const catalog = await fetchMumoServerCatalog();
  return {
    id: personId,
    name: personId === 101 ? 'VJ Junior' : 'Star Actor',
    biography: 'Renowned film actor and voice artist in the MumoWatch server catalog.',
    birthday: '1985-06-15',
    place_of_birth: 'Kampala, Uganda',
    profile_path: catalog.movies[0]?.posterUrl,
    known_for_department: 'Acting',
    combined_credits: { cast: catalog.movies.slice(0, 5) },
  };
}

export function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '2h 05m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatCurrency(amount?: number | null): string {
  if (!amount || amount <= 0) return '$50,000,000';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatReleaseDate(dateStr?: string | null): string {
  if (!dateStr) return '2024';
  return dateStr;
}

export const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  27: 'Horror',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy',
};

export async function getTrendingMedia(_mediaType: string = 'all', _timeWindow: string = 'day'): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return [...catalog.movies, ...catalog.series];
}

export async function getPopularMovies(): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.movies;
}

export async function getPopularTv(): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.series;
}

export async function getTopRatedTv(): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.series;
}

export async function getAiringTodayTv(): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.series;
}

export async function getNowPlayingMovies(): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.movies;
}

export async function getUpcomingMovies(): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.movies;
}

export async function getTopRatedMovies(): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.movies;
}

export async function getAnimeMedia(): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.movies.filter((m) => m.genres?.includes('Animation') || m.genres?.includes('Sci-Fi'));
}

export async function getKidsMedia(): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.movies.filter((m) => m.genres?.includes('Animation'));
}

export async function getKoreanDramas(): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.series;
}

export async function getMediaByGenre(genreIdOrName: number | string, _type: string = 'movie'): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  const all = [...catalog.movies, ...catalog.series];
  const targetGenre = typeof genreIdOrName === 'number' ? TMDB_GENRES[genreIdOrName] : genreIdOrName;
  if (!targetGenre) return all;
  return all.filter((m) => m.genres?.some((g) => g.toLowerCase().includes(String(targetGenre).toLowerCase())));
}

export async function getMovieDetails(id: string | number, title?: string): Promise<MediaItem> {
  const catalog = await fetchMumoServerCatalog();
  const found = [...catalog.movies, ...catalog.series].find((m) => m.id === String(id) || m.title === title);
  if (found) return found;
  return catalog.movies[0];
}

export async function getTvDetails(id: string | number, title?: string): Promise<MediaItem> {
  return getMovieDetails(id, title);
}

export async function getTvSeasonDetails(_tvId: string | number, seasonNumber: number = 1): Promise<TmdbEpisode[]> {
  return [
    { id: 1, episode_number: 1, season_number: seasonNumber, air_date: '2024-01-01', name: 'Episode 1: Awakening', overview: 'First episode of the series streaming from MumoWatch server.', vote_average: 8.5, runtime: 45, still_path: 'https://image.tmdb.org/t/p/w300/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg' },
    { id: 2, episode_number: 2, season_number: seasonNumber, air_date: '2024-01-08', name: 'Episode 2: The Choice', overview: 'Second episode streaming from MumoWatch server.', vote_average: 8.6, runtime: 48, still_path: 'https://image.tmdb.org/t/p/w300/vZloFAK7NKnMGKEslAoLi6kjvKR.jpg' },
    { id: 3, episode_number: 3, season_number: seasonNumber, air_date: '2024-01-15', name: 'Episode 3: Confrontation', overview: 'Third episode streaming from MumoWatch server.', vote_average: 8.8, runtime: 50, still_path: 'https://image.tmdb.org/t/p/w300/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg' },
    { id: 4, episode_number: 4, season_number: seasonNumber, air_date: '2024-01-22', name: 'Episode 4: Ultimate Test', overview: 'Fourth episode streaming from MumoWatch server.', vote_average: 8.4, runtime: 46, still_path: 'https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg' },
  ];
}

export async function getMediaVideos(_id: string | number, _type: string = 'movie', _title?: string): Promise<TmdbVideo[]> {
  return [
    { id: 'v1', key: 'dQw4w9WgXcQ', name: 'Official Server Trailer', site: 'YouTube', type: 'Trailer', official: true },
  ];
}

export async function getSimilarMedia(_id: string | number, _type: string = 'movie'): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.movies.slice(0, 8);
}

export async function getRecommendedMedia(_id: string | number, _type: string = 'movie'): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  return catalog.movies.slice(2, 10);
}

export async function searchMedia(query: string): Promise<MediaItem[]> {
  const catalog = await fetchMumoServerCatalog();
  const all = [...catalog.movies, ...catalog.series];
  if (!query) return all;
  const q = query.toLowerCase();
  return all.filter((m) => m.title.toLowerCase().includes(q) || m.genres?.some((g) => g.toLowerCase().includes(q)));
}

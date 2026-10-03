import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  Calendar,
  MapPin,
  Briefcase,
  TrendingUp,
  ChevronRight,
  Loader2,
  Film,
  ExternalLink,
} from 'lucide-react';
import { getPersonDetails, getTmdbImageUrl, mapTmdbToMediaItem } from '../services/tmdb';
import { TmdbPersonDetails, MediaItem } from '../types';

interface ActorDetailModalProps {
  personId: number;
  personName?: string;
  onClose: () => void;
  onSelectMovie: (item: MediaItem) => void;
}

export const ActorDetailModal: React.FC<ActorDetailModalProps> = ({
  personId,
  personName,
  onClose,
  onSelectMovie,
}) => {
  const [details, setDetails] = useState<TmdbPersonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'known_for' | 'all_credits'>('known_for');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getPersonDetails(personId)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError('Failed to load details for this actor.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [personId]);

  // Gender label
  const getGenderLabel = (g?: number) => {
    if (g === 1) return 'Female';
    if (g === 2) return 'Male';
    if (g === 3) return 'Non-binary';
    return 'Not specified';
  };

  // Calculate age
  const calculateAge = (birthday?: string | null, deathday?: string | null) => {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Known for movies (top rated / popular)
  const castCredits = details?.combined_credits?.cast || [];
  const sortedByPopularity = [...castCredits]
    .filter((c) => c.poster_path)
    .sort((a, b) => (b.vote_average || 0) * (b.release_date ? 1 : 0.8) - (a.vote_average || 0));

  const knownFor = sortedByPopularity.slice(0, 10);
  const allCredits = [...castCredits].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || '';
    const dateB = b.release_date || b.first_air_date || '';
    return dateB.localeCompare(dateA);
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md max-h-[92vh] sm:max-h-[85vh] bg-[#0c0e16] rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 bg-[#141724] border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00df82]" />
            <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider">
              Actor Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-zinc-400">
              <Loader2 className="w-8 h-8 text-[#00df82] animate-spin" />
              <p className="text-xs">Loading actor profile...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-zinc-400 space-y-2">
              <p className="text-sm font-semibold text-rose-400">{error}</p>
              <button
                onClick={onClose}
                className="text-xs text-[#00df82] hover:underline"
              >
                Close
              </button>
            </div>
          ) : details ? (
            <>
              {/* Actor Head Card */}
              <div className="flex gap-4 items-start">
                <div className="w-24 h-32 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 border border-white/10 shadow-lg">
                  <img
                    src={getTmdbImageUrl(
                      details.profile_path,
                      'h632'
                    )}
                    alt={details.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {details.name}
                  </h2>
                  <p className="text-xs text-[#00df82] font-semibold mt-0.5">
                    {details.known_for_department || 'Acting'}
                  </p>

                  <div className="mt-2.5 space-y-1 text-xs text-zinc-300">
                    {details.birthday && (
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>
                          {details.birthday}
                          {calculateAge(details.birthday, details.deathday) !== null && (
                            <span className="text-zinc-500 ml-1">
                              ({calculateAge(details.birthday, details.deathday)}{' '}
                              {details.deathday ? 'at death' : 'years old'})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {details.place_of_birth && (
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{details.place_of_birth}</span>
                      </div>
                    )}

                    {details.popularity && (
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <TrendingUp className="w-3.5 h-3.5 text-[#00df82] shrink-0" />
                        <span>Popularity: {details.popularity.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Biography Section */}
              <div className="bg-[#131522] rounded-2xl p-3.5 border border-white/5 space-y-1.5">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Biography
                </h3>
                {details.biography ? (
                  <div>
                    <p
                      className={`text-xs text-zinc-300 leading-relaxed ${
                        !isBioExpanded && details.biography.length > 280
                          ? 'line-clamp-4'
                          : ''
                      }`}
                    >
                      {details.biography}
                    </p>
                    {details.biography.length > 280 && (
                      <button
                        onClick={() => setIsBioExpanded(!isBioExpanded)}
                        className="text-xs font-semibold text-[#00df82] hover:text-[#00c975] mt-1.5 inline-block"
                      >
                        {isBioExpanded ? 'Read Less' : 'Read More'}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">
                    No biography available for this person.
                  </p>
                )}
              </div>

              {/* Filmography Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex gap-4 text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('known_for')}
                      className={`transition pb-1 relative ${
                        activeTab === 'known_for'
                          ? 'text-white'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Known For ({knownFor.length})
                      {activeTab === 'known_for' && (
                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00df82] rounded-full" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab('all_credits')}
                      className={`transition pb-1 relative ${
                        activeTab === 'all_credits'
                          ? 'text-white'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Complete Filmography ({allCredits.length})
                      {activeTab === 'all_credits' && (
                        <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00df82] rounded-full" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Display Selected Grid/List */}
                {activeTab === 'known_for' ? (
                  <div className="grid grid-cols-3 gap-2.5">
                    {knownFor.map((item, idx) => (
                      <div
                        key={`kf-${item.id}-${idx}-${item.character || 'role'}`}
                        onClick={() => {
                          const media = mapTmdbToMediaItem(item, item.media_type);
                          onSelectMovie(media);
                          onClose();
                        }}
                        className="group cursor-pointer space-y-1"
                      >
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:ring-2 group-hover:ring-[#00df82] transition">
                          <img
                            src={getTmdbImageUrl(item.poster_path, 'w342')}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            loading="lazy"
                          />
                          {item.vote_average && item.vote_average > 0 && (
                            <div className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-[#00df82] font-bold text-[9px] px-1 py-0.5 rounded flex items-center gap-0.5">
                              ★ {item.vote_average.toFixed(1)}
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-white truncate group-hover:text-[#00df82]">
                          {item.title || item.name}
                        </p>
                        {item.character && (
                          <p className="text-[10px] text-zinc-400 truncate">
                            as {item.character}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {allCredits.map((item, idx) => {
                      const year = (item.release_date || item.first_air_date || '').substring(0, 4) || '—';
                      return (
                        <div
                          key={`all-${item.id}-${idx}`}
                          onClick={() => {
                            const media = mapTmdbToMediaItem(item, item.media_type);
                            onSelectMovie(media);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#131522] hover:bg-[#1c2032] cursor-pointer transition border border-white/5"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[11px] font-bold text-zinc-500 w-10 shrink-0">
                              {year}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">
                                {item.title || item.name}
                              </p>
                              {item.character && (
                                <p className="text-[10px] text-zinc-400 truncate">
                                  as {item.character}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

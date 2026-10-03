import React, { useState, useMemo } from 'react';
import { X, Search, Users, Clapperboard, ChevronRight } from 'lucide-react';
import { TmdbCastMember, TmdbCrewMember } from '../types';
import { getTmdbImageUrl } from '../services/tmdb';

interface FullCastCrewSheetProps {
  movieTitle: string;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
  initialTab?: 'cast' | 'crew';
  onClose: () => void;
  onSelectPerson: (personId: number, personName: string) => void;
}

export const FullCastCrewSheet: React.FC<FullCastCrewSheetProps> = ({
  movieTitle,
  cast,
  crew,
  initialTab = 'cast',
  onClose,
  onSelectPerson,
}) => {
  const [activeTab, setActiveTab] = useState<'cast' | 'crew'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');

  // Filtered cast
  const filteredCast = useMemo(() => {
    if (!searchQuery.trim()) return cast;
    const q = searchQuery.toLowerCase();
    return cast.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.character && c.character.toLowerCase().includes(q))
    );
  }, [cast, searchQuery]);

  // Group crew by department
  const { departments, filteredCrew } = useMemo(() => {
    const deptSet = new Set<string>();
    crew.forEach((c) => {
      if (c.department) deptSet.add(c.department);
    });
    const depts = ['All', ...Array.from(deptSet).sort()];

    let list = crew;
    if (selectedDepartment !== 'All') {
      list = list.filter((c) => c.department === selectedDepartment);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.job.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q)
      );
    }
    return { departments: depts, filteredCrew: list };
  }, [crew, selectedDepartment, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md h-[92vh] sm:h-[85vh] bg-[#0b0d15] rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 bg-[#121522] border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm font-bold text-white truncate">
              {movieTitle}
            </h2>
            <p className="text-[11px] text-[#00df82] font-semibold">
              Complete Credits ({cast.length} Cast • {crew.length} Crew)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/5 bg-[#0f111c] px-4 pt-2">
          <button
            onClick={() => setActiveTab('cast')}
            className={`flex-1 pb-2.5 text-xs font-bold transition relative flex items-center justify-center gap-1.5 ${
              activeTab === 'cast' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#00df82]" />
            <span>Full Cast ({cast.length})</span>
            {activeTab === 'cast' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00df82] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('crew')}
            className={`flex-1 pb-2.5 text-xs font-bold transition relative flex items-center justify-center gap-1.5 ${
              activeTab === 'crew' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5 text-[#00df82]" />
            <span>Full Crew ({crew.length})</span>
            {activeTab === 'crew' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00df82] rounded-full" />
            )}
          </button>
        </div>

        {/* Search Bar & Crew Department Chips */}
        <div className="p-3 bg-[#0d0f19] border-b border-white/5 space-y-2 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'cast'
                  ? 'Search actor or character name...'
                  : 'Search crew member or job...'
              }
              className="w-full bg-[#181b28] text-white text-xs pl-8 pr-7 py-2 rounded-full outline-none focus:ring-1 focus:ring-[#00df82] placeholder:text-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {activeTab === 'crew' && departments.length > 2 && (
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap transition border ${
                    selectedDepartment === dept
                      ? 'bg-[#00df82] text-black font-bold border-transparent'
                      : 'bg-[#151825] text-zinc-400 hover:text-white border-white/5'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2">
          {activeTab === 'cast' ? (
            filteredCast.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No cast members match "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {filteredCast.map((member, idx) => (
                  <div
                    key={`cast-full-${member.id}-${member.order ?? idx}-${idx}`}
                    onClick={() => onSelectPerson(member.id, member.name)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-[#131623] hover:bg-[#1a1e2f] border border-white/5 cursor-pointer transition group"
                  >
                    <div className="w-11 h-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/5">
                      <img
                        src={getTmdbImageUrl(member.profile_path, 'w185')}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-[#00df82]">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {member.character || 'Self'}
                      </p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">
                        Order #{member.order + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            filteredCrew.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No crew members match "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredCrew.map((member, idx) => (
                  <div
                    key={`crew-full-${member.id}-${idx}`}
                    onClick={() => onSelectPerson(member.id, member.name)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#131623] hover:bg-[#1a1e2f] border border-white/5 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-11 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/5">
                        <img
                          src={getTmdbImageUrl(member.profile_path, 'w185')}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-[#00df82]">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-[#00df82] font-medium truncate">
                          {member.job}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">
                          Department: {member.department}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

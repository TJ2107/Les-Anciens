import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Alumnus } from '../types';
import { AvatarDisplay } from './AvatarDisplay';

interface AlumniPageProps {
  alumniList: Alumnus[];
  onSelectAlumnus: (alumnus: Alumnus) => void;
  onRequestDeleteAlumnus: (alumnus: Alumnus) => void;
}

type AlumniFilter = 'all' | 'online' | 'promo' | 'new' | 'memorial';

const FILTERS: { id: AlumniFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'online', label: 'En ligne' },
  { id: 'promo', label: 'Promo récente' },
  { id: 'new', label: 'Nouveaux' },
  { id: 'memorial', label: 'In Memoriam' },
];

export const AlumniPage: React.FC<AlumniPageProps> = ({
  alumniList,
  onSelectAlumnus,
  onRequestDeleteAlumnus,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AlumniFilter>('all');

  const filtered = alumniList.filter(a => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.univ.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.filiere.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (filter === 'online') return a.status === 'online';
    if (filter === 'promo') return parseInt(a.year, 10) >= 2018;
    if (filter === 'new') return parseInt(a.year, 10) >= 2020;
    if (filter === 'memorial') return a.status === 'memorial';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-accent">Annuaire des Anciens</h1>
          <p className="text-xs text-[#a09888] mt-0.5 tabular-nums">
            {filtered.length} membre{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a09888]" size={17} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, université, pays ou filière..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#1a1d2e] border border-accent/20 rounded-xl text-white text-sm placeholder-[#706858] focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#1a1d2e] p-1 rounded-xl border border-accent/16 overflow-x-auto">
          {FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === f.id
                  ? 'bg-accent text-accent-contrast'
                  : 'text-[#a09888] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => (
            <article
              key={a.id}
              className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-5 hover:border-accent/60 transition-colors flex gap-3 items-start"
            >
              <button
                type="button"
                onClick={() => onSelectAlumnus(a)}
                className="flex-1 min-w-0 flex gap-4 items-start text-left cursor-pointer focus:outline-none"
              >
                <div className="w-13 h-13 rounded-full bg-[#252840] flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                  <AvatarDisplay avatar={a.avatar} alt={a.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base text-white truncate">{a.name}</h2>
                  <div className="text-xs text-accent mt-0.5 truncate">
                    {a.promo} · {a.filiere}
                  </div>
                  <div className="text-xs text-[#a09888] mt-1.5 truncate">{a.univ}</div>
                  <div className="text-xs text-[#a09888] mt-0.5 truncate">
                    {a.country}{a.city && a.city !== '—' ? ` · ${a.city}` : ''}
                  </div>
                  <div className="text-xs text-[#e8e0d0] mt-2 truncate">{a.role}</div>
                </div>
              </button>

              <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
                <span
                  className={`text-[11px] font-semibold shrink-0 ${
                    a.status === 'online'
                      ? 'text-emerald-400'
                      : a.status === 'memorial'
                      ? 'text-red-400'
                      : 'text-[#807868]'
                  }`}
                >
                  {a.status === 'online' ? 'En ligne' : a.status === 'memorial' ? 'Mémoire' : 'Hors ligne'}
                </span>

                <button
                  type="button"
                  onClick={() => onRequestDeleteAlumnus(a)}
                  aria-label={`Supprimer ${a.name}`}
                  title={`Supprimer ${a.name}`}
                  className="w-7 h-7 rounded-lg bg-[#252840]/80 text-[#a09888] hover:text-red-400 hover:bg-red-500/15 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-10 text-center">
          <p className="text-sm text-[#a09888]">
            {alumniList.length === 0
              ? 'Aucun ancien enregistré dans l’annuaire pour le moment.'
              : 'Aucun ancien ne correspond à vos critères.'}
          </p>
          {(search !== '' || filter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-[#252840] text-accent text-xs font-semibold rounded-xl hover:bg-accent hover:text-accent-contrast transition-colors cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import { List, MapPin, RotateCcw, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { COUNTRIES, FILIERES, PROMO_YEARS } from '../data/demoData';
import { Alumnus } from '../types';
import { AlumniMapView } from './AlumniMapView';
import { AvatarDisplay } from './AvatarDisplay';

interface AlumniPageProps {
  alumniList: Alumnus[];
  onSelectAlumnus: (alumnus: Alumnus) => void;
  onRequestDeleteAlumnus: (alumnus: Alumnus) => void;
}

type AlumniStatusFilter = 'all' | 'online' | 'offline' | 'memorial';
type AlumniViewMode = 'list' | 'map';

const STATUS_FILTERS: { id: AlumniStatusFilter; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'online', label: 'En ligne' },
  { id: 'offline', label: 'Hors ligne' },
  { id: 'memorial', label: 'In Memoriam' },
];

export const AlumniPage: React.FC<AlumniPageProps> = ({
  alumniList,
  onSelectAlumnus,
  onRequestDeleteAlumnus,
}) => {
  const [viewMode, setViewMode] = useState<AlumniViewMode>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AlumniStatusFilter>('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [filiereFilter, setFiliereFilter] = useState('all');

  const countryOptions = useMemo(() => {
    const set = new Set<string>(COUNTRIES);
    alumniList.forEach(a => {
      if (a.country.trim()) set.add(a.country.trim());
    });
    return Array.from(set);
  }, [alumniList]);

  const yearOptions = useMemo(() => {
    const set = new Set<string>(PROMO_YEARS);
    alumniList.forEach(a => {
      if (a.year.trim()) set.add(a.year.trim());
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [alumniList]);

  const filiereOptions = useMemo(() => {
    const set = new Set<string>(FILIERES);
    alumniList.forEach(a => {
      if (a.filiere.trim()) set.add(a.filiere.trim());
    });
    return Array.from(set);
  }, [alumniList]);

  const filtered = alumniList.filter(a => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.univ.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.filiere.toLowerCase().includes(q) ||
      a.promo.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (countryFilter !== 'all' && a.country !== countryFilter) return false;
    if (yearFilter !== 'all' && a.year !== yearFilter) return false;
    if (filiereFilter !== 'all' && a.filiere !== filiereFilter) return false;
    return true;
  });

  const activeFiltersCount =
    (search.trim() ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (countryFilter !== 'all' ? 1 : 0) +
    (yearFilter !== 'all' ? 1 : 0) +
    (filiereFilter !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCountryFilter('all');
    setYearFilter('all');
    setFiliereFilter('all');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-accent">Annuaire des Anciens</h1>
          <p className="text-xs text-[#a09888] mt-0.5 tabular-nums">
            {filtered.length} membre{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
            {activeFiltersCount > 0 && (
              <>
                {' '}
                · {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>

        {/* View Mode Switcher: Liste | Carte */}
        <div className="flex items-center gap-1 bg-[#1a1d2e] p-1 rounded-xl border border-accent/18 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'list'
                ? 'bg-accent text-accent-contrast'
                : 'text-[#a09888] hover:text-white'
            }`}
          >
            <List size={14} /> Liste
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              viewMode === 'map'
                ? 'bg-accent text-accent-contrast'
                : 'text-[#a09888] hover:text-white'
            }`}
          >
            <MapPin size={14} /> Carte interactive
          </button>
        </div>
      </div>

      {/* Multi-Criteria Search & Filters */}
      <section
        className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-4 space-y-3"
        aria-label="Recherche multicritère"
      >
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a09888]" size={17} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, ville, université, métier..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm placeholder-[#706858] focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#252840] p-1 rounded-xl border border-accent/14 overflow-x-auto">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  statusFilter === f.id
                    ? 'bg-accent text-accent-contrast'
                    : 'text-[#a09888] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-[#a09888] mb-1">
              Promotion
            </label>
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              aria-label="Filtrer par promotion"
              className="w-full px-3 py-2 bg-[#252840] border border-accent/18 rounded-xl text-white text-xs focus:outline-none focus:border-accent"
            >
              <option value="all">Toutes les promotions</option>
              {yearOptions.map(y => (
                <option key={y} value={y}>
                  Promo {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#a09888] mb-1">
              Pays
            </label>
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              aria-label="Filtrer par pays"
              className="w-full px-3 py-2 bg-[#252840] border border-accent/18 rounded-xl text-white text-xs focus:outline-none focus:border-accent"
            >
              <option value="all">Tous les pays</option>
              {countryOptions.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#a09888] mb-1">
              Filière
            </label>
            <select
              value={filiereFilter}
              onChange={e => setFiliereFilter(e.target.value)}
              aria-label="Filtrer par filière"
              className="w-full px-3 py-2 bg-[#252840] border border-accent/18 rounded-xl text-white text-xs focus:outline-none focus:border-accent"
            >
              <option value="all">Toutes les filières</option>
              {filiereOptions.map(f => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-[11px] text-[#a09888] flex items-center gap-1 sm:hidden">
              <SlidersHorizontal size={12} /> Filtres combinés
            </span>
            <button
              type="button"
              disabled={activeFiltersCount === 0}
              onClick={handleResetFilters}
              className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                activeFiltersCount > 0
                  ? 'bg-[#252840] border border-accent/30 text-accent hover:bg-accent hover:text-accent-contrast cursor-pointer'
                  : 'bg-[#252840]/40 border border-accent/10 text-[#605848] cursor-not-allowed'
              }`}
            >
              <RotateCcw size={13} /> Réinitialiser
            </button>
          </div>
        </div>
      </section>

      {/* Content: Directory Grid or Interactive Map */}
      {viewMode === 'map' ? (
        <AlumniMapView alumni={filtered} onSelectAlumnus={onSelectAlumnus} />
      ) : filtered.length > 0 ? (
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
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
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

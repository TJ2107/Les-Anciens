import React, { useState } from 'react';
import {
  ArrowRight,
  Camera,
  CreditCard,
  Heart,
  Newspaper,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import {
  Alumnus,
  Cotisation,
  EventFund,
  GalleryCategory,
  GalleryPhoto,
  PageId,
  Post,
  UserProfile,
} from '../types';
import { AvatarDisplay } from './AvatarDisplay';

interface DashboardPageProps {
  user: UserProfile;
  alumniList: Alumnus[];
  posts: Post[];
  cotisations: Cotisation[];
  eventFunds: EventFund[];
  galleryPhotos: GalleryPhoto[];
  totalMessagesCount: number;
  onNavigate: (page: PageId) => void;
  onSelectAlumnus: (alumnus: Alumnus) => void;
  onSelectGalleryPhoto: (photoId: number) => void;
  onToggleGalleryLike: (photoId: number) => void;
  onOpenAddGalleryPhoto: () => void;
  onEditGalleryPhoto: (photo: GalleryPhoto) => void;
  onRequestDeleteGalleryPhoto: (photo: GalleryPhoto) => void;
  onOpenCreateEvent: () => void;
  onEditEvent: (event: EventFund) => void;
  onRequestDeleteEvent: (event: EventFund) => void;
}

const GALLERY_FILTERS: { id: 'all' | GalleryCategory; label: string }[] = [
  { id: 'all', label: 'Tous' },
  { id: 'gala', label: 'Galas' },
  { id: 'retrouvailles', label: 'Retrouvailles' },
  { id: 'mentorat', label: 'Mentorat' },
  { id: 'solidarite', label: 'Solidarité' },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  alumniList,
  posts,
  cotisations,
  eventFunds,
  galleryPhotos,
  totalMessagesCount,
  onNavigate,
  onSelectAlumnus,
  onSelectGalleryPhoto,
  onToggleGalleryLike,
  onOpenAddGalleryPhoto,
  onEditGalleryPhoto,
  onRequestDeleteGalleryPhoto,
  onOpenCreateEvent,
  onEditEvent,
  onRequestDeleteEvent,
}) => {
  const [galleryFilter, setGalleryFilter] = useState<'all' | GalleryCategory>('all');
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const paidCotisationsCount = cotisations.filter(c => c.status === 'paid').length;
  const visibleGalleryPhotos =
    galleryFilter === 'all'
      ? galleryPhotos
      : galleryPhotos.filter(p => p.category === galleryFilter);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-accent/14 via-[#9b59b6]/10 to-[#1a1d2e] border border-accent/28 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-5 shadow-xl">
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-accent to-[#9b59b6] flex items-center justify-center text-3xl sm:text-4xl shadow-md shrink-0 overflow-hidden">
          <AvatarDisplay avatar={user.avatar} alt={user.name} />
        </div>
        <div className="flex-1 text-center md:text-left min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-accent tracking-tight">
            Bonjour, {user.name}
          </h1>
          <p className="text-sm text-[#a09888] mt-1 truncate">
            {user.univ} · {user.promo} · {user.filiere}
          </p>
          <p className="text-xs sm:text-sm text-[#e8e0d0]/85 mt-2 max-w-2xl leading-relaxed">
            Cet espace centralise la vie de votre communauté : retrouvez vos camarades dans l&apos;annuaire, suivez les actualités, partagez vos souvenirs dans la galerie, échangez en messagerie et contribuez aux événements du réseau.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('alumni')}
          className="px-5 py-2.5 bg-accent text-accent-contrast font-bold rounded-xl text-sm hover:bg-accent-light transition-colors shadow-md cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          Explorer le réseau <ArrowRight size={16} />
        </button>
      </section>

      {/* KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" aria-label="Statistiques clés">
        <div className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-medium text-[#a09888]">Anciens inscrits</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-accent mt-1 tabular-nums">
            {alumniList.some(a => a.email.toLowerCase() === user.email.toLowerCase())
              ? alumniList.length
              : alumniList.length + 1}
          </div>
        </div>
        <div className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-medium text-[#a09888]">Publications</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-accent mt-1 tabular-nums">
            {posts.length}
          </div>
        </div>
        <div className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-medium text-[#a09888]">Cotisations réglées</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-accent mt-1 tabular-nums">
            {paidCotisationsCount}
          </div>
        </div>
        <div className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-medium text-[#a09888]">Messages échangés</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-accent mt-1 tabular-nums">
            {totalMessagesCount}
          </div>
        </div>
      </section>

      {/* News & Members 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Latest News */}
        <section className="lg:col-span-7 bg-[#1a1d2e] border border-accent/16 rounded-3xl p-5 sm:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-bold text-accent flex items-center gap-2">
              <Newspaper size={18} /> Dernières informations
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('info')}
              className="text-xs text-accent hover:underline font-semibold cursor-pointer whitespace-nowrap"
            >
              Voir tout →
            </button>
          </div>
          <div className="divide-y divide-accent/12 flex-1">
            {posts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-[#a09888]">Aucune publication pour le moment.</p>
                <button
                  type="button"
                  onClick={() => onNavigate('info')}
                  className="mt-3 px-3.5 py-1.5 bg-[#252840] text-accent text-xs font-semibold rounded-lg hover:bg-accent hover:text-accent-contrast transition-colors cursor-pointer"
                >
                  Publier une information
                </button>
              </div>
            ) : (
              posts.slice(0, 3).map(p => (
                <div key={p.id} className="flex gap-3.5 py-3.5 first:pt-1 last:pb-1">
                  <div className="w-10 h-10 rounded-full bg-[#252840] flex items-center justify-center text-lg shrink-0 overflow-hidden">
                    <AvatarDisplay avatar={p.avatar} alt={p.author} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-[#e8e0d0] leading-snug line-clamp-2">
                      <strong className="text-accent">{p.author}</strong> — {p.text}
                    </div>
                    <div className="text-xs text-[#807868] mt-1">{p.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* New Members */}
        <section className="lg:col-span-5 bg-[#1a1d2e] border border-accent/16 rounded-3xl p-5 sm:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-bold text-accent flex items-center gap-2">
              <Users size={18} /> Nouveaux membres
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('alumni')}
              className="text-xs text-accent hover:underline font-semibold cursor-pointer whitespace-nowrap"
            >
              Voir tout →
            </button>
          </div>
          <div className="divide-y divide-accent/12 flex-1">
            {alumniList.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#a09888]">
                Aucun membre inscrit pour le moment.
              </div>
            ) : (
              alumniList.slice(0, 4).map(a => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onSelectAlumnus(a)}
                  className="w-full text-left flex items-center gap-3 py-3 first:pt-1 last:pb-1 hover:bg-[#252840]/40 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-[#252840] flex items-center justify-center text-lg shrink-0 overflow-hidden">
                    <AvatarDisplay avatar={a.avatar} alt={a.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-white truncate">{a.name}</div>
                    <div className="text-xs text-[#a09888] truncate">
                      {a.promo} · {a.country}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Galerie des anciens événements */}
      <section
        className="bg-[#1a1d2e] border border-accent/16 rounded-3xl p-5 sm:p-6"
        aria-label="Galerie des anciens événements"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-accent flex items-center gap-2">
              <Camera size={18} /> Galerie
            </h2>
            <p className="text-xs text-[#a09888] mt-0.5">
              Souvenirs et moments forts des événements de la communauté
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-[#252840] rounded-xl overflow-x-auto">
              {GALLERY_FILTERS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGalleryFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    galleryFilter === tab.id
                      ? 'bg-accent text-accent-contrast'
                      : 'text-[#a09888] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onOpenAddGalleryPhoto}
              className="px-3.5 py-2 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Plus size={14} /> Ajouter une photo
            </button>
          </div>
        </div>

        {visibleGalleryPhotos.length === 0 ? (
          <div className="py-10 text-center bg-[#252840]/40 rounded-2xl border border-accent/12">
            <Camera size={28} className="mx-auto text-[#a09888]/60 mb-2" />
            <p className="text-sm font-semibold text-white">
              Aucune photo dans cette catégorie pour le moment
            </p>
            <p className="text-xs text-[#a09888] mt-1">
              Partagez un souvenir d&apos;événement pour enrichir la mémoire du réseau.
            </p>
            <button
              type="button"
              onClick={onOpenAddGalleryPhoto}
              className="mt-4 px-4 py-2 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Ajouter une photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleGalleryPhotos.map(photo => {
              const hasFailed = failedImages[photo.id];
              return (
                <article
                  key={photo.id}
                  className="group relative rounded-2xl overflow-hidden bg-[#252840] border border-accent/15 hover:border-accent/50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onSelectGalleryPhoto(photo.id)}
                    className="block w-full text-left cursor-pointer focus:outline-none"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#252840]">
                      {!hasFailed ? (
                        <img
                          src={photo.imageUrl}
                          alt={`${photo.title} — ${photo.location}`}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setFailedImages(prev => ({ ...prev, [photo.id]: true }))
                          }
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#252840] via-[#1a1d2e] to-[#2e2438] flex flex-col items-center justify-center p-4 text-center">
                          <Camera size={24} className="text-accent mb-1.5" />
                          <span className="text-xs font-semibold text-white line-clamp-1">
                            {photo.title}
                          </span>
                        </div>
                      )}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"
                        aria-hidden="true"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-3.5 pr-12">
                        <div className="text-[11px] text-[#e8e0d0]/85 truncate">
                          {photo.date} · {photo.location}
                        </div>
                        <h3 className="text-sm font-bold text-white mt-0.5 leading-snug line-clamp-1">
                          {photo.title}
                        </h3>
                      </div>
                    </div>
                  </button>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onEditGalleryPhoto(photo)}
                      aria-label={`Modifier ${photo.title}`}
                      title="Modifier"
                      className="w-7 h-7 rounded-full bg-black/65 hover:bg-accent text-white hover:text-accent-contrast flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDeleteGalleryPhoto(photo)}
                      aria-label={`Supprimer ${photo.title}`}
                      title="Supprimer"
                      className="w-7 h-7 rounded-full bg-black/65 hover:bg-red-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleGalleryLike(photo.id)}
                    aria-label={`Aimer la photo ${photo.title}`}
                    className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/65 hover:bg-black/85 text-xs font-semibold text-white flex items-center gap-1 transition-colors cursor-pointer tabular-nums"
                  >
                    <Heart
                      size={12}
                      className={photo.liked ? 'fill-rose-400 text-rose-400' : 'text-[#e8e0d0]'}
                    />
                    <span>{photo.likes}</span>
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Event Funds Tracking */}
      <section className="bg-[#1a1d2e] border border-accent/16 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-accent flex items-center gap-2">
            <CreditCard size={18} /> Suivi des cotisations par événement
          </h2>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={onOpenCreateEvent}
              className="px-3 py-1.5 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              <Plus size={13} /> Nouvel événement
            </button>
            <button
              type="button"
              onClick={() => onNavigate('cotisations')}
              className="text-xs text-accent hover:underline font-semibold cursor-pointer whitespace-nowrap"
            >
              Voir tout →
            </button>
          </div>
        </div>

        {eventFunds.length === 0 ? (
          <div className="py-8 px-4 text-center bg-[#252840]/40 rounded-2xl border border-accent/12">
            <p className="text-sm font-semibold text-white">Aucun événement actif</p>
            <p className="text-xs text-[#a09888] mt-1">
              Ajoutez un événement pour démarrer le suivi des cotisations.
            </p>
            <button
              type="button"
              onClick={onOpenCreateEvent}
              className="mt-4 px-4 py-2 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Créer un événement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {eventFunds.map(e => {
              const pct =
                e.target > 0 ? Math.min(100, Math.round((e.collected / e.target) * 100)) : 0;
              return (
                <div
                  key={e.id}
                  className="p-4 bg-[#252840]/60 rounded-2xl border border-accent/15 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-white leading-snug min-w-0">
                        {e.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs font-mono font-bold text-accent tabular-nums mr-1">
                          {pct}%
                        </span>
                        <button
                          type="button"
                          onClick={() => onEditEvent(e)}
                          aria-label={`Modifier ${e.name}`}
                          title="Modifier l’événement"
                          className="w-7 h-7 rounded-lg bg-[#1a1d2e]/80 text-[#a09888] hover:text-accent hover:bg-[#1a1d2e] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDeleteEvent(e)}
                          aria-label={`Supprimer ${e.name}`}
                          title="Supprimer l’événement"
                          className="w-7 h-7 rounded-lg bg-[#1a1d2e]/80 text-[#a09888] hover:text-red-400 hover:bg-[#1a1d2e] flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-[#a09888] space-y-1.5 mt-3">
                      <div className="flex justify-between gap-2">
                        <span>Collecté</span>
                        <span className="text-white font-mono tabular-nums">
                          {e.collected.toLocaleString()} / {e.target.toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>Début</span>
                        <span className="text-white">{e.startDate}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>Date butoire</span>
                        <span className="text-accent-light font-semibold">{e.deadline}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="w-full h-2 bg-[#1a1d2e] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-accent-highlight rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-[#a09888] mt-2 tabular-nums">
                      {e.participants} participants
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

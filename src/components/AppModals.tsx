import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Camera,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Heart,
  HelpCircle,
  ImagePlus,
  MessageSquare,
  Newspaper,
  Pencil,
  Plus,
  Share2,
  ShieldCheck,
  Trash2,
  Users,
  Vote,
  X,
  XCircle,
} from 'lucide-react';
import {
  Alumnus,
  AppNotification,
  Cotisation,
  EventFund,
  GalleryCategory,
  GalleryPhoto,
  NotificationCategory,
} from '../types';
import { COTISATION_PAYMENT_CHANNEL } from '../data/demoData';
import { AvatarDisplay } from './AvatarDisplay';

interface AlumnusModalBodyProps {
  alumnus: Alumnus;
  onStartMessage: (alumnus: Alumnus) => void;
  onShare: () => void;
  onRequestDelete?: (alumnus: Alumnus) => void;
}

export const AlumnusModalBody: React.FC<AlumnusModalBodyProps> = ({
  alumnus,
  onStartMessage,
  onShare,
  onRequestDelete,
}) => (
  <div className="text-center">
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-[#9b59b6] mx-auto mb-3 flex items-center justify-center text-4xl shadow-md overflow-hidden">
      <AvatarDisplay avatar={alumnus.avatar} alt={alumnus.name} />
    </div>
    <h2 className="text-xl font-bold text-accent">{alumnus.name}</h2>
    <p className="text-sm text-[#a09888] mt-1">
      {alumnus.role}{alumnus.city && alumnus.city !== '—' ? ` · ${alumnus.city}` : ''}
    </p>
    <div className="text-xs font-semibold mt-2 text-[#a09888]">
      <span
        className={
          alumnus.status === 'online'
            ? 'text-emerald-400'
            : alumnus.status === 'memorial'
            ? 'text-red-400'
            : 'text-[#a09888]'
        }
      >
        {alumnus.status === 'online'
          ? 'En ligne'
          : alumnus.status === 'memorial'
          ? 'In Memoriam'
          : 'Hors ligne'}
      </span>
      <span aria-hidden="true"> · </span>
      <span className="text-accent">{alumnus.promo}</span>
    </div>

    <dl className="text-left text-sm mt-5 space-y-2.5 bg-[#252840] p-4 rounded-2xl border border-accent/15">
      <div className="flex justify-between gap-2">
        <dt className="text-[#a09888]">Université</dt>
        <dd className="text-white font-medium text-right">{alumnus.univ}</dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-[#a09888]">Filière</dt>
        <dd className="text-white font-medium text-right">{alumnus.filiere}</dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-[#a09888]">Pays</dt>
        <dd className="text-white font-medium text-right">{alumnus.country}</dd>
      </div>
      <div className="flex justify-between gap-2">
        <dt className="text-[#a09888]">Amitié</dt>
        <dd className="text-accent">{'❤'.repeat(alumnus.bond)}{'♡'.repeat(5 - alumnus.bond)}</dd>
      </div>
    </dl>

    <div className="mt-5 flex flex-wrap gap-2.5 justify-center">
      <button
        type="button"
        onClick={() => onStartMessage(alumnus)}
        className="px-4 py-2.5 bg-accent text-accent-contrast font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-accent-light transition-colors cursor-pointer"
      >
        <MessageSquare size={16} /> Envoyer un message
      </button>
      <button
        type="button"
        onClick={onShare}
        className="px-4 py-2.5 border border-accent/30 text-accent font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-accent/10 transition-colors cursor-pointer"
      >
        <Share2 size={16} /> Partager
      </button>
      {onRequestDelete && (
        <button
          type="button"
          onClick={() => onRequestDelete(alumnus)}
          className="px-4 py-2.5 border border-red-400/30 bg-red-500/12 text-red-300 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
        >
          <Trash2 size={16} /> Supprimer
        </button>
      )}
    </div>
  </div>
);

interface NotificationsModalBodyProps {
  notifications: AppNotification[];
  browserNotifStatus: NotificationPermission | 'unsupported';
  onEnableBrowserNotif: () => void;
  onSelectNotification: (notif: AppNotification) => void;
  onMarkAllRead: () => void;
  onDismissNotification: (id: number) => void;
  onClearRead: () => void;
}

const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; icon: React.ReactNode; toneClass: string }
> = {
  cotisation: {
    label: 'Cotisations',
    icon: <CreditCard size={16} />,
    toneClass: 'bg-amber-500/15 text-accent-light',
  },
  info: {
    label: 'Informations',
    icon: <Newspaper size={16} />,
    toneClass: 'bg-emerald-500/15 text-emerald-400',
  },
  poll: {
    label: 'Sondages',
    icon: <Vote size={16} />,
    toneClass: 'bg-purple-500/15 text-purple-300',
  },
  discussion: {
    label: 'Discussions',
    icon: <MessageSquare size={16} />,
    toneClass: 'bg-sky-500/15 text-sky-400',
  },
  system: {
    label: 'Compte',
    icon: <Bell size={16} />,
    toneClass: 'bg-accent/15 text-accent',
  },
};

export const NotificationsModalBody: React.FC<NotificationsModalBodyProps> = ({
  notifications,
  browserNotifStatus,
  onEnableBrowserNotif,
  onSelectNotification,
  onMarkAllRead,
  onDismissNotification,
  onClearRead,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.length - unreadCount;
  const visibleNotifications =
    filterMode === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div>
      <div className="pr-10 mb-4">
        <h2 className="text-lg font-bold text-accent flex items-center gap-2">
          <Bell size={19} /> Notifications
        </h2>
        <p className="text-xs text-[#a09888] mt-1 tabular-nums">
          {unreadCount > 0
            ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''} sur ${notifications.length}`
            : notifications.length > 0
            ? 'Toutes vos notifications sont lues'
            : 'Aucune notification active'}
        </p>
      </div>

      {/* Controls: Filter + Bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-accent/14">
        <div className="flex items-center gap-1 p-1 bg-[#252840] rounded-lg">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
              filterMode === 'all'
                ? 'bg-accent text-accent-contrast'
                : 'text-[#a09888] hover:text-white'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('unread')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
              filterMode === 'unread'
                ? 'bg-accent text-accent-contrast'
                : 'text-[#a09888] hover:text-white'
            }`}
          >
            Non lues ({unreadCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="px-2.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/10 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <CheckCheck size={14} /> Tout marquer lu
            </button>
          )}
          {readCount > 0 && (
            <button
              type="button"
              onClick={onClearRead}
              className="px-2.5 py-1.5 text-xs font-semibold text-[#a09888] hover:text-white hover:bg-[#252840] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Effacer lues
            </button>
          )}
        </div>
      </div>

      {/* Browser Push Permission Bar */}
      {browserNotifStatus !== 'unsupported' && (
        <div className="mt-3 px-3 py-2.5 bg-[#252840]/70 border border-accent/14 rounded-xl flex items-center justify-between gap-3">
          <div className="text-xs text-[#e8e0d0] min-w-0">
            {browserNotifStatus === 'granted'
              ? 'Alertes navigateur activées'
              : browserNotifStatus === 'denied'
              ? 'Alertes bloquées dans les réglages du navigateur'
              : 'Recevoir aussi les alertes sur cet appareil'}
          </div>
          {browserNotifStatus === 'default' && (
            <button
              type="button"
              onClick={onEnableBrowserNotif}
              className="px-3 py-1.5 bg-accent text-accent-contrast text-xs font-bold rounded-lg hover:bg-accent-light transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Activer
            </button>
          )}
        </div>
      )}

      {/* Notification List */}
      <div className="mt-2 divide-y divide-accent/12">
        {visibleNotifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={28} className="mx-auto text-[#a09888]/60 mb-2" />
            <p className="text-sm font-semibold text-[#e8e0d0]">
              {filterMode === 'unread'
                ? 'Aucune notification non lue'
                : 'Boîte de notifications vide'}
            </p>
            <p className="text-xs text-[#a09888] mt-1">
              Les nouvelles publications, cotisations et messages apparaîtront ici.
            </p>
          </div>
        ) : (
          visibleNotifications.map(notif => {
            const meta = CATEGORY_META[notif.category];
            return (
              <div
                key={notif.id}
                className={`py-3 flex items-start gap-3 transition-colors rounded-xl px-2 -mx-2 ${
                  notif.read ? 'opacity-75 hover:opacity-100 hover:bg-[#252840]/40' : 'bg-[#252840]/60 hover:bg-[#252840]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${meta.toneClass}`}
                  aria-hidden="true"
                >
                  {meta.icon}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectNotification(notif)}
                  className="flex-1 min-w-0 text-left cursor-pointer focus:outline-none"
                >
                  <div className="text-xs text-[#a09888] flex items-center gap-1.5 tabular-nums">
                    <span>{meta.label}</span>
                    <span aria-hidden="true">·</span>
                    <span>{notif.time}</span>
                    {!notif.read && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-accent font-semibold">Non lue</span>
                      </>
                    )}
                  </div>
                  <div
                    className={`text-sm mt-0.5 leading-snug ${
                      notif.read ? 'font-medium text-[#e8e0d0]' : 'font-bold text-white'
                    }`}
                  >
                    {notif.title}
                  </div>
                  <p className="text-xs text-[#a09888] mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => onDismissNotification(notif.id)}
                  aria-label={`Supprimer la notification : ${notif.title}`}
                  className="w-7 h-7 rounded-lg text-[#a09888] hover:text-white hover:bg-[#1a1d2e] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

interface PayModalBodyProps {
  eventFunds: EventFund[];
  prefillCotisation?: Cotisation | null;
  onConfirmPay: (
    eventName: string,
    amount: number,
    transactionRef: string,
    targetCotisationId?: number
  ) => void;
  onShowError: (msg: string) => void;
}

export const PayModalBody: React.FC<PayModalBodyProps> = ({
  eventFunds,
  prefillCotisation,
  onConfirmPay,
  onShowError,
}) => {
  const [selectedEvent, setSelectedEvent] = useState(
    prefillCotisation?.event || eventFunds[0]?.name || ''
  );
  const [amount, setAmount] = useState(
    prefillCotisation ? String(prefillCotisation.amount) : '10000'
  );
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(COTISATION_PAYMENT_CHANNEL.number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEventName = (prefillCotisation?.event || selectedEvent).trim();
    if (!targetEventName) {
      onShowError('Veuillez préciser le nom de l’événement');
      return;
    }
    if (!reference.trim()) {
      onShowError('Veuillez saisir votre numéro d’envoi ou référence MTN Mobile Money');
      return;
    }
    const numericAmount = prefillCotisation
      ? prefillCotisation.amount
      : Math.max(500, parseInt(amount, 10) || 10000);
    onConfirmPay(targetEventName, numericAmount, reference.trim(), prefillCotisation?.id);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-accent mb-4 flex items-center gap-2 pr-10">
        <CreditCard size={19} /> Déclarer un paiement
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">Événement</label>
          {prefillCotisation ? (
            <div className="w-full px-3 py-2.5 bg-[#252840]/60 border border-accent/18 rounded-xl text-white text-sm font-semibold">
              {prefillCotisation.event}
            </div>
          ) : eventFunds.length > 0 ? (
            <select
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            >
              {eventFunds.map(e => (
                <option key={e.id} value={e.name}>
                  {e.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              required
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
              placeholder="Ex: Gala des Anciens 2026"
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">Montant (FCFA)</label>
          <input
            type="number"
            min={500}
            value={amount}
            readOnly={Boolean(prefillCotisation)}
            onChange={e => setAmount(e.target.value)}
            className={`w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm font-mono tabular-nums focus:outline-none focus:border-accent ${
              prefillCotisation ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          />
        </div>

        {/* Sole Official Collection Channel: MTN Mobile Money */}
        <div className="p-3.5 bg-[#252840] border border-accent/28 rounded-2xl space-y-2">
          <div className="text-xs font-bold text-accent-light">
            Canal unique de paiement · {COTISATION_PAYMENT_CHANNEL.provider}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5 text-xs">
              <div className="text-[#a09888]">
                Numéro :{' '}
                <strong className="text-white font-mono tabular-nums text-sm">
                  {COTISATION_PAYMENT_CHANNEL.number}
                </strong>
              </div>
              <div className="text-[#a09888]">
                Bénéficiaire :{' '}
                <strong className="text-white">{COTISATION_PAYMENT_CHANNEL.recipientName}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyNumber}
              className="px-3 py-1.5 rounded-lg bg-[#1a1d2e] border border-accent/28 text-accent hover:bg-accent hover:text-accent-contrast text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">
            Votre numéro d&apos;envoi / Référence MTN <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="Ex: 06 XXX XXXX ou ID transaction"
            className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <p className="text-xs text-[#a09888] leading-relaxed">
          Votre cotisation passera en statut <strong className="text-white">En attente</strong> et ne deviendra <strong className="text-emerald-400">Payé</strong> qu&apos;après confirmation de réception par <strong className="text-accent">{COTISATION_PAYMENT_CHANNEL.recipientName}</strong>.
        </p>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer"
        >
          Soumettre pour confirmation
        </button>
      </div>
    </form>
  );
};

interface BenichouConfirmModalBodyProps {
  cotisation: Cotisation;
  onConfirmReceipt: (cotiId: number) => void;
  onRejectReceipt: (cotiId: number) => void;
  onCancel: () => void;
}

export const BenichouConfirmModalBody: React.FC<BenichouConfirmModalBodyProps> = ({
  cotisation,
  onConfirmReceipt,
  onRejectReceipt,
  onCancel,
}) => {
  const [attested, setAttested] = useState(false);

  return (
    <div className="space-y-4">
      <div className="pr-10">
        <h2 className="text-lg font-bold text-accent flex items-center gap-2">
          <ShieldCheck size={20} /> Confirmation · {COTISATION_PAYMENT_CHANNEL.recipientName}
        </h2>
        <p className="text-xs text-[#a09888] mt-1">
          Seule la validation de {COTISATION_PAYMENT_CHANNEL.recipientName} permet de passer le statut du contribuable à Payé.
        </p>
      </div>

      <dl className="bg-[#252840] border border-accent/18 rounded-2xl p-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-[#a09888]">Contribuable</dt>
          <dd className="text-white font-semibold text-right">
            {cotisation.contributorName || 'Membre'}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#a09888]">Événement</dt>
          <dd className="text-white font-medium text-right">{cotisation.event}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#a09888]">Montant déclaré</dt>
          <dd className="text-accent-light font-bold font-mono tabular-nums text-right">
            {cotisation.amount.toLocaleString('fr-FR')} FCFA
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#a09888]">Référence MTN</dt>
          <dd className="text-white font-mono text-right break-all">
            {cotisation.transactionRef || 'Non renseignée'}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#a09888]">Date de déclaration</dt>
          <dd className="text-[#e8e0d0] font-mono tabular-nums text-right">{cotisation.date}</dd>
        </div>
      </dl>

      <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#252840]/60 border border-accent/20 cursor-pointer text-xs text-[#e8e0d0]">
        <input
          type="checkbox"
          checked={attested}
          onChange={e => setAttested(e.target.checked)}
          className="mt-0.5 rounded border-accent/30 bg-[#1a1d2e] accent-accent"
        />
        <span>
          Je suis <strong className="text-white">{COTISATION_PAYMENT_CHANNEL.recipientName}</strong> et je confirme avoir effectivement reçu cette somme sur le compte {COTISATION_PAYMENT_CHANNEL.provider} <strong className="text-accent font-mono">{COTISATION_PAYMENT_CHANNEL.number}</strong>.
        </span>
      </label>

      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <button
          type="button"
          disabled={!attested}
          onClick={() => onConfirmReceipt(cotisation.id)}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
            attested
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer'
              : 'bg-[#252840] text-[#706858] cursor-not-allowed'
          }`}
        >
          Confirmer : Statut Payé
        </button>
        <button
          type="button"
          onClick={() => onRejectReceipt(cotisation.id)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500/15 border border-red-400/30 text-red-300 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
        >
          Non reçu
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#252840] text-[#a09888] hover:text-white transition-colors cursor-pointer"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

interface CreateSalonModalBodyProps {
  alumniList: Alumnus[];
  onCreateSalon: (name: string, emoji: string, selectedMemberNames: string[]) => void;
  onShowError: (msg: string) => void;
}

export const CreateSalonModalBody: React.FC<CreateSalonModalBodyProps> = ({
  alumniList,
  onCreateSalon,
  onShowError,
}) => {
  const [salonName, setSalonName] = useState('');
  const [salonEmoji, setSalonEmoji] = useState('💬');
  const [selectedAlumniIds, setSelectedAlumniIds] = useState<number[]>([]);
  const [memberFilter, setMemberFilter] = useState('');

  const filteredAlumni = alumniList.filter(a =>
    a.name.toLowerCase().includes(memberFilter.toLowerCase()) ||
    a.promo.toLowerCase().includes(memberFilter.toLowerCase())
  );

  const toggleMember = (id: number) => {
    setSelectedAlumniIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonName.trim()) {
      onShowError('Veuillez entrer un nom pour le salon');
      return;
    }
    const memberNames = alumniList
      .filter(a => selectedAlumniIds.includes(a.id))
      .map(a => a.name);
    onCreateSalon(salonName.trim(), salonEmoji, memberNames);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-accent mb-4 flex items-center gap-2">
        <MessageSquare size={19} /> Créer un nouveau salon
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">Nom du salon</label>
          <input
            type="text"
            value={salonName}
            onChange={e => setSalonName(e.target.value)}
            placeholder="Ex: Promo 2018 Dakar, Projet Tech..."
            className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">Icône / Émoji</label>
          <select
            value={salonEmoji}
            onChange={e => setSalonEmoji(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
          >
            <option value="💬">💬 Discussion</option>
            <option value="🚀">🚀 Projet / Tech</option>
            <option value="🎓">🎓 Promotion</option>
            <option value="💼">💼 Affaires & Emploi</option>
            <option value="☕">☕ Détente & Café</option>
            <option value="🌍">🌍 International</option>
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-[#a09888]">
              Ajouter des intéressés
            </label>
            <span className="text-[11px] text-accent font-medium tabular-nums">
              {selectedAlumniIds.length} sélectionné{selectedAlumniIds.length > 1 ? 's' : ''}
            </span>
          </div>
          <input
            type="text"
            value={memberFilter}
            onChange={e => setMemberFilter(e.target.value)}
            placeholder="Filtrer les membres..."
            className="w-full px-3 py-2 mb-2 bg-[#252840] border border-accent/15 rounded-xl text-white text-xs focus:outline-none focus:border-accent"
          />
          <div className="max-h-40 overflow-y-auto bg-[#252840] border border-accent/15 rounded-xl p-2 space-y-1">
            {filteredAlumni.length === 0 ? (
              <div className="py-3 text-center text-xs text-[#a09888]">
                Aucun autre membre inscrit pour le moment.
              </div>
            ) : (
              filteredAlumni.map(a => {
                const checked = selectedAlumniIds.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-[#1a1d2e] rounded-lg cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMember(a.id)}
                      className="rounded border-accent/30 bg-[#1a1d2e] accent-accent"
                    />
                    <span className="text-white truncate flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#1a1d2e] inline-flex items-center justify-center text-xs shrink-0 overflow-hidden">
                        <AvatarDisplay avatar={a.avatar} alt={a.name} />
                      </span>
                      <span className="truncate">{a.name}</span>
                    </span>
                    <span className="text-[#a09888] ml-auto shrink-0">{a.promo}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer"
        >
          Créer le salon et inviter
        </button>
      </div>
    </form>
  );
};

interface ConfirmDeleteModalBodyProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteModalBody: React.FC<ConfirmDeleteModalBodyProps> = ({
  onCancel,
  onConfirm,
}) => (
  <div className="text-center space-y-4">
    <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 mx-auto flex items-center justify-center">
      <Trash2 size={22} />
    </div>
    <div>
      <h2 className="text-lg font-bold text-white">Supprimer votre compte ?</h2>
      <p className="text-xs text-[#a09888] mt-1">
        Cette action est irréversible et supprimera vos informations de session locale.
      </p>
    </div>
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 bg-[#252840] text-white font-semibold rounded-xl text-sm hover:bg-[#2d3050] cursor-pointer"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 cursor-pointer"
      >
        Supprimer
      </button>
    </div>
  </div>
);

const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  gala: 'Gala',
  retrouvailles: 'Retrouvailles',
  mentorat: 'Mentorat',
  solidarite: 'Solidarité',
};

interface GalleryPhotoModalBodyProps {
  photos: GalleryPhoto[];
  activePhotoId: number;
  onSelectPhoto: (photoId: number) => void;
  onToggleLike: (photoId: number) => void;
  onEditPhoto: (photo: GalleryPhoto) => void;
  onDeletePhoto: (photoId: number) => void;
}

export const GalleryPhotoModalBody: React.FC<GalleryPhotoModalBodyProps> = ({
  photos,
  activePhotoId,
  onSelectPhoto,
  onToggleLike,
  onEditPhoto,
  onDeletePhoto,
}) => {
  const [imageError, setImageError] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const currentIndex = Math.max(
    0,
    photos.findIndex(p => p.id === activePhotoId)
  );
  const photo = photos[currentIndex] || photos[0];

  if (!photo) return null;

  const hasMultiple = photos.length > 1;
  const handlePrev = () => {
    setImageError(false);
    setConfirmingDelete(false);
    const prevIdx = (currentIndex - 1 + photos.length) % photos.length;
    onSelectPhoto(photos[prevIdx].id);
  };
  const handleNext = () => {
    setImageError(false);
    setConfirmingDelete(false);
    const nextIdx = (currentIndex + 1) % photos.length;
    onSelectPhoto(photos[nextIdx].id);
  };

  return (
    <div className="space-y-4">
      <div className="pr-10">
        <div className="text-xs text-[#a09888] flex flex-wrap items-center gap-1.5">
          <span className="text-accent font-semibold">
            {GALLERY_CATEGORY_LABELS[photo.category]}
          </span>
          <span aria-hidden="true">·</span>
          <span>{photo.date}</span>
          <span aria-hidden="true">·</span>
          <span>{photo.location}</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-white mt-1">{photo.title}</h2>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-[#252840] border border-accent/16 aspect-[4/3]">
        {!imageError ? (
          <img
            src={photo.imageUrl}
            alt={photo.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#252840] via-[#1a1d2e] to-[#2d2538] flex flex-col items-center justify-center p-6 text-center">
            <Camera size={32} className="text-accent mb-2" />
            <div className="text-sm font-semibold text-white">{photo.title}</div>
            <div className="text-xs text-[#a09888] mt-1">
              {photo.event} · {photo.location}
            </div>
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Photo précédente"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Photo suivante"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      <p className="text-sm text-[#e8e0d0] leading-relaxed">{photo.caption}</p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-accent/14">
        <div className="text-xs text-[#a09888]">
          Partagé par <strong className="text-white">{photo.author}</strong> · {photo.promo}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasMultiple && (
            <span className="text-xs text-[#a09888] font-mono tabular-nums mr-1">
              {currentIndex + 1} / {photos.length}
            </span>
          )}
          <button
            type="button"
            onClick={() => onToggleLike(photo.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
              photo.liked
                ? 'bg-rose-500/15 border-rose-400/40 text-rose-300'
                : 'bg-[#252840] border-accent/20 text-[#e8e0d0] hover:border-accent'
            }`}
          >
            <Heart size={14} className={photo.liked ? 'fill-rose-400 text-rose-400' : ''} />
            {photo.likes}
          </button>

          <button
            type="button"
            onClick={() => onEditPhoto(photo)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#252840] border border-accent/20 text-[#e8e0d0] hover:border-accent hover:text-accent flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Pencil size={13} /> Modifier
          </button>

          {confirmingDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setConfirmingDelete(false);
                  onDeletePhoto(photo.id);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Confirmer
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-[#252840] text-[#a09888] hover:text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500/15 border border-red-400/30 text-red-300 hover:bg-red-500 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trash2 size={13} /> Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface AddGalleryPhotoModalBodyProps {
  onAddPhoto: (data: {
    title: string;
    event: string;
    date: string;
    location: string;
    category: GalleryCategory;
    caption: string;
    imageUrl: string;
  }) => void;
  onShowError: (msg: string) => void;
}

export const AddGalleryPhotoModalBody: React.FC<AddGalleryPhotoModalBodyProps> = ({
  onAddPhoto,
  onShowError,
}) => {
  const [title, setTitle] = useState('');
  const [event, setEvent] = useState('');
  const [date, setDate] = useState('Mars 2025');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('retrouvailles');
  const [caption, setCaption] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowError('Veuillez sélectionner une image valide (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      onShowError('Veuillez importer une photo de l’événement');
      return;
    }
    if (!title.trim()) {
      onShowError('Veuillez indiquer un titre pour ce souvenir');
      return;
    }
    onAddPhoto({
      title: title.trim(),
      event: event.trim() || title.trim(),
      date: date.trim() || '2025',
      location: location.trim() || 'Communauté',
      category,
      caption:
        caption.trim() ||
        'Moment partagé lors d’une rencontre de la communauté des Anciens.',
      imageUrl: imagePreview,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-accent mb-4 flex items-center gap-2 pr-10">
        <Camera size={19} /> Ajouter une photo souvenir
      </h2>

      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1.5">
            Photo de l&apos;événement
          </label>
          <label className="block rounded-2xl border border-dashed border-accent/35 bg-[#252840]/60 hover:bg-[#252840] transition-colors cursor-pointer overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            {imagePreview ? (
              <div className="relative aspect-[4/3]">
                <img
                  src={imagePreview}
                  alt="Aperçu de la photo sélectionnée"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent text-xs text-white font-medium text-center">
                  Cliquer pour changer la photo
                </div>
              </div>
            ) : (
              <div className="py-7 px-4 flex flex-col items-center justify-center text-center gap-1.5">
                <ImagePlus size={24} className="text-accent" />
                <span className="text-xs font-semibold text-white">
                  Importer une image depuis votre appareil
                </span>
                <span className="text-[11px] text-[#a09888]">JPG, PNG ou WebP</span>
              </div>
            )}
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">
            Titre du souvenir
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Dîner de la Promo 2018 à Brazzaville"
            className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Catégorie
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as GalleryCategory)}
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            >
              <option value="gala">Galas</option>
              <option value="retrouvailles">Retrouvailles</option>
              <option value="mentorat">Mentorat</option>
              <option value="solidarite">Solidarité</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Événement
            </label>
            <input
              type="text"
              value={event}
              onChange={e => setEvent(e.target.value)}
              placeholder="Ex: Gala annuel"
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Date
            </label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="Ex: Février 2025"
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Ville
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ex: Dakar, Douala..."
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">
            Légende
          </label>
          <textarea
            rows={2}
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Racontez brièvement ce moment partagé entre anciens..."
            className="w-full px-3 py-2 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer"
        >
          Publier dans la galerie
        </button>
      </div>
    </form>
  );
};

interface EditGalleryPhotoModalBodyProps {
  photo: GalleryPhoto;
  onSavePhoto: (updated: GalleryPhoto) => void;
  onDeletePhoto: (photoId: number) => void;
  onShowError: (msg: string) => void;
}

export const EditGalleryPhotoModalBody: React.FC<EditGalleryPhotoModalBodyProps> = ({
  photo,
  onSavePhoto,
  onDeletePhoto,
  onShowError,
}) => {
  const [title, setTitle] = useState(photo.title);
  const [event, setEvent] = useState(photo.event);
  const [date, setDate] = useState(photo.date);
  const [location, setLocation] = useState(photo.location);
  const [category, setCategory] = useState<GalleryCategory>(photo.category);
  const [caption, setCaption] = useState(photo.caption);
  const [imageUrl, setImageUrl] = useState(photo.imageUrl);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowError('Veuillez sélectionner une image valide (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowError('Veuillez indiquer un titre pour ce souvenir');
      return;
    }
    onSavePhoto({
      ...photo,
      title: title.trim(),
      event: event.trim() || title.trim(),
      date: date.trim() || photo.date,
      location: location.trim() || 'Communauté',
      category,
      caption: caption.trim() || photo.caption,
      imageUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-accent mb-4 flex items-center gap-2 pr-10">
        <Pencil size={18} /> Modifier le souvenir
      </h2>

      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1.5">
            Image de l&apos;événement
          </label>
          <label className="block rounded-2xl border border-accent/28 bg-[#252840]/60 hover:bg-[#252840] transition-colors cursor-pointer overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            <div className="relative aspect-[4/3]">
              <img
                src={imageUrl}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent text-xs text-white font-medium text-center">
                Cliquer pour remplacer la photo
              </div>
            </div>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">
            Titre du souvenir
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Catégorie
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as GalleryCategory)}
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            >
              <option value="gala">Galas</option>
              <option value="retrouvailles">Retrouvailles</option>
              <option value="mentorat">Mentorat</option>
              <option value="solidarite">Solidarité</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Événement
            </label>
            <input
              type="text"
              value={event}
              onChange={e => setEvent(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Date
            </label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Ville
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">
            Légende
          </label>
          <textarea
            rows={2}
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="w-full px-3 py-2 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer"
          >
            Enregistrer les modifications
          </button>

          {confirmDelete ? (
            <button
              type="button"
              onClick={() => onDeletePhoto(photo.id)}
              className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Confirmer la suppression
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-3 bg-red-500/15 border border-red-400/30 text-red-300 hover:bg-red-500 hover:text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Trash2 size={15} /> Supprimer
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

interface ConfirmDeleteGalleryModalBodyProps {
  photo: GalleryPhoto;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteGalleryModalBody: React.FC<ConfirmDeleteGalleryModalBodyProps> = ({
  photo,
  onCancel,
  onConfirm,
}) => (
  <div className="text-center space-y-4">
    <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 mx-auto flex items-center justify-center">
      <Trash2 size={22} />
    </div>
    <div>
      <h2 className="text-lg font-bold text-white">Supprimer cette photo ?</h2>
      <p className="text-xs text-[#a09888] mt-1">
        &laquo;&nbsp;{photo.title}&nbsp;&raquo; ({photo.date} · {photo.location}) sera retirée de la galerie.
      </p>
    </div>
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 bg-[#252840] text-white font-semibold rounded-xl text-sm hover:bg-[#2d3050] cursor-pointer"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 cursor-pointer"
      >
        Supprimer
      </button>
    </div>
  </div>
);

interface EventFormModalBodyProps {
  event?: EventFund | null;
  onSaveEvent: (data: Omit<EventFund, 'id'>, existingId?: number) => void;
  onDeleteEvent?: (eventId: number) => void;
  onShowError: (msg: string) => void;
}

export const EventFormModalBody: React.FC<EventFormModalBodyProps> = ({
  event,
  onSaveEvent,
  onDeleteEvent,
  onShowError,
}) => {
  const isEdit = Boolean(event);
  const [name, setName] = useState(event?.name || '');
  const [startDate, setStartDate] = useState(event?.startDate || '');
  const [deadline, setDeadline] = useState(event?.deadline || '');
  const [target, setTarget] = useState(event ? String(event.target) : '1000000');
  const [collected, setCollected] = useState(event ? String(event.collected) : '0');
  const [participants, setParticipants] = useState(event ? String(event.participants) : '0');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowError('Veuillez saisir le nom de l’événement');
      return;
    }
    if (!startDate.trim()) {
      onShowError('Veuillez indiquer la date de début');
      return;
    }
    if (!deadline.trim()) {
      onShowError('Veuillez indiquer la date butoire');
      return;
    }
    const parsedTarget = parseInt(target, 10);
    if (Number.isNaN(parsedTarget) || parsedTarget < 500) {
      onShowError('L’objectif financier doit être d’au moins 500 FCFA');
      return;
    }
    const parsedCollected = Math.max(0, parseInt(collected, 10) || 0);
    const parsedParticipants = Math.max(0, parseInt(participants, 10) || 0);

    onSaveEvent(
      {
        name: name.trim(),
        startDate: startDate.trim(),
        deadline: deadline.trim(),
        target: parsedTarget,
        collected: parsedCollected,
        participants: parsedParticipants,
      },
      event?.id
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-accent mb-4 flex items-center gap-2 pr-10">
        {isEdit ? <Pencil size={18} /> : <Plus size={19} />}
        {isEdit ? 'Modifier l’événement' : 'Créer un événement'}
      </h2>

      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">
            Nom de l&apos;événement <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Gala des Anciens 2026"
            className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Date de début <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              placeholder="Ex: 01 Juin 2026"
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Date butoire <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              placeholder="Ex: 20 Déc 2026 ou Permanent"
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#a09888] mb-1">
            Objectif à collecter (FCFA) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min={500}
            required
            value={target}
            onChange={e => setTarget(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm font-mono tabular-nums focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Montant déjà collecté (FCFA)
            </label>
            <input
              type="number"
              min={0}
              value={collected}
              onChange={e => setCollected(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm font-mono tabular-nums focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Participants
            </label>
            <input
              type="number"
              min={0}
              value={participants}
              onChange={e => setParticipants(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm font-mono tabular-nums focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            type="submit"
            className="flex-1 py-3 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer"
          >
            {isEdit ? 'Enregistrer les modifications' : 'Créer l’événement'}
          </button>

          {isEdit && event && onDeleteEvent && (
            confirmDelete ? (
              <button
                type="button"
                onClick={() => onDeleteEvent(event.id)}
                className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Confirmer suppression
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-3 bg-red-500/15 border border-red-400/30 text-red-300 hover:bg-red-500 hover:text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Trash2 size={15} /> Supprimer
              </button>
            )
          )}
        </div>
      </div>
    </form>
  );
};

interface ConfirmDeleteEventModalBodyProps {
  event: EventFund;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteEventModalBody: React.FC<ConfirmDeleteEventModalBodyProps> = ({
  event,
  onCancel,
  onConfirm,
}) => (
  <div className="text-center space-y-4">
    <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 mx-auto flex items-center justify-center">
      <Calendar size={22} />
    </div>
    <div>
      <h2 className="text-lg font-bold text-white">Supprimer cet événement ?</h2>
      <p className="text-xs text-[#a09888] mt-1.5 leading-relaxed">
        L&apos;événement <strong className="text-white">&laquo;&nbsp;{event.name}&nbsp;&raquo;</strong> ({event.startDate} — {event.deadline}) sera définitivement retiré du suivi.
      </p>
    </div>
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 bg-[#252840] text-white font-semibold rounded-xl text-sm hover:bg-[#2d3050] cursor-pointer"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 cursor-pointer"
      >
        Supprimer
      </button>
    </div>
  </div>
);

interface ConfirmDeleteAlumnusModalBodyProps {
  alumnus: Alumnus;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteAlumnusModalBody: React.FC<ConfirmDeleteAlumnusModalBodyProps> = ({
  alumnus,
  onCancel,
  onConfirm,
}) => (
  <div className="text-center space-y-4">
    <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-400 mx-auto flex items-center justify-center">
      <Trash2 size={22} />
    </div>
    <div>
      <h2 className="text-lg font-bold text-white">Supprimer cet ancien ?</h2>
      <p className="text-xs text-[#a09888] mt-1.5 leading-relaxed">
        <strong className="text-white">{alumnus.name}</strong> ({alumnus.promo} · {alumnus.univ}) sera retiré de l&apos;annuaire des anciens.
      </p>
    </div>
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 bg-[#252840] text-white font-semibold rounded-xl text-sm hover:bg-[#2d3050] cursor-pointer"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 cursor-pointer"
      >
        Supprimer
      </button>
    </div>
  </div>
);

interface EventParticipantsModalBodyProps {
  event: EventFund;
  userEmail: string;
  onRsvp: (eventId: number, status: 'going' | 'maybe' | 'not_going') => void;
}

export const EventParticipantsModalBody: React.FC<EventParticipantsModalBodyProps> = ({
  event,
  userEmail,
  onRsvp,
}) => {
  const rsvps = event.rsvps || [];
  const going = rsvps.filter(r => r.status === 'going');
  const maybe = rsvps.filter(r => r.status === 'maybe');
  const notGoing = rsvps.filter(r => r.status === 'not_going');
  const userStatus = rsvps.find(
    r => r.alumnusEmail.toLowerCase() === userEmail.trim().toLowerCase()
  )?.status;

  const renderGroup = (
    title: string,
    toneClass: string,
    items: typeof rsvps
  ) => (
    <div className="space-y-2">
      <div className={`text-xs font-bold flex items-center justify-between ${toneClass}`}>
        <span>{title}</span>
        <span className="font-mono tabular-nums">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-[#706858] px-3 py-2 rounded-xl bg-[#252840]/40">
          Aucun membre dans cette catégorie.
        </div>
      ) : (
        <div className="space-y-1.5">
          {items.map(item => (
            <div
              key={item.alumnusEmail}
              className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-[#252840]/70 border border-accent/12"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#1a1d2e] flex items-center justify-center text-sm shrink-0 overflow-hidden">
                  <AvatarDisplay avatar={item.avatar} alt={item.alumnusName} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {item.alumnusName}
                  </div>
                  {item.promo && (
                    <div className="text-[11px] text-[#a09888] truncate">{item.promo}</div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-[#807868] font-mono tabular-nums shrink-0">
                {item.updatedAt}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="pr-10">
        <h2 className="text-lg font-bold text-accent flex items-center gap-2">
          <Users size={19} /> Participants · {event.name}
        </h2>
        <p className="text-xs text-[#a09888] mt-1 tabular-nums">
          {event.startDate} — {event.deadline} · {rsvps.length} réponse{rsvps.length > 1 ? 's' : ''} enregistrée{rsvps.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Quick RSVP Toggle inside modal */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onRsvp(event.id, 'going')}
          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            userStatus === 'going'
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              : 'bg-[#252840] border-accent/15 text-[#a09888] hover:text-white'
          }`}
        >
          <Check size={13} /> Je participe
        </button>
        <button
          type="button"
          onClick={() => onRsvp(event.id, 'maybe')}
          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            userStatus === 'maybe'
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-[#252840] border-accent/15 text-[#a09888] hover:text-white'
          }`}
        >
          <HelpCircle size={13} /> Peut-être
        </button>
        <button
          type="button"
          onClick={() => onRsvp(event.id, 'not_going')}
          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            userStatus === 'not_going'
              ? 'bg-red-500/20 border-red-400 text-red-300'
              : 'bg-[#252840] border-accent/15 text-[#a09888] hover:text-white'
          }`}
        >
          <XCircle size={13} /> Absent
        </button>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
        {renderGroup('Je participe', 'text-emerald-400', going)}
        {renderGroup('Peut-être', 'text-amber-400', maybe)}
        {renderGroup('Absent(s)', 'text-red-400', notGoing)}
      </div>
    </div>
  );
};


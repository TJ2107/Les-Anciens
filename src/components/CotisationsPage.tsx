import React, { useState } from 'react';
import { Check, Copy, CreditCard, Pencil, Plus, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { Cotisation, EventFund } from '../types';
import { COTISATION_PAYMENT_CHANNEL } from '../data/demoData';

interface CotisationsPageProps {
  cotisations: Cotisation[];
  eventFunds: EventFund[];
  onPayCotisation: (cotiId: number) => void;
  onOpenPayModal: () => void;
  onOpenBenichouConfirm: (cotisation: Cotisation) => void;
  onOpenCreateEvent: () => void;
  onEditEvent: (event: EventFund) => void;
  onRequestDeleteEvent: (event: EventFund) => void;
}

export const CotisationsPage: React.FC<CotisationsPageProps> = ({
  cotisations,
  eventFunds,
  onPayCotisation,
  onOpenPayModal,
  onOpenBenichouConfirm,
  onOpenCreateEvent,
  onEditEvent,
  onRequestDeleteEvent,
}) => {
  const [copied, setCopied] = useState(false);
  const paidList = cotisations.filter(c => c.status === 'paid');
  const awaitingList = cotisations.filter(c => c.status === 'awaiting_confirmation');
  const unpaidCount = cotisations.filter(
    c => c.status === 'pending' || c.status === 'overdue'
  ).length;
  const totalPaid = paidList.reduce((sum, c) => sum + c.amount, 0);

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(COTISATION_PAYMENT_CHANNEL.number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable in restricted contexts
    }
  };

  const renderStatus = (c: Cotisation) => {
    if (c.status === 'paid') {
      return (
        <div>
          <span className="text-emerald-400 font-semibold text-xs">✅ Payé</span>
          <div className="text-[11px] text-[#807868] mt-0.5">
            Confirmé par {c.confirmedBy || COTISATION_PAYMENT_CHANNEL.recipientName}
          </div>
        </div>
      );
    }
    if (c.status === 'awaiting_confirmation') {
      return (
        <div>
          <span className="text-sky-400 font-semibold text-xs">
            ⏳ Attente confirmation ({COTISATION_PAYMENT_CHANNEL.recipientName})
          </span>
          {c.transactionRef && (
            <div className="text-[11px] text-[#a09888] mt-0.5 font-mono">
              Réf : {c.transactionRef}
            </div>
          )}
        </div>
      );
    }
    if (c.status === 'pending') {
      return <span className="text-accent font-semibold text-xs">⏳ À payer</span>;
    }
    return <span className="text-red-400 font-semibold text-xs">🔴 En retard</span>;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-accent">Cotisations & Contributions</h1>
        <button
          type="button"
          onClick={onOpenPayModal}
          className="px-4 py-2.5 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow whitespace-nowrap shrink-0"
        >
          <Plus size={15} /> Payer une cotisation
        </button>
      </div>

      {/* Financial KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-5">
          <div className="text-xs font-medium text-[#a09888]">Total cotisé (confirmé)</div>
          <div className="text-2xl font-extrabold text-accent mt-1 font-mono tabular-nums">
            {totalPaid.toLocaleString()} <span className="text-sm font-semibold">FCFA</span>
          </div>
        </div>
        <div className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-5">
          <div className="text-xs font-medium text-[#a09888]">Cotisations confirmées</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 tabular-nums">
            {paidList.length}
          </div>
        </div>
        <div className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-5">
          <div className="text-xs font-medium text-[#a09888]">En attente de validation</div>
          <div className="text-2xl font-extrabold text-accent mt-1 tabular-nums">
            {awaitingList.length}
            {unpaidCount > 0 && (
              <span className="text-xs font-normal text-[#a09888] ml-2">
                · {unpaidCount} à régler
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Official Payment Channel */}
      <section
        className="bg-[#1a1d2e] border border-accent/28 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        aria-label="Canal unique de versement des cotisations"
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-accent-light/15 text-accent-light flex items-center justify-center shrink-0">
            <Smartphone size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-accent">
              Canal unique de perception · {COTISATION_PAYMENT_CHANNEL.provider}
            </h2>
            <p className="text-xs text-[#a09888] mt-1">
              Les paiements sont perçus exclusivement sur ce compte. Le statut passe à <strong className="text-white">Payé</strong> uniquement après confirmation de réception par <strong className="text-white">{COTISATION_PAYMENT_CHANNEL.recipientName}</strong>.
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="text-[#a09888]">
                Numéro :{' '}
                <strong className="text-white font-mono tabular-nums">
                  {COTISATION_PAYMENT_CHANNEL.number}
                </strong>
              </span>
              <span aria-hidden="true" className="text-[#605848] hidden sm:inline">·</span>
              <span className="text-[#a09888]">
                Nom : <strong className="text-white">{COTISATION_PAYMENT_CHANNEL.recipientName}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyNumber}
          className="px-4 py-2.5 bg-[#252840] hover:bg-accent text-accent hover:text-accent-contrast border border-accent/30 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Numéro copié' : 'Copier 066679430'}
        </button>
      </section>

      {/* Personal Cotisations History */}
      <section className="bg-[#1a1d2e] border border-accent/16 rounded-3xl p-5 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-bold text-accent flex items-center gap-2">
            <CreditCard size={18} /> Mes cotisations
          </h2>
        </div>

        {cotisations.length === 0 ? (
          <div className="py-8 px-4 text-center bg-[#252840]/40 rounded-2xl border border-accent/12">
            <p className="text-sm font-semibold text-white">
              Aucune cotisation enregistrée pour le moment
            </p>
            <p className="text-xs text-[#a09888] mt-1">
              Déclarez un paiement MTN Mobile Money pour suivre vos contributions ici.
            </p>
            <button
              type="button"
              onClick={onOpenPayModal}
              className="mt-4 px-4 py-2 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Payer une cotisation
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-accent/20 text-accent text-xs">
                    <th className="py-3 px-4 font-semibold">Événement</th>
                    <th className="py-3 px-4 font-semibold text-right">Montant</th>
                    <th className="py-3 px-4 font-semibold">Statut</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-accent/10">
                  {cotisations.map(c => (
                    <tr key={c.id} className="hover:bg-[#252840]/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">{c.event}</td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-right">
                        {c.amount.toLocaleString()} FCFA
                      </td>
                      <td className="py-3.5 px-4">{renderStatus(c)}</td>
                      <td className="py-3.5 px-4 text-[#a09888] font-mono tabular-nums text-xs">{c.date}</td>
                      <td className="py-3.5 px-4 text-right">
                        {c.status === 'pending' || c.status === 'overdue' ? (
                          <button
                            type="button"
                            onClick={() => onPayCotisation(c.id)}
                            className="px-3.5 py-1.5 bg-accent text-accent-contrast font-bold rounded-lg text-xs hover:bg-accent-light cursor-pointer whitespace-nowrap"
                          >
                            Payer
                          </button>
                        ) : c.status === 'awaiting_confirmation' ? (
                          <span className="text-xs text-sky-400 font-medium whitespace-nowrap">
                            Validation requise
                          </span>
                        ) : (
                          <span className="text-[#605848]">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Stack */}
            <div className="md:hidden divide-y divide-accent/12">
              {cotisations.map(c => (
                <div key={c.id} className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-white truncate">{c.event}</div>
                    <div className="text-xs text-[#a09888] mt-1 flex items-center gap-2 font-mono tabular-nums">
                      <span>{c.amount.toLocaleString()} FCFA</span>
                      <span aria-hidden="true">·</span>
                      <span>{c.date}</span>
                    </div>
                    <div className="mt-1">{renderStatus(c)}</div>
                  </div>
                  {(c.status === 'pending' || c.status === 'overdue') && (
                    <button
                      type="button"
                      onClick={() => onPayCotisation(c.id)}
                      className="px-3.5 py-2 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light cursor-pointer shrink-0"
                    >
                      Payer
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Benichou Massengo Confirmation Space */}
      <section
        className="bg-[#1a1d2e] border border-accent/22 rounded-3xl p-5 sm:p-6"
        aria-label="Validation des paiements par Benichou Massengo"
      >
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-bold text-accent flex items-center gap-2">
            <ShieldCheck size={18} /> Validation des paiements · {COTISATION_PAYMENT_CHANNEL.recipientName}
          </h2>
          <p className="text-xs text-[#a09888] mt-0.5">
            Contrôle de réception sur {COTISATION_PAYMENT_CHANNEL.provider} ({COTISATION_PAYMENT_CHANNEL.number}) requis pour passer le contribuable au statut Payé.
          </p>
        </div>

        {awaitingList.length === 0 ? (
          <div className="py-6 px-4 text-center bg-[#252840]/40 rounded-2xl border border-accent/12">
            <p className="text-xs sm:text-sm text-[#a09888]">
              Aucun paiement en attente de confirmation pour le moment.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-accent/12">
            {awaitingList.map(c => (
              <div
                key={c.id}
                className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">
                    {c.contributorName || 'Contribuable'} · {c.event}
                  </div>
                  <div className="text-xs text-[#a09888] mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono tabular-nums">
                    <span className="text-accent-light font-semibold">
                      {c.amount.toLocaleString('fr-FR')} FCFA
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Réf : {c.transactionRef || '—'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{c.date}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenBenichouConfirm(c)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck size={14} /> Confirmer réception
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Event Funds */}
      <section className="bg-[#1a1d2e] border border-accent/16 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-accent">
            Événements en cours
          </h2>
          <button
            type="button"
            onClick={onOpenCreateEvent}
            className="px-3.5 py-2 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus size={14} /> Créer un événement
          </button>
        </div>

        {eventFunds.length === 0 ? (
          <div className="py-8 px-4 text-center bg-[#252840]/40 rounded-2xl border border-accent/12">
            <p className="text-sm font-semibold text-white">Aucun événement en cours</p>
            <p className="text-xs text-[#a09888] mt-1">
              Créez un événement pour suivre les cotisations et objectifs de la communauté.
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
                        <span>Montant total</span>
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

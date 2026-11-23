import React from 'react';
import { Check, HelpCircle, Users, XCircle } from 'lucide-react';
import { EventFund, EventRsvpStatus } from '../types';

interface EventRsvpControlsProps {
  event: EventFund;
  userEmail: string;
  onRsvp: (eventId: number, status: EventRsvpStatus) => void;
  onOpenParticipants: (event: EventFund) => void;
}

export const EventRsvpControls: React.FC<EventRsvpControlsProps> = ({
  event,
  userEmail,
  onRsvp,
  onOpenParticipants,
}) => {
  const rsvps = event.rsvps || [];
  const normalizedEmail = userEmail.trim().toLowerCase();
  const userRsvp = rsvps.find(r => r.alumnusEmail.toLowerCase() === normalizedEmail);

  const goingCount = rsvps.filter(r => r.status === 'going').length;
  const maybeCount = rsvps.filter(r => r.status === 'maybe').length;
  const notGoingCount = rsvps.filter(r => r.status === 'not_going').length;

  return (
    <div className="pt-2.5 border-t border-accent/14 space-y-2.5">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="text-[#a09888] font-semibold">Confirmation de présence (RSVP)</span>
        <button
          type="button"
          onClick={() => onOpenParticipants(event)}
          className="text-accent hover:underline font-semibold flex items-center gap-1 cursor-pointer tabular-nums whitespace-nowrap"
        >
          <Users size={12} /> {goingCount} part. · {maybeCount} peut-être
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => onRsvp(event.id, 'going')}
          aria-pressed={userRsvp?.status === 'going'}
          className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
            userRsvp?.status === 'going'
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
              : 'bg-[#1a1d2e]/70 border-accent/15 text-[#a09888] hover:text-white hover:border-emerald-400/40'
          }`}
        >
          <Check size={12} /> Je participe
        </button>

        <button
          type="button"
          onClick={() => onRsvp(event.id, 'maybe')}
          aria-pressed={userRsvp?.status === 'maybe'}
          className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
            userRsvp?.status === 'maybe'
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-[#1a1d2e]/70 border-accent/15 text-[#a09888] hover:text-white hover:border-amber-400/40'
          }`}
        >
          <HelpCircle size={12} /> Peut-être
        </button>

        <button
          type="button"
          onClick={() => onRsvp(event.id, 'not_going')}
          aria-pressed={userRsvp?.status === 'not_going'}
          className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
            userRsvp?.status === 'not_going'
              ? 'bg-red-500/20 border-red-400 text-red-300'
              : 'bg-[#1a1d2e]/70 border-accent/15 text-[#a09888] hover:text-white hover:border-red-400/40'
          }`}
        >
          <XCircle size={12} /> Absent
        </button>
      </div>

      {rsvps.length > 0 && (
        <button
          type="button"
          onClick={() => onOpenParticipants(event)}
          className="w-full text-left text-[11px] text-[#a09888] hover:text-accent transition-colors cursor-pointer flex items-center justify-between"
        >
          <span className="truncate">
            Inscrits : {goingCount} oui · {maybeCount} peut-être · {notGoingCount} absent{notGoingCount > 1 ? 's' : ''}
          </span>
          <span className="text-accent font-semibold shrink-0 ml-2">Voir la liste →</span>
        </button>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
  Unlock,
  Vote,
  X,
} from 'lucide-react';
import { Poll, UserProfile } from '../types';
import { AvatarDisplay } from './AvatarDisplay';

interface PollsPageProps {
  user: UserProfile;
  polls: Poll[];
  onCreatePoll: (data: {
    question: string;
    description?: string;
    optionLabels: string[];
    allowMultiple: boolean;
    deadline?: string;
  }) => void;
  onVotePoll: (pollId: number, optionId: string) => void;
  onToggleClosePoll: (pollId: number) => void;
  onDeletePoll: (pollId: number) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

type PollFilter = 'all' | 'open' | 'closed';

export const PollsPage: React.FC<PollsPageProps> = ({
  user,
  polls,
  onCreatePoll,
  onVotePoll,
  onToggleClosePoll,
  onDeletePoll,
  onShowToast,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [optionInputs, setOptionInputs] = useState<string[]>(['', '']);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [filter, setFilter] = useState<PollFilter>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const userEmail = user.email.trim().toLowerCase();

  const visiblePolls = polls.filter(p => {
    if (filter === 'open') return !p.closed;
    if (filter === 'closed') return Boolean(p.closed);
    return true;
  });

  const handleAddOptionField = () => {
    if (optionInputs.length >= 6) return;
    setOptionInputs(prev => [...prev, '']);
  };

  const handleRemoveOptionField = (index: number) => {
    if (optionInputs.length <= 2) return;
    setOptionInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    setOptionInputs(prev => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuestion = question.trim();
    const cleanedOptions = optionInputs.map(o => o.trim()).filter(Boolean);

    if (!trimmedQuestion) {
      onShowToast('Veuillez saisir la question du sondage', 'error');
      return;
    }
    if (cleanedOptions.length < 2) {
      onShowToast('Ajoutez au moins 2 choix de réponse', 'error');
      return;
    }

    onCreatePoll({
      question: trimmedQuestion,
      description: description.trim() || undefined,
      optionLabels: cleanedOptions,
      allowMultiple,
      deadline: deadline.trim() || undefined,
    });

    setQuestion('');
    setDescription('');
    setOptionInputs(['', '']);
    setAllowMultiple(false);
    setDeadline('');
    setShowCreateForm(false);
  };

  const openCount = polls.filter(p => !p.closed).length;
  const totalVotesCast = polls.reduce(
    (sum, p) => sum + p.options.reduce((s, o) => s + o.voterEmails.length, 0),
    0
  );

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-accent">Sondages &amp; Votes</h1>
          <p className="text-xs text-[#a09888] mt-0.5 tabular-nums">
            {openCount} sondage{openCount > 1 ? 's' : ''} actif{openCount > 1 ? 's' : ''} · {totalVotesCast} vote{totalVotesCast > 1 ? 's' : ''} exprimé{totalVotesCast > 1 ? 's' : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(prev => !prev)}
          className="px-4 py-2.5 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
        >
          {showCreateForm ? <X size={15} /> : <Plus size={15} />}
          {showCreateForm ? 'Fermer' : 'Nouveau sondage'}
        </button>
      </div>

      {/* Create Poll Form */}
      {showCreateForm && (
        <form
          onSubmit={handleSubmitCreate}
          className="bg-[#1a1d2e] border border-accent/28 rounded-3xl p-5 sm:p-6 space-y-4 animate-fadeIn"
        >
          <h2 className="text-base sm:text-lg font-bold text-accent flex items-center gap-2">
            <Vote size={18} /> Créer un sondage communautaire
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Question du sondage <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ex: Où souhaitez-vous organiser la prochaine rencontre annuelle ?"
              className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm placeholder-[#706858] focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a09888] mb-1">
              Précisions / contexte (optionnel)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Détails sur les modalités ou dates envisagées..."
              className="w-full px-3.5 py-2 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm placeholder-[#706858] focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#a09888]">
                Choix proposés (2 à 6) <span className="text-red-400">*</span>
              </label>
              {optionInputs.length < 6 && (
                <button
                  type="button"
                  onClick={handleAddOptionField}
                  className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={13} /> Ajouter une option
                </button>
              )}
            </div>

            <div className="space-y-2">
              {optionInputs.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${idx + 1} (ex: ${idx === 0 ? 'Dakar' : idx === 1 ? 'Paris' : 'Abidjan'})`}
                    className="flex-1 px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-sm placeholder-[#706858] focus:outline-none focus:border-accent"
                  />
                  {optionInputs.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionField(idx)}
                      aria-label={`Supprimer l'option ${idx + 1}`}
                      className="w-9 h-9 rounded-xl bg-[#252840] text-[#a09888] hover:text-red-400 flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#252840]/60 border border-accent/15 cursor-pointer text-xs text-[#e8e0d0]">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={e => setAllowMultiple(e.target.checked)}
                className="rounded border-accent/30 bg-[#1a1d2e] accent-accent"
              />
              <span>Autoriser plusieurs choix par membre</span>
            </label>

            <div>
              <input
                type="text"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                placeholder="Clôture (optionnel, ex: 30 Juin 2026)"
                className="w-full px-3.5 py-2.5 bg-[#252840] border border-accent/18 rounded-xl text-white text-xs placeholder-[#706858] focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2.5 bg-[#252840] text-white font-semibold rounded-xl text-xs hover:bg-[#2d3050] cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl text-xs hover:shadow-lg cursor-pointer"
            >
              Publier le sondage
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-[#1a1d2e] p-1 rounded-xl border border-accent/16 w-fit overflow-x-auto">
        {(
          [
            { id: 'all', label: `Tous (${polls.length})` },
            { id: 'open', label: `Ouverts (${openCount})` },
            { id: 'closed', label: `Clôturés (${polls.length - openCount})` },
          ] as { id: PollFilter; label: string }[]
        ).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
              filter === tab.id ? 'bg-accent text-accent-contrast' : 'text-[#a09888] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Polls List */}
      {visiblePolls.length === 0 ? (
        <div className="bg-[#1a1d2e] border border-accent/16 rounded-3xl p-10 text-center">
          <BarChart3 size={30} className="mx-auto text-accent/70 mb-2.5" />
          <p className="text-sm font-bold text-white">
            {polls.length === 0
              ? 'Aucun sondage lancé pour le moment'
              : 'Aucun sondage dans cette catégorie'}
          </p>
          <p className="text-xs text-[#a09888] mt-1 max-w-md mx-auto">
            Lancez une consultation pour recueillir l&apos;avis des anciens en direct (lieu de rencontre, thème du gala, projets solidaires).
          </p>
          {polls.length === 0 && (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 bg-accent text-accent-contrast font-bold rounded-xl text-xs hover:bg-accent-light transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Créer le premier sondage
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visiblePolls.map(poll => {
            const totalVotes = poll.options.reduce((s, o) => s + o.voterEmails.length, 0);
            const uniqueVoterSet = new Set<string>();
            poll.options.forEach(o => o.voterEmails.forEach(e => uniqueVoterSet.add(e)));
            const isCreator = poll.createdByEmail.toLowerCase() === userEmail;
            const hasUserVoted = poll.options.some(o => o.voterEmails.includes(userEmail));

            return (
              <article
                key={poll.id}
                className="bg-[#1a1d2e] border border-accent/16 rounded-3xl p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#252840] flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      <AvatarDisplay avatar={poll.createdByAvatar} alt={poll.createdBy} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {poll.question}
                      </h2>
                      <div className="text-xs text-[#a09888] mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 tabular-nums">
                        <span>Par <strong className="text-[#e8e0d0]">{poll.createdBy}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>{poll.createdAt}</span>
                        {poll.deadline && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Clôture : {poll.deadline}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className={poll.closed ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                          {poll.closed ? 'Clôturé' : 'Ouvert'}
                        </span>
                        {poll.allowMultiple && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-accent">Choix multiple</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isCreator && (
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                      <button
                        type="button"
                        onClick={() => onToggleClosePoll(poll.id)}
                        title={poll.closed ? 'Rouvrir le sondage' : 'Clôturer le sondage'}
                        className="px-2.5 py-1.5 rounded-lg bg-[#252840] text-xs font-semibold text-[#e8e0d0] hover:text-accent transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                      >
                        {poll.closed ? <Unlock size={13} /> : <Lock size={13} />}
                        {poll.closed ? 'Rouvrir' : 'Clôturer'}
                      </button>

                      {confirmDeleteId === poll.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteId(null);
                              onDeletePoll(poll.id);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                          >
                            Confirmer
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1.5 rounded-lg bg-[#252840] text-xs text-[#a09888] cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(poll.id)}
                          aria-label="Supprimer le sondage"
                          title="Supprimer le sondage"
                          className="w-8 h-8 rounded-lg bg-[#252840] text-[#a09888] hover:text-red-400 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {poll.description && (
                  <p className="text-xs sm:text-sm text-[#a09888] leading-relaxed">
                    {poll.description}
                  </p>
                )}

                {/* Options with Live Percentage Bars */}
                <div className="space-y-2.5">
                  {poll.options.map(opt => {
                    const voteCount = opt.voterEmails.length;
                    const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                    const isSelected = opt.voterEmails.includes(userEmail);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={Boolean(poll.closed)}
                        onClick={() => onVotePoll(poll.id, opt.id)}
                        className={`w-full text-left relative rounded-2xl border overflow-hidden transition-colors ${
                          poll.closed ? 'cursor-default' : 'cursor-pointer'
                        } ${
                          isSelected
                            ? 'border-accent bg-[#252840]/90'
                            : 'border-accent/16 bg-[#252840]/45 hover:border-accent/45'
                        }`}
                      >
                        <div
                          className={`absolute inset-y-0 left-0 transition-all duration-300 ${
                            isSelected ? 'bg-accent/22' : 'bg-accent/10'
                          }`}
                          style={{ width: `${pct}%` }}
                          aria-hidden="true"
                        />
                        <div className="relative px-4 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-accent bg-accent text-accent-contrast'
                                  : 'border-[#706858]'
                              }`}
                            >
                              {isSelected && <CheckCircle2 size={11} />}
                            </span>
                            <span className="text-sm font-semibold text-white truncate">
                              {opt.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 font-mono tabular-nums">
                            <span className="text-xs text-[#a09888]">
                              {voteCount} vote{voteCount > 1 ? 's' : ''}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-accent min-w-[3ch] text-right">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-accent/12 text-xs text-[#a09888] tabular-nums">
                  <span>
                    {uniqueVoterSet.size} participant{uniqueVoterSet.size > 1 ? 's' : ''} · {totalVotes} vote{totalVotes > 1 ? 's' : ''} au total
                  </span>
                  <span>
                    {poll.closed
                      ? 'Scrutin clôturé'
                      : hasUserVoted
                      ? 'Votre vote est enregistré (cliquez pour modifier)'
                      : 'Cliquez sur une option pour voter en direct'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

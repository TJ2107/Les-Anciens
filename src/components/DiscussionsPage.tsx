import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  ChevronDown,
  ImageOff,
  ImagePlus,
  Pencil,
  Plus,
  Send,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Conversation } from '../types';
import { AvatarDisplay } from './AvatarDisplay';

const MAX_PHOTO_BYTES = 1024 * 1024; // 1 Mo

interface DiscussionsPageProps {
  conversations: Conversation[];
  activeChatId: number;
  onSelectChat: (chatId: number) => void;
  onSendMessage: (chatId: number, text: string, image?: string) => void;
  onEditMessage: (chatId: number, messageIndex: number, newText: string) => void;
  onDeleteMessage: (chatId: number, messageIndex: number) => void;
  onDeleteMessageImage: (chatId: number, messageIndex: number) => void;
  onOpenCreateSalon: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface PendingPhoto {
  dataUrl: string;
  name: string;
  sizeKb: number;
}

interface PreviewImageState {
  url: string;
  messageIndex: number;
  canDeleteImage: boolean;
}

export const DiscussionsPage: React.FC<DiscussionsPageProps> = ({
  conversations,
  activeChatId,
  onSelectChat,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onDeleteMessageImage,
  onOpenCreateSalon,
  onShowToast,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [pendingPhoto, setPendingPhoto] = useState<PendingPhoto | null>(null);
  const [previewImage, setPreviewImage] = useState<PreviewImageState | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];

  useEffect(() => {
    setEditingIndex(null);
    setEditingText('');
    setConfirmDeleteIndex(null);
    setPreviewImage(null);
  }, [activeChatId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setPreviewImage(null);
        setEditingIndex(null);
        setConfirmDeleteIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    if (editingIndex === null) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.id, activeChat?.messages.length, editingIndex]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Veuillez sélectionner une image valide (JPG, PNG, WebP)', 'error');
      return;
    }

    if (file.size >= MAX_PHOTO_BYTES) {
      const sizeMb = (file.size / MAX_PHOTO_BYTES).toFixed(2);
      onShowToast(
        `Photo trop volumineuse (${sizeMb} Mo). Taille maximale : moins de 1 Mo.`,
        'error'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPendingPhoto({
          dataUrl: reader.result,
          name: file.name,
          sizeKb: Math.max(1, Math.round(file.size / 1024)),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    const trimmed = chatInput.trim();
    if ((!trimmed && !pendingPhoto) || !activeChat) return;
    onSendMessage(activeChat.id, trimmed, pendingPhoto?.dataUrl);
    setChatInput('');
    setPendingPhoto(null);
  };

  const handleStartEdit = (index: number, currentText: string) => {
    setConfirmDeleteIndex(null);
    setEditingIndex(index);
    setEditingText(currentText);
  };

  const handleSaveEdit = (index: number, hasImage: boolean) => {
    if (!activeChat) return;
    const trimmed = editingText.trim();
    if (!trimmed && !hasImage) {
      onShowToast('Le message ne peut pas être vide', 'error');
      return;
    }
    onEditMessage(activeChat.id, index, trimmed);
    setEditingIndex(null);
    setEditingText('');
  };

  return (
    <div className="animate-fadeIn w-full">
      {/* Lightbox preview for shared chat photos */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de la photo partagée"
        >
          <div className="relative max-w-3xl max-h-[88dvh]" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              aria-label="Fermer l'aperçu"
              className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-[#1a1d2e] border border-accent/30 text-white flex items-center justify-center hover:bg-accent hover:text-accent-contrast transition-colors cursor-pointer shadow-lg"
            >
              <X size={16} />
            </button>
            <img
              src={previewImage.url}
              alt="Photo partagée dans la discussion"
              referrerPolicy="no-referrer"
              className="max-h-[78dvh] max-w-full rounded-2xl object-contain border border-accent/20 shadow-2xl"
            />
            {previewImage.canDeleteImage && activeChat && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteMessageImage(activeChat.id, previewImage.messageIndex);
                    setPreviewImage(null);
                  }}
                  className="px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
                >
                  <ImageOff size={14} /> Supprimer l&apos;image
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wide WhatsApp-Style Chat Viewport */}
      <div className="bg-[#0b141a] border border-accent/20 rounded-3xl flex flex-col h-[calc(100dvh-10rem)] min-h-[500px] max-h-[840px] overflow-hidden shadow-2xl">
        {/* Compact Single-Row Messaging Header */}
        <div className="px-3 sm:px-5 py-2 bg-[#1f2c34] border-b border-[#222d34] flex items-center justify-between gap-2.5">
          {/* Unified Salon Dropdown Trigger */}
          <div className="relative min-w-0 flex-1 max-w-md" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
              className="w-full px-2.5 py-1.5 bg-[#2a3942]/75 hover:bg-[#2a3942] border border-[#374a56]/70 rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-full bg-[#1f2c34] flex items-center justify-center text-base shrink-0 overflow-hidden">
                  <AvatarDisplay avatar={activeChat?.avatar} alt={activeChat?.name} fallback="💬" />
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[#e9edef] truncate leading-tight">
                    {activeChat?.name || 'Discussion générale'}
                  </div>
                  <div className="text-[11px] text-[#8696a0] flex items-center gap-1.5 truncate tabular-nums leading-tight mt-0.5">
                    {activeChat?.isGeneral ? (
                      <span className="truncate">Discussion générale</span>
                    ) : (
                      <span className="flex items-center gap-1 truncate">
                        <Users size={10} className="shrink-0" />
                        <span className="truncate">
                          {activeChat?.members && activeChat.members.length > 0
                            ? activeChat.members.join(', ')
                            : 'Salon privé'}
                        </span>
                      </span>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="shrink-0">{activeChat?.messages.length || 0} msg</span>
                  </div>
                </div>
              </div>
              <ChevronDown
                size={15}
                className={`text-accent shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="listbox"
                className="absolute left-0 mt-1.5 w-full min-w-[260px] sm:w-80 bg-[#1a1d2e] border border-accent/30 rounded-2xl shadow-2xl z-30 overflow-hidden animate-fadeIn"
              >
                <div className="px-3.5 py-2 text-[11px] font-semibold text-[#a09888] border-b border-accent/12">
                  Salons disponibles
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-accent/8">
                  {conversations.map(c => {
                    const isSelected = c.id === activeChat?.id;
                    const unread = c.unreadCount || 0;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onSelectChat(c.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors cursor-pointer ${
                          isSelected ? 'bg-accent/15 text-white' : 'text-[#e8e0d0] hover:bg-[#252840]'
                        }`}
                      >
                        <span className="w-8 h-8 rounded-full bg-[#252840] flex items-center justify-center text-base shrink-0 overflow-hidden relative">
                          <AvatarDisplay avatar={c.avatar} alt={c.name} fallback="💬" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate flex items-center gap-1.5">
                            <span className="truncate">{c.name}</span>
                            {c.isGeneral && (
                              <span className="text-[10px] font-medium text-accent">· Public</span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#a09888] truncate tabular-nums">
                            {c.messages.length} message{c.messages.length > 1 ? 's' : ''}
                            {c.members && c.members.length > 0 ? ` · ${c.members.length} invité(s)` : ''}
                          </div>
                        </div>
                        {unread > 0 && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-[11px] font-bold rounded-full tabular-nums shrink-0">
                            {unread}
                          </span>
                        )}
                        {isSelected && unread === 0 && <Check size={16} className="text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 bg-[#141724] border-t border-accent/18">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenCreateSalon();
                    }}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl text-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={15} /> Créer un nouveau salon
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenCreateSalon}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2a3942] hover:bg-[#374a56] text-[#e9edef] text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus size={14} /> <span className="hidden sm:inline">Nouveau salon</span>
            <span className="sm:hidden">Salon</span>
          </button>
        </div>

        {/* Wide WhatsApp Messages Area */}
        <div className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-4 space-y-3 bg-[radial-gradient(#142028_1px,transparent_1px)] bg-[size:18px_18px]">
          {activeChat?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <p className="text-sm font-semibold text-[#e9edef]">Aucun message dans ce salon</p>
              <p className="text-xs text-[#8696a0] mt-1">
                Envoyez un premier message ou partagez une photo pour lancer la discussion.
              </p>
            </div>
          ) : (
            activeChat?.messages.map((m, i) => {
              const isEditing = editingIndex === i;
              const isConfirmingDelete = confirmDeleteIndex === i;

              return (
                <div
                  key={m.id ?? i}
                  className={`group flex gap-2 max-w-[92%] sm:max-w-[78%] lg:max-w-[68%] ${
                    m.sent ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#2a3942] flex items-center justify-center text-xs shrink-0 text-white self-end mb-5 overflow-hidden">
                    <AvatarDisplay avatar={m.avatar} alt={m.sender} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                        m.sent
                          ? 'bg-[#005c4b] text-[#e9edef] rounded-br-xs'
                          : 'bg-[#202c33] text-[#e9edef] rounded-bl-xs border border-[#2a3942]'
                      }`}
                    >
                      {!m.sent && (
                        <div className="text-[11px] font-bold text-[#53bdeb] mb-1">{m.sender}</div>
                      )}

                      {m.image && (
                        <div className="relative mb-1.5 inline-block max-w-full">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImage({
                                url: m.image || '',
                                messageIndex: i,
                                canDeleteImage: m.sent,
                              })
                            }
                            className="block rounded-xl overflow-hidden cursor-pointer focus:outline-none"
                          >
                            <img
                              src={m.image}
                              alt={`Photo partagée par ${m.sender}`}
                              referrerPolicy="no-referrer"
                              className="max-h-64 w-auto max-w-full rounded-xl object-cover"
                            />
                          </button>
                          {m.sent && !isEditing && (
                            <button
                              type="button"
                              onClick={() => onDeleteMessageImage(activeChat.id, i)}
                              title="Supprimer l'image"
                              aria-label="Supprimer l'image du message"
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                            >
                              <ImageOff size={13} />
                            </button>
                          )}
                        </div>
                      )}

                      {isEditing ? (
                        <div className="space-y-2 min-w-[210px] sm:min-w-[260px]">
                          <textarea
                            rows={2}
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEdit(i, Boolean(m.image));
                              } else if (e.key === 'Escape') {
                                setEditingIndex(null);
                              }
                            }}
                            autoFocus
                            className="w-full px-2.5 py-1.5 bg-[#0b141a]/75 border border-[#00a884]/60 rounded-xl text-sm text-white focus:outline-none focus:border-[#00a884] resize-none"
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingIndex(null)}
                              className="px-2.5 py-1 rounded-lg bg-black/25 hover:bg-black/40 text-xs font-medium text-[#e9edef] cursor-pointer"
                            >
                              Annuler
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(i, Boolean(m.image))}
                              className="px-2.5 py-1 rounded-lg bg-[#00a884] hover:bg-[#008f72] text-xs font-bold text-white cursor-pointer flex items-center gap-1"
                            >
                              <Check size={12} /> Enregistrer
                            </button>
                          </div>
                        </div>
                      ) : (
                        m.text && <div>{m.text}</div>
                      )}
                    </div>

                    <div
                      className={`mt-1 px-1 flex items-center gap-2 text-[10px] text-[#8696a0] tabular-nums ${
                        m.sent ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>
                        {m.time}
                        {m.edited ? ' · modifié' : ''}
                      </span>

                      {m.sent && !isEditing && (
                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          {isConfirmingDelete ? (
                            <span className="inline-flex items-center gap-1 text-[11px]">
                              <span className="text-red-300">Supprimer ?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteMessage(activeChat.id, i);
                                  setConfirmDeleteIndex(null);
                                }}
                                className="px-1.5 py-0.5 rounded bg-red-500 text-white font-semibold hover:bg-red-600 cursor-pointer"
                              >
                                Oui
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteIndex(null)}
                                className="px-1.5 py-0.5 rounded bg-[#2a3942] text-[#e9edef] hover:bg-[#374a56] cursor-pointer"
                              >
                                Non
                              </button>
                            </span>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleStartEdit(i, m.text)}
                                title="Modifier le message"
                                aria-label="Modifier le message"
                                className="p-1 rounded hover:bg-[#2a3942] text-[#a0aab0] hover:text-accent transition-colors cursor-pointer"
                              >
                                <Pencil size={12} />
                              </button>
                              {m.image && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteMessageImage(activeChat.id, i)}
                                  title="Supprimer l'image"
                                  aria-label="Supprimer l'image"
                                  className="p-1 rounded hover:bg-[#2a3942] text-[#a0aab0] hover:text-amber-300 transition-colors cursor-pointer"
                                >
                                  <ImageOff size={12} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingIndex(null);
                                  setConfirmDeleteIndex(i);
                                }}
                                title="Supprimer le message"
                                aria-label="Supprimer le message"
                                className="p-1 rounded hover:bg-[#2a3942] text-[#a0aab0] hover:text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Photo Strip (< 1 Mo) */}
        {pendingPhoto && (
          <div className="px-3 sm:px-5 py-2 bg-[#1a242b] border-t border-[#2a3942] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={pendingPhoto.dataUrl}
                alt={pendingPhoto.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-lg object-cover border border-[#374a56] shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[#e9edef] truncate">
                  {pendingPhoto.name}
                </div>
                <div className="text-[11px] text-[#00a884] tabular-nums">
                  {pendingPhoto.sizeKb} Ko · Prête à envoyer (&lt; 1 Mo)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPendingPhoto(null)}
              aria-label="Retirer la photo"
              className="w-8 h-8 rounded-full bg-[#2a3942] hover:bg-[#374a56] text-[#e9edef] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* WhatsApp Input Footer */}
        <div className="p-2.5 sm:p-3.5 bg-[#202c33] border-t border-[#2a3942] flex items-center gap-2 sm:gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Partager une photo (< 1 Mo)"
            aria-label="Partager une photo de moins de 1 Mo"
            className="w-10 h-10 rounded-full bg-[#2a3942] hover:bg-[#374a56] text-accent flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <ImagePlus size={18} />
          </button>

          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={
              pendingPhoto
                ? 'Ajouter une légende à la photo...'
                : 'Tapez un message ou partagez une photo (< 1 Mo)...'
            }
            className="flex-1 min-w-0 px-4 py-2.5 bg-[#2a3942] border border-transparent rounded-full text-[#e9edef] placeholder-[#8696a0] text-sm focus:outline-none focus:border-[#00a884]"
          />
          <button
            type="button"
            onClick={handleSend}
            aria-label="Envoyer le message"
            className="w-10 h-10 sm:w-11 sm:h-11 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow shrink-0"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

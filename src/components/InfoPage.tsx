import React, { useState } from 'react';
import { Camera, Heart, MessageSquare, Share2, X } from 'lucide-react';
import { Post, PostType, UserProfile } from '../types';
import { AvatarDisplay } from './AvatarDisplay';

interface InfoPageProps {
  user: UserProfile;
  posts: Post[];
  onPublishPost: (text: string, type: PostType, media?: string, mediaKind?: 'image' | 'video') => void;
  onLikePost: (postId: number) => void;
  onToggleComments: (postId: number) => void;
  onAddComment: (postId: number, text: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const POST_TYPES: { id: PostType; label: string }[] = [
  { id: 'info', label: '📢 Information' },
  { id: 'promotion', label: '🎓 Promotion' },
  { id: 'naissance', label: '👶 Naissance' },
  { id: 'deces', label: '🕊️ Décès' },
  { id: 'evenement', label: '🎉 Événement' },
  { id: 'emploi', label: '💼 Emploi' },
];

const FEED_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'info', label: 'Infos' },
  { id: 'promotion', label: 'Promos' },
  { id: 'naissance', label: 'Naissances' },
  { id: 'deces', label: 'Décès' },
  { id: 'evenement', label: 'Événements' },
  { id: 'emploi', label: 'Emplois' },
];

const TYPE_LABEL_MAP: Record<PostType, string> = {
  info: 'Information',
  promotion: 'Promotion',
  naissance: 'Naissance',
  deces: 'Décès',
  evenement: 'Événement',
  emploi: 'Emploi',
};

export const InfoPage: React.FC<InfoPageProps> = ({
  user,
  posts,
  onPublishPost,
  onLikePost,
  onToggleComments,
  onAddComment,
  onShowToast,
}) => {
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState<PostType>('info');
  const [postMedia, setPostMedia] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<'image' | 'video'>('image');
  const [feedFilter, setFeedFilter] = useState<string>('all');
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});

  const filteredPosts = posts.filter(p => feedFilter === 'all' || p.type === feedFilter);

  const handlePublish = () => {
    if (!postText.trim() && !postMedia) {
      onShowToast('Écrivez un message ou ajoutez un média', 'error');
      return;
    }
    onPublishPost(postText.trim() || '(Média partagé)', postType, postMedia || undefined, mediaKind);
    setPostText('');
    setPostMedia(null);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaKind(file.type.startsWith('video') ? 'video' : 'image');
    const reader = new FileReader();
    reader.onload = ev => setPostMedia(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const submitComment = (postId: number) => {
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentDrafts(prev => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      <h1 className="text-2xl font-extrabold text-accent">Informations & Actualités</h1>

      {/* Post Creator */}
      <section className="bg-[#1a1d2e] border border-accent/20 rounded-3xl p-5 sm:p-6">
        <div className="flex gap-3 sm:gap-4 items-start">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-[#9b59b6] flex items-center justify-center text-xl shrink-0 overflow-hidden">
            <AvatarDisplay avatar={user.avatar} alt={user.name} />
          </div>
          <textarea
            value={postText}
            onChange={e => setPostText(e.target.value)}
            placeholder="Partagez une information, une annonce, un événement..."
            rows={3}
            className="w-full bg-[#252840] border border-accent/16 rounded-2xl p-3.5 text-white placeholder-[#706858] focus:outline-none focus:border-accent text-sm resize-y"
          />
        </div>

        <div className="flex gap-2 flex-wrap mt-3">
          {POST_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPostType(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                postType === t.id
                  ? 'bg-accent text-accent-contrast border-accent'
                  : 'border-accent/20 text-[#a09888] hover:text-white hover:bg-[#252840]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {postMedia && (
          <div className="mt-4 relative rounded-2xl overflow-hidden max-h-56 bg-[#252840]">
            {mediaKind === 'video' ? (
              <video src={postMedia} controls className="w-full max-h-56 object-cover" />
            ) : (
              <img src={postMedia} alt="Aperçu du média" className="w-full max-h-56 object-cover" />
            )}
            <button
              type="button"
              onClick={() => setPostMedia(null)}
              aria-label="Retirer le média"
              className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full text-white hover:bg-black cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-accent/15 gap-3">
          <input
            type="file"
            id="mediaUpload"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleMediaChange}
          />
          <button
            type="button"
            onClick={() => document.getElementById('mediaUpload')?.click()}
            className="px-3.5 py-2 border border-accent/30 text-accent rounded-xl text-xs font-semibold hover:bg-accent/10 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
          >
            <Camera size={14} /> Photo / Vidéo
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="px-6 py-2 bg-gradient-to-r from-accent to-accent-light text-accent-contrast font-bold rounded-xl text-sm hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
          >
            Publier
          </button>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="flex items-center gap-1.5 bg-[#1a1d2e] p-1 rounded-xl border border-accent/16 overflow-x-auto">
        {FEED_FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFeedFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              feedFilter === f.id ? 'bg-accent text-accent-contrast' : 'text-[#a09888] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map(p => (
            <article
              key={p.id}
              className="bg-[#1a1d2e] border border-accent/16 rounded-3xl p-5 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-11 h-11 rounded-full bg-[#252840] flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  <AvatarDisplay avatar={p.avatar} alt={p.author} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate">{p.author}</div>
                  <div className="text-xs text-[#a09888] flex items-center gap-1.5">
                    <span className="text-accent font-medium">{TYPE_LABEL_MAP[p.type]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{p.time}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-[#e8e0d0] leading-relaxed mb-4">{p.text}</p>

              {p.media && (
                <div className="rounded-2xl overflow-hidden mb-4 max-h-80 bg-[#252840]">
                  {p.mediaKind === 'video' || p.media.startsWith('data:video') ? (
                    <video src={p.media} controls className="w-full max-h-80 object-cover" />
                  ) : (
                    <img src={p.media} alt="Média publié" className="w-full max-h-80 object-cover" />
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-3 border-t border-accent/14">
                <button
                  type="button"
                  onClick={() => onLikePost(p.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer tabular-nums ${
                    p.liked ? 'text-red-400 bg-red-500/10' : 'text-[#a09888] hover:bg-[#252840]'
                  }`}
                >
                  <Heart size={15} fill={p.liked ? 'currentColor' : 'none'} /> {p.likes}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleComments(p.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-[#a09888] hover:bg-[#252840] transition-colors cursor-pointer tabular-nums"
                >
                  <MessageSquare size={15} /> {p.comments.length} commentaire{p.comments.length > 1 ? 's' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Lien de la publication copié', 'success')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-[#a09888] hover:bg-[#252840] transition-colors cursor-pointer ml-auto"
                >
                  <Share2 size={15} /> Partager
                </button>
              </div>

              {p.showComments && (
                <div className="mt-4 pt-4 border-t border-accent/14 space-y-3">
                  {p.comments.map((c, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <div className="w-8 h-8 rounded-full bg-[#252840] flex items-center justify-center text-xs shrink-0 overflow-hidden">
                        <AvatarDisplay avatar={c.avatar} alt={c.author} />
                      </div>
                      <div className="flex-1 bg-[#252840]/60 px-3.5 py-2.5 rounded-2xl">
                        <div className="font-bold text-xs text-accent">{c.author}</div>
                        <div className="text-xs text-[#e8e0d0] mt-0.5">{c.text}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={commentDrafts[p.id] || ''}
                      onChange={e => setCommentDrafts(prev => ({ ...prev, [p.id]: e.target.value }))}
                      onKeyDown={e => {
                        if (e.key === 'Enter') submitComment(p.id);
                      }}
                      placeholder="Ajouter un commentaire..."
                      className="flex-1 px-3.5 py-2 bg-[#252840] border border-accent/16 rounded-xl text-white text-xs focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => submitComment(p.id)}
                      className="px-4 py-2 bg-accent text-accent-contrast font-bold rounded-xl text-xs cursor-pointer hover:bg-accent-light whitespace-nowrap"
                    >
                      Envoyer
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-10 text-center text-sm text-[#a09888]">
          {posts.length === 0
            ? 'Aucune publication pour le moment. Soyez le premier à partager une nouvelle !'
            : 'Aucune publication dans cette catégorie.'}
        </div>
      )}
    </div>
  );
};

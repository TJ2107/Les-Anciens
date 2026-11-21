/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  buildInitialNotifications,
  COTISATION_PAYMENT_CHANNEL,
  EVENT_FUNDS,
  INITIAL_ALUMNI,
  INITIAL_CONVERSATIONS,
  INITIAL_COTISATIONS,
  INITIAL_GALLERY_PHOTOS,
  INITIAL_POSTS,
} from './data/demoData';
import {
  Alumnus,
  AppNotification,
  AppSettings,
  Conversation,
  Cotisation,
  EventFund,
  GalleryCategory,
  GalleryPhoto,
  PageId,
  Post,
  PostType,
  ToastItem,
  UserProfile,
} from './types';
import { applyThemeToDocument, DEFAULT_APP_SETTINGS } from './utils/appTheme';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { Modal } from './components/Modal';
import { DashboardPage } from './components/DashboardPage';
import { AlumniPage } from './components/AlumniPage';
import { InfoPage } from './components/InfoPage';
import { CotisationsPage } from './components/CotisationsPage';
import { DiscussionsPage } from './components/DiscussionsPage';
import { ProfilePage } from './components/ProfilePage';
import { SettingsPage } from './components/SettingsPage';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import {
  AddGalleryPhotoModalBody,
  AlumnusModalBody,
  BenichouConfirmModalBody,
  ConfirmDeleteAlumnusModalBody,
  ConfirmDeleteEventModalBody,
  ConfirmDeleteGalleryModalBody,
  ConfirmDeleteModalBody,
  CreateSalonModalBody,
  EditGalleryPhotoModalBody,
  EventFormModalBody,
  GalleryPhotoModalBody,
  NotificationsModalBody,
  PayModalBody,
} from './components/AppModals';

type ActiveModalState =
  | { type: 'alumnus'; alumnus: Alumnus }
  | { type: 'confirmDeleteAlumnus'; alumnus: Alumnus }
  | { type: 'notifications' }
  | { type: 'pay'; prefillCotisation?: Cotisation | null }
  | { type: 'benichouConfirm'; cotisation: Cotisation }
  | { type: 'createSalon' }
  | { type: 'confirmDelete' }
  | { type: 'galleryPhoto'; photoId: number }
  | { type: 'addGalleryPhoto' }
  | { type: 'editGalleryPhoto'; photo: GalleryPhoto }
  | { type: 'confirmDeleteGalleryPhoto'; photo: GalleryPhoto }
  | { type: 'createEvent' }
  | { type: 'editEvent'; event: EventFund }
  | { type: 'confirmDeleteEvent'; event: EventFund }
  | null;

const LEGACY_DEMO_ALUMNI_EMAILS = new Set([
  'moussa@email.com',
  'aminata@email.com',
  'ibrahim@email.com',
  'fatou@email.com',
  'kwame@email.com',
  'aicha@email.com',
  'paul@email.com',
  'sokhna@email.com',
  'emmanuel@email.com',
  'lea@email.com',
]);

const LEGACY_DEMO_EVENT_IDS = new Set([1, 2, 3]);
const LEGACY_DEMO_COTISATION_IDS = new Set([1, 2, 3, 4, 5]);
const LEGACY_DEMO_GALLERY_IDS = new Set([1, 2, 3, 4]);

function purgeLegacyMockDataOnce() {
  try {
    if (localStorage.getItem('anciens_real_only_v1')) return;

    const savedSession = localStorage.getItem('anciens_session');
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      if (
        parsedSession &&
        (parsedSession.email === 'demo@anciens.com' || parsedSession.id === 0)
      ) {
        localStorage.removeItem('anciens_session');
      }
    }

    const savedAlumni = localStorage.getItem('anciens_alumni_list');
    if (savedAlumni) {
      const parsed = JSON.parse(savedAlumni);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (a: Alumnus) => !LEGACY_DEMO_ALUMNI_EMAILS.has((a.email || '').toLowerCase())
        );
        localStorage.setItem('anciens_alumni_list', JSON.stringify(cleaned));
      }
    }

    const savedEvents = localStorage.getItem('anciens_event_funds');
    if (savedEvents) {
      const parsed = JSON.parse(savedEvents);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((e: EventFund) => !LEGACY_DEMO_EVENT_IDS.has(e.id));
        localStorage.setItem('anciens_event_funds', JSON.stringify(cleaned));
      }
    }

    const savedCoti = localStorage.getItem('anciens_cotisations');
    if (savedCoti) {
      const parsed = JSON.parse(savedCoti);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (c: Cotisation) => !LEGACY_DEMO_COTISATION_IDS.has(c.id)
        );
        localStorage.setItem('anciens_cotisations', JSON.stringify(cleaned));
      }
    }

    const savedGallery = localStorage.getItem('anciens_gallery_photos');
    if (savedGallery) {
      const parsed = JSON.parse(savedGallery);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(
          (p: GalleryPhoto) => !LEGACY_DEMO_GALLERY_IDS.has(p.id)
        );
        localStorage.setItem('anciens_gallery_photos', JSON.stringify(cleaned));
      }
    }

    localStorage.removeItem('anciens_notifications');
    localStorage.setItem('anciens_real_only_v1', '1');
  } catch {
    // Ignore localStorage cleanup errors
  }
}

export default function App() {
  purgeLegacyMockDataOnce();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeModal, setActiveModal] = useState<ActiveModalState>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('anciens_app_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            appName:
              typeof parsed.appName === 'string' && parsed.appName.trim()
                ? parsed.appName
                : DEFAULT_APP_SETTINGS.appName,
            logo:
              typeof parsed.logo === 'string' && parsed.logo.trim()
                ? parsed.logo
                : DEFAULT_APP_SETTINGS.logo,
            accentColor:
              typeof parsed.accentColor === 'string' && parsed.accentColor.trim()
                ? parsed.accentColor
                : DEFAULT_APP_SETTINGS.accentColor,
          };
        }
      }
    } catch {
      // Fallback to default app settings
    }
    return DEFAULT_APP_SETTINGS;
  });

  const [alumniList, setAlumniList] = useState<Alumnus[]>(() => {
    try {
      const saved = localStorage.getItem('anciens_alumni_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      const savedUsers = localStorage.getItem('anciens_users');
      if (savedUsers) {
        const users: UserProfile[] = JSON.parse(savedUsers);
        if (Array.isArray(users) && users.length > 0) {
          return users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            country: u.country,
            univ: u.univ,
            year: u.year,
            filiere: u.filiere,
            status: 'offline' as const,
            avatar: u.avatar,
            promo: u.promo || `Promo ${u.year}`,
            role: u.role,
            city: u.city,
            bond: 5,
          }));
        }
      }
    } catch {
      // Fallback to empty alumni list
    }
    return INITIAL_ALUMNI;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('anciens_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to empty posts
    }
    return INITIAL_POSTS;
  });

  const [cotisations, setCotisations] = useState<Cotisation[]>(() => {
    try {
      const saved = localStorage.getItem('anciens_cotisations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to empty cotisations
    }
    return INITIAL_COTISATIONS;
  });

  const [eventFunds, setEventFunds] = useState<EventFund[]>(() => {
    try {
      const saved = localStorage.getItem('anciens_event_funds');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to empty event funds
    }
    return EVENT_FUNDS;
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('anciens_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to empty general discussion
    }
    return INITIAL_CONVERSATIONS;
  });
  const [activeChatId, setActiveChatId] = useState<number>(INITIAL_CONVERSATIONS[0].id);

  useEffect(() => {
    if (currentPage === 'discussions') {
      setConversations(prev =>
        prev.map(c => (c.id === activeChatId ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, [currentPage, activeChatId]);

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    setConversations(prev =>
      prev.map(c => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('anciens_gallery_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to empty gallery photos
    }
    return INITIAL_GALLERY_PHOTOS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('anciens_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback to initial notifications
    }
    return buildInitialNotifications(INITIAL_COTISATIONS, INITIAL_POSTS, INITIAL_CONVERSATIONS);
  });

  const [browserNotifStatus, setBrowserNotifStatus] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return window.Notification.permission;
    }
    return 'unsupported';
  });

  useEffect(() => {
    const savedSession = localStorage.getItem('anciens_session');
    if (savedSession) {
      try {
        const parsedUser: UserProfile = JSON.parse(savedSession);
        if (parsedUser && parsedUser.email && parsedUser.email !== 'demo@anciens.com') {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('anciens_session');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('anciens_notifications', JSON.stringify(notifications));
    } catch {
      // Ignore storage quota errors
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('anciens_posts', JSON.stringify(posts));
    } catch {
      // Ignore storage quota errors
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('anciens_conversations', JSON.stringify(conversations));
    } catch {
      // Ignore storage quota errors
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem('anciens_gallery_photos', JSON.stringify(galleryPhotos));
    } catch {
      // Ignore storage quota errors
    }
  }, [galleryPhotos]);

  useEffect(() => {
    try {
      localStorage.setItem('anciens_cotisations', JSON.stringify(cotisations));
    } catch {
      // Ignore storage quota errors
    }
  }, [cotisations]);

  useEffect(() => {
    try {
      localStorage.setItem('anciens_event_funds', JSON.stringify(eventFunds));
    } catch {
      // Ignore storage quota errors
    }
  }, [eventFunds]);

  useEffect(() => {
    try {
      localStorage.setItem('anciens_alumni_list', JSON.stringify(alumniList));
    } catch {
      // Ignore storage quota errors
    }
  }, [alumniList]);

  useEffect(() => {
    applyThemeToDocument(appSettings);
    try {
      localStorage.setItem('anciens_app_settings', JSON.stringify(appSettings));
    } catch {
      // Ignore storage quota errors
    }
  }, [appSettings]);

  const showToast = (msg: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const pushNotification = (
    payload: Omit<AppNotification, 'id' | 'time' | 'read'>
  ) => {
    const time = new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newNotif: AppNotification = {
      ...payload,
      id: Date.now() + Math.floor(Math.random() * 1000),
      time,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 40));

    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      window.Notification.permission === 'granted'
    ) {
      try {
        new window.Notification(payload.title, { body: payload.message });
      } catch {
        // Safe fallback in restricted iframe environments
      }
    }
  };

  const handleRequestBrowserNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setBrowserNotifStatus('unsupported');
      showToast('Les alertes navigateur ne sont pas disponibles ici', 'info');
      return;
    }
    try {
      const permission = await window.Notification.requestPermission();
      setBrowserNotifStatus(permission);
      if (permission === 'granted') {
        showToast('Alertes navigateur activées', 'success');
        try {
          new window.Notification(appSettings.appName, {
            body: 'Les notifications en temps réel sont maintenant activées.',
          });
        } catch {
          // Ignore Notification constructor errors in sandboxed iframes
        }
      } else if (permission === 'denied') {
        showToast('Alertes bloquées par le navigateur', 'info');
      }
    } catch {
      showToast('Activation bloquée dans cet environnement', 'info');
    }
  };

  const handleSelectNotification = (notif: AppNotification) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setActiveModal(null);
    setCurrentPage(notif.targetPage);
    if (notif.targetPage === 'discussions' && notif.targetChatId !== undefined) {
      setActiveChatId(notif.targetChatId);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearReadNotifications = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  const handleLoginSuccess = (
    loggedUser: UserProfile,
    toastMessage: string,
    toastType: 'success' | 'info' = 'success'
  ) => {
    setUser(loggedUser);
    localStorage.setItem('anciens_session', JSON.stringify(loggedUser));

    setAlumniList(prev => {
      const exists = prev.some(
        a => a.id === loggedUser.id || a.email.toLowerCase() === loggedUser.email.toLowerCase()
      );
      if (exists) {
        return prev.map(a =>
          a.id === loggedUser.id || a.email.toLowerCase() === loggedUser.email.toLowerCase()
            ? {
                ...a,
                name: loggedUser.name,
                email: loggedUser.email,
                country: loggedUser.country,
                univ: loggedUser.univ,
                year: loggedUser.year,
                filiere: loggedUser.filiere,
                avatar: loggedUser.avatar,
                promo: loggedUser.promo || `Promo ${loggedUser.year}`,
                role: loggedUser.role,
                city: loggedUser.city,
                status: 'online',
              }
            : a
        );
      }
      return [
        {
          id: loggedUser.id,
          name: loggedUser.name,
          email: loggedUser.email,
          country: loggedUser.country,
          univ: loggedUser.univ,
          year: loggedUser.year,
          filiere: loggedUser.filiere,
          status: 'online',
          avatar: loggedUser.avatar,
          promo: loggedUser.promo || `Promo ${loggedUser.year}`,
          role: loggedUser.role,
          city: loggedUser.city,
          bond: 5,
        },
        ...prev,
      ];
    });

    setCurrentPage('dashboard');
    showToast(toastMessage, toastType);

    if (toastMessage.includes('Inscription')) {
      pushNotification({
        title: `Bienvenue ${loggedUser.name}`,
        message: 'Votre profil est prêt. Explorez l’annuaire des anciens et vos cotisations.',
        category: 'system',
        targetPage: 'profile',
      });
    }
  };

  const handleLogout = () => {
    const activeEmail = user?.email?.toLowerCase();
    if (activeEmail) {
      setAlumniList(prev =>
        prev.map(a =>
          a.email.toLowerCase() === activeEmail ? { ...a, status: 'offline' } : a
        )
      );
    }
    localStorage.removeItem('anciens_session');
    setUser(null);
    setActiveModal(null);
    showToast('Déconnexion réussie', 'info');
  };

  const handleConfirmDeleteAccount = () => {
    const activeEmail = user?.email?.toLowerCase();
    const users: UserProfile[] = JSON.parse(localStorage.getItem('anciens_users') || '[]');
    const filtered = users.filter(u => u.email.toLowerCase() !== activeEmail);
    localStorage.setItem('anciens_users', JSON.stringify(filtered));
    if (activeEmail) {
      setAlumniList(prev => prev.filter(a => a.email.toLowerCase() !== activeEmail));
    }
    setActiveModal(null);
    localStorage.removeItem('anciens_session');
    setUser(null);
    showToast('Compte supprimé', 'info');
  };

  const handleUpdateProfile = (updatedUser: UserProfile): boolean => {
    const prevEmail = user?.email?.toLowerCase();
    const nextEmail = updatedUser.email.trim().toLowerCase();

    try {
      const users: UserProfile[] = JSON.parse(localStorage.getItem('anciens_users') || '[]');
      const emailTaken = users.some(
        u =>
          u.email.toLowerCase() === nextEmail &&
          u.id !== updatedUser.id &&
          u.email.toLowerCase() !== prevEmail
      );
      if (emailTaken) {
        showToast('Cet email est déjà utilisé par un autre compte', 'error');
        return false;
      }

      const nextUsers = users.some(
        u => u.id === updatedUser.id || u.email.toLowerCase() === prevEmail
      )
        ? users.map(u =>
            u.id === updatedUser.id || u.email.toLowerCase() === prevEmail
              ? { ...u, ...updatedUser }
              : u
          )
        : users;
      localStorage.setItem('anciens_users', JSON.stringify(nextUsers));
    } catch {
      // Ignore storage parsing errors
    }

    try {
      localStorage.setItem('anciens_session', JSON.stringify(updatedUser));
    } catch {
      // Ignore storage quota errors
    }

    setUser(updatedUser);
    setAlumniList(prev =>
      prev.map(a =>
        a.id === updatedUser.id || a.email.toLowerCase() === prevEmail
          ? {
              ...a,
              name: updatedUser.name,
              email: updatedUser.email,
              country: updatedUser.country,
              univ: updatedUser.univ,
              year: updatedUser.year,
              filiere: updatedUser.filiere,
              avatar: updatedUser.avatar,
              promo: updatedUser.promo,
              role: updatedUser.role,
              city: updatedUser.city,
            }
          : a
      )
    );
    showToast('Profil mis à jour avec succès', 'success');
    pushNotification({
      title: 'Profil mis à jour',
      message: `Vos informations personnelles (${updatedUser.name}) ont été enregistrées.`,
      category: 'system',
      targetPage: 'profile',
    });
    return true;
  };

  const handlePublishPost = (
    text: string,
    type: PostType,
    media?: string,
    mediaKind?: 'image' | 'video'
  ) => {
    const newPost: Post = {
      id: Date.now(),
      author: user?.name || 'Vous',
      avatar: user?.avatar || '👤',
      type,
      time: 'À l\'instant',
      text,
      media,
      mediaKind,
      likes: 0,
      comments: [],
    };
    setPosts(prev => [newPost, ...prev]);
    showToast('Publication envoyée', 'success');
    pushNotification({
      title: `Publication publiée · ${user?.name || 'Vous'}`,
      message: text.trim()
        ? text.trim().length > 85
          ? `${text.trim().slice(0, 85)}…`
          : text.trim()
        : 'Un nouveau média a été partagé dans les informations.',
      category: 'info',
      targetPage: 'info',
    });
  };

  const handleLikePost = (postId: number) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const liked = !p.liked;
        return { ...p, liked, likes: p.likes + (liked ? 1 : -1) };
      })
    );
  };

  const handleToggleComments = (postId: number) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, showComments: !p.showComments } : p))
    );
  };

  const handleAddComment = (postId: number, commentText: string) => {
    const targetPost = posts.find(p => p.id === postId);
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [
            ...p.comments,
            {
              author: user?.name || 'Vous',
              avatar: user?.avatar || '👤',
              text: commentText,
            },
          ],
        };
      })
    );
    pushNotification({
      title: 'Nouveau commentaire publié',
      message: targetPost
        ? `Sur la publication de ${targetPost.author} : "${commentText.length > 65 ? `${commentText.slice(0, 65)}…` : commentText}"`
        : commentText,
      category: 'info',
      targetPage: 'info',
    });
  };

  const handlePayCotisation = (cotiId: number) => {
    const targetCoti = cotisations.find(c => c.id === cotiId);
    if (!targetCoti) return;
    setActiveModal({ type: 'pay', prefillCotisation: targetCoti });
  };

  const handleSubmitPayDeclaration = (
    eventName: string,
    amount: number,
    transactionRef: string,
    targetCotisationId?: number
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const contributorName = user?.name || 'Contribuable';

    if (targetCotisationId !== undefined) {
      setCotisations(prev =>
        prev.map(c =>
          c.id === targetCotisationId
            ? {
                ...c,
                status: 'awaiting_confirmation',
                date: today,
                contributorName,
                transactionRef,
              }
            : c
        )
      );
    } else {
      const newCoti: Cotisation = {
        id: Date.now(),
        event: eventName,
        amount,
        status: 'awaiting_confirmation',
        date: today,
        contributorName,
        transactionRef,
      };
      setCotisations(prev => [newCoti, ...prev]);
    }

    setActiveModal(null);
    showToast(
      `Paiement déclaré · En attente de confirmation par ${COTISATION_PAYMENT_CHANNEL.recipientName}`,
      'info'
    );
    pushNotification({
      title: `Validation requise · ${eventName}`,
      message: `${contributorName} a déclaré ${amount.toLocaleString('fr-FR')} FCFA (Réf : ${transactionRef}). En attente de confirmation par ${COTISATION_PAYMENT_CHANNEL.recipientName}.`,
      category: 'cotisation',
      targetPage: 'cotisations',
    });
  };

  const handleBenichouConfirmReceipt = (cotiId: number) => {
    const targetCoti = cotisations.find(c => c.id === cotiId);
    if (!targetCoti) return;
    const today = new Date().toISOString().split('T')[0];

    setCotisations(prev =>
      prev.map(c =>
        c.id === cotiId
          ? {
              ...c,
              status: 'paid',
              confirmedBy: COTISATION_PAYMENT_CHANNEL.recipientName,
              confirmedAt: today,
            }
          : c
      )
    );

    setEventFunds(prev =>
      prev.map(ef => {
        const matchesExact = ef.name === targetCoti.event;
        const matchesPartial =
          targetCoti.event.toLowerCase().includes('gala') && ef.name.toLowerCase().includes('gala') ||
          targetCoti.event.toLowerCase().includes('solidarit') && ef.name.toLowerCase().includes('solidarit') ||
          targetCoti.event.toLowerCase().includes('assurance') && ef.name.toLowerCase().includes('assurance');
        return matchesExact || matchesPartial
          ? {
              ...ef,
              collected: ef.collected + targetCoti.amount,
              participants: ef.participants + 1,
            }
          : ef;
      })
    );

    setNotifications(prev =>
      prev.map(n => (n.relatedCotisationId === cotiId ? { ...n, read: true } : n))
    );

    setActiveModal(null);
    showToast(
      `Paiement confirmé par ${COTISATION_PAYMENT_CHANNEL.recipientName} : statut passé à Payé`,
      'success'
    );
    pushNotification({
      title: `Paiement confirmé · ${targetCoti.event}`,
      message: `${COTISATION_PAYMENT_CHANNEL.recipientName} a confirmé la réception de ${targetCoti.amount.toLocaleString('fr-FR')} FCFA sur ${COTISATION_PAYMENT_CHANNEL.provider} (${COTISATION_PAYMENT_CHANNEL.number}).`,
      category: 'cotisation',
      targetPage: 'cotisations',
    });
  };

  const handleBenichouRejectReceipt = (cotiId: number) => {
    const targetCoti = cotisations.find(c => c.id === cotiId);
    setCotisations(prev =>
      prev.map(c =>
        c.id === cotiId
          ? {
              ...c,
              status: 'pending',
              transactionRef: undefined,
            }
          : c
      )
    );
    setActiveModal(null);
    showToast(
      `Paiement non confirmé par ${COTISATION_PAYMENT_CHANNEL.recipientName}`,
      'error'
    );
    if (targetCoti) {
      pushNotification({
        title: `Paiement non confirmé · ${targetCoti.event}`,
        message: `${COTISATION_PAYMENT_CHANNEL.recipientName} n’a pas encore confirmé la réception pour la référence ${targetCoti.transactionRef || 'indiquée'}.`,
        category: 'cotisation',
        targetPage: 'cotisations',
      });
    }
  };

  const handleSendMessage = (chatId: number, text: string, image?: string) => {
    const time = new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' });
    setConversations(prev =>
      prev.map(c =>
        c.id === chatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: Date.now() + Math.floor(Math.random() * 1000),
                  sender: user?.name || 'Vous',
                  avatar: user?.avatar || '👤',
                  text,
                  image,
                  time,
                  sent: true,
                },
              ],
            }
          : c
      )
    );
  };

  const handleEditMessage = (chatId: number, messageIndex: number, newText: string) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.map((m, idx) =>
                idx === messageIndex ? { ...m, text: newText, edited: true } : m
              ),
            }
          : c
      )
    );
    showToast('Message modifié', 'success');
  };

  const handleDeleteMessage = (chatId: number, messageIndex: number) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === chatId
          ? {
              ...c,
              messages: c.messages.filter((_, idx) => idx !== messageIndex),
            }
          : c
      )
    );
    showToast('Message supprimé', 'info');
  };

  const handleDeleteMessageImage = (chatId: number, messageIndex: number) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== chatId) return c;
        const target = c.messages[messageIndex];
        if (!target) return c;
        if (!target.text.trim()) {
          return {
            ...c,
            messages: c.messages.filter((_, idx) => idx !== messageIndex),
          };
        }
        return {
          ...c,
          messages: c.messages.map((m, idx) =>
            idx === messageIndex ? { ...m, image: undefined, edited: true } : m
          ),
        };
      })
    );
    showToast('Image supprimée du message', 'info');
  };

  const handleCreateSalon = (name: string, emoji: string, selectedMemberNames: string[]) => {
    const newId = Date.now();
    const membersNote =
      selectedMemberNames.length > 0
        ? ` Membres invités : ${selectedMemberNames.join(', ')}.`
        : '';
    const newConv: Conversation = {
      id: newId,
      name,
      avatar: emoji,
      members: selectedMemberNames,
      messages: [
        {
          sender: user?.name || 'Vous',
          avatar: user?.avatar || '👤',
          text: `Bienvenue dans le salon "${name}" ! Créé par ${user?.name || 'un ancien'}.${membersNote}`,
          time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
          sent: true,
        },
      ],
    };
    setConversations(prev => [...prev, newConv]);
    setActiveChatId(newId);
    setActiveModal(null);
    setCurrentPage('discussions');
    showToast(`Salon "${name}" créé`, 'success');
    pushNotification({
      title: `Salon créé · ${name}`,
      message:
        selectedMemberNames.length > 0
          ? `${selectedMemberNames.length} membre(s) invité(s) : ${selectedMemberNames.join(', ')}.`
          : 'Nouveau salon de discussion ouvert.',
      category: 'discussion',
      targetPage: 'discussions',
      targetChatId: newId,
    });
  };

  const handleStartDirectMessage = (alumnus: Alumnus) => {
    const existing = conversations.find(
      c => !c.isGeneral && c.name === alumnus.name
    );
    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newId = Date.now();
      const directConv: Conversation = {
        id: newId,
        name: alumnus.name,
        avatar: alumnus.avatar,
        members: [alumnus.name],
        messages: [
          {
            sender: user?.name || 'Vous',
            avatar: user?.avatar || '👤',
            text: `Bonjour ${alumnus.name} !`,
            time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
            sent: true,
          },
        ],
      };
      setConversations(prev => [...prev, directConv]);
      setActiveChatId(newId);
      pushNotification({
        title: `Discussion ouverte · ${alumnus.name}`,
        message: `Conversation privée démarrée avec ${alumnus.name}.`,
        category: 'discussion',
        targetPage: 'discussions',
        targetChatId: newId,
      });
    }
    setActiveModal(null);
    setCurrentPage('discussions');
    showToast(`Salon ouvert avec ${alumnus.name}`, 'success');
  };

  const handleToggleGalleryLike = (photoId: number) => {
    setGalleryPhotos(prev =>
      prev.map(p => {
        if (p.id !== photoId) return p;
        const liked = !p.liked;
        return { ...p, liked, likes: p.likes + (liked ? 1 : -1) };
      })
    );
  };

  const handleAddGalleryPhoto = (data: {
    title: string;
    event: string;
    date: string;
    location: string;
    category: GalleryCategory;
    caption: string;
    imageUrl: string;
  }) => {
    const newPhoto: GalleryPhoto = {
      id: Date.now(),
      ...data,
      author: user?.name || 'Vous',
      promo: user?.promo || 'Ancien',
      likes: 1,
      liked: true,
    };
    setGalleryPhotos(prev => [newPhoto, ...prev]);
    setActiveModal(null);
    showToast('Photo ajoutée à la galerie', 'success');
    pushNotification({
      title: `Nouvelle photo · Galerie`,
      message: `${user?.name || 'Un ancien'} a ajouté "${data.title}" (${data.location}).`,
      category: 'info',
      targetPage: 'dashboard',
    });
  };

  const handleUpdateGalleryPhoto = (updated: GalleryPhoto) => {
    setGalleryPhotos(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setActiveModal(null);
    showToast('Photo de la galerie modifiée', 'success');
  };

  const handleDeleteGalleryPhoto = (photoId: number) => {
    setGalleryPhotos(prev => prev.filter(p => p.id !== photoId));
    setActiveModal(null);
    showToast('Photo supprimée de la galerie', 'info');
  };

  const handleSaveEvent = (data: Omit<EventFund, 'id'>, existingId?: number) => {
    if (existingId !== undefined) {
      const previous = eventFunds.find(ef => ef.id === existingId);
      setEventFunds(prev =>
        prev.map(ef => (ef.id === existingId ? { id: existingId, ...data } : ef))
      );
      if (previous && previous.name !== data.name) {
        setCotisations(prev =>
          prev.map(c => (c.event === previous.name ? { ...c, event: data.name } : c))
        );
      }
      setActiveModal(null);
      showToast(`Événement "${data.name}" modifié`, 'success');
      return;
    }

    const newEvent: EventFund = {
      id: Date.now(),
      ...data,
    };
    setEventFunds(prev => [newEvent, ...prev]);
    setActiveModal(null);
    showToast(`Événement "${data.name}" créé`, 'success');
    pushNotification({
      title: `Nouvel événement · ${data.name}`,
      message: `Objectif : ${data.target.toLocaleString('fr-FR')} FCFA (du ${data.startDate} au ${data.deadline}).`,
      category: 'cotisation',
      targetPage: 'cotisations',
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    const targetEvent = eventFunds.find(ef => ef.id === eventId);
    setEventFunds(prev => prev.filter(ef => ef.id !== eventId));
    setActiveModal(null);
    showToast(
      targetEvent ? `Événement "${targetEvent.name}" supprimé` : 'Événement supprimé',
      'info'
    );
  };

  const handleDeleteAlumnus = (alumnusId: number) => {
    const targetAlumnus = alumniList.find(a => a.id === alumnusId);
    setAlumniList(prev => prev.filter(a => a.id !== alumnusId));
    setActiveModal(null);
    showToast(
      targetAlumnus ? `Ancien "${targetAlumnus.name}" supprimé` : 'Ancien supprimé',
      'info'
    );
    if (targetAlumnus) {
      pushNotification({
        title: `Annuaire mis à jour`,
        message: `${targetAlumnus.name} (${targetAlumnus.promo}) a été retiré de la liste des anciens.`,
        category: 'system',
        targetPage: 'alumni',
      });
    }
  };

  const handleResetAppSettings = () => {
    setAppSettings(DEFAULT_APP_SETTINGS);
    showToast('Paramètres réinitialisés par défaut', 'info');
  };

  if (!user) {
    return (
      <>
        <ToastContainer toasts={toasts} />
        <OfflineIndicator />
        <div className="fixed top-4 right-4 z-50">
          <PWAInstallButton />
        </div>
        <AuthScreen
          appSettings={appSettings}
          onLoginSuccess={handleLoginSuccess}
          onShowToast={showToast}
        />
      </>
    );
  }

  const totalMessagesCount = conversations.reduce((sum, c) => sum + c.messages.length, 0);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadDiscussionsCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1117] text-[#e8e0d0]">
      <ToastContainer toasts={toasts} />

      <Modal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        maxWidthClass={activeModal?.type === 'galleryPhoto' ? 'max-w-2xl' : 'max-w-lg'}
      >
        {activeModal?.type === 'alumnus' && (
          <AlumnusModalBody
            alumnus={activeModal.alumnus}
            onStartMessage={handleStartDirectMessage}
            onShare={() => {
              showToast('Profil partagé', 'success');
              setActiveModal(null);
            }}
            onRequestDelete={alumnus =>
              setActiveModal({ type: 'confirmDeleteAlumnus', alumnus })
            }
          />
        )}
        {activeModal?.type === 'confirmDeleteAlumnus' && (
          <ConfirmDeleteAlumnusModalBody
            alumnus={activeModal.alumnus}
            onCancel={() => setActiveModal(null)}
            onConfirm={() => handleDeleteAlumnus(activeModal.alumnus.id)}
          />
        )}
        {activeModal?.type === 'notifications' && (
          <NotificationsModalBody
            notifications={notifications}
            browserNotifStatus={browserNotifStatus}
            onEnableBrowserNotif={handleRequestBrowserNotifications}
            onSelectNotification={handleSelectNotification}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onDismissNotification={handleDismissNotification}
            onClearRead={handleClearReadNotifications}
          />
        )}
        {activeModal?.type === 'pay' && (
          <PayModalBody
            eventFunds={eventFunds}
            prefillCotisation={activeModal.prefillCotisation}
            onConfirmPay={handleSubmitPayDeclaration}
            onShowError={msg => showToast(msg, 'error')}
          />
        )}
        {activeModal?.type === 'benichouConfirm' && (
          <BenichouConfirmModalBody
            cotisation={activeModal.cotisation}
            onConfirmReceipt={handleBenichouConfirmReceipt}
            onRejectReceipt={handleBenichouRejectReceipt}
            onCancel={() => setActiveModal(null)}
          />
        )}
        {activeModal?.type === 'createSalon' && (
          <CreateSalonModalBody
            alumniList={alumniList}
            onCreateSalon={handleCreateSalon}
            onShowError={msg => showToast(msg, 'error')}
          />
        )}
        {activeModal?.type === 'confirmDelete' && (
          <ConfirmDeleteModalBody
            onCancel={() => setActiveModal(null)}
            onConfirm={handleConfirmDeleteAccount}
          />
        )}
        {activeModal?.type === 'galleryPhoto' && (
          <GalleryPhotoModalBody
            photos={galleryPhotos}
            activePhotoId={activeModal.photoId}
            onSelectPhoto={photoId => setActiveModal({ type: 'galleryPhoto', photoId })}
            onToggleLike={handleToggleGalleryLike}
            onEditPhoto={photo => setActiveModal({ type: 'editGalleryPhoto', photo })}
            onDeletePhoto={handleDeleteGalleryPhoto}
          />
        )}
        {activeModal?.type === 'addGalleryPhoto' && (
          <AddGalleryPhotoModalBody
            onAddPhoto={handleAddGalleryPhoto}
            onShowError={msg => showToast(msg, 'error')}
          />
        )}
        {activeModal?.type === 'editGalleryPhoto' && (
          <EditGalleryPhotoModalBody
            photo={activeModal.photo}
            onSavePhoto={handleUpdateGalleryPhoto}
            onDeletePhoto={handleDeleteGalleryPhoto}
            onShowError={msg => showToast(msg, 'error')}
          />
        )}
        {activeModal?.type === 'confirmDeleteGalleryPhoto' && (
          <ConfirmDeleteGalleryModalBody
            photo={activeModal.photo}
            onCancel={() => setActiveModal(null)}
            onConfirm={() => handleDeleteGalleryPhoto(activeModal.photo.id)}
          />
        )}
        {activeModal?.type === 'createEvent' && (
          <EventFormModalBody
            onSaveEvent={handleSaveEvent}
            onShowError={msg => showToast(msg, 'error')}
          />
        )}
        {activeModal?.type === 'editEvent' && (
          <EventFormModalBody
            event={activeModal.event}
            onSaveEvent={handleSaveEvent}
            onDeleteEvent={handleDeleteEvent}
            onShowError={msg => showToast(msg, 'error')}
          />
        )}
        {activeModal?.type === 'confirmDeleteEvent' && (
          <ConfirmDeleteEventModalBody
            event={activeModal.event}
            onCancel={() => setActiveModal(null)}
            onConfirm={() => handleDeleteEvent(activeModal.event.id)}
          />
        )}
      </Modal>

      <Navbar
        currentPage={currentPage}
        user={user}
        appSettings={appSettings}
        unreadNotificationsCount={unreadNotificationsCount}
        unreadDiscussionsCount={unreadDiscussionsCount}
        onNavigate={setCurrentPage}
        onOpenNotifications={() => setActiveModal({ type: 'notifications' })}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto pt-22 px-4 sm:px-6 pb-10">
        {currentPage === 'dashboard' && (
          <DashboardPage
            user={user}
            alumniList={alumniList}
            posts={posts}
            cotisations={cotisations}
            eventFunds={eventFunds}
            galleryPhotos={galleryPhotos}
            totalMessagesCount={totalMessagesCount}
            onNavigate={setCurrentPage}
            onSelectAlumnus={alumnus => setActiveModal({ type: 'alumnus', alumnus })}
            onSelectGalleryPhoto={photoId => setActiveModal({ type: 'galleryPhoto', photoId })}
            onToggleGalleryLike={handleToggleGalleryLike}
            onOpenAddGalleryPhoto={() => setActiveModal({ type: 'addGalleryPhoto' })}
            onEditGalleryPhoto={photo => setActiveModal({ type: 'editGalleryPhoto', photo })}
            onRequestDeleteGalleryPhoto={photo =>
              setActiveModal({ type: 'confirmDeleteGalleryPhoto', photo })
            }
            onOpenCreateEvent={() => setActiveModal({ type: 'createEvent' })}
            onEditEvent={event => setActiveModal({ type: 'editEvent', event })}
            onRequestDeleteEvent={event =>
              setActiveModal({ type: 'confirmDeleteEvent', event })
            }
          />
        )}

        {currentPage === 'alumni' && (
          <AlumniPage
            alumniList={alumniList}
            onSelectAlumnus={alumnus => setActiveModal({ type: 'alumnus', alumnus })}
            onRequestDeleteAlumnus={alumnus =>
              setActiveModal({ type: 'confirmDeleteAlumnus', alumnus })
            }
          />
        )}

        {currentPage === 'info' && (
          <InfoPage
            user={user}
            posts={posts}
            onPublishPost={handlePublishPost}
            onLikePost={handleLikePost}
            onToggleComments={handleToggleComments}
            onAddComment={handleAddComment}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'cotisations' && (
          <CotisationsPage
            cotisations={cotisations}
            eventFunds={eventFunds}
            onPayCotisation={handlePayCotisation}
            onOpenPayModal={() => setActiveModal({ type: 'pay' })}
            onOpenBenichouConfirm={cotisation =>
              setActiveModal({ type: 'benichouConfirm', cotisation })
            }
            onOpenCreateEvent={() => setActiveModal({ type: 'createEvent' })}
            onEditEvent={event => setActiveModal({ type: 'editEvent', event })}
            onRequestDeleteEvent={event =>
              setActiveModal({ type: 'confirmDeleteEvent', event })
            }
          />
        )}

        {currentPage === 'discussions' && (
          <DiscussionsPage
            conversations={conversations}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onDeleteMessageImage={handleDeleteMessageImage}
            onOpenCreateSalon={() => setActiveModal({ type: 'createSalon' })}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage
            user={user}
            onLogout={handleLogout}
            onRequestDeleteAccount={() => setActiveModal({ type: 'confirmDelete' })}
            onOpenSettings={() => setCurrentPage('settings')}
            onUpdateProfile={handleUpdateProfile}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage
            settings={appSettings}
            onUpdateSettings={setAppSettings}
            onResetSettings={handleResetAppSettings}
            onShowToast={showToast}
          />
        )}
      </main>

      <footer className="border-t border-accent/12 py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#807868]">
          <div>© 2026 Empreintes Technologies. Tous droits réservés.</div>
          <div className="flex items-center gap-3">
            <PWAInstallButton />
          </div>
        </div>
      </footer>
      <OfflineIndicator />
    </div>
  );
}

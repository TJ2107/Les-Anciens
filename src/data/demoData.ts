import {
  Alumnus,
  AppNotification,
  Conversation,
  Cotisation,
  EventFund,
  GalleryPhoto,
  Post,
} from '../types';

export const COTISATION_PAYMENT_CHANNEL = {
  provider: 'MTN Mobile Money',
  number: '066679430',
  recipientName: 'Benichou Massengo',
} as const;

export const COUNTRIES: string[] = [
  '🇨🇲 Cameroun',
  '🇸🇳 Sénégal',
  '🇨🇮 Côte d\'Ivoire',
  '🇨🇩 RD Congo',
  '🇨🇬 Congo',
  '🇧🇫 Burkina Faso',
  '🇲🇱 Mali',
  '🇬🇦 Gabon',
  '🇬🇳 Guinée',
  '🇹🇬 Togo',
  '🇧🇯 Bénin',
  '🇫🇷 France',
  '🇨🇦 Canada',
  '🇧🇪 Belgique',
];

export const PROMO_YEARS: string[] = [
  '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017',
  '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008', '2007',
  '2006', '2005', '2004', '2003', '2002', '2001', '2000', '1995', '1990',
];

export const FILIERES: string[] = [
  'Informatique',
  'Médecine',
  'Droit',
  'Gestion',
  'Ingénierie',
  'Électronique',
  'Mécanique',
  'Électricité',
  'Aviation',
  'Lettres',
  'Sciences',
  'Économie',
  'Pharmacie',
  'Autre',
];

export const INITIAL_ALUMNI: Alumnus[] = [];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_COTISATIONS: Cotisation[] = [];

export const EVENT_FUNDS: EventFund[] = [];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: 'Discussion générale',
    avatar: '💬',
    isGeneral: true,
    messages: [],
  },
];

export const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = [];

export const buildInitialNotifications = (
  _cotisations: Cotisation[],
  _posts: Post[],
  _conversations: Conversation[]
): AppNotification[] => [];

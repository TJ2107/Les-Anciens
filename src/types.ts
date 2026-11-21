export type PageId =
  | 'dashboard'
  | 'alumni'
  | 'info'
  | 'cotisations'
  | 'discussions'
  | 'profile'
  | 'settings';

export interface AppSettings {
  appName: string;
  logo: string;
  accentColor: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  password?: string;
  country: string;
  univ: string;
  year: string;
  filiere: string;
  avatar: string;
  role: string;
  city: string;
  promo: string;
}

export interface Alumnus {
  id: number;
  name: string;
  email: string;
  country: string;
  univ: string;
  year: string;
  filiere: string;
  status: 'online' | 'offline' | 'memorial';
  avatar: string;
  promo: string;
  role: string;
  city: string;
  bond: number;
}

export interface PostComment {
  author: string;
  avatar: string;
  text: string;
}

export type PostType = 'info' | 'promotion' | 'naissance' | 'deces' | 'evenement' | 'emploi';

export interface Post {
  id: number;
  author: string;
  avatar: string;
  type: PostType;
  time: string;
  text: string;
  media?: string;
  mediaKind?: 'image' | 'video';
  likes: number;
  liked?: boolean;
  comments: PostComment[];
  showComments?: boolean;
}

export interface Cotisation {
  id: number;
  event: string;
  amount: number;
  status: 'paid' | 'awaiting_confirmation' | 'pending' | 'overdue';
  date: string;
  contributorName?: string;
  transactionRef?: string;
  confirmedBy?: string;
  confirmedAt?: string;
}

export interface EventFund {
  id: number;
  name: string;
  startDate: string;
  deadline: string;
  target: number;
  collected: number;
  participants: number;
}

export interface ChatMessage {
  id?: number;
  sender: string;
  avatar: string;
  text: string;
  image?: string;
  time: string;
  sent: boolean;
  edited?: boolean;
}

export interface Conversation {
  id: number;
  name: string;
  avatar: string;
  members?: string[];
  isGeneral?: boolean;
  messages: ChatMessage[];
}

export interface ToastItem {
  id: number;
  msg: string;
  type: 'success' | 'error' | 'info';
}

export type NotificationCategory = 'cotisation' | 'info' | 'discussion' | 'system';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  category: NotificationCategory;
  time: string;
  read: boolean;
  targetPage: PageId;
  targetChatId?: number;
  relatedCotisationId?: number;
}

export type GalleryCategory = 'gala' | 'retrouvailles' | 'mentorat' | 'solidarite';

export interface GalleryPhoto {
  id: number;
  title: string;
  event: string;
  date: string;
  location: string;
  category: GalleryCategory;
  imageUrl: string;
  caption: string;
  author: string;
  promo: string;
  likes: number;
  liked?: boolean;
}

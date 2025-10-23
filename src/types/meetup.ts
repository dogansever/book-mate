import { User } from './user';
import { Book } from './book';

export interface MeetupMember {
  id: string;
  userId: string;
  user: User;
  joinedAt: string;
  role: 'owner' | 'member';
  status: 'active' | 'left';
}

export interface MeetupMessage {
  id: string;
  meetupId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
  editedAt?: string;
  type: 'text' | 'book_recommendation' | 'meeting_reminder' | 'system';
  metadata?: {
    bookId?: string;
    book?: Book;
    meetingDate?: string;
    meetingLocation?: string;
  };
}

export interface MeetingSchedule {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  locationType: 'online' | 'physical' | 'hybrid';
  isRecurring: boolean;
  recurringPattern?: 'weekly' | 'biweekly' | 'monthly';
  createdBy: string;
  attendees: string[]; // user IDs
}

export interface Meetup {
  id: string;
  title: string;
  description: string;
  theme: string; // e.g., "Klasik Edebiyat", "Modern Roman", "Felsefe Kitapları"
  bookId?: string; // Specific book if meetup is about one book
  book?: Book;
  coverImage?: string;
  
  // Member management
  members: MeetupMember[];
  maxMembers: number; // Max 4 as per requirement
  isPrivate: boolean;
  inviteCode?: string; // For private groups
  
  // Meetup details
  createdBy: string;
  owner: User;
  createdAt: string;
  lastActivity: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  
  // Reading progress and goals
  currentBook?: Book;
  readingGoal?: {
    targetPages: number;
    currentPages: number;
    deadline?: string;
  };
  
  // Communication
  messages: MeetupMessage[];
  unreadCount?: number;
  
  // Meeting scheduling
  meetings: MeetingSchedule[];
  nextMeeting?: MeetingSchedule;
  
  // Tags and categories
  tags: string[];
  category: 'book-specific' | 'theme-based' | 'genre-focused' | 'author-focused' | 'general';
  
  // Statistics
  stats: {
    totalBooks: number;
    completedBooks: number;
    totalMeetings: number;
    activeMembers: number;
  };
}

export interface CreateMeetupData {
  title: string;
  description: string;
  theme: string;
  bookId?: string;
  coverImage?: string;
  maxMembers: number; // 2-4 range
  isPrivate: boolean;
  tags: string[];
  category: Meetup['category'];
  initialMessage?: string;
}

export interface UpdateMeetupData {
  title?: string;
  description?: string;
  theme?: string;
  bookId?: string;
  coverImage?: string;
  isPrivate?: boolean;
  tags?: string[];
  status?: Meetup['status'];
}

export interface JoinMeetupData {
  meetupId: string;
  userId: string;
  inviteCode?: string;
  message?: string; // Introduction message
}

export interface CreateMessageData {
  meetupId: string;
  userId: string;
  content: string;
  type: MeetupMessage['type'];
  metadata?: MeetupMessage['metadata'];
}

export interface CreateMeetingData {
  meetupId: string;
  userId?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  locationType: MeetingSchedule['locationType'];
  isRecurring: boolean;
  recurringPattern?: MeetingSchedule['recurringPattern'];
}

export interface MeetupFilters {
  category?: Meetup['category'];
  hasSpace?: boolean; // Has available slots
  tags?: string[];
  theme?: string;
  bookId?: string;
  status?: Meetup['status'];
  isOwner?: boolean;
  isMember?: boolean;
}

export interface MeetupSortOptions {
  field: 'createdAt' | 'lastActivity' | 'memberCount' | 'title';
  direction: 'asc' | 'desc';
}

export interface MeetupStats {
  totalMeetups: number;
  activeMeetups: number;
  ownedMeetups: number;
  joinedMeetups: number;
  totalMessages: number;
  totalMeetings: number;
  favoriteCategories: Array<{
    category: string;
    count: number;
  }>;
}

// Common meetup categories and themes
export const MEETUP_CATEGORIES = [
  { id: 'book-specific', label: 'Belirli Kitap', description: 'Tek bir kitap üzerine odaklanan grup' },
  { id: 'theme-based', label: 'Tema Bazlı', description: 'Belirli bir tema etrafında toplanan grup' },
  { id: 'genre-focused', label: 'Tür Odaklı', description: 'Belirli bir edebiyat türü' },
  { id: 'author-focused', label: 'Yazar Odaklı', description: 'Belirli bir yazarın eserleri' },
  { id: 'general', label: 'Genel', description: 'Genel kitap tartışmaları' }
] as const;

export const POPULAR_THEMES = [
  'Klasik Edebiyat',
  'Modern Roman',
  'Felsefe Kitapları',
  'Bilim Kurgu',
  'Fantastik Edebiyat',
  'Türk Edebiyatı',
  'Dünya Edebiyatı',
  'Psikoloji Kitapları',
  'Tarih Kitapları',
  'Biyografi',
  'Kişisel Gelişim',
  'Şiir',
  'Deneme',
  'Çocuk Kitapları',
  'Gençlik Romanları'
] as const;
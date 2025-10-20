export interface Book {
  id: string;
  googleBooksId?: string;
  isbn?: string;
  title: string;
  authors: string[];
  description?: string;
  publisher?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
  language?: string;
  previewLink?: string;
  infoLink?: string;
}

export interface GoogleBooksVolumeInfo {
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
  readingModes?: {
    text: boolean;
    image: boolean;
  };
  pageCount?: number;
  printType?: string;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  maturityRating?: string;
  allowAnonLogging?: boolean;
  contentVersion?: string;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
  language?: string;
  previewLink?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
}

export interface GoogleBooksItem {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: GoogleBooksVolumeInfo;
  saleInfo?: never;
  accessInfo?: never;
  searchInfo?: {
    textSnippet?: string;
  };
}

export interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBooksItem[];
}

export interface UserBook {
  id: string;
  userId: string;
  bookId: string;
  book?: Book; // Book objesi opsiyonel
  title: string; // Kitap başlığı direkt olarak
  authors: string[]; // Yazarlar direkt olarak
  imageUrl?: string; // Kitap kapağı URL'i
  status: 'want-to-read' | 'currently-reading' | 'read';
  rating?: number;
  review?: string;
  dateAdded: Date; // addedAt yerine dateAdded
  dateStarted?: Date; // startedReadingAt yerine dateStarted
  dateFinished?: Date; // finishedReadingAt yerine dateFinished
  pages?: number; // Sayfa sayısı
  updatedAt?: Date;
  isFavorite?: boolean;
  readingProgress?: number; // 0-100 percentage
  notes?: string[];
}

export interface BookSearchFilters {
  query: string;
  author?: string;
  publisher?: string;
  subject?: string;
  isbn?: string;
  language?: string;
  maxResults?: number;
  startIndex?: number;
}

export interface BookSearchResult {
  books: Book[];
  totalResults: number;
  hasMore: boolean;
}

// Gelişmiş kitap arama ve filtreleme tipleri
export interface SearchCriteria {
  query?: string; // Genel arama terimi
  title?: string; // Kitap adı
  author?: string; // Yazar
  genre?: string; // Tür/kategori
  city?: string; // Şehir
  owner?: string; // Kitap sahibi
  status?: UserBook['status']; // Kitap durumu
  minRating?: number; // Minimum puan
  maxDistance?: number; // Maksimum mesafe (km)
}

export interface SearchFilters {
  sortBy?: 'title' | 'author' | 'rating' | 'dateAdded' | 'distance';
  sortOrder?: 'asc' | 'desc';
  includeAvailableOnly?: boolean; // Sadece uygun kitaplar
  includeNearbyOnly?: boolean; // Sadece yakındaki kullanıcılar
}

export interface SearchResultItem {
  userBook: UserBook;
  owner: {
    id: string;
    displayName: string;
    city?: string;
    avatar?: string;
  };
  distance?: number; // Mesafe (km)
  matchScore?: number; // Arama skoru (0-1)
}

export interface BookSearchResponse {
  results: SearchResultItem[];
  totalResults: number;
  appliedFilters: SearchCriteria & SearchFilters;
  nearbyResults?: SearchResultItem[]; // Yakındaki öneriler
}
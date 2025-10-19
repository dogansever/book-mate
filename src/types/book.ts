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
  saleInfo?: any;
  accessInfo?: any;
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
  book: Book;
  status: 'want-to-read' | 'currently-reading' | 'read';
  rating?: number;
  review?: string;
  startedReadingAt?: Date;
  finishedReadingAt?: Date;
  addedAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
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
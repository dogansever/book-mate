import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Book, UserBook, BookSearchFilters, BookSearchResult } from '../types/book';
import { User } from '../types/user';
import { GoogleBooksService } from '../services/googleBooksService';
import { useAuth } from '../hooks/useAuth';

export interface UserBooksContextValue {
  userBooks: UserBook[];
  isLoading: boolean;
  error: string | null;
  searchResults: BookSearchResult | null;
  isSearching: boolean;
  searchError: string | null;
  addBook: (book: Book, status?: UserBook['status']) => Promise<UserBook>;
  updateBookStatus: (userBookId: string, status: UserBook['status']) => Promise<void>;
  updateBookRating: (userBookId: string, rating: number, review?: string) => Promise<void>;
  removeBook: (userBookId: string) => Promise<void>;
  searchBooks: (filters: BookSearchFilters) => Promise<void>;
  searchByISBN: (isbn: string) => Promise<Book | null>;
  clearSearchResults: () => void;
  getUserBookByBookId: (bookId: string) => UserBook | undefined;
  getBooksByStatus: (status: UserBook['status']) => UserBook[];
  getAllUsers: () => Promise<User[]>;
  getUserBooks: (userId: string) => Promise<UserBook[]>;
  getReadingStats: () => {
    totalBooks: number;
    readBooks: number;
    currentlyReading: number;
    wantToRead: number;
    averageRating: number;
    totalPages: number;
  };
}

const UserBooksContext = createContext<UserBooksContextValue | undefined>(undefined);

// Mock user ID - In a real app, this would come from auth context
const MOCK_USER_ID = 'user-1';

interface UserBooksProviderProps {
  children: ReactNode;
}

export const UserBooksProvider: React.FC<UserBooksProviderProps> = ({ 
  children
}) => {
  const { state } = useAuth();
  const userId = state.user?.id || MOCK_USER_ID; // Auth'den user ID al veya fallback
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<BookSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Initialize with some test books for the current user
  useEffect(() => {
    console.log('🔄 UserBooksContext useEffect - userId:', userId, 'userBooks.length:', userBooks.length);
    if (userId) { // userId varsa kitapları kontrol et
      // Mevcut kitapların userId'si yanlışsa temizle
      const hasWrongUserId = userBooks.some(book => book.userId !== userId.toString());
      if (hasWrongUserId || userBooks.length === 0) {
        console.log('✅ Test kitapları yeniden oluşturuluyor, userId:', userId);
        const testBooks: UserBook[] = [
        {
          id: 'ub-test-1',
          userId: userId, // Dynamic user ID kullan
          bookId: 'test-book-1',
          title: 'Harry Potter ve Felsefe Taşı',
          authors: ['J.K. Rowling'],
          imageUrl: 'https://example.com/harry-potter.jpg',
          status: 'read',
          rating: 5,
          dateAdded: new Date('2024-01-10'),
          dateStarted: new Date('2024-01-12'),
          dateFinished: new Date('2024-01-25'),
          pages: 320
        },
        {
          id: 'ub-test-2',
          userId: userId, // Dynamic user ID kullan
          bookId: 'test-book-2',
          title: 'Benim Adım Kırmızı',
          authors: ['Orhan Pamuk'],
          imageUrl: 'https://example.com/benim-adim-kirmizi.jpg',
          status: 'currently-reading',
          dateAdded: new Date('2024-02-01'),
          dateStarted: new Date('2024-02-03'),
          pages: 560
        }
      ];
      console.log('📚 Test kitapları yeniden oluşturuldu:', testBooks);
      setUserBooks(testBooks);
      }
    }
  }, [userId, userBooks]);

  const addBook = useCallback(async (book: Book, status: UserBook['status'] = 'want-to-read'): Promise<UserBook> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if book already exists for this user
      const existingBook = userBooks.find(ub => ub.bookId === book.id);
      
      if (existingBook) {
        throw new Error('Bu kitap zaten kütüphanenizde mevcut.');
      }

      const newUserBook: UserBook = {
        id: `ub-${userId}-${Date.now()}`,
        userId,
        bookId: book.id,
        title: book.title,
        authors: book.authors,
        imageUrl: book.imageLinks?.thumbnail,
        status: status || 'want-to-read',
        dateAdded: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
      };
      
      setUserBooks(prev => [...prev, newUserBook]);
      return newUserBook;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kitap eklenirken bir hata oluştu.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, userBooks]);

  const updateBookStatus = useCallback(async (userBookId: string, status: UserBook['status']) => {
    try {
      setIsLoading(true);
      setError(null);

      setUserBooks(prev => prev.map(ub => {
        if (ub.id === userBookId) {
          const updates: Partial<UserBook> = {
            status,
            updatedAt: new Date(),
          };

          if (status === 'currently-reading' && ub.status !== 'currently-reading') {
            updates.dateStarted = new Date();
          }

          if (status === 'read' && ub.status !== 'read') {
            updates.dateFinished = new Date();
            updates.readingProgress = 100;
          }

          return { ...ub, ...updates };
        }
        return ub;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kitap durumu güncellenirken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBookRating = useCallback(async (userBookId: string, rating: number, review?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      setUserBooks(prev => prev.map(ub => {
        if (ub.id === userBookId) {
          return {
            ...ub,
            rating: rating === 0 ? undefined : rating,
            review,
            updatedAt: new Date(),
          };
        }
        return ub;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kitap puanı güncellenirken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeBook = useCallback(async (userBookId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      setUserBooks(prev => prev.filter(ub => ub.id !== userBookId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kitap kaldırılırken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchBooks = useCallback(async (filters: BookSearchFilters) => {
    try {
      setIsSearching(true);
      setSearchError(null);

      const results = await GoogleBooksService.searchBooks(filters);
      setSearchResults(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kitap arama sırasında bir hata oluştu.';
      setSearchError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const searchByISBN = useCallback(async (isbn: string): Promise<Book | null> => {
    try {
      setIsSearching(true);
      setSearchError(null);

      // Search by ISBN using the regular search function
      const results = await GoogleBooksService.searchBooks({ query: '', isbn, maxResults: 1 });
      return results.books.length > 0 ? results.books[0] : null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ISBN ile arama sırasında bir hata oluştu.';
      setSearchError(errorMessage);
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearchResults = useCallback(() => {
    setSearchResults(null);
    setSearchError(null);
  }, []);

  const getUserBookByBookId = useCallback((bookId: string) => {
    return userBooks.find(ub => ub.bookId === bookId);
  }, [userBooks]);

  const getBooksByStatus = useCallback((status: UserBook['status']) => {
    return userBooks.filter(ub => ub.status === status);
  }, [userBooks]);

  const getReadingStats = useCallback(() => {
    const totalBooks = userBooks.length;
    const readBooks = userBooks.filter(ub => ub.status === 'read').length;
    const currentlyReading = userBooks.filter(ub => ub.status === 'currently-reading').length;
    const wantToRead = userBooks.filter(ub => ub.status === 'want-to-read').length;

    const ratedBooks = userBooks.filter(ub => ub.rating && ub.rating > 0);
    const averageRating = ratedBooks.length > 0
      ? ratedBooks.reduce((acc, ub) => acc + (ub.rating || 0), 0) / ratedBooks.length
      : 0;

    const totalPages = userBooks.reduce((acc, ub) => acc + (ub.pages || 0), 0);

    return {
      totalBooks,
      readBooks,
      currentlyReading,
      wantToRead,
      averageRating,
      totalPages,
    };
  }, [userBooks]);

  // Mock fonksiyonlar - gerçek uygulamada API'den gelecek
  const getAllUsers = useCallback(async (): Promise<User[]> => {
    // Mock users data
    return [
      {
        id: 'user-2',
        email: 'ali@example.com',
        displayName: 'Ali Demir',
        avatar: '',
        profile: {
          isProfileComplete: true,
          favoriteGenres: ['Roman', 'Bilim Kurgu'],
          favoriteAuthors: [],
          interests: [],
          readingGoal: 24,
          bio: 'Kitap tutkunu'
        },
        createdAt: new Date('2024-01-15'),
        lastLoginAt: new Date()
      },
      {
        id: 'user-3',
        email: 'zehra@example.com',
        displayName: 'Zehra Kaya',
        avatar: '',
        profile: {
          isProfileComplete: true,
          favoriteGenres: ['Klasik', 'Tarih'],
          favoriteAuthors: [],
          interests: [],
          readingGoal: 36,
          bio: 'Edebiyat meraklısı'
        },
        createdAt: new Date('2024-02-10'),
        lastLoginAt: new Date()
      }
    ];
  }, []);

  const getUserBooks = useCallback(async (targetUserId: string): Promise<UserBook[]> => {
    // Mock user books - gerçek uygulamada API'den gelecek
    if (targetUserId === 'user-2') {
      return [
        {
          id: 'ub-ali-1',
          userId: 'user-2',
          bookId: 'book-ali-1',
          title: 'Suç ve Ceza',
          authors: ['Fyodor Dostoyevski'],
          imageUrl: 'https://example.com/crime-punishment.jpg',
          status: 'read',
          rating: 5,
          review: 'Muhteşem bir klasik',
          dateAdded: new Date('2024-01-20'),
          dateStarted: new Date('2024-01-25'),
          dateFinished: new Date('2024-02-15'),
          pages: 624
        },
        {
          id: 'ub-ali-2',
          userId: 'user-2',
          bookId: 'book-ali-2',
          title: 'Dune',
          authors: ['Frank Herbert'],
          imageUrl: 'https://example.com/dune.jpg',
          status: 'currently-reading',
          dateAdded: new Date('2024-02-20'),
          dateStarted: new Date('2024-02-22'),
          pages: 896
        }
      ];
    } else if (targetUserId === 'user-3') {
      return [
        {
          id: 'ub-zehra-1',
          userId: 'user-3',
          bookId: 'book-zehra-1',
          title: 'Madame Bovary',
          authors: ['Gustave Flaubert'],
          imageUrl: 'https://example.com/madame-bovary.jpg',
          status: 'read',
          rating: 4,
          review: 'Harika bir realizm örneği',
          dateAdded: new Date('2024-01-10'),
          dateStarted: new Date('2024-01-12'),
          dateFinished: new Date('2024-01-30'),
          pages: 374
        },
        {
          id: 'ub-zehra-2',
          userId: 'user-3',
          bookId: 'book-zehra-2',
          title: 'Osmanlı Tarihi',
          authors: ['Halil İnalcık'],
          imageUrl: 'https://example.com/ottoman-history.jpg',
          status: 'want-to-read',
          dateAdded: new Date('2024-02-25'),
          pages: 512
        }
      ];
    }
    return [];
  }, []);

  const value: UserBooksContextValue = {
    userBooks,
    isLoading,
    error,
    searchResults,
    isSearching,
    searchError,
    addBook,
    updateBookStatus,
    updateBookRating,
    removeBook,
    searchBooks,
    searchByISBN,
    clearSearchResults,
    getUserBookByBookId,
    getBooksByStatus,
    getAllUsers,
    getUserBooks,
    getReadingStats,
  };

  return (
    <UserBooksContext.Provider value={value}>
      {children}
    </UserBooksContext.Provider>
  );
};

export const useUserBooks = (): UserBooksContextValue => {
  const context = useContext(UserBooksContext);
  if (context === undefined) {
    throw new Error('useUserBooks must be used within a UserBooksProvider');
  }
  return context;
};
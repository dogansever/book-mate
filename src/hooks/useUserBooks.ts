import { useState, useCallback } from 'react';
import { Book, UserBook, BookSearchFilters, BookSearchResult } from '../types/book';
import { GoogleBooksService } from '../services/googleBooksService';

export interface UseUserBooksReturn {
  userBooks: UserBook[];
  isLoading: boolean;
  error: string | null;
  searchResults: BookSearchResult | null;
  isSearching: boolean;
  searchError: string | null;
  addBook: (book: Book, status?: UserBook['status']) => Promise<void>;
  updateBookStatus: (userBookId: string, status: UserBook['status']) => Promise<void>;
  updateBookRating: (userBookId: string, rating: number, review?: string) => Promise<void>;
  removeBook: (userBookId: string) => Promise<void>;
  searchBooks: (filters: BookSearchFilters) => Promise<void>;
  searchByISBN: (isbn: string) => Promise<Book | null>;
  clearSearchResults: () => void;
  getUserBookByBookId: (bookId: string) => UserBook | undefined;
  getBooksByStatus: (status: UserBook['status']) => UserBook[];
  getReadingStats: () => {
    totalBooks: number;
    readBooks: number;
    currentlyReading: number;
    wantToRead: number;
    averageRating: number;
    totalPages: number;
  };
}

// Mock user ID - In a real app, this would come from auth context
const MOCK_USER_ID = 'user-1';

export const useUserBooks = (userId: string = MOCK_USER_ID): UseUserBooksReturn => {
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<BookSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const addBook = useCallback(async (book: Book, status: UserBook['status'] = 'want-to-read') => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if book already exists for this user
      const existingBook = userBooks.find(ub => ub.book.id === book.id);
      if (existingBook) {
        throw new Error('Bu kitap zaten kütüphanenizde mevcut.');
      }

      const newUserBook: UserBook = {
        id: `user-book-${Date.now()}-${Math.random()}`,
        userId,
        bookId: book.id,
        book,
        status,
        addedAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
      };

      setUserBooks(prev => [...prev, newUserBook]);
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
            updates.startedReadingAt = new Date();
          }

          if (status === 'read' && ub.status !== 'read') {
            updates.finishedReadingAt = new Date();
            updates.readingProgress = 100;
          }

          return { ...ub, ...updates };
        }
        return ub;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kitap durumu güncellenirken bir hata oluştu.';
      setError(errorMessage);
      throw err;
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
            rating,
            review,
            updatedAt: new Date(),
          };
        }
        return ub;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kitap değerlendirmesi güncellenirken bir hata oluştu.';
      setError(errorMessage);
      throw err;
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
      throw err;
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
      const errorMessage = err instanceof Error ? err.message : 'Kitap araması sırasında bir hata oluştu.';
      setSearchError(errorMessage);
      throw err;
    } finally {
      setIsSearching(false);
    }
  }, []);

  const searchByISBN = useCallback(async (isbn: string): Promise<Book | null> => {
    try {
      setIsSearching(true);
      setSearchError(null);

      if (!GoogleBooksService.isValidISBN(isbn)) {
        throw new Error('Geçersiz ISBN formatı. Lütfen 10 veya 13 haneli geçerli bir ISBN girin.');
      }

      return await GoogleBooksService.searchByISBN(isbn);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ISBN araması sırasında bir hata oluştu.';
      setSearchError(errorMessage);
      throw err;
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearchResults = useCallback(() => {
    setSearchResults(null);
    setSearchError(null);
  }, []);

  const getUserBookByBookId = useCallback((bookId: string) => {
    return userBooks.find(ub => ub.book.id === bookId);
  }, [userBooks]);

  const getBooksByStatus = useCallback((status: UserBook['status']) => {
    return userBooks.filter(ub => ub.status === status);
  }, [userBooks]);

  const getReadingStats = useCallback(() => {
    const totalBooks = userBooks.length;
    const readBooks = userBooks.filter(ub => ub.status === 'read').length;
    const currentlyReading = userBooks.filter(ub => ub.status === 'currently-reading').length;
    const wantToRead = userBooks.filter(ub => ub.status === 'want-to-read').length;
    
    const ratingsSum = userBooks.reduce((sum, ub) => sum + (ub.rating || 0), 0);
    const ratedBooksCount = userBooks.filter(ub => ub.rating && ub.rating > 0).length;
    const averageRating = ratedBooksCount > 0 ? ratingsSum / ratedBooksCount : 0;
    
    const totalPages = userBooks.reduce((sum, ub) => sum + (ub.book.pageCount || 0), 0);

    return {
      totalBooks,
      readBooks,
      currentlyReading,
      wantToRead,
      averageRating,
      totalPages,
    };
  }, [userBooks]);

  return {
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
    getReadingStats,
  };
};
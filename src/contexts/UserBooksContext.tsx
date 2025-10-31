import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Book, UserBook, BookSearchFilters, BookSearchResult } from '../types/book';
import { User } from '../types/user';
import { GoogleBooksService } from '../services/googleBooksService';
import { BookApiService } from '../services/bookApiService';
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

  // API'den kullanıcının kitaplarını yükle
  const loadUserBooks = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 UserBooksContext API\'den kitaplar yükleniyor, userId:', userId);
      
      const books = await BookApiService.getUserBooks(userId);
      console.log('📚 API\'den yüklenen kitaplar:', books.length, books);
      setUserBooks(books);
    } catch (err) {
      console.error('❌ Kitaplar yüklenirken hata:', err);
      setError(err instanceof Error ? err.message : 'Kitaplar yüklenirken hata oluştu');
      // Hata durumunda boş array set et
      setUserBooks([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Component mount olduğunda ve userId değiştiğinde kitapları yükle
  useEffect(() => {
    loadUserBooks();
  }, [loadUserBooks]);

  const addBook = useCallback(async (book: Book, status: UserBook['status'] = 'want-to-read'): Promise<UserBook> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if book already exists for this user
      const existingBook = userBooks.find(ub => ub.bookId === book.id);
      
      if (existingBook) {
        throw new Error('Bu kitap zaten kütüphanenizde mevcut.');
      }

      const newUserBookData: Omit<UserBook, 'id'> = {
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
      
      // API'ye kaydet
      const savedBook = await BookApiService.addUserBook(newUserBookData);
      
      // Local state'i güncelle
      setUserBooks(prev => [...prev, savedBook]);
      return savedBook;
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

      const book = userBooks.find(ub => ub.id === userBookId);
      if (!book) {
        throw new Error('Kitap bulunamadı');
      }

      const updates: Partial<UserBook> = {
        status,
        updatedAt: new Date(),
      };

      if (status === 'currently-reading' && book.status !== 'currently-reading') {
        updates.dateStarted = new Date();
      }

      if (status === 'read' && book.status !== 'read') {
        updates.dateFinished = new Date();
        updates.readingProgress = 100;
      }

      // API'yi güncelle
      const updatedBook = await BookApiService.updateUserBook(userBookId, updates);
      
      // Local state'i güncelle
      setUserBooks(prev => prev.map(ub => 
        ub.id === userBookId ? updatedBook : ub
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kitap durumu güncellenirken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userBooks]);

  const updateBookRating = useCallback(async (userBookId: string, rating: number, review?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const updates = {
        rating: rating === 0 ? undefined : rating,
        review,
        updatedAt: new Date(),
      };

      // API'yi güncelle
      const updatedBook = await BookApiService.updateUserBook(userBookId, updates);
      
      // Local state'i güncelle
      setUserBooks(prev => prev.map(ub => 
        ub.id === userBookId ? updatedBook : ub
      ));
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

      // API'den sil
      await BookApiService.deleteUserBook(userBookId);
      
      // Local state'den kaldır
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

  // API'den tüm kullanıcıları getir
  const getAllUsers = useCallback(async (): Promise<User[]> => {
    try {
      return await BookApiService.getUsers();
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  }, []);

  const getUserBooks = useCallback(async (targetUserId: string): Promise<UserBook[]> => {
    try {
      return await BookApiService.getUserBooks(targetUserId);
    } catch (error) {
      console.error('Failed to fetch user books:', error);
      return [];
    }
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

// eslint-disable-next-line react-refresh/only-export-components
export const useUserBooks = (): UserBooksContextValue => {
  const context = useContext(UserBooksContext);
  if (context === undefined) {
    throw new Error('useUserBooks must be used within a UserBooksProvider');
  }
  return context;
};
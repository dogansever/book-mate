import { useState, useCallback, useEffect } from 'react';
import { Book, UserBook, BookSearchFilters, BookSearchResult } from '../types/book';
import { GoogleBooksService } from '../services/googleBooksService';
import { BookApiService } from '../services/bookApiService';

export interface UseUserBooksReturn {
  userBooks: UserBook[];
  isLoading: boolean;
  error: string | null;
  searchResults: BookSearchResult | null;
  isSearching: boolean;
  searchError: string | null;
  addBook: (book: Book, status?: UserBook['status']) => Promise<UserBook>;
  addBookToLibrary: (book: Book, status?: UserBook['status']) => Promise<UserBook>;
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

  // API'den kullanıcının kitaplarını yükle
  const loadUserBooks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const books = await BookApiService.getUserBooks(userId);
      setUserBooks(books);
    } catch (err) {
      console.error('Failed to load user books:', err);
      setError(err instanceof Error ? err.message : 'Kitaplar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Component mount olduğunda kitapları yükle
  useEffect(() => {
    loadUserBooks();
  }, [loadUserBooks]);

  const addBook = useCallback(async (book: Book, status: UserBook['status'] = 'want-to-read'): Promise<UserBook> => {
    console.log('📚 useUserBooks addBook çağrıldı:', { bookTitle: book.title, bookId: book.id, status });
    console.log('👤 Kullanıcı ID:', userId);
    console.log('📖 Mevcut kitaplar:', userBooks.length);
    
    try {
      setIsLoading(true);
      setError(null);

      // Check if book already exists for this user
      const existingBook = userBooks.find(ub => ub.bookId === book.id);
      console.log('🔍 Kitap zaten var mı?', !!existingBook);
      
      if (existingBook) {
        console.log('⚠️ Kitap zaten mevcut:', existingBook);
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

      console.log('📝 Yeni UserBook oluşturuluyor:', newUserBookData);
      
      // API'ye kaydet
      const savedBook = await BookApiService.addUserBook(newUserBookData);
      
      // Local state'i güncelle
      setUserBooks(prev => {
        console.log('🔄 UserBooks state güncelleniyor. Önceki:', prev.length);
        const newState = [...prev, savedBook];
        console.log('🔄 UserBooks state güncellendi. Sonraki:', newState.length);
        return newState;
      });
      
      console.log('✅ addBook tamamlandı');
      return savedBook;
    } catch (err) {
      console.error('❌ addBook hatası:', err);
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
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userBooks]);

  const updateBookRating = useCallback(async (userBookId: string, rating: number, review?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const updates = {
        rating,
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

      // API'den sil
      await BookApiService.deleteUserBook(userBookId);
      
      // Local state'den kaldır
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
    
    const ratingsSum = userBooks.reduce((sum, ub) => sum + (ub.rating || 0), 0);
    const ratedBooksCount = userBooks.filter(ub => ub.rating && ub.rating > 0).length;
    const averageRating = ratedBooksCount > 0 ? ratingsSum / ratedBooksCount : 0;
    
    const totalPages = userBooks.reduce((sum, ub) => sum + (ub.pages || 0), 0);

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
    addBookToLibrary: addBook, // Alias for import compatibility
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
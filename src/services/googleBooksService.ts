import { Book, GoogleBooksResponse, GoogleBooksItem, BookSearchFilters, BookSearchResult } from '../types/book';

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1';

export class GoogleBooksService {
  private static extractISBN(identifiers: Array<{ type: string; identifier: string }> = []): string | undefined {
    const isbn13 = identifiers.find(id => id.type === 'ISBN_13');
    const isbn10 = identifiers.find(id => id.type === 'ISBN_10');
    return isbn13?.identifier || isbn10?.identifier;
  }

  private static mapGoogleBookToBook(item: GoogleBooksItem): Book {
    const { volumeInfo } = item;
    
    return {
      id: item.id,
      googleBooksId: item.id,
      isbn: this.extractISBN(volumeInfo.industryIdentifiers),
      title: volumeInfo.title || '',
      authors: volumeInfo.authors || [],
      description: volumeInfo.description,
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories,
      averageRating: volumeInfo.averageRating,
      ratingsCount: volumeInfo.ratingsCount,
      imageLinks: volumeInfo.imageLinks,
      language: volumeInfo.language,
      previewLink: volumeInfo.previewLink,
      infoLink: volumeInfo.infoLink,
    };
  }

  static async searchBooks(filters: BookSearchFilters): Promise<BookSearchResult> {
    try {
      const { query, author, publisher, subject, isbn, language, maxResults = 10, startIndex = 0 } = filters;
      
      // Build search query
      let searchQuery = query;
      
      if (isbn) {
        searchQuery = `isbn:${isbn}`;
      } else {
        if (author) {
          searchQuery += `+inauthor:${author}`;
        }
        if (publisher) {
          searchQuery += `+inpublisher:${publisher}`;
        }
        if (subject) {
          searchQuery += `+subject:${subject}`;
        }
      }

      const params = new URLSearchParams({
        q: searchQuery,
        maxResults: maxResults.toString(),
        startIndex: startIndex.toString(),
        printType: 'books',
        ...(language && { langRestrict: language }),
      });

      const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes?${params}`);
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }

      const data: GoogleBooksResponse = await response.json();

      const books = data.items ? data.items.map(item => this.mapGoogleBookToBook(item)) : [];

      return {
        books,
        totalResults: data.totalItems,
        hasMore: startIndex + maxResults < data.totalItems,
      };
    } catch (error) {
      console.error('Error searching books:', error);
      throw new Error('Kitap araması sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }

  static async getBookById(bookId: string): Promise<Book | null> {
    try {
      const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes/${bookId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Google Books API error: ${response.status}`);
      }

      const item: GoogleBooksItem = await response.json();
      return this.mapGoogleBookToBook(item);
    } catch (error) {
      console.error('Error fetching book by ID:', error);
      throw new Error('Kitap bilgileri alınırken bir hata oluştu.');
    }
  }

  static async searchByISBN(isbn: string): Promise<Book | null> {
    try {
      const result = await this.searchBooks({ query: '', isbn, maxResults: 1 });
      return result.books.length > 0 ? result.books[0] : null;
    } catch (error) {
      console.error('Error searching by ISBN:', error);
      throw new Error('ISBN ile kitap araması sırasında bir hata oluştu.');
    }
  }

  static isValidISBN(isbn: string): boolean {
    // Remove hyphens and spaces
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    // Check if it's 10 or 13 digits
    if (!/^\d{10}$/.test(cleanISBN) && !/^\d{13}$/.test(cleanISBN)) {
      return false;
    }

    if (cleanISBN.length === 10) {
      return this.validateISBN10(cleanISBN);
    } else {
      return this.validateISBN13(cleanISBN);
    }
  }

  private static validateISBN10(isbn: string): boolean {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(isbn[i]) * (10 - i);
    }
    const checkDigit = isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
    return (sum + checkDigit) % 11 === 0;
  }

  private static validateISBN13(isbn: string): boolean {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbn[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = parseInt(isbn[12]);
    return (sum + checkDigit) % 10 === 0;
  }

  static formatISBN(isbn: string): string {
    const cleanISBN = isbn.replace(/[-\s]/g, '');
    
    if (cleanISBN.length === 10) {
      return `${cleanISBN.slice(0, 1)}-${cleanISBN.slice(1, 6)}-${cleanISBN.slice(6, 9)}-${cleanISBN.slice(9)}`;
    } else if (cleanISBN.length === 13) {
      return `${cleanISBN.slice(0, 3)}-${cleanISBN.slice(3, 4)}-${cleanISBN.slice(4, 9)}-${cleanISBN.slice(9, 12)}-${cleanISBN.slice(12)}`;
    }
    
    return isbn;
  }
}

// Export singleton instance
export const googleBooksService = new GoogleBooksService();
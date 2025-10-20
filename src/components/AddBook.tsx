import React, { useState } from 'react';
import { Book, UserBook } from '../types/book';
import { GoogleBooksService } from '../services/googleBooksService';
import { useUserBooks } from '../contexts/UserBooksContext';
import './AddBook.css';

interface AddBookProps {
  onBookAdded?: (userBook: UserBook) => void;
  onClose?: () => void;
}

const AddBook: React.FC<AddBookProps> = ({ onBookAdded, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isISBNSearch, setIsISBNSearch] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<UserBook['status']>('want-to-read');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [addedBookIds, setAddedBookIds] = useState<Set<string>>(new Set());
  
  const {
    searchResults,
    isSearching,
    searchError,
    addBook,
    isLoading,
    error,
    searchBooks,
    searchByISBN,
    clearSearchResults,
    getUserBookByBookId,
  } = useUserBooks();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    clearSearchResults();
    setAddedBookIds(new Set()); // Clear recently added books when starting new search

    try {
      if (isISBNSearch) {
        const book = await searchByISBN(searchQuery.trim());
        if (book) {
          // Create a mock search result for consistency
          await searchBooks({ query: '', isbn: searchQuery.trim(), maxResults: 1 });
        }
      } else {
        await searchBooks({ query: searchQuery.trim(), maxResults: 20 });
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleAddBook = async (book: Book) => {
    try {
      setSuccessMessage(''); // Clear any previous success message
      
      const addedUserBook = await addBook(book, selectedStatus);
      
      // Add book ID to the local state to immediately update UI
      setAddedBookIds(prev => new Set([...prev, book.id]));
      
      // Show success message
      setSuccessMessage(`"${book.title}" kitabı kütüphanenize başarıyla eklendi!`);
      
      // Call the callback
      onBookAdded?.(addedUserBook);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Kitap ekleme hatası:', err);
      setSuccessMessage(''); // Clear success message on error
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    
    // Auto-detect ISBN format
    const cleanValue = value.replace(/[-\s]/g, '');
    const isISBN = /^\d{10,13}$/.test(cleanValue);
    setIsISBNSearch(isISBN);
  };

  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return 'Yazar belirtilmemiş';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return authors.join(' ve ');
    return `${authors.slice(0, -1).join(', ')} ve ${authors[authors.length - 1]}`;
  };

  const getStatusText = (status: UserBook['status']) => {
    const statusMap = {
      'want-to-read': 'Okunacak',
      'currently-reading': 'Okunuyor',
      'read': 'Okundu'
    };
    return statusMap[status];
  };

  const getStatusIcon = (status: UserBook['status']) => {
    const iconMap = {
      'want-to-read': '📚',
      'currently-reading': '📖',
      'read': '✅'
    };
    return iconMap[status];
  };

  return (
    <div className="add-book">
      <div className="add-book-header">
        <h2>📚 Kitap Ekle</h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={isISBNSearch ? "ISBN kodu girin (örn: 9781234567890)" : "Kitap adı veya yazar adı girin"}
            className="search-input"
            disabled={isSearching}
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={!searchQuery.trim() || isSearching}
          >
            {isSearching ? '🔍 Arıyor...' : '🔍 Ara'}
          </button>
        </div>
        
        <div className="search-type-indicator">
          {isISBNSearch ? (
            <span className="isbn-indicator">
              📊 ISBN Araması
              {searchQuery && !GoogleBooksService.isValidISBN(searchQuery) && (
                <span className="isbn-error"> - Geçersiz ISBN formatı</span>
              )}
            </span>
          ) : (
            <span className="text-indicator">📝 Metin Araması</span>
          )}
        </div>

        <div className="status-selector">
          <label htmlFor="status">Kitap durumu:</label>
          <select 
            id="status"
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value as UserBook['status'])}
            className="status-select"
          >
            <option value="want-to-read">{getStatusIcon('want-to-read')} Okunacak</option>
            <option value="currently-reading">{getStatusIcon('currently-reading')} Okunuyor</option>
            <option value="read">{getStatusIcon('read')} Okundu</option>
          </select>
        </div>
      </form>

      {searchError && (
        <div className="error-message">
          ❌ {searchError}
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          ✅ {successMessage}
        </div>
      )}

      {searchResults && (
        <div className="search-results">
          <h3>Arama Sonuçları ({searchResults.totalResults} sonuç bulundu)</h3>
          
          {searchResults.books.length === 0 ? (
            <div className="no-results">
              📭 Arama kriterlerinize uygun kitap bulunamadı.
            </div>
          ) : (
            <div className="books-grid">
              {searchResults.books.map((book) => {
                const existingUserBook = getUserBookByBookId(book.id);
                const isRecentlyAdded = addedBookIds.has(book.id);
                const isAlreadyAdded = existingUserBook || isRecentlyAdded;
                
                return (
                  <div key={book.id} className="book-card">
                    <div className="book-image">
                      {book.imageLinks?.thumbnail ? (
                        <img 
                          src={book.imageLinks.thumbnail} 
                          alt={book.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-book.png';
                          }}
                        />
                      ) : (
                        <div className="book-placeholder">
                          📚
                        </div>
                      )}
                    </div>
                    
                    <div className="book-info">
                      <h4 className="book-title">{book.title}</h4>
                      <p className="book-authors">{formatAuthors(book.authors)}</p>
                      
                      {book.publishedDate && (
                        <p className="book-year">📅 {book.publishedDate}</p>
                      )}
                      
                      {book.pageCount && (
                        <p className="book-pages">📄 {book.pageCount} sayfa</p>
                      )}
                      
                      {book.categories && book.categories.length > 0 && (
                        <div className="book-categories">
                          {book.categories.slice(0, 2).map((category, index) => (
                            <span key={index} className="category-tag">
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {book.averageRating && (
                        <div className="book-rating">
                          ⭐ {book.averageRating.toFixed(1)} 
                          {book.ratingsCount && (
                            <span className="rating-count">({book.ratingsCount})</span>
                          )}
                        </div>
                      )}
                      
                      {book.description && (
                        <p className="book-description">
                          {book.description.substring(0, 150)}
                          {book.description.length > 150 && '...'}
                        </p>
                      )}
                    </div>
                    
                    <div className="book-actions">
                      {isAlreadyAdded ? (
                        <div className="already-added">
                          ✅ Kütüphanende mevcut
                          {existingUserBook && (
                            <span className="book-status">
                              ({getStatusText(existingUserBook.status)})
                            </span>
                          )}
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleAddBook(book)}
                          className="add-book-button"
                          disabled={isLoading}
                        >
                          {isLoading ? '⏳ Ekleniyor...' : `${getStatusIcon(selectedStatus)} Ekle`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {searchResults.hasMore && (
            <div className="load-more">
              <p>Daha fazla sonuç mevcut. Aramanızı daha spesifik hale getirmeyi deneyin.</p>
            </div>
          )}
        </div>
      )}

      <div className="help-section">
        <h4>💡 Arama İpuçları</h4>
        <ul>
          <li><strong>Kitap Adı:</strong> "Serenad", "Harry Potter", "1984" gibi</li>
          <li><strong>Yazar Adı:</strong> "Zülfü Livaneli", "Orhan Pamuk" gibi</li>
          <li><strong>ISBN:</strong> 10 veya 13 haneli kod (örn: 9789750738061)</li>
          <li><strong>Karma Arama:</strong> "Harry Potter Rowling" gibi kombinasyonlar</li>
        </ul>
      </div>
    </div>
  );
};

export default AddBook;
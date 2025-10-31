import React, { useState, useMemo } from 'react';
import { useUserBooks } from '../contexts/UserBooksContext';
import { useBookSwap } from '../contexts/BookSwapContext';
import { useAuth } from '../hooks/useAuth';
import { UserBook } from '../types/book';
import SwapRequestModal from './SwapRequestModal';
import { PlaceholderImages } from '../utils/placeholderImages';
import './BookShelf.css';

interface BookShelfProps {
  onBookClick?: (userBook: UserBook) => void;
  displayMode?: 'shelf' | 'grid';
  maxBooksPerShelf?: number;
  userId?: string; // If provided, shows other user's books with swap options
  showSwapOptions?: boolean;
}

const BookShelf: React.FC<BookShelfProps> = ({ 
  onBookClick, 
  displayMode = 'shelf',
  maxBooksPerShelf = 8,
                                                 showSwapOptions = false
}) => {
  const { state } = useAuth();
  const { canRequestSwap } = useBookSwap();
  const [activeFilter, setActiveFilter] = useState<'all' | UserBook['status']>('all');
  const [selectedBook, setSelectedBook] = useState<UserBook | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTargetBook, setSwapTargetBook] = useState<UserBook | null>(null);
  
  const {
    userBooks,
    isLoading,
    error,
    updateBookStatus,
    updateBookRating,
    getBooksByStatus,
    getReadingStats,
  } = useUserBooks();

  const stats = getReadingStats();

  const filteredBooks = useMemo(() => {
    return activeFilter === 'all' ? userBooks : getBooksByStatus(activeFilter);
  }, [userBooks, activeFilter, getBooksByStatus]);

  // Organize books into shelves
  const shelves = useMemo(() => {
    if (displayMode === 'grid') return [];
    
    const booksPerShelf = maxBooksPerShelf;
    const shelfCount = Math.ceil(filteredBooks.length / booksPerShelf);
    const shelvesList = [];
    
    for (let i = 0; i < shelfCount; i++) {
      const startIndex = i * booksPerShelf;
      const endIndex = startIndex + booksPerShelf;
      const shelfBooks = filteredBooks.slice(startIndex, endIndex);
      shelvesList.push(shelfBooks);
    }
    
    return shelvesList;
  }, [filteredBooks, maxBooksPerShelf, displayMode]);

  const getStatusColor = (status: UserBook['status']) => {
    const colorMap = {
      'want-to-read': '#3498db',
      'currently-reading': '#e67e22', 
      'read': '#27ae60'
    };
    return colorMap[status];
  };

  const handleBookClick = (userBook: UserBook) => {
    setSelectedBook(userBook);
    onBookClick?.(userBook);
  };

  const handleSwapRequest = (userBook: UserBook) => {
    setSwapTargetBook(userBook);
    setShowSwapModal(true);
  };

  const closeSwapModal = () => {
    setShowSwapModal(false);
    setSwapTargetBook(null);
  };

  const handleStatusChange = async (userBookId: string, newStatus: UserBook['status']) => {
    try {
      await updateBookStatus(userBookId, newStatus);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleRatingChange = async (userBookId: string, rating: number) => {
    try {
      await updateBookRating(userBookId, rating);
    } catch (err) {
      console.error('Rating update error:', err);
    }
  };

  const renderStarRating = (userBook: UserBook) => {
    const currentRating = userBook.rating || 0;
    
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star ${star <= currentRating ? 'filled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleRatingChange(userBook.id, star === currentRating ? 0 : star);
            }}
            title={`${star} yıldız`}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  const renderBook = (userBook: UserBook, index: number) => (
    <div
      key={userBook.id}
      className={`book-spine ${userBook.status}`}
      style={{
        '--book-color': getStatusColor(userBook.status),
        '--animation-delay': `${index * 0.1}s`
      } as React.CSSProperties}
      onClick={() => handleBookClick(userBook)}
      title={`${userBook.title} - ${userBook.authors.join(', ')}`}
    >
      <div className="book-spine-content">
        <div className="book-title-spine">{userBook.title}</div>
        <div className="book-author-spine">{userBook.authors[0]}</div>
        {userBook.rating && (
          <div className="book-rating-spine">
            {'⭐'.repeat(userBook.rating)}
          </div>
        )}
      </div>
      <div className="book-status-indicator" />
    </div>
  );

  if (isLoading) {
    return (
      <div className="bookshelf loading">
        <div className="loading-message">📚 Kitap rafınız hazırlanıyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookshelf error">
        <div className="error-message">❌ {error}</div>
      </div>
    );
  }

  return (
    <div className="bookshelf">
      <div className="bookshelf-header">
        <h2>📚 Kitap Rafım</h2>
        
        {stats.totalBooks > 0 && (
          <div className="shelf-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.totalBooks}</span>
              <span className="stat-label">Kitap</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.readBooks}</span>
              <span className="stat-label">Okundu</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.currentlyReading}</span>
              <span className="stat-label">Okunuyor</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.wantToRead}</span>
              <span className="stat-label">Okunacak</span>
            </div>
          </div>
        )}
      </div>

      {userBooks.length === 0 ? (
        <div className="empty-shelf">
          <div className="empty-bookcase">
            <div className="empty-shelf-item"></div>
            <div className="empty-shelf-item"></div>
            <div className="empty-shelf-item"></div>
          </div>
          <div className="empty-message">
            <h3>Rafınız henüz boş</h3>
            <p>İlk kitabınızı ekleyerek kişisel kütüphanenizi oluşturmaya başlayın!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="shelf-controls">
            <div className="shelf-filters">
              <button
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                🎯 Tüm Kitaplar ({userBooks.length})
              </button>
              <button
                className={`filter-btn ${activeFilter === 'read' ? 'active' : ''}`}
                onClick={() => setActiveFilter('read')}
              >
                ✅ Okuduklarım ({stats.readBooks})
              </button>
              <button
                className={`filter-btn ${activeFilter === 'currently-reading' ? 'active' : ''}`}
                onClick={() => setActiveFilter('currently-reading')}
              >
                📖 Okuyorum ({stats.currentlyReading})
              </button>
              <button
                className={`filter-btn ${activeFilter === 'want-to-read' ? 'active' : ''}`}
                onClick={() => setActiveFilter('want-to-read')}
              >
                📚 Okuyacağım ({stats.wantToRead})
              </button>
            </div>
          </div>

          {displayMode === 'shelf' ? (
            <div className="bookcase">
              {shelves.map((shelf, shelfIndex) => (
                <div key={shelfIndex} className="bookshelf-row">
                  <div className="shelf-support left"></div>
                  <div className="shelf-books">
                    {shelf.map((userBook, bookIndex) => 
                      renderBook(userBook, bookIndex)
                    )}
                    {/* Fill empty spaces if shelf is not full */}
                    {Array.from({ length: maxBooksPerShelf - shelf.length }).map((_, emptyIndex) => (
                      <div key={`empty-${emptyIndex}`} className="empty-book-space" />
                    ))}
                  </div>
                  <div className="shelf-support right"></div>
                  <div className="shelf-board"></div>
                </div>
              ))}
              
              {/* Add some decorative elements */}
              <div className="bookcase-base"></div>
            </div>
          ) : (
            <div className="books-grid">
              {filteredBooks.map((userBook) => (
                <div key={userBook.id} className="book-card">
                  <div className="book-cover" onClick={() => handleBookClick(userBook)}>
                    {userBook.imageUrl ? (
                      <img
                        src={userBook.imageUrl || PlaceholderImages.book}
                        alt={userBook.title}
                        onError={(e) => PlaceholderImages.handleImageError(e, 'book')}
                      />
                    ) : (
                      <div className="book-placeholder">📚</div>
                    )}
                    <div 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(userBook.status) }}
                    >
                      {userBook.status === 'read' ? '✅' : 
                       userBook.status === 'currently-reading' ? '📖' : '📚'}
                    </div>
                  </div>
                  <div className="book-info">
                    <h4 className="book-title">{userBook.title}</h4>
                    <p className="book-author">{userBook.authors.join(', ')}</p>
                    {userBook.status === 'read' && renderStarRating(userBook)}
                    
                    {/* Swap Button for other users' books */}
                    {showSwapOptions && 
                     state.user && 
                     userBook.userId !== state.user.id && 
                     canRequestSwap(userBook.bookId, userBook.userId) && (
                      <button 
                        className="swap-request-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwapRequest(userBook);
                        }}
                        title="Takas isteği gönder"
                      >
                        🔄 Takas İste
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="book-modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="book-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedBook(null)}
            >
              ✕
            </button>
            
            <div className="modal-content">
              <div className="modal-book-cover">
                {selectedBook.imageUrl ? (
                  <img
                    src={selectedBook.imageUrl}
                    alt={selectedBook.title}
                  />
                ) : (
                  <div className="book-placeholder">📚</div>
                )}
              </div>
              
              <div className="modal-book-details">
                <h3>{selectedBook.title}</h3>
                <p className="modal-authors">{selectedBook.authors.join(', ')}</p>
                
                {selectedBook.book?.description && (
                  <p className="modal-description">{selectedBook.book.description}</p>
                )}
                
                <div className="modal-actions">
                  <select
                    value={selectedBook.status}
                    onChange={(e) => handleStatusChange(selectedBook.id, e.target.value as UserBook['status'])}
                    className="status-select"
                  >
                    <option value="want-to-read">📚 Okuyacağım</option>
                    <option value="currently-reading">📖 Okuyorum</option>
                    <option value="read">✅ Okudum</option>
                  </select>
                  
                  {selectedBook.status === 'read' && (
                    <div className="modal-rating">
                      <span>Puanım:</span>
                      {renderStarRating(selectedBook)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Swap Request Modal */}
      {showSwapModal && swapTargetBook && (
        <SwapRequestModal
          targetBook={swapTargetBook}
          targetUser={swapTargetBook.userId ? { id: swapTargetBook.userId, displayName: 'Diğer Kullanıcı', email: '' } as never : {} as never}
          onSubmit={async (offeredBookId: string, message: string) => {
            console.log('Takas isteği:', { offeredBookId, message });
            closeSwapModal();
          }}
          onClose={closeSwapModal}
        />
      )}
    </div>
  );
};

export default BookShelf;
import React, { useState, useMemo } from 'react';
import { useUserBooks } from '../contexts/UserBooksContext';
import { UserBook } from '../types/book';
import { PlaceholderImages } from '../utils/placeholderImages';
import './BookLibrary.css';

interface BookLibraryProps {
  onBookClick?: (userBook: UserBook) => void;
}

const BookLibrary: React.FC<BookLibraryProps> = ({ onBookClick }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | UserBook['status']>('all');
  const [sortBy, setSortBy] = useState<'addedAt' | 'title' | 'rating'>('addedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const {
    userBooks,
    isLoading,
    error,
    updateBookStatus,
    updateBookRating,
    removeBook,
    getBooksByStatus,
    getReadingStats,
  } = useUserBooks();

  const stats = getReadingStats();

  const filteredAndSortedBooks = useMemo(() => {
    const filtered = activeFilter === 'all' ? userBooks : getBooksByStatus(activeFilter);
    
    return [...filtered].sort((a, b) => {
      let comparison;
      
      switch (sortBy) {
        case 'title': {
          const titleA = a.title || a.book?.title || '';
          const titleB = b.title || b.book?.title || '';
          comparison = titleA.localeCompare(titleB, 'tr');
          break;
        }
        case 'rating': {
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        }
        case 'addedAt':
        default: {
          comparison = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
          break;
        }
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }, [userBooks, activeFilter, sortBy, sortOrder, getBooksByStatus]);

  const formatAuthors = (authors: string[]) => {
    if (authors.length === 0) return 'Yazar belirtilmemiş';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return authors.join(' ve ');
    return `${authors.slice(0, -1).join(', ')} ve ${authors[authors.length - 1]}`;
  };

  const getStatusIcon = (status: UserBook['status']) => {
    const iconMap = {
      'want-to-read': '📚',
      'currently-reading': '📖',
      'read': '✅'
    };
    return iconMap[status];
  };

  const getStatusColor = (status: UserBook['status']) => {
    const colorMap = {
      'want-to-read': '#3498db',
      'currently-reading': '#e67e22',
      'read': '#27ae60'
    };
    return colorMap[status];
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

  const handleRemoveBook = async (userBookId: string) => {
    if (window.confirm('Bu kitabı kütüphanenizden kaldırmak istediğinizden emin misiniz?')) {
      try {
        await removeBook(userBookId);
      } catch (err) {
        console.error('Remove book error:', err);
      }
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
            onClick={() => handleRatingChange(userBook.id, star === currentRating ? 0 : star)}
            title={`${star} yıldız`}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="book-library loading">
        <div className="loading-message">📚 Kütüphaneniz yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-library error">
        <div className="error-message">❌ {error}</div>
      </div>
    );
  }

  return (
    <div className="book-library">
      <div className="library-header">
        <h2>📚 Kitap Kütüphanem</h2>
        
        {stats.totalBooks > 0 && (
          <div className="library-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.totalBooks}</span>
              <span className="stat-label">Toplam Kitap</span>
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
            {stats.averageRating > 0 && (
              <div className="stat-item">
                <span className="stat-number">{stats.averageRating.toFixed(1)}</span>
                <span className="stat-label">Ort. Puan</span>
              </div>
            )}
          </div>
        )}
      </div>

      {userBooks.length === 0 ? (
        <div className="empty-library">
          <div className="empty-icon">📚</div>
          <h3>Kütüphaneniz henüz boş</h3>
          <p>İlk kitabınızı ekleyerek başlayın!</p>
        </div>
      ) : (
        <>
          <div className="library-controls">
            <div className="filters">
              <button
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                🎯 Tümü ({userBooks.length})
              </button>
              <button
                className={`filter-btn ${activeFilter === 'want-to-read' ? 'active' : ''}`}
                onClick={() => setActiveFilter('want-to-read')}
              >
                📚 Okunacak ({stats.wantToRead})
              </button>
              <button
                className={`filter-btn ${activeFilter === 'currently-reading' ? 'active' : ''}`}
                onClick={() => setActiveFilter('currently-reading')}
              >
                📖 Okunuyor ({stats.currentlyReading})
              </button>
              <button
                className={`filter-btn ${activeFilter === 'read' ? 'active' : ''}`}
                onClick={() => setActiveFilter('read')}
              >
                ✅ Okundu ({stats.readBooks})
              </button>
            </div>

            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'addedAt' | 'title' | 'rating')}
                className="sort-select"
              >
                <option value="addedAt">Eklenme Tarihi</option>
                <option value="title">Kitap Adı</option>
                <option value="rating">Puan</option>
              </select>
              <button
                className="sort-order-btn"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'Artan sıralama' : 'Azalan sıralama'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          <div className="books-grid">
            {filteredAndSortedBooks.map((userBook: UserBook) => (
              <div key={userBook.id} className="user-book-card">
                <div className="book-image" onClick={() => onBookClick?.(userBook)}>
                  {userBook.imageUrl || userBook.book?.imageLinks?.thumbnail ? (
                    <img 
                      src={userBook.imageUrl || userBook.book?.imageLinks?.thumbnail || PlaceholderImages.book} 
                      alt={userBook.title || userBook.book?.title || 'Kitap'}
                      onError={(e) => PlaceholderImages.handleImageError(e, 'book')}
                    />
                  ) : (
                    <div className="book-placeholder">
                      📚
                    </div>
                  )}
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(userBook.status) }}
                  >
                    {getStatusIcon(userBook.status)}
                  </div>
                </div>
                
                <div className="book-content">
                  <div className="book-info">
                    <h4 className="book-title" onClick={() => onBookClick?.(userBook)}>
                      {userBook.title || userBook.book?.title}
                    </h4>
                    <p className="book-authors">{formatAuthors(userBook.authors || userBook.book?.authors || [])}</p>
                    
                    {userBook.book?.publishedDate && (
                      <p className="book-year">📅 {userBook.book.publishedDate}</p>
                    )}
                  </div>

                  <div className="book-user-info">
                    <div className="status-control">
                      <select
                        value={userBook.status}
                        onChange={(e) => handleStatusChange(userBook.id, e.target.value as UserBook['status'])}
                        className="status-select"
                      >
                        <option value="want-to-read">📚 Okunacak</option>
                        <option value="currently-reading">📖 Okunuyor</option>
                        <option value="read">✅ Okundu</option>
                      </select>
                    </div>

                    {userBook.status === 'read' && renderStarRating(userBook)}
                  </div>

                  <div className="book-actions">
                    <button
                      onClick={() => handleRemoveBook(userBook.id)}
                      className="remove-btn"
                      title="Kütüphaneden kaldır"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BookLibrary;
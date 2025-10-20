import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserBooks } from '../contexts/UserBooksContext';
import { useBookSwap } from '../contexts/BookSwapContext';
import { User } from '../types/user';
import { UserBook } from '../types/book';
import SwapRequestModal from './SwapRequestModal';
import './BookDiscovery.css';

interface UserWithBooks extends User {
  books: UserBook[];
  totalBooks: number;
}

const BookDiscovery: React.FC = () => {
  const { state } = useAuth();
  const { getAllUsers, getUserBooks } = useUserBooks();
  const { createSwapRequest, isLoading } = useBookSwap();
  
  const [users, setUsers] = useState<UserWithBooks[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithBooks | null>(null);
  const [selectedBook, setSelectedBook] = useState<UserBook | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'available' | 'read'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsersWithBooks();
  }, []);

  const loadUsersWithBooks = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      
      // Kendi kullanıcımızı hariç tut
      const otherUsers = allUsers.filter(user => user.id !== state.user?.id);
      
      // Her kullanıcının kitaplarını yükle
      const usersWithBooks: UserWithBooks[] = await Promise.all(
        otherUsers.map(async (user) => {
          const userBooks = await getUserBooks(user.id);
          return {
            ...user,
            books: userBooks, // Tüm kitapları göster
            totalBooks: userBooks.length
          };
        })
      );

      // En az 1 kitabı olan kullanıcıları göster
      setUsers(usersWithBooks.filter(user => user.books.length > 0));
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRequest = (book: UserBook, owner: UserWithBooks) => {
    setSelectedBook(book);
    setSelectedUser(owner);
    setShowSwapModal(true);
  };

  const handleSwapRequestSubmit = async (offeredBookId: string, message: string) => {
    if (!selectedBook || !selectedUser) return;

    try {
      await createSwapRequest({
        requestedBookId: selectedBook.bookId || selectedBook.id,
        offeredBookId,
        message,
        ownerId: selectedUser.id
      });
      
      setShowSwapModal(false);
      setSelectedBook(null);
      setSelectedUser(null);
      
      // Başarı mesajı göster
      alert('Takas isteği başarıyla gönderildi! 🎉');
    } catch (error) {
      console.error('Takas isteği gönderilirken hata:', error);
      alert('Takas isteği gönderilirken bir hata oluştu.');
    }
  };

  const filteredUsers = users.filter(user => {
    // Arama filtresi
    const matchesSearch = searchTerm === '' || 
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.books.some(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    // Durum filtresi
    const matchesFilter = filterBy === 'all' || 
      user.books.some(book => 
        filterBy === 'available' ? book.status === 'want-to-read' || book.status === 'currently-reading' :
        filterBy === 'read' ? book.status === 'read' : true
      );

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: UserBook['status']) => {
    const statusConfig = {
      'want-to-read': { icon: '📋', label: 'Okunacak', className: 'status-want' },
      'currently-reading': { icon: '📖', label: 'Okuyor', className: 'status-reading' },
      'read': { icon: '✅', label: 'Okudu', className: 'status-read' }
    };

    const config = statusConfig[status];
    return (
      <span className={`book-status-badge ${config.className}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="book-discovery">
        <div className="discovery-header">
          <h2>🌍 Kitap Keşfi</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Kitap severler ve kitapları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="book-discovery">
      <div className="discovery-header">
        <h2>🌍 Kitap Keşfi</h2>
        <p>Diğer kullanıcıların kitaplarını keşfedin ve takas istekleri gönderin</p>
      </div>

      <div className="discovery-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Kullanıcı veya kitap ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterBy === 'all' ? 'active' : ''}`}
            onClick={() => setFilterBy('all')}
          >
            📚 Tümü
          </button>
          <button
            className={`filter-btn ${filterBy === 'available' ? 'active' : ''}`}
            onClick={() => setFilterBy('available')}
          >
            🔄 Takas Edilebilir
          </button>
          <button
            className={`filter-btn ${filterBy === 'read' ? 'active' : ''}`}
            onClick={() => setFilterBy('read')}
          >
            ✅ Okunanlar
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Hiç kullanıcı bulunamadı</h3>
          <p>
            {searchTerm ? 
              'Arama kriterlerinize uygun kullanıcı bulunamadı.' :
              'Henüz başka kullanıcı yok veya kimse kitap paylaşmamış.'
            }
          </p>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.displayName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <h3>{user.displayName}</h3>
                  <p className="user-stats">
                    📚 {user.totalBooks} kitap
                    {user.profile?.favoriteGenres && (
                      <span className="favorite-genre">
                        • {user.profile.favoriteGenres[0]}
                      </span>
                    )}
                  </p>
                  {user.profile?.location && (
                    <p className="user-location">📍 {user.profile.location}</p>
                  )}
                </div>
              </div>

              <div className="user-books">
                <h4>📖 Kitapları ({user.books.length})</h4>
                <div className="books-list">
                  {user.books.slice(0, 6).map(book => (
                    <div key={book.id} className="book-item">
                      <div className="book-cover">
                        {book.imageUrl ? (
                          <img src={book.imageUrl} alt={book.title} />
                        ) : (
                          <div className="book-placeholder">📚</div>
                        )}
                      </div>
                      <div className="book-details">
                        <h5>{book.title}</h5>
                        <p>{book.authors.join(', ')}</p>
                        <div className="book-meta">
                          {getStatusBadge(book.status)}
                          {book.rating && book.status === 'read' && (
                            <span className="book-rating">
                              {'⭐'.repeat(book.rating)}
                            </span>
                          )}
                        </div>
                        <small>Eklenme: {formatDate(book.dateAdded)}</small>
                      </div>
                      <div className="book-actions">
                        <button
                          onClick={() => handleSwapRequest(book, user)}
                          disabled={isLoading}
                          className="swap-request-btn"
                          title="Takas isteği gönder"
                        >
                          🔄 Takas İste
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {user.books.length > 6 && (
                  <div className="more-books">
                    <span>+{user.books.length - 6} kitap daha</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Swap Request Modal */}
      {showSwapModal && selectedBook && selectedUser && (
        <SwapRequestModal
          targetBook={selectedBook}
          targetUser={selectedUser}
          onSubmit={handleSwapRequestSubmit}
          onClose={() => {
            setShowSwapModal(false);
            setSelectedBook(null);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default BookDiscovery;
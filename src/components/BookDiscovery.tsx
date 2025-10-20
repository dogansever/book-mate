import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBookSwap } from '../contexts/BookSwapContext';
import { useLocation } from '../hooks/useLocation';
import { UserBook, SearchCriteria, SearchFilters, SearchResultItem } from '../types/book';
import { BookSearchService } from '../services/bookSearchService';
import { getAllMockUsers, getAllMockUserBooks } from '../services/mockDataService';
import SearchFilter from './SearchFilter';
import SwapRequestModal from './SwapRequestModal';
import './BookDiscovery.css';

const BookDiscovery: React.FC = () => {
  const { state } = useAuth();
  const { createSwapRequest, isLoading: swapLoading } = useBookSwap();
  const { location, requestLocation, isLoading: locationLoading } = useLocation();
  
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [nearbyResults, setNearbyResults] = useState<SearchResultItem[]>([]);
  const [selectedBook, setSelectedBook] = useState<UserBook | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const performInitialSearch = useCallback(() => {
    const allUsers = getAllMockUsers();
    const allBooks = getAllMockUserBooks();
    
    if (!state.user?.id) return;

    const initialResults = BookSearchService.searchBooks(
      allBooks,
      allUsers,
      { query: '' }, // Boş arama - tüm kitaplar
      { sortBy: 'rating', sortOrder: 'desc' },
      state.user.id
    );

    setSearchResults(initialResults.results.slice(0, 20)); // İlk 20 sonuç
    setNearbyResults(initialResults.nearbyResults || []);
  }, [state.user?.id, setSearchResults, setNearbyResults]);

  useEffect(() => {
    // Başlangıçta popüler kitapları göster
    performInitialSearch();
  }, [performInitialSearch]);

  const handleSearch = (criteria: SearchCriteria, filters: SearchFilters) => {
    setIsSearching(true);
    setHasSearched(true);
    
    const allUsers = getAllMockUsers();
    const allBooks = getAllMockUserBooks();
    
    if (!state.user?.id) return;

    const results = BookSearchService.searchBooks(
      allBooks,
      allUsers,
      criteria,
      filters,
      state.user.id,
      location ? { latitude: location.latitude, longitude: location.longitude } : undefined
    );

    setSearchResults(results.results);
    setNearbyResults(results.nearbyResults || []);
    setIsSearching(false);
  };

  const handleLocationRequest = () => {
    setShowLocationPrompt(false);
    requestLocation();
  };

  const handleSwapRequest = (book: UserBook) => {
    setSelectedBook(book);
    setShowSwapModal(true);
  };

  const handleSwapRequestSubmit = async (offeredBookId: string, message: string) => {
    if (!selectedBook) return;

    console.log('🔍 BookDiscovery - Takas isteği gönderiliyor:');
    console.log('- selectedBook:', selectedBook);
    console.log('- selectedBook.bookId:', selectedBook.bookId);
    console.log('- selectedBook.id:', selectedBook.id);
    console.log('- requestedBookId:', selectedBook.bookId || selectedBook.id);

    try {
      await createSwapRequest({
        requestedBookId: selectedBook.bookId || selectedBook.id,
        offeredBookId,
        message,
        ownerId: selectedBook.userId
      });
      
      setShowSwapModal(false);
      setSelectedBook(null);
      
      alert('Takas isteği başarıyla gönderildi! 🎉');
    } catch (error) {
      console.error('Takas isteği gönderilirken hata:', error);
      alert('Takas isteği gönderilirken bir hata oluştu.');
    }
  };

  const renderBookCard = (result: SearchResultItem) => {
    const { userBook, owner, distance } = result;
    
    return (
      <div key={userBook.id} className="book-card">
        <div className="book-image">
          <img 
            src={userBook.imageUrl || '/placeholder-book.jpg'} 
            alt={userBook.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-book.jpg';
            }}
          />
        </div>
        
        <div className="book-info">
          <h3 className="book-title">{userBook.title}</h3>
          <p className="book-authors">{userBook.authors.join(', ')}</p>
          
          <div className="book-status">
            <span className={`status-badge status-${userBook.status}`}>
              {userBook.status === 'read' ? 'Okundu' : 
               userBook.status === 'currently-reading' ? 'Okunuyor' : 'Okunacak'}
            </span>
            
            {userBook.rating && (
              <div className="book-rating">
                {'⭐'.repeat(userBook.rating)}
              </div>
            )}
          </div>
          
          <div className="book-owner">
            <span className="owner-avatar">{owner.avatar || '👤'}</span>
            <div className="owner-info">
              <span className="owner-name">{owner.displayName}</span>
              {owner.city && <span className="owner-city">{owner.city}</span>}
              {distance && <span className="owner-distance">{distance} km</span>}
            </div>
          </div>
          
          <button 
            className="swap-button"
            onClick={() => handleSwapRequest(userBook)}
            disabled={swapLoading}
          >
            {swapLoading ? 'Gönderiliyor...' : 'Takas İste'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="book-discovery">
      <div className="discovery-header">
        <h1>Kitap Keşfet</h1>
        <p>Diğer kullanıcıların kitaplarını keşfedin ve takas teklifleri yapın</p>
      </div>

      {/* Konum İzni Bildirimi */}
      {!location && showLocationPrompt && (
        <div className="location-prompt">
          <div className="location-prompt-content">
            <h3>📍 Yakınımdaki Kitapları Göster</h3>
            <p>Konumunuzu paylaşarak size yakın kullanıcıların kitaplarını keşfedebilirsiniz.</p>
            <div className="location-prompt-actions">
              <button onClick={handleLocationRequest} disabled={locationLoading}>
                {locationLoading ? 'Konum Alınıyor...' : 'Konumu Paylaş'}
              </button>
              <button onClick={() => setShowLocationPrompt(false)} className="secondary">
                Şimdi Değil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konum Durumu */}
      {location && (
        <div className="location-status">
          📍 Konumunuz: {location.city || 'Bilinmeyen'} 
          {nearbyResults.length > 0 && (
            <span className="nearby-count">
              ({nearbyResults.length} yakın kitap bulundu)
            </span>
          )}
        </div>
      )}

      {/* Arama ve Filtreleme */}
      <SearchFilter 
        onSearch={handleSearch}
        isSearching={isSearching}
        initialCriteria={{}}
        initialFilters={{}}
      />

      {/* Yakındaki Kitaplar (Eğer konum varsa) */}
      {location && nearbyResults.length > 0 && (
        <div className="nearby-section">
          <h2>🎯 Yakınınızdaki Kitaplar</h2>
          <div className="books-grid nearby-books">
            {nearbyResults.slice(0, 6).map(renderBookCard)}
          </div>
        </div>
      )}

      {/* Arama Sonuçları */}
      <div className="search-results">
        {hasSearched ? (
          <h2>
            Arama Sonuçları ({searchResults.length} kitap bulundu)
          </h2>
        ) : (
          <h2>Popüler Kitaplar</h2>
        )}

        {isSearching ? (
          <div className="loading-state">
            <div className="loading-spinner">🔍</div>
            <p>Kitaplar aranıyor...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="books-grid">
            {searchResults.map(renderBookCard)}
          </div>
        ) : hasSearched ? (
          <div className="empty-state">
            <h3>📚 Aradığınız kriterlere uygun kitap bulunamadı</h3>
            <p>Arama kriterlerinizi değiştirmeyi deneyin</p>
            {!location && (
              <button onClick={() => setShowLocationPrompt(true)}>
                📍 Yakınımdaki Kitapları Ara
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Takas İsteği Modal */}
      {showSwapModal && selectedBook && (
        <SwapRequestModal
          targetBook={selectedBook}
          targetUser={{
            id: selectedBook.userId,
            displayName: 'Kullanıcı',
            email: '',
            createdAt: new Date()
          }}
          onSubmit={handleSwapRequestSubmit}
          onClose={() => {
            setShowSwapModal(false);
            setSelectedBook(null);
          }}
        />
      )}
    </div>
  );
};

export default BookDiscovery;
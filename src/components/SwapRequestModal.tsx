import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserBooks } from '../contexts/UserBooksContext';
import { UserBook } from '../types/book';
import { User } from '../types/user';
import './SwapRequestModal.css';

interface SwapRequestModalProps {
  targetBook: UserBook;
  targetUser: User;
  onSubmit: (offeredBookId: string, message: string) => Promise<void>;
  onClose: () => void;
}

const SwapRequestModal: React.FC<SwapRequestModalProps> = ({ 
  targetBook, 
  targetUser,
  onSubmit,
  onClose
}) => {
  const { state } = useAuth();
  const { userBooks } = useUserBooks();
  
  const [selectedOfferedBook, setSelectedOfferedBook] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOfferedBook) {
      alert('Lütfen teklif edeceğiniz kitabı seçin.');
      return;
    }

    console.log('📤 SwapRequestModal - Gönderilen veri:');
    console.log('- selectedOfferedBook:', selectedOfferedBook);
    console.log('- userBooks:', userBooks.map(ub => ({ id: ub.id, bookId: ub.bookId, title: ub.title })));

    setIsSubmitting(true);
    try {
      await onSubmit(selectedOfferedBook, message);
    } catch (error) {
      console.error('Takas isteği gönderme hatası:', error);
      alert('Takas isteği gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAuthors = (authors: string[]) => {
    return authors.join(', ');
  };

  if (!state.user) {
    return null;
  }

  return (
    <div className="swap-modal-overlay">
      <div className="swap-modal">
        <div className="modal-header">
          <h3>� Kitap Takası İsteği</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="modal-content">
          <div className="target-book-section">
            <h4>📖 İstediğiniz Kitap</h4>
            <div className="book-card">
              <div className="book-cover">
                {targetBook.imageUrl ? (
                  <img 
                    src={targetBook.imageUrl}
                    alt={targetBook.title}
                  />
                ) : (
                  <div className="book-placeholder">📚</div>
                )}
              </div>
              <div className="book-info">
                <h5>{targetBook.title}</h5>
                <p>{formatAuthors(targetBook.authors)}</p>
                <small>Sahibi: {targetUser.displayName}</small>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="offered-books-section">
              <h4>📚 Teklif Edeceğiniz Kitap</h4>
              <div className="offered-books-grid">
                {userBooks.filter(book => book.status === 'read' || book.status === 'currently-reading').map(userBook => (
                  <div 
                    key={userBook.id}
                    className={`offered-book-card ${selectedOfferedBook === userBook.id ? 'selected' : ''}`}
                    onClick={() => 
                      setSelectedOfferedBook(selectedOfferedBook === userBook.id ? '' : userBook.id)
                    }
                  >
                    <div className="book-cover">
                      {userBook.imageUrl ? (
                        <img 
                          src={userBook.imageUrl}
                          alt={userBook.title}
                        />
                      ) : (
                        <div className="book-placeholder">📚</div>
                      )}
                    </div>
                    <div className="book-info">
                      <h6>{userBook.title}</h6>
                      <p>{formatAuthors(userBook.authors)}</p>
                      <span className="book-status">
                        {userBook.status === 'read' ? '✅ Okudum' : '📖 Okuyorum'}
                      </span>
                    </div>
                    {selectedOfferedBook === userBook.id && (
                      <div className="selected-indicator">
                        ✓ Seçildi
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {userBooks.filter(book => book.status === 'read' || book.status === 'currently-reading').length === 0 && (
                <div className="no-books-message">
                  <p>Takas için teklif edebileceğiniz kitabınız bulunmuyor.</p>
                  <small>Sadece okuduğunuz veya şu anda okuduğunuz kitapları teklif edebilirsiniz.</small>
                </div>
              )}
            </div>

            <div className="message-section">
              <label htmlFor="message">� Mesajınız (İsteğe bağlı)</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Takas isteğinizle ilgili bir mesaj yazabilirsiniz..."
                rows={3}
                maxLength={500}
              />
              <small>{message.length}/500 karakter</small>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                onClick={onClose} 
                className="cancel-btn"
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={!selectedOfferedBook || isSubmitting}
              >
                {isSubmitting ? 'Gönderiliyor...' : '� Takas İsteği Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SwapRequestModal;
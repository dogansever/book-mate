import React, { useState } from 'react';
import { useBookSwap } from '../contexts/BookSwapContext';
import { useAuth } from '../hooks/useAuth';
import { SwapRequest } from '../types/swap';
import SwapChat from './SwapChat';
import './SwapManager.css';

const SwapManager: React.FC = () => {
  const { state } = useAuth();
  const {
    getSentRequests,
    getReceivedRequests,
    getSwapStats,
    acceptSwapRequest,
    rejectSwapRequest,
    cancelSwapRequest,
    isLoading
  } = useBookSwap();

  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'stats'>('received');
  const [selectedChatRequest, setSelectedChatRequest] = useState<SwapRequest | null>(null);

  const sentRequests = getSentRequests();
  const receivedRequests = getReceivedRequests();
  const stats = getSwapStats();

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptSwapRequest(requestId);
    } catch (err) {
      console.error('Takas kabul etme hatası:', err);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Red etme sebebi (isteğe bağlı):');
    try {
      await rejectSwapRequest(requestId, reason || undefined);
    } catch (err) {
      console.error('Takas reddetme hatası:', err);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (window.confirm('Takas isteğini iptal etmek istediğinizden emin misiniz?')) {
      try {
        await cancelSwapRequest(requestId);
      } catch (err) {
        console.error('Takas iptal etme hatası:', err);
      }
    }
  };

  const getStatusBadge = (status: SwapRequest['status']) => {
    const statusConfig = {
      'pending': { icon: '⏳', label: 'Bekliyor', className: 'status-pending' },
      'accepted': { icon: '✅', label: 'Kabul Edildi', className: 'status-accepted' },
      'rejected': { icon: '❌', label: 'Reddedildi', className: 'status-rejected' },
      'completed': { icon: '🎉', label: 'Tamamlandı', className: 'status-completed' },
      'cancelled': { icon: '🚫', label: 'İptal Edildi', className: 'status-cancelled' }
    };

    const config = statusConfig[status];
    return (
      <span className={`status-badge ${config.className}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRequestCard = (request: SwapRequest, isReceived: boolean) => (
    <div key={request.id} className="swap-request-card">
      <div className="request-header">
        <div className="request-user">
          <div className="user-avatar">
            {(isReceived ? request.requesterAvatar : undefined) ? (
              <img 
                src={isReceived ? request.requesterAvatar : undefined} 
                alt={isReceived ? request.requesterName : request.ownerName}
              />
            ) : (
              <div className="avatar-placeholder">
                {(isReceived ? request.requesterName : request.ownerName).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-info">
            <h4>{isReceived ? request.requesterName : request.ownerName}</h4>
            <small>{formatDate(request.createdAt)}</small>
          </div>
        </div>
        {getStatusBadge(request.status)}
      </div>

      <div className="request-books">
        <div className="book-info">
          <div className="book-cover">
            {request.requestedBook.imageUrl ? (
              <img src={request.requestedBook.imageUrl} alt={request.requestedBook.title} />
            ) : (
              <div className="book-placeholder">📚</div>
            )}
          </div>
          <div className="book-details">
            <strong>{request.requestedBook.title}</strong>
            <p>{request.requestedBook.authors.join(', ')}</p>
            <small>{isReceived ? 'İstenen kitap' : 'Talep ettiğiniz kitap'}</small>
          </div>
        </div>

        {request.offeredBook && (
          <>
            <div className="swap-arrow">⇄</div>
            <div className="book-info">
              <div className="book-cover">
                {request.offeredBook.imageUrl ? (
                  <img src={request.offeredBook.imageUrl} alt={request.offeredBook.title} />
                ) : (
                  <div className="book-placeholder">📚</div>
                )}
              </div>
              <div className="book-details">
                <strong>{request.offeredBook.title}</strong>
                <p>{request.offeredBook.authors.join(', ')}</p>
                <small>Teklif edilen kitap</small>
              </div>
            </div>
          </>
        )}
      </div>

      {request.message && (
        <div className="request-message">
          <strong>Mesaj:</strong> "{request.message}"
        </div>
      )}

      <div className="request-actions">
        {isReceived && request.status === 'pending' && (
          <>
            <button 
              onClick={() => handleAcceptRequest(request.id)}
              disabled={isLoading}
              className="accept-btn"
            >
              ✅ Kabul Et
            </button>
            <button 
              onClick={() => handleRejectRequest(request.id)}
              disabled={isLoading}
              className="reject-btn"
            >
              ❌ Reddet
            </button>
          </>
        )}

        {!isReceived && request.status === 'pending' && (
          <button 
            onClick={() => handleCancelRequest(request.id)}
            disabled={isLoading}
            className="cancel-btn"
          >
            🚫 İptal Et
          </button>
        )}

        {request.status === 'accepted' && (
          <button 
            onClick={() => setSelectedChatRequest(request)}
            className="chat-btn"
          >
            💬 Mesajlaş
          </button>
        )}
      </div>
    </div>
  );

  if (!state.user) {
    return (
      <div className="swap-manager">
        <div className="error-message">
          Takas yönetimi için giriş yapmalısınız.
        </div>
      </div>
    );
  }

  return (
    <div className="swap-manager">
      <div className="swap-header">
        <h2>🔄 Kitap Takası Yönetimi</h2>
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            📥 Gelen İstekler ({receivedRequests.filter(r => r.status === 'pending').length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            📤 Gönderilen İstekler ({sentRequests.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 İstatistikler
          </button>
        </div>
      </div>

      <div className="swap-content">
        {activeTab === 'received' && (
          <div className="requests-section">
            <h3>📥 Gelen Takas İstekleri</h3>
            {receivedRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h4>Henüz gelen takas isteği yok</h4>
                <p>Başka kullanıcılar kitaplarınız için takas isteği gönderdiğinde burada görünecek.</p>
              </div>
            ) : (
              <div className="requests-list">
                {receivedRequests.map(request => renderRequestCard(request, true))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="requests-section">
            <h3>📤 Gönderdiğiniz Takas İstekleri</h3>
            {sentRequests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📤</div>
                <h4>Henüz takas isteği göndermediniz</h4>
                <p>Başka kullanıcıların kitapları için takas isteği gönderebilirsiniz.</p>
              </div>
            ) : (
              <div className="requests-list">
                {sentRequests.map(request => renderRequestCard(request, false))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-section">
            <h3>📊 Takas İstatistikleri</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-value">{stats.totalRequests}</div>
                <div className="stat-label">Toplam İstek</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-value">{stats.pendingRequests}</div>
                <div className="stat-label">Bekleyen</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.acceptedRequests}</div>
                <div className="stat-label">Kabul Edilen</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎉</div>
                <div className="stat-value">{stats.completedSwaps}</div>
                <div className="stat-label">Tamamlanan</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📤</div>
                <div className="stat-value">{stats.sentRequests}</div>
                <div className="stat-label">Gönderilen</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📥</div>
                <div className="stat-value">{stats.receivedRequests}</div>
                <div className="stat-label">Alınan</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {selectedChatRequest && (
        <SwapChat
          swapRequest={selectedChatRequest}
          onClose={() => setSelectedChatRequest(null)}
        />
      )}
    </div>
  );
};

export default SwapManager;
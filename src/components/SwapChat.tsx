import React, { useState, useEffect, useRef } from 'react';
import { useBookSwap } from '../contexts/BookSwapContext';
import { useAuth } from '../hooks/useAuth';
import { SwapRequest, SwapMessage } from '../types/swap';
import './SwapChat.css';

interface SwapChatProps {
  swapRequest: SwapRequest;
  onClose: () => void;
}

const SwapChat: React.FC<SwapChatProps> = ({ swapRequest, onClose }) => {
  const { state } = useAuth();
  const { 
    getSwapChat, 
    sendMessage, 
    markMessagesAsRead, 
    completeSwapRequest,
    isLoading 
  } = useBookSwap();
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const chat = getSwapChat(swapRequest.id);
  const otherParticipant = chat?.participants.find(p => p.id !== state.user?.id);

  useEffect(() => {
    if (chat && state.user) {
      markMessagesAsRead(swapRequest.id);
    }
  }, [chat, swapRequest.id, state.user, markMessagesAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      await sendMessage(swapRequest.id, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      console.error('Mesaj gönderme hatası:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCompleteSwap = async () => {
    if (window.confirm('Takası tamamlamak istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        await completeSwapRequest(swapRequest.id);
      } catch (err) {
        console.error('Takas tamamlama hatası:', err);
      }
    }
  };

  const formatMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageDate.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const renderMessage = (message: SwapMessage) => {
    const isOwnMessage = message.senderId === state.user?.id;
    const isSystemMessage = message.type === 'system';

    if (isSystemMessage) {
      return (
        <div key={message.id} className="system-message">
          <div className="system-message-content">
            <span className="system-icon">ℹ️</span>
            {message.content}
          </div>
          <div className="message-time">
            {formatMessageTime(message.createdAt)}
          </div>
        </div>
      );
    }

    return (
      <div 
        key={message.id} 
        className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
      >
        <div className="message-content">
          <div className="message-text">{message.content}</div>
          <div className="message-info">
            <span className="message-time">
              {formatMessageTime(message.createdAt)}
            </span>
            {isOwnMessage && (
              <span className={`read-status ${message.isRead ? 'read' : 'unread'}`}>
                {message.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
        {!isOwnMessage && message.senderAvatar && (
          <div className="message-avatar">
            <img src={message.senderAvatar} alt={message.senderName} />
          </div>
        )}
      </div>
    );
  };

  if (!chat) {
    return (
      <div className="swap-chat-overlay" onClick={onClose}>
        <div className="swap-chat" onClick={(e) => e.stopPropagation()}>
          <div className="chat-header">
            <h3>Sohbet bulunamadı</h3>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="chat-error">
            <p>Bu takas için sohbet henüz oluşturulmamış.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="swap-chat-overlay" onClick={onClose}>
      <div className="swap-chat" onClick={(e) => e.stopPropagation()}>
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-info">
            <div className="participant-info">
              {otherParticipant?.avatar && (
                <img 
                  src={otherParticipant.avatar} 
                  alt={otherParticipant.name}
                  className="participant-avatar"
                />
              )}
              <div className="participant-details">
                <h3>{otherParticipant?.name}</h3>
                <span className="swap-status">
                  {swapRequest.status === 'accepted' && '✅ Takas Kabul Edildi'}
                  {swapRequest.status === 'completed' && '🎉 Takas Tamamlandı'}
                </span>
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Swap Details */}
        <div className="swap-details">
          <div className="swap-books">
            <div className="requested-book">
              <small>İstenen Kitap:</small>
              <div className="book-info">
                {swapRequest.requestedBook.imageUrl && (
                  <img 
                    src={swapRequest.requestedBook.imageUrl} 
                    alt={swapRequest.requestedBook.title}
                  />
                )}
                <div>
                  <strong>{swapRequest.requestedBook.title}</strong>
                  <br />
                  <small>{swapRequest.requestedBook.authors.join(', ')}</small>
                </div>
              </div>
            </div>
            
            {swapRequest.offeredBook && (
              <>
                <div className="swap-arrow">⇄</div>
                <div className="offered-book">
                  <small>Teklif Edilen Kitap:</small>
                  <div className="book-info">
                    {swapRequest.offeredBook.imageUrl && (
                      <img 
                        src={swapRequest.offeredBook.imageUrl} 
                        alt={swapRequest.offeredBook.title}
                      />
                    )}
                    <div>
                      <strong>{swapRequest.offeredBook.title}</strong>
                      <br />
                      <small>{swapRequest.offeredBook.authors.join(', ')}</small>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          <div className="messages-container">
            {chat.messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        {chat.isActive && swapRequest.status !== 'completed' && (
          <div className="message-input-area">
            <form onSubmit={handleSendMessage} className="message-form">
              <div className="input-container">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  disabled={isSending}
                  maxLength={500}
                  className="message-input"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="send-btn"
                >
                  {isSending ? '⏳' : '📤'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        {swapRequest.status === 'accepted' && chat.isActive && (
          <div className="chat-actions">
            <button 
              onClick={handleCompleteSwap}
              disabled={isLoading}
              className="complete-swap-btn"
            >
              {isLoading ? '⏳ İşleniyor...' : '🎉 Takası Tamamla'}
            </button>
          </div>
        )}

        {swapRequest.status === 'completed' && (
          <div className="swap-completed-message">
            <div className="completion-icon">🎉</div>
            <h4>Takas Tamamlandı!</h4>
            <p>Bu takas başarıyla tamamlandı. İyi okumalar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapChat;
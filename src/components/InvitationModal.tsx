import React, { useState } from 'react';
import { useMeetupContext } from '../hooks/useMeetupContext';
import { useFollow } from '../hooks/useFollow';
import { Meetup } from '../types/meetup';
import './InvitationModal.css';

interface InvitationModalProps {
  meetup: Meetup;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

const InvitationModal: React.FC<InvitationModalProps> = ({
  meetup,
  isOpen,
  onClose,
  currentUserId
}) => {
  const { sendInvitation, state } = useMeetupContext();
  const { following } = useFollow(currentUserId);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Filter following list to exclude current members
  const availableUsers = following.filter(userConnection => 
    !meetup.members.some(member => member.userId === userConnection.user.id)
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSendInvitations = async () => {
    if (selectedUsers.length === 0) return;

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      let successCount = 0;
      let duplicateCount = 0;
      
      // Send invitation to each selected user
      for (const userId of selectedUsers) {
        console.log('Sending invitation from:', currentUserId, 'to:', userId);
        try {
          await sendInvitation({
            meetupId: meetup.id,
            toUserId: userId,
            message: inviteMessage || `${meetup.title} grubuna katılmaya davet edildiniz!`
          }, currentUserId);
          successCount++;
        } catch (inviteError) {
          const errorMessage = inviteError instanceof Error ? inviteError.message : 'Bilinmeyen hata';
          if (errorMessage === 'Bu kişiye zaten davet gönderilmiş') {
            duplicateCount++;
          } else {
            // Log error and continue with next user instead of re-throwing
            console.error('Individual invitation failed:', inviteError);
            setErrorMessage(errorMessage);
          }
        }
      }

      // Show appropriate success message
      if (successCount > 0 && duplicateCount > 0) {
        alert(`${successCount} kişiye davet gönderildi! ${duplicateCount} kişiye zaten davet gönderilmişti. 🎉`);
      } else if (successCount > 0) {
        alert(`${successCount} kişiye davet gönderildi! 🎉`);
      } else if (duplicateCount > 0) {
        alert(`Bu kişi(ler)e zaten davet gönderilmiş! ⚠️`);
      }
      
      onClose();
      setSelectedUsers([]);
      setInviteMessage('');
    } catch (error) {
      console.error('Invitation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Davet gönderilirken hata oluştu';
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="invitation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📩 Grup Daveti Gönder</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="meetup-info">
            <h3>{meetup.title}</h3>
            <p>{meetup.description}</p>
            <div className="meetup-stats">
              <span>👥 {meetup.members.length}/{meetup.maxMembers} üye</span>
              <span>📚 {meetup.theme}</span>
            </div>
          </div>

          <div className="invite-section">
            <h4>Davet Edilecek Kişiler</h4>
            <p className="helper-text">
              Sadece takip ettiğiniz kişilere davet gönderebilirsiniz
            </p>

            {availableUsers.length === 0 ? (
              <div className="empty-state">
                <p>Davet edilebilecek kimse bulunamadı.</p>
                <small>Takip ettiğiniz kişiler zaten bu grubun üyesi olabilir.</small>
              </div>
            ) : (
              <div className="users-list">
                {availableUsers.map((userConnection) => {
                  const user = userConnection.user;
                  return (
                    <div
                      key={user.id}
                      className={`user-item ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <div className="user-avatar">
                        {user.avatar || '👤'}
                      </div>
                      <div className="user-info">
                        <div className="user-name">{user.displayName}</div>
                        <div className="user-details">
                          {user.profile?.location && <span>📍 {user.profile.location}</span>}
                          {userConnection.commonInterests.length > 0 && (
                            <span>🤝 {userConnection.commonInterests.length} ortak ilgi</span>
                          )}
                          <span>🎯 %{Math.round(userConnection.compatibilityScore * 100)} uyumlu</span>
                        </div>
                      </div>
                      <div className="selection-indicator">
                        {selectedUsers.includes(user.id) ? '✓' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="message-section">
              <label htmlFor="invite-message">Davet Mesajı (İsteğe bağlı)</label>
              <textarea
                id="invite-message"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Bu gruba katılmanı çok istiyorum..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={onClose}
            disabled={isLoading}
          >
            İptal
          </button>
          <button 
            className="send-button" 
            onClick={handleSendInvitations}
            disabled={selectedUsers.length === 0 || isLoading || state.isLoading}
          >
            {isLoading ? 'Gönderiliyor...' : `Davet Gönder (${selectedUsers.length})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvitationModal;
import React, { useEffect } from 'react';
import { useMeetupContext } from '../hooks/useMeetupContext';
import { useAuth } from '../hooks/useAuth';
import { MeetupInvitation } from '../types/meetup';
import './InvitationsList.css';

const InvitationsList: React.FC = () => {
  const { state: authState } = useAuth();
  const { 
    state: meetupState, 
    loadInvitations, 
    respondToInvitation 
  } = useMeetupContext();

  useEffect(() => {
    if (authState.user?.id) {
      loadInvitations(authState.user.id);
    }
  }, [authState.user?.id, loadInvitations]);

  const handleRespondToInvitation = async (
    invitationId: string, 
    response: 'accept' | 'decline'
  ) => {
    if (!authState.user?.id) return;

    try {
      await respondToInvitation({ 
        invitationId, 
        response,
        message: response === 'accept' ? 'Davetinizi kabul ediyorum! 🎉' : 'Üzgünüm, şu anda katılamıyorum.'
      }, authState.user.id);
    } catch (error) {
      console.error('Davet yanıtlama hatası:', error);
    }
  };

  const pendingInvitations = meetupState.invitations.filter(inv => inv.status === 'pending');
  const respondedInvitations = meetupState.invitations.filter(inv => inv.status !== 'pending');

  if (!authState.user) {
    return <div>Lütfen giriş yapınız.</div>;
  }

  return (
    <div className="invitations-list">
      <h2>📩 Grup Davetleri</h2>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="invitations-section">
          <h3>🔔 Bekleyen Davetler ({pendingInvitations.length})</h3>
          <div className="invitations-grid">
            {pendingInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onRespond={handleRespondToInvitation}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Responded Invitations */}
      {respondedInvitations.length > 0 && (
        <div className="invitations-section">
          <h3>📋 Yanıtlanan Davetler ({respondedInvitations.length})</h3>
          <div className="invitations-grid">
            {respondedInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onRespond={handleRespondToInvitation}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}

      {meetupState.invitations.length === 0 && !meetupState.isLoading && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Henüz davet yok</h3>
          <p>Grup davetleri aldığınızda burada görünecek.</p>
        </div>
      )}
    </div>
  );
};

interface InvitationCardProps {
  invitation: MeetupInvitation;
  onRespond: (invitationId: string, response: 'accept' | 'decline') => void;
  showActions: boolean;
}

const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onRespond,
  showActions
}) => {
  const getStatusBadge = (status: MeetupInvitation['status']) => {
    switch (status) {
      case 'accepted':
        return <span className="status-badge accepted">✅ Kabul Edildi</span>;
      case 'declined':
        return <span className="status-badge declined">❌ Reddedildi</span>;
      case 'expired':
        return <span className="status-badge expired">⏰ Süresi Doldu</span>;
      default:
        return <span className="status-badge pending">⏳ Bekliyor</span>;
    }
  };

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    return `${Math.floor(diffInHours / 24)} gün önce`;
  };

  return (
    <div className={`invitation-card status-${invitation.status}`}>
      <div className="invitation-header">
        <div className="inviter-info">
          <div className="inviter-avatar">
            {invitation.fromUser.avatar || '👤'}
          </div>
          <div className="inviter-details">
            <div className="inviter-name">{invitation.fromUser.displayName}</div>
            <div className="invitation-time">{timeAgo(invitation.createdAt)}</div>
          </div>
        </div>
        {getStatusBadge(invitation.status)}
      </div>

      <div className="meetup-info">
        <h4>{invitation.meetup.title}</h4>
        <p>{invitation.meetup.description}</p>
        <div className="meetup-details">
          <span>👥 {invitation.meetup.members.length}/{invitation.meetup.maxMembers} üye</span>
          <span>📚 {invitation.meetup.theme}</span>
          {invitation.meetup.isPrivate && <span>🔒 Özel</span>}
        </div>
      </div>

      {invitation.message && (
        <div className="invitation-message">
          <strong>Mesaj:</strong> "{invitation.message}"
        </div>
      )}

      {showActions && invitation.status === 'pending' && (
        <div className="invitation-actions">
          <button
            className="accept-btn"
            onClick={() => onRespond(invitation.id, 'accept')}
          >
            ✅ Kabul Et
          </button>
          <button
            className="decline-btn"
            onClick={() => onRespond(invitation.id, 'decline')}
          >
            ❌ Reddet
          </button>
        </div>
      )}
    </div>
  );
};

export default InvitationsList;
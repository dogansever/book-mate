import React, { useEffect } from 'react';
import { useMeetupContext } from '../hooks/useMeetupContext';
import { PlaceholderImages } from '../utils/placeholderImages';
import './MeetupPreview.css';

interface MeetupPreviewProps {
  userId: string;
}

const MeetupPreview: React.FC<MeetupPreviewProps> = ({ userId }) => {
  const { state, loadMeetups } = useMeetupContext();

  useEffect(() => {
    loadMeetups(userId);
  }, [loadMeetups, userId]);

  const activeMeetups = state.meetups
    .filter(meetup => meetup.status === 'active')
    .slice(0, 3);

  if (state.isLoading) {
    return (
      <div className="meetup-preview-loading">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Gruplar yükleniyor...</p>
      </div>
    );
  }

  if (activeMeetups.length === 0) {
    return (
      <div className="no-meetups-preview">
        <div className="preview-icon">🤝</div>
        <p>Henüz hiç buluşma grubuna katılmamışsın</p>
        <small>Kitap severlerle tanışmak için bir grup oluştur veya mevcut gruplara katıl!</small>
      </div>
    );
  }

  const formatLastActivity = (lastActivity: string) => {
    const date = new Date(lastActivity);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="meetup-preview-container">
      {activeMeetups.map(meetup => (
        <div key={meetup.id} className="meetup-preview-card">
          <div className="meetup-preview-header">
            <h5>{meetup.title}</h5>
            <span className="preview-category">{meetup.category}</span>
          </div>
          
          <div className="meetup-preview-meta">
            <span className="preview-theme">📖 {meetup.theme}</span>
            <div className="preview-members">
              👥 {(meetup as any).memberCount || meetup.members?.length || 0}/{(meetup as any).maxMembers || 10}
            </div>
          </div>

          {meetup.book && (
            <div className="preview-book">
              <img 
                src={meetup.book.imageLinks?.thumbnail || PlaceholderImages.book} 
                alt={meetup.book.title}
                className="preview-book-cover"
                onError={(e) => PlaceholderImages.handleImageError(e, 'book')}
              />
              <span className="preview-book-title">{meetup.book.title}</span>
            </div>
          )}

          <div className="preview-activity">
            <span className="activity-indicator">
              {(meetup.messages?.length || 0) > 0 ? '💬' : '⭐'} 
              {formatLastActivity(meetup.lastActivity || (meetup as any).updatedAt || meetup.createdAt)}
            </span>
            {meetup.nextMeeting && (
              <span className="next-meeting">
                📅 {new Date(meetup.nextMeeting.date).toLocaleDateString('tr-TR')}
              </span>
            )}
          </div>

          <div className="preview-stats">
            <div className="preview-stat">
              <span>💬</span>
              <span>{meetup.messages?.length || 0}</span>
            </div>
            <div className="preview-stat">
              <span>📅</span>
              <span>{(meetup as any).stats?.totalMeetings || 0}</span>
            </div>
            {(meetup as any).readingGoal && (meetup as any).readingGoal.targetPages > 0 && (
              <div className="preview-stat">
                <span>📖</span>
                <span>{Math.round(((meetup as any).readingGoal.currentPages / (meetup as any).readingGoal.targetPages) * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetupPreview;
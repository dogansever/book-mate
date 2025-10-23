import React, { useState } from 'react';
import { Meetup, CreateMessageData, CreateMeetingData } from '../types/meetup';
import './MeetupDetails.css';

interface MeetupDetailsProps {
  meetup: Meetup;
  currentUserId: string;
  isLoading?: boolean;
  onSendMessage: (data: CreateMessageData) => Promise<void>;
  onCreateMeeting: (data: CreateMeetingData) => Promise<void>;
  onJoinMeetup: (meetupId: string, inviteCode?: string) => Promise<void>;
  onLeaveMeetup: (meetupId: string) => Promise<void>;
  onClose: () => void;
}

const MeetupDetails: React.FC<MeetupDetailsProps> = ({
  meetup,
  currentUserId,
  isLoading = false,
  onSendMessage,
  onCreateMeeting,
  onJoinMeetup,
  onLeaveMeetup,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'meetings'>('overview');
  const [messageText, setMessageText] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingForm, setMeetingForm] = useState<Partial<CreateMeetingData>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    locationType: 'online',
    isRecurring: false
  });

  const isOwner = meetup.createdBy === currentUserId;
  const isMember = meetup.members.some(member => 
    member.userId === currentUserId && member.status === 'active'
  );
  const canJoin = !isMember && meetup.members.filter(m => m.status === 'active').length < meetup.maxMembers;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await onSendMessage({
        meetupId: meetup.id,
        userId: currentUserId,
        content: messageText,
        type: 'text'
      });
      setMessageText('');
    } catch (error) {
      console.error('Message send error:', error);
    }
  };

  const handleJoinMeetup = async () => {
    try {
      await onJoinMeetup(meetup.id, meetup.isPrivate ? inviteCode : undefined);
      setInviteCode('');
    } catch (error) {
      console.error('Join meetup error:', error);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time) return;

    try {
      await onCreateMeeting({
        meetupId: meetup.id,
        userId: currentUserId,
        title: meetingForm.title!,
        description: meetingForm.description,
        date: meetingForm.date!,
        time: meetingForm.time!,
        location: meetingForm.location!,
        locationType: meetingForm.locationType!,
        isRecurring: meetingForm.isRecurring!,
        recurringPattern: meetingForm.recurringPattern
      });
      setShowMeetingForm(false);
      setMeetingForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        locationType: 'online',
        isRecurring: false
      });
    } catch (error) {
      console.error('Create meeting error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMeetingDate = (date: string, time: string) => {
    const meetingDate = new Date(`${date}T${time}`);
    return meetingDate.toLocaleString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="meetup-details-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <h1>{meetup.title}</h1>
            <p>{meetup.theme}</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Cover Image */}
        {(meetup.coverImage || meetup.book?.imageLinks?.thumbnail) && (
          <div 
            className="meetup-cover"
            style={{
              backgroundImage: `url(${meetup.coverImage || meetup.book?.imageLinks?.thumbnail})`
            }}
          >
            <div className="cover-overlay">
              <div className="meetup-meta">
                <span className="member-count">
                  {meetup.members.filter(m => m.status === 'active').length}/{meetup.maxMembers} üye
                </span>
                {meetup.isPrivate && <span className="privacy-badge">🔒 Özel</span>}
              </div>
            </div>
          </div>
        )}

        {/* Action Bar */}
        {!isMember && canJoin && (
          <div className="action-bar">
            {meetup.isPrivate ? (
              <div className="join-private">
                <input
                  type="text"
                  placeholder="Davet kodu girin..."
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
                <button 
                  onClick={handleJoinMeetup} 
                  disabled={!inviteCode.trim() || isLoading}
                >
                  Katıl
                </button>
              </div>
            ) : (
              <button 
                className="join-btn" 
                onClick={() => onJoinMeetup(meetup.id)}
                disabled={isLoading}
              >
                Gruba Katıl
              </button>
            )}
          </div>
        )}

        {isMember && !isOwner && (
          <div className="action-bar">
            <button 
              className="leave-btn" 
              onClick={() => onLeaveMeetup(meetup.id)}
              disabled={isLoading}
            >
              Gruptan Ayrıl
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Genel Bakış
          </button>
          <button 
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Mesajlar ({meetup.messages.length})
          </button>
          <button 
            className={`tab ${activeTab === 'meetings' ? 'active' : ''}`}
            onClick={() => setActiveTab('meetings')}
          >
            Buluşmalar ({meetup.meetings.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="section">
                <h3>Açıklama</h3>
                <p>{meetup.description}</p>
              </div>

              {meetup.book && (
                <div className="section">
                  <h3>Kitap</h3>
                  <div className="book-info">
                    <img 
                      src={meetup.book.imageLinks?.thumbnail || '/placeholder-book.png'} 
                      alt={meetup.book.title}
                      className="book-cover"
                    />
                    <div className="book-details">
                      <h4>{meetup.book.title}</h4>
                      <p className="authors">{meetup.book.authors?.join(', ')}</p>
                      <p className="pages">{meetup.book.pageCount} sayfa</p>
                      {meetup.book.description && (
                        <p className="description">{meetup.book.description.substring(0, 200)}...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {meetup.readingGoal && (
                <div className="section">
                  <h3>Okuma Hedefi</h3>
                  <div className="reading-progress">
                    <div className="progress-info">
                      <span>{meetup.readingGoal.currentPages} / {meetup.readingGoal.targetPages} sayfa</span>
                      {meetup.readingGoal.deadline && (
                        <span>Hedef: {new Date(meetup.readingGoal.deadline).toLocaleDateString('tr-TR')}</span>
                      )}
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(meetup.readingGoal.currentPages / meetup.readingGoal.targetPages) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="section">
                <h3>Etiketler</h3>
                <div className="tags">
                  {meetup.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="section">
                <h3>Üyeler ({meetup.members.filter(m => m.status === 'active').length})</h3>
                <div className="members-grid">
                  {meetup.members
                    .filter(member => member.status === 'active')
                    .map(member => (
                    <div key={member.id} className="member-card">
                      <img 
                        src={member.user.avatar || '/default-avatar.png'} 
                        alt={member.user.displayName}
                        className="member-avatar"
                      />
                      <div className="member-info">
                        <h5>{member.user.displayName}</h5>
                        <span className={`role ${member.role}`}>
                          {member.role === 'owner' ? 'Grup Sahibi' : 'Üye'}
                        </span>
                        <span className="join-date">
                          {formatDate(member.joinedAt)} tarihinde katıldı
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="section">
                <h3>İstatistikler</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span className="stat-number">{meetup.stats.totalBooks}</span>
                    <span className="stat-label">Toplam Kitap</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{meetup.stats.completedBooks}</span>
                    <span className="stat-label">Tamamlanan</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{meetup.stats.totalMeetings}</span>
                    <span className="stat-label">Buluşma</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-number">{meetup.stats.activeMembers}</span>
                    <span className="stat-label">Aktif Üye</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="messages-tab">
              {isMember && (
                <form onSubmit={handleSendMessage} className="message-form">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    rows={3}
                  />
                  <button type="submit" disabled={!messageText.trim() || isLoading}>
                    Gönder
                  </button>
                </form>
              )}

              <div className="messages-list">
                {meetup.messages.length === 0 ? (
                  <div className="empty-messages">
                    <p>Henüz mesaj yok. İlk mesajı siz gönderin!</p>
                  </div>
                ) : (
                  meetup.messages
                    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                    .map(message => (
                    <div key={message.id} className="message">
                      <img 
                        src={message.user.avatar || '/default-avatar.png'} 
                        alt={message.user.displayName}
                        className="message-avatar"
                      />
                      <div className="message-content">
                        <div className="message-header">
                          <span className="sender-name">{message.user.displayName}</span>
                          <span className="message-time">{formatDate(message.createdAt)}</span>
                        </div>
                        <div className="message-text">{message.content}</div>
                        {message.editedAt && (
                          <span className="edited-indicator">(düzenlendi)</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="meetings-tab">
              {isMember && (
                <div className="meeting-actions">
                  <button 
                    onClick={() => setShowMeetingForm(!showMeetingForm)}
                    className="create-meeting-btn"
                  >
                    {showMeetingForm ? 'İptal Et' : 'Yeni Buluşma Planla'}
                  </button>
                </div>
              )}

              {showMeetingForm && (
                <form onSubmit={handleCreateMeeting} className="meeting-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Başlık</label>
                      <input
                        type="text"
                        value={meetingForm.title}
                        onChange={(e) => setMeetingForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Buluşma başlığı"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Tarih</label>
                      <input
                        type="date"
                        value={meetingForm.date}
                        onChange={(e) => setMeetingForm(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Saat</label>
                      <input
                        type="time"
                        value={meetingForm.time}
                        onChange={(e) => setMeetingForm(prev => ({ ...prev, time: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Buluşma Türü</label>
                      <select
                        value={meetingForm.locationType}
                        onChange={(e) => setMeetingForm(prev => ({ 
                          ...prev, 
                          locationType: e.target.value as CreateMeetingData['locationType']
                        }))}
                      >
                        <option value="online">Online</option>
                        <option value="physical">Fiziksel Mekan</option>
                        <option value="hybrid">Hibrit</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Konum/Link</label>
                    <input
                      type="text"
                      value={meetingForm.location}
                      onChange={(e) => setMeetingForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder={
                        meetingForm.locationType === 'online' 
                          ? 'Zoom linki, Meet linki vb.' 
                          : 'Adres veya mekan adı'
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Açıklama</label>
                    <textarea
                      value={meetingForm.description}
                      onChange={(e) => setMeetingForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Buluşma hakkında detaylar..."
                      rows={3}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={() => setShowMeetingForm(false)}>
                      İptal
                    </button>
                    <button type="submit" disabled={isLoading}>
                      Buluşma Oluştur
                    </button>
                  </div>
                </form>
              )}

              <div className="meetings-list">
                {meetup.meetings.length === 0 ? (
                  <div className="empty-meetings">
                    <p>Henüz planlanmış buluşma yok.</p>
                  </div>
                ) : (
                  meetup.meetings
                    .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())
                    .map(meeting => (
                    <div key={meeting.id} className="meeting-card">
                      <div className="meeting-header">
                        <h4>{meeting.title}</h4>
                        <span className={`location-type ${meeting.locationType}`}>
                          {meeting.locationType === 'online' && '💻 Online'}
                          {meeting.locationType === 'physical' && '📍 Fiziksel'}
                          {meeting.locationType === 'hybrid' && '🔄 Hibrit'}
                        </span>
                      </div>
                      
                      <div className="meeting-info">
                        <p className="meeting-date">
                          📅 {formatMeetingDate(meeting.date, meeting.time)}
                        </p>
                        <p className="meeting-location">
                          📍 {meeting.location}
                        </p>
                        {meeting.description && (
                          <p className="meeting-description">{meeting.description}</p>
                        )}
                      </div>

                      <div className="meeting-attendees">
                        <span>Katılımcılar ({meeting.attendees.length}):</span>
                        <div className="attendee-avatars">
                          {meeting.attendees.slice(0, 5).map(attendeeId => {
                            const attendee = meetup.members.find(m => m.userId === attendeeId)?.user;
                            return attendee ? (
                              <img
                                key={attendeeId}
                                src={attendee.avatar || '/default-avatar.png'}
                                alt={attendee.displayName}
                                title={attendee.displayName}
                                className="attendee-avatar"
                              />
                            ) : null;
                          })}
                          {meeting.attendees.length > 5 && (
                            <span className="more-attendees">+{meeting.attendees.length - 5}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetupDetails;
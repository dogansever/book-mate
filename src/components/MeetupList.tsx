import React, { useState } from 'react';
import { Meetup, MeetupFilters, MeetupSortOptions, MEETUP_CATEGORIES } from '../types/meetup';
import './MeetupList.css';

interface MeetupListProps {
  meetups: Meetup[];
  isLoading?: boolean;
  onMeetupSelect: (meetup: Meetup) => void;
  onJoinMeetup: (meetupId: string) => void;
  onFilterChange: (filters: MeetupFilters) => void;
  onSortChange: (sort: MeetupSortOptions) => void;
  currentUserId?: string;
}

const MeetupList: React.FC<MeetupListProps> = ({
  meetups,
  isLoading = false,
  onMeetupSelect,
  onJoinMeetup,
  onFilterChange,
  onSortChange,
  currentUserId
}) => {
  const [activeFilters, setActiveFilters] = useState<MeetupFilters>({});
  const [sortOptions, setSortOptions] = useState<MeetupSortOptions>({
    field: 'lastActivity',
    direction: 'desc'
  });

  const handleFilterChange = (key: keyof MeetupFilters, value: string | boolean | undefined) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (field: MeetupSortOptions['field']) => {
    const newSort: MeetupSortOptions = {
      field,
      direction: sortOptions.field === field && sortOptions.direction === 'desc' ? 'asc' : 'desc'
    };
    setSortOptions(newSort);
    onSortChange(newSort);
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  const isUserMember = (meetup: Meetup): boolean => {
    // API'den gelen members basit string array olduğu için
    return (meetup.members as unknown as string[])?.includes(currentUserId || '') || false;
  };

  const canJoinMeetup = (meetup: Meetup): boolean => {
    const memberCount = (meetup as any).memberCount || meetup.members?.length || 0;
    const maxMembers = (meetup as any).maxMembers || 10;
    return Boolean(currentUserId && 
           !isUserMember(meetup) && 
           memberCount < maxMembers);
  };

  const getStatusColor = (status: Meetup['status']) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#6b7280';
      case 'paused': return '#f59e0b';
      case 'archived': return '#ef4444';
      default: return '#6b7280';
    }
  };

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

  if (isLoading) {
    return (
      <div className="meetup-list-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Buluşma grupları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meetup-list-container">
      {/* Filters and Sort */}
      <div className="meetup-controls">
        <div className="filters-section">
          <h3>Filtrele</h3>
          
          {/* Category Filter */}
          <div className="filter-group">
            <label>Kategori</label>
            <select 
              value={activeFilters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            >
              <option value="">Tüm kategoriler</option>
              {MEETUP_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label>Durum</label>
            <select 
              value={activeFilters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <option value="">Tüm durumlar</option>
              <option value="active">Aktif</option>
              <option value="completed">Tamamlanmış</option>
              <option value="paused">Duraklatılmış</option>
              <option value="archived">Arşivlenmiş</option>
            </select>
          </div>

          {/* Has Space Filter */}
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={activeFilters.hasSpace || false}
                onChange={(e) => handleFilterChange('hasSpace', e.target.checked || undefined)}
              />
              Boş yer var
            </label>
          </div>

          {/* My Meetups Filters */}
          {currentUserId && (
            <>
              <div className="filter-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={activeFilters.isOwner || false}
                    onChange={(e) => handleFilterChange('isOwner', e.target.checked || undefined)}
                  />
                  Sahip olduklarım
                </label>
              </div>

              <div className="filter-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={activeFilters.isMember || false}
                    onChange={(e) => handleFilterChange('isMember', e.target.checked || undefined)}
                  />
                  Üyesi olduklarım
                </label>
              </div>
            </>
          )}

          {Object.keys(activeFilters).length > 0 && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Filtreleri Temizle
            </button>
          )}
        </div>

        {/* Sort Options */}
        <div className="sort-section">
          <h3>Sırala</h3>
          <div className="sort-buttons">
            <button
              className={`sort-btn ${sortOptions.field === 'lastActivity' ? 'active' : ''}`}
              onClick={() => handleSortChange('lastActivity')}
            >
              Son Aktivite
              {sortOptions.field === 'lastActivity' && (
                <span className="sort-direction">
                  {sortOptions.direction === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>
            <button
              className={`sort-btn ${sortOptions.field === 'createdAt' ? 'active' : ''}`}
              onClick={() => handleSortChange('createdAt')}
            >
              Oluşturma Tarihi
              {sortOptions.field === 'createdAt' && (
                <span className="sort-direction">
                  {sortOptions.direction === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>
            <button
              className={`sort-btn ${sortOptions.field === 'memberCount' ? 'active' : ''}`}
              onClick={() => handleSortChange('memberCount')}
            >
              Üye Sayısı
              {sortOptions.field === 'memberCount' && (
                <span className="sort-direction">
                  {sortOptions.direction === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>
            <button
              className={`sort-btn ${sortOptions.field === 'title' ? 'active' : ''}`}
              onClick={() => handleSortChange('title')}
            >
              İsim
              {sortOptions.field === 'title' && (
                <span className="sort-direction">
                  {sortOptions.direction === 'desc' ? '↓' : '↑'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Meetup Grid */}
      <div className="meetups-grid">
        {meetups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>Henüz buluşma grubu yok</h3>
            <p>Filtrelere uygun grup bulunamadı veya henüz grup oluşturulmamış.</p>
          </div>
        ) : (
          meetups.map(meetup => (
            <div key={meetup.id} className="meetup-card">
              {/* Cover Image */}
              <div 
                className="meetup-cover"
                style={{
                  backgroundImage: `url(${meetup.coverImage || meetup.book?.imageLinks?.thumbnail || '/placeholder-meetup.png'})`
                }}
              >
                <div className="meetup-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(meetup.status) }}
                  >
                    {meetup.status === 'active' && 'Aktif'}
                    {meetup.status === 'completed' && 'Tamamlanmış'}
                    {meetup.status === 'paused' && 'Duraklatılmış'}
                    {meetup.status === 'archived' && 'Arşivlenmiş'}
                  </span>
                </div>
                
                {meetup.isPrivate && (
                  <div className="privacy-badge">
                    🔒 Özel
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="meetup-content">
                <div className="meetup-header">
                  <h3 onClick={() => onMeetupSelect(meetup)}>{meetup.title}</h3>
                  <span className="category-tag">
                    {MEETUP_CATEGORIES.find(cat => cat.id === meetup.category)?.label}
                  </span>
                </div>

                <div className="meetup-meta">
                  <div className="theme-info">
                    <strong>Tema:</strong> {meetup.theme}
                  </div>
                  {meetup.book && (
                    <div className="book-info">
                      <strong>Kitap:</strong> {meetup.book.title}
                    </div>
                  )}
                </div>

                <p className="meetup-description">
                  {meetup.description.length > 120 
                    ? `${meetup.description.substring(0, 120)}...` 
                    : meetup.description
                  }
                </p>

                <div className="meetup-tags">
                  {meetup.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                  {meetup.tags.length > 3 && (
                    <span className="tag more">+{meetup.tags.length - 3}</span>
                  )}
                </div>

                <div className="meetup-stats">
                  <div className="stat">
                    <span className="stat-icon">👥</span>
                    <span>{(meetup as any).memberCount || meetup.members?.length || 0}/{(meetup as any).maxMembers || 10}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">💬</span>
                    <span>{meetup.messages?.length || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">📅</span>
                    <span>{(meetup as any).stats?.totalMeetings || 0}</span>
                  </div>
                </div>

                <div className="meetup-footer">
                  <div className="owner-info">
                    <img 
                      src={(meetup as any).owner?.avatar || '/default-avatar.png'} 
                      alt={(meetup as any).owner?.displayName || 'Grup Sahibi'}
                      className="owner-avatar"
                    />
                    <span>{(meetup as any).owner?.displayName || `Kullanıcı ${(meetup as any).createdBy}`}</span>
                  </div>
                  
                  <div className="last-activity">
                    {formatLastActivity(meetup.lastActivity)}
                  </div>
                </div>

                <div className="meetup-actions">
                  <button 
                    className="view-btn"
                    onClick={() => onMeetupSelect(meetup)}
                  >
                    Detayları Gör
                  </button>
                  
                  {canJoinMeetup(meetup) && (
                    <button 
                      className="join-btn"
                      onClick={() => onJoinMeetup(meetup.id)}
                    >
                      Katıl
                    </button>
                  )}
                  
                  {isUserMember(meetup) && (
                    <span className="member-badge">Üyesiniz</span>
                  )}
                  
                  {((meetup as any).memberCount || meetup.members?.length || 0) >= ((meetup as any).maxMembers || 10) && 
                   !isUserMember(meetup) && (
                    <span className="full-badge">Dolu</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MeetupList;
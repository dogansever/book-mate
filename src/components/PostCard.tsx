import React, { useState } from 'react';
import { Post, PostComment } from '../types/post';
import './PostCard.css';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onBookmark: (postId: string) => void;
  onShare: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (postId: string) => void;
  currentUserId?: string;
  comments?: PostComment[];
  isLoadingComments?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onBookmark,
  onShare,
  onDeletePost,
  onEditPost,
  currentUserId,
  comments = [],
  isLoadingComments = false
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const isOwner = currentUserId === post.userId;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getCategoryInfo = (category: string) => {
    const categories = {
      book: { icon: '📚', label: 'Kitap' },
      philosophy: { icon: '🤔', label: 'Felsefe' },
      culture: { icon: '🎭', label: 'Kültür' },
      thought: { icon: '💭', label: 'Düşünce' },
      general: { icon: '💬', label: 'Genel' }
    };
    return categories[category as keyof typeof categories] || categories.general;
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await onLike(post.id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      await onComment(post.id, newComment.trim());
      setNewComment('');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const renderContent = () => {
    const content = post.content;
    if (content.length <= 280) return content;

    return (
      <div className="post-content-expandable">
        <p>{content.substring(0, 280)}...</p>
        <button className="read-more-btn">Devamını oku</button>
      </div>
    );
  };

  const categoryInfo = getCategoryInfo(post.category);

  return (
    <>
      <article className="post-card">
        {/* Post Header */}
        <header className="post-header">
          <div className="user-info">
            <img 
              src={post.user.profileImage || '/default-avatar.png'} 
              alt={post.user.fullName}
              className="user-avatar"
            />
            <div className="user-details">
              <h4 className="user-name">{post.user.fullName}</h4>
              <div className="post-meta">
                <span className="username">@{post.user.username}</span>
                <span className="separator">•</span>
                <time className="post-date">{formatDate(post.createdAt)}</time>
                {post.user.city && (
                  <>
                    <span className="separator">•</span>
                    <span className="user-location">📍 {post.user.city}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="post-category">
            <span className="category-badge">
              {categoryInfo.icon} {categoryInfo.label}
            </span>
            {isOwner && (
              <div className="post-actions-menu">
                <button className="menu-trigger">⋮</button>
                <div className="menu-dropdown">
                  {onEditPost && (
                    <button onClick={() => onEditPost(post.id)}>
                      ✏️ Düzenle
                    </button>
                  )}
                  {onDeletePost && (
                    <button 
                      onClick={() => onDeletePost(post.id)}
                      className="delete-btn"
                    >
                      🗑️ Sil
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Post Content */}
        <div className="post-content">
          {renderContent()}
        </div>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className={`post-images ${post.images.length === 1 ? 'single' : 'multiple'}`}>
            {post.images.map((image, index) => (
              <div 
                key={image.id} 
                className="image-container"
                onClick={() => handleImageClick(index)}
              >
                <img 
                  src={image.url} 
                  alt={image.alt || `Image ${index + 1}`}
                  loading="lazy"
                />
                {image.caption && (
                  <div className="image-caption">{image.caption}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Post Stats */}
        <div className="post-stats">
          <div className="stats-left">
            {post.likesCount > 0 && (
              <span className="stat-item">
                ❤️ {post.likesCount} beğeni
              </span>
            )}
            {post.commentsCount > 0 && (
              <span className="stat-item">
                💬 {post.commentsCount} yorum
              </span>
            )}
            {post.sharesCount > 0 && (
              <span className="stat-item">
                🔄 {post.sharesCount} paylaşım
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="post-actions">
          <button 
            className={`action-btn like-btn ${post.isLiked ? 'active' : ''}`}
            onClick={handleLike}
            disabled={isLiking}
          >
            <span className="action-icon">{post.isLiked ? '❤️' : '🤍'}</span>
            <span className="action-text">Beğen</span>
          </button>

          <button 
            className="action-btn comment-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <span className="action-icon">💬</span>
            <span className="action-text">Yorum</span>
          </button>

          <button 
            className="action-btn share-btn"
            onClick={() => onShare(post.id)}
          >
            <span className="action-icon">🔄</span>
            <span className="action-text">Paylaş</span>
          </button>

          <button 
            className={`action-btn bookmark-btn ${post.isBookmarked ? 'active' : ''}`}
            onClick={() => onBookmark(post.id)}
          >
            <span className="action-icon">{post.isBookmarked ? '🔖' : '📌'}</span>
            <span className="action-text">Kaydet</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="comments-section">
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Yorumunuzu yazın..."
                className="comment-input"
                maxLength={280}
                disabled={isCommenting}
              />
              <button 
                type="submit" 
                className="comment-submit"
                disabled={!newComment.trim() || isCommenting}
              >
                {isCommenting ? '⏳' : '➤'}
              </button>
            </form>

            {/* Comments List */}
            <div className="comments-list">
              {isLoadingComments ? (
                <div className="loading-comments">Yorumlar yükleniyor...</div>
              ) : comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <img 
                      src={comment.user.profileImage || '/default-avatar.png'} 
                      alt={comment.user.fullName}
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.user.fullName}</span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                      {comment.likesCount > 0 && (
                        <div className="comment-stats">
                          ❤️ {comment.likesCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-comments">Henüz yorum yok. İlk yorumu siz yapın!</div>
              )}
            </div>
          </div>
        )}
      </article>

      {/* Image Modal */}
      {showImageModal && post.images && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowImageModal(false)}
            >
              ✕
            </button>
            <img 
              src={post.images[selectedImageIndex]?.url} 
              alt={post.images[selectedImageIndex]?.alt}
            />
            {post.images.length > 1 && (
              <div className="modal-navigation">
                <button 
                  className="nav-btn prev"
                  onClick={() => setSelectedImageIndex(
                    selectedImageIndex > 0 ? selectedImageIndex - 1 : post.images!.length - 1
                  )}
                >
                  ‹
                </button>
                <button 
                  className="nav-btn next"
                  onClick={() => setSelectedImageIndex(
                    selectedImageIndex < post.images!.length - 1 ? selectedImageIndex + 1 : 0
                  )}
                >
                  ›
                </button>
              </div>
            )}
            <div className="modal-counter">
              {selectedImageIndex + 1} / {post.images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
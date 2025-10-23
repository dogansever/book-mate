import React, { useState, useEffect, useCallback } from 'react';
import { Post, PostComment, PostFilters, PostSortOptions, PostCategory, CreatePostData } from '../types/post';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import PostService from '../services/postService';
import { useAuth } from '../hooks/useAuth';
import './PostFeed.css';

interface PostFeedProps {
  userId?: string; // Belirli bir kullanıcının postları için
  category?: PostCategory; // Belirli kategori filtresi
  showCreatePost?: boolean;
  limit?: number;
}

const PostFeed: React.FC<PostFeedProps> = ({ 
  userId, 
  category, 
  showCreatePost = true,
  limit = 10
}) => {
  const { state } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // Filtering ve sorting states
  const [activeFilters, setActiveFilters] = useState<PostFilters>({
    category: category,
    userId: userId
  });
  const [sortOptions, setSortOptions] = useState<PostSortOptions>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadPosts = useCallback(async (offset = 0, append = false) => {
    try {
      if (offset === 0) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await PostService.getAllPosts({
        filters: activeFilters,
        sortOptions,
        limit,
        offset
      });

      if (append) {
        setPosts(prev => [...prev, ...response.posts]);
      } else {
        setPosts(response.posts);
      }

      setHasMore(response.posts.length === limit && offset + response.posts.length < response.total);
    } catch (err) {
      console.error('Posts yüklenirken hata:', err);
      setError('Postlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeFilters, sortOptions, limit]);



  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async (data: CreatePostData) => {
    if (!state.user?.id) {
      alert('Post oluşturmak için giriş yapmanız gerekiyor');
      return;
    }

    setIsCreatingPost(true);
    try {
      const newPost = await PostService.createPost(data, state.user.id);
      setPosts(prev => [newPost, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Post oluşturulurken hata:', err);
      throw err; // CreatePost komponenti hatayı handle edecek
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!state.user?.id) return;

    try {
      const result = await PostService.toggleLike(postId, state.user.id);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, isLiked: result.isLiked, likesCount: result.likesCount }
          : post
      ));
    } catch (err) {
      console.error('Beğeni işlemi hatası:', err);
    }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!state.user?.id) return;

    try {
      const newComment = await PostService.createComment(postId, state.user.id, { content });
      
      // Yorumları güncelle
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));

      // Post'un yorum sayısını artır
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post
      ));
    } catch (err) {
      console.error('Yorum ekleme hatası:', err);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      const isBookmarked = await PostService.toggleBookmark(postId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, isBookmarked }
          : post
      ));
    } catch (err) {
      console.error('Bookmark işlemi hatası:', err);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      // Basit share fonksiyonu - gerçek uygulamada social sharing API'leri kullanılabilir
      if (navigator.share) {
        await navigator.share({
          title: 'Book Mate - Kitap Paylaşımı',
          text: 'Bu gönderiyi incele!',
          url: `${window.location.origin}/post/${postId}`
        });
      } else {
        // Fallback: URL'yi panoya kopyala
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        alert('Post linki panoya kopyalandı!');
      }
    } catch (err) {
      console.error('Paylaşım hatası:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bu postu silmek istediğinizden emin misiniz?')) return;

    try {
      await PostService.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Post silme hatası:', err);
      alert('Post silinirken bir hata oluştu');
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(posts.length, true);
    }
  };

  const handleFilterChange = (newFilters: Partial<PostFilters>) => {
    setActiveFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSort: Partial<PostSortOptions>) => {
    setSortOptions(prev => ({ ...prev, ...newSort }));
  };

  const clearFilters = () => {
    setActiveFilters({
      category: category,
      userId: userId
    });
  };

  if (loading) {
    return (
      <div className="post-feed">
        <div className="loading-skeleton">
          {[1, 2, 3].map(i => (
            <div key={i} className="post-skeleton">
              <div className="skeleton-header">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-text">
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                </div>
              </div>
              <div className="skeleton-content">
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-feed">
        <div className="error-state">
          <div className="error-icon">😔</div>
          <h3>Bir şeyler ters gitti</h3>
          <p>{error}</p>
          <button onClick={() => loadPosts()} className="retry-btn">
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-feed">
      {/* Create Post Button/Modal */}
      {showCreatePost && state.user && (
        <div className="create-post-section">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="create-post-trigger"
          >
            <img 
              src={state.user.avatar || '/default-avatar.png'} 
              alt="Profile" 
              className="trigger-avatar"
            />
            <span className="trigger-text">Düşüncelerinizi paylaşın...</span>
            <div className="trigger-icons">
              <span>📚</span>
              <span>📷</span>
              <span>💭</span>
            </div>
          </button>
        </div>
      )}

      {/* Filters and Sort */}
      <div className="feed-controls">
        <div className="controls-left">
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filtrele
          </button>
          
          <select 
            value={sortOptions.sortBy}
            onChange={(e) => handleSortChange({ sortBy: e.target.value as 'createdAt' | 'likesCount' | 'commentsCount' | 'popularity' })}
            className="sort-select"
          >
            <option value="createdAt">En Yeni</option>
            <option value="likesCount">En Çok Beğenilen</option>
            <option value="commentsCount">En Çok Yorumlanan</option>
            <option value="popularity">En Popüler</option>
          </select>
        </div>

        <div className="controls-right">
          <span className="post-count">{posts.length} gönderi</span>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="advanced-filters">
          <div className="filter-group">
            <label>Kategori</label>
            <select 
              value={activeFilters.category || ''}
              onChange={(e) => handleFilterChange({ 
                category: e.target.value as PostCategory || undefined 
              })}
            >
              <option value="">Tümü</option>
              <option value="book">📚 Kitap</option>
              <option value="philosophy">🤔 Felsefe</option>
              <option value="culture">🎭 Kültür</option>
              <option value="thought">💭 Düşünce</option>
              <option value="general">💬 Genel</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <input 
                type="checkbox"
                checked={activeFilters.hasImages || false}
                onChange={(e) => handleFilterChange({ hasImages: e.target.checked || undefined })}
              />
              Sadece görselli postlar
            </label>
          </div>

          <button onClick={clearFilters} className="clear-filters">
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* Posts List */}
      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Henüz post yok</h3>
            <p>
              {userId 
                ? 'Bu kullanıcının henüz paylaşımı bulunmuyor.'
                : 'Henüz paylaşım yapılmamış. İlk paylaşımı siz yapın!'
              }
            </p>
            {showCreatePost && !userId && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="create-first-post"
              >
                İlk Postu Oluştur
              </button>
            )}
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onDeletePost={state.user?.id === post.userId ? handleDeletePost : undefined}
              currentUserId={state.user?.id}
              comments={comments[post.id] || []}
              isLoadingComments={false}
            />
          ))
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="load-more-section">
          <button 
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="load-more-btn"
          >
            {loadingMore ? 'Yükleniyor...' : 'Daha Fazla Göster'}
          </button>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <CreatePost
              onSubmit={handleCreatePost}
              onCancel={() => setShowCreateModal(false)}
              isSubmitting={isCreatingPost}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
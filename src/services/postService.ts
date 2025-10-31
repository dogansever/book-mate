import { 
  Post, 
  PostComment, 
  CreatePostData, 
  PostFeedOptions, 
  CreateCommentData, 
  User
} from '../types/post';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface ApiPost extends Omit<Post, 'user' | 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

interface ApiComment extends Omit<PostComment, 'user' | 'createdAt'> {
  createdAt: string;
}

// API'den kullanıcı bilgisini getir
async function getUser(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    if (!response.ok) return null;
    
    const userData = await response.json();
    return {
      id: userData.id,
      username: userData.displayName?.toLowerCase().replace(' ', '_') || 'user',
      fullName: userData.displayName,
      profileImage: userData.avatar,
      city: userData.profile?.city || '',
      followersCount: 0, // Bu bilgi userStats'ten alınabilir
      followingCount: 0  // Bu bilgi userStats'ten alınabilir
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// API Post'unu UI Post'una dönüştür
async function mapApiPostToPost(apiPost: ApiPost): Promise<Post> {
  const user = await getUser(apiPost.userId);
  
  return {
    ...apiPost,
    user: user || {
      id: apiPost.userId,
      username: 'unknown_user',
      fullName: 'Bilinmeyen Kullanıcı',
      profileImage: '👤',
      city: '',
      followersCount: 0,
      followingCount: 0
    },
    createdAt: new Date(apiPost.createdAt),
    updatedAt: new Date(apiPost.updatedAt)
  };
}

export class PostService {
  
  // Tüm postları getir
  static async getAllPosts(options: PostFeedOptions = {}): Promise<{ posts: Post[]; total: number }> {
    try {
      let url = `${API_BASE_URL}/posts`;
      const params = new URLSearchParams();
      
      // Pagination
      if (options.limit) params.append('_limit', options.limit.toString());
      if (options.offset) {
        const page = Math.floor(options.offset / (options.limit || 10)) + 1;
        params.append('_page', page.toString());
      }
      
      // Sorting
      if (options.sortOptions) {
        params.append('_sort', options.sortOptions.sortBy);
        params.append('_order', options.sortOptions.sortOrder || 'desc');
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const apiPosts: ApiPost[] = await response.json();
      const posts = await Promise.all(apiPosts.map(mapApiPostToPost));
      
      // Filtreleme (client-side, daha iyi performans için server-side yapılabilir)
      let filteredPosts = posts;
      
      if (options.filters) {
        const { category, userId, tags } = options.filters;
        
        if (category) {
          filteredPosts = filteredPosts.filter(post => post.category === category);
        }
        
        if (userId) {
          filteredPosts = filteredPosts.filter(post => post.userId === userId);
        }
        
        if (tags && tags.length > 0) {
          filteredPosts = filteredPosts.filter(post => 
            post.tags?.some(tag => tags.includes(tag))
          );
        }
      }
      
      return {
        posts: filteredPosts,
        total: filteredPosts.length
      };
      
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], total: 0 };
    }
  }

  // Belirli bir postu getir
  static async getPostById(postId: string): Promise<Post | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
      if (!response.ok) return null;
      
      const apiPost: ApiPost = await response.json();
      return await mapApiPostToPost(apiPost);
      
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }

  // Yeni post oluştur
  static async createPost(postData: CreatePostData, userId: string): Promise<Post | null> {
    try {
      const newPost = {
        id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: userId,
        type: postData.type,
        category: postData.category,
        content: postData.content,
        images: postData.images || [],
        tags: postData.tags || [],
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        isBookmarked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: postData.visibility || 'public'
      };

      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost)
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const createdPost: ApiPost = await response.json();
      return await mapApiPostToPost(createdPost);
      
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  // Post beğen/beğenmekten vazgeç
  static async toggleLike(postId: string, userId: string): Promise<{ success: boolean; isLiked: boolean; likesCount: number }> {
    try {
      // Mevcut beğeniyi kontrol et
      const likesResponse = await fetch(`${API_BASE_URL}/postLikes?postId=${postId}&userId=${userId}`);
      const existingLikes = await likesResponse.json();
      
      if (existingLikes.length > 0) {
        // Beğeniyi kaldır
        const deleteResponse = await fetch(`${API_BASE_URL}/postLikes/${existingLikes[0].id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          // Post'un likesCount'unu güncelle
          const post = await this.getPostById(postId);
          if (post) {
            await fetch(`${API_BASE_URL}/posts/${postId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                likesCount: Math.max(0, post.likesCount - 1)
              })
            });
          }
          
          return { success: true, isLiked: false, likesCount: post ? post.likesCount - 1 : 0 };
        }
      } else {
        // Beğeni ekle
        const newLike = {
          id: `like-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          postId,
          userId,
          createdAt: new Date().toISOString()
        };
        
        const createResponse = await fetch(`${API_BASE_URL}/postLikes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLike)
        });
        
        if (createResponse.ok) {
          // Post'un likesCount'unu güncelle
          const post = await this.getPostById(postId);
          if (post) {
            await fetch(`${API_BASE_URL}/posts/${postId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                likesCount: post.likesCount + 1
              })
            });
          }
          
          return { success: true, isLiked: true, likesCount: post ? post.likesCount + 1 : 1 };
        }
      }
      
      return { success: false, isLiked: false, likesCount: 0 };
      
    } catch (error) {
      console.error('Error toggling like:', error);
      return { success: false, isLiked: false, likesCount: 0 };
    }
  }

  // Post yorumlarını getir
  static async getPostComments(postId: string): Promise<PostComment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/postComments?postId=${postId}`);
      if (!response.ok) return [];
      
      const apiComments: ApiComment[] = await response.json();
      
      const comments = await Promise.all(
        apiComments.map(async (comment) => {
          const user = await getUser(comment.userId);
          return {
            ...comment,
            user: user || {
              id: comment.userId,
              username: 'unknown_user',
              fullName: 'Bilinmeyen Kullanıcı',
              profileImage: '👤',
              city: '',
              followersCount: 0,
              followingCount: 0
            },
            createdAt: new Date(comment.createdAt)
          };
        })
      );
      
      return comments;
      
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Yorum ekle
  static async addComment(postId: string, userId: string, commentData: CreateCommentData): Promise<PostComment | null> {
    try {
      const newComment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        postId: postId,
        userId: userId,
        content: commentData.content,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        isLiked: false
      };

      const response = await fetch(`${API_BASE_URL}/postComments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newComment)
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const createdComment = await response.json();
      
      // Post'un commentsCount'unu güncelle
      const post = await this.getPostById(postId);
      if (post) {
        await fetch(`${API_BASE_URL}/posts/${postId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commentsCount: post.commentsCount + 1
          })
        });
      }

      const user = await getUser(createdComment.userId);
      
      return {
        ...createdComment,
        user: user || {
          id: createdComment.userId,
          username: 'unknown_user',
          fullName: 'Bilinmeyen Kullanıcı',
          profileImage: '👤',
          city: '',
          followersCount: 0,
          followingCount: 0
        },
        createdAt: new Date(createdComment.createdAt)
      };
      
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  // Kullanıcının postlarını getir
  static async getUserPosts(userId: string, limit: number = 20): Promise<Post[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts?userId=${userId}&_limit=${limit}&_sort=createdAt&_order=desc`);
      if (!response.ok) return [];
      
      const apiPosts: ApiPost[] = await response.json();
      const posts = await Promise.all(apiPosts.map(mapApiPostToPost));
      
      return posts;
      
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  }

  // Trend olan postları getir
  static async getTrendingPosts(limit: number = 10): Promise<Post[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts?_sort=likesCount&_order=desc&_limit=${limit}`);
      if (!response.ok) return [];
      
      const apiPosts: ApiPost[] = await response.json();
      const posts = await Promise.all(apiPosts.map(mapApiPostToPost));
      
      return posts;
      
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      return [];
    }
  }

  // Önerilen postlar (takip edilen kullanıcılardan)
  static async getRecommendedPosts(userId: string, limit: number = 10): Promise<Post[]> {
    try {
      // Kullanıcının takip ettiği kişileri al
      const followingResponse = await fetch(`${API_BASE_URL}/followRelationships?followerId=${userId}`);
      const followingRelations = await followingResponse.json();
      const followingIds = followingRelations.map((rel: any) => rel.followingId);
      
      if (followingIds.length === 0) {
        // Takip edilen kimse yoksa trending postları döndür
        return this.getTrendingPosts(limit);
      }
      
      // Takip edilen kullanıcıların postlarını al
      const allPosts: Post[] = [];
      for (const followingId of followingIds) {
        const posts = await this.getUserPosts(followingId, 5);
        allPosts.push(...posts);
      }
      
      // Tarih sırasına göre sırala ve limit uygula
      return allPosts
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error fetching recommended posts:', error);
      return [];
    }
  }

  // Post güncelle
  static async updatePost(postId: string, updateData: Partial<Post>): Promise<Post> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      const updatedPost = await response.json();
      return mapApiPostToPost(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  // Post sil
  static async deletePost(postId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  // Bookmark toggle
  static async toggleBookmark(postId: string, _userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookmarked: true // Simplified implementation
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle bookmark');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  // Yorum ekle
  static async createComment(postId: string, commentData: CreateCommentData): Promise<PostComment> {
    try {
      const response = await fetch(`${API_BASE_URL}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...commentData,
          postId,
          createdAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      const comment = await response.json();
      const user = await getUser(comment.userId);
      
      return {
        id: comment.id,
        postId: postId,
        content: comment.content,
        userId: comment.userId,
        user: user || { id: comment.userId, username: 'unknown', fullName: 'Unknown User', profileImage: '' },
        likesCount: 0,
        isLiked: false,
        createdAt: new Date(comment.createdAt)
      };
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  // Post istatistikleri
  static async getPostStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`);
      if (!response.ok) {
        throw new Error('Failed to fetch post stats');
      }
      
      const posts = await response.json();
      return {
        totalPosts: posts.length,
        totalLikes: posts.reduce((sum: number, post: any) => sum + (post.likes || 0), 0),
        totalComments: posts.reduce((sum: number, post: any) => sum + (post.comments?.length || 0), 0)
      };
    } catch (error) {
      console.error('Error fetching post stats:', error);
      throw error;
    }
  }
}

export default PostService;
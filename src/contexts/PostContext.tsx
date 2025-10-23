import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  Post, 
  PostComment, 
  CreatePostData, 
  UpdatePostData, 
  PostStats, 
  PostFilters,
  PostSortOptions
} from '../types/post';
import PostService from '../services/postService';

interface PostContextState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalPosts: number;
  filters: PostFilters;
  sortOptions: PostSortOptions;
  selectedPost: Post | null;
  stats: PostStats | null;
}

interface PostContextActions {
  // Post CRUD
  loadPosts: (options?: { append?: boolean; offset?: number }) => Promise<void>;
  createPost: (data: CreatePostData, userId: string) => Promise<Post>;
  updatePost: (postId: string, data: UpdatePostData) => Promise<Post | null>;
  deletePost: (postId: string) => Promise<boolean>;
  
  // Interactions
  toggleLike: (postId: string, userId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
  addComment: (postId: string, userId: string, content: string) => Promise<PostComment>;
  
  // Filtering & Sorting
  setFilters: (filters: Partial<PostFilters>) => void;
  setSortOptions: (sort: Partial<PostSortOptions>) => void;
  clearFilters: () => void;
  
  // UI State
  setSelectedPost: (post: Post | null) => void;
  
  // Stats
  loadStats: (userId?: string) => Promise<void>;
  
  // Utils
  reset: () => void;
}

type PostContextType = PostContextState & PostContextActions;

const defaultState: PostContextState = {
  posts: [],
  loading: false,
  error: null,
  hasMore: true,
  totalPosts: 0,
  filters: {},
  sortOptions: { sortBy: 'createdAt', sortOrder: 'desc' },
  selectedPost: null,
  stats: null
};

const PostContext = createContext<PostContextType | undefined>(undefined);

interface PostProviderProps {
  children: ReactNode;
  initialFilters?: PostFilters;
  limit?: number;
}

export const PostProvider: React.FC<PostProviderProps> = ({ 
  children, 
  initialFilters = {},
  limit = 10
}) => {
  const [state, setState] = useState<PostContextState>({
    ...defaultState,
    filters: initialFilters
  });

  // Post CRUD Operations
  const loadPosts = useCallback(async (options: { append?: boolean; offset?: number } = {}) => {
    try {
      if (!options.append) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const offset = options.offset ?? (options.append ? state.posts.length : 0);

      const response = await PostService.getAllPosts({
        filters: state.filters,
        sortOptions: state.sortOptions,
        limit,
        offset
      });

      setState(prev => ({
        ...prev,
        posts: options.append ? [...prev.posts, ...response.posts] : response.posts,
        hasMore: response.posts.length === limit && offset + response.posts.length < response.total,
        totalPosts: response.total,
        loading: false
      }));
    } catch (err) {
      console.error('Posts yüklenirken hata:', err);
      setState(prev => ({ 
        ...prev, 
        error: 'Postlar yüklenirken bir hata oluştu',
        loading: false 
      }));
    }
  }, [state.filters, state.sortOptions, state.posts.length, limit]);

  const createPost = useCallback(async (data: CreatePostData, userId: string): Promise<Post> => {
    try {
      const newPost = await PostService.createPost(data, userId);
      
      setState(prev => ({
        ...prev,
        posts: [newPost, ...prev.posts],
        totalPosts: prev.totalPosts + 1
      }));
      
      return newPost;
    } catch (err) {
      console.error('Post oluşturulurken hata:', err);
      throw new Error('Post oluşturulurken bir hata oluştu');
    }
  }, []);

  const updatePost = useCallback(async (postId: string, data: UpdatePostData): Promise<Post | null> => {
    try {
      const updatedPost = await PostService.updatePost(postId, data);
      
      if (updatedPost) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.map(post => 
            post.id === postId ? updatedPost : post
          ),
          selectedPost: prev.selectedPost?.id === postId ? updatedPost : prev.selectedPost
        }));
      }
      
      return updatedPost;
    } catch (err) {
      console.error('Post güncellenirken hata:', err);
      throw new Error('Post güncellenirken bir hata oluştu');
    }
  }, []);

  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    try {
      const success = await PostService.deletePost(postId);
      
      if (success) {
        setState(prev => ({
          ...prev,
          posts: prev.posts.filter(post => post.id !== postId),
          totalPosts: Math.max(0, prev.totalPosts - 1),
          selectedPost: prev.selectedPost?.id === postId ? null : prev.selectedPost
        }));
      }
      
      return success;
    } catch (err) {
      console.error('Post silinirken hata:', err);
      throw new Error('Post silinirken bir hata oluştu');
    }
  }, []);

  // Interaction Methods
  const toggleLike = useCallback(async (postId: string, userId: string) => {
    try {
      const result = await PostService.toggleLike(postId, userId);
      
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: result.isLiked, 
                likesCount: result.likesCount 
              }
            : post
        ),
        selectedPost: prev.selectedPost?.id === postId 
          ? { 
              ...prev.selectedPost, 
              isLiked: result.isLiked, 
              likesCount: result.likesCount 
            }
          : prev.selectedPost
      }));
    } catch (err) {
      console.error('Beğeni işlemi hatası:', err);
      throw new Error('Beğeni işlemi sırasında bir hata oluştu');
    }
  }, []);

  const toggleBookmark = useCallback(async (postId: string) => {
    try {
      const isBookmarked = await PostService.toggleBookmark(postId);
      
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(post => 
          post.id === postId ? { ...post, isBookmarked } : post
        ),
        selectedPost: prev.selectedPost?.id === postId 
          ? { ...prev.selectedPost, isBookmarked }
          : prev.selectedPost
      }));
    } catch (err) {
      console.error('Bookmark işlemi hatası:', err);
      throw new Error('Kaydetme işlemi sırasında bir hata oluştu');
    }
  }, []);

  const addComment = useCallback(async (postId: string, userId: string, content: string): Promise<PostComment> => {
    try {
      const newComment = await PostService.createComment(postId, userId, { content });
      
      setState(prev => ({
        ...prev,
        posts: prev.posts.map(post => 
          post.id === postId 
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        ),
        selectedPost: prev.selectedPost?.id === postId 
          ? { ...prev.selectedPost, commentsCount: prev.selectedPost.commentsCount + 1 }
          : prev.selectedPost
      }));
      
      return newComment;
    } catch (err) {
      console.error('Yorum ekleme hatası:', err);
      throw new Error('Yorum eklenirken bir hata oluştu');
    }
  }, []);

  // Filter & Sort Methods
  const setFilters = useCallback((newFilters: Partial<PostFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      posts: [], // Reset posts when filters change
      hasMore: true,
      totalPosts: 0
    }));
  }, []);

  const setSortOptions = useCallback((newSort: Partial<PostSortOptions>) => {
    setState(prev => ({
      ...prev,
      sortOptions: { ...prev.sortOptions, ...newSort },
      posts: [], // Reset posts when sort changes
      hasMore: true,
      totalPosts: 0
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      posts: [],
      hasMore: true,
      totalPosts: 0
    }));
  }, []);

  // UI State Methods
  const setSelectedPost = useCallback((post: Post | null) => {
    setState(prev => ({ ...prev, selectedPost: post }));
  }, []);

  // Stats Methods
  const loadStats = useCallback(async (userId?: string) => {
    try {
      const stats = await PostService.getPostStats(userId);
      setState(prev => ({ ...prev, stats }));
    } catch (err) {
      console.error('İstatistikler yüklenirken hata:', err);
    }
  }, []);

  // Utility Methods
  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  // Auto-load posts when filters or sort options change
  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const contextValue: PostContextType = {
    // State
    ...state,
    
    // Actions
    loadPosts,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    toggleBookmark,
    addComment,
    setFilters,
    setSortOptions,
    clearFilters,
    setSelectedPost,
    loadStats,
    reset
  };

  return (
    <PostContext.Provider value={contextValue}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = (): PostContextType => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};

export default PostContext;
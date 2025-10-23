export interface User {
  id: string;
  username: string;
  fullName: string;
  profileImage?: string;
  city?: string;
  followersCount?: number;
  followingCount?: number;
}

export type PostCategory = 'book' | 'philosophy' | 'culture' | 'thought' | 'general';

export type PostType = 'text' | 'image' | 'text-image';

export interface PostImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  type: PostType;
  category: PostCategory;
  content: string;
  images?: PostImage[];
  tags?: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt: Date;
  visibility: 'public' | 'followers' | 'private';
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: Date;
  parentCommentId?: string; // İç içe yorumlar için
  replies?: PostComment[];
}

export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  user: User;
  createdAt: Date;
}

export interface CreatePostData {
  type: PostType;
  category: PostCategory;
  content: string;
  images?: File[];
  tags?: string[];
  visibility?: 'public' | 'followers' | 'private';
}

export interface UpdatePostData {
  content?: string;
  category?: PostCategory;
  tags?: string[];
  visibility?: 'public' | 'followers' | 'private';
}

export interface PostFilters {
  category?: PostCategory;
  userId?: string;
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  hasImages?: boolean;
}

export interface PostSortOptions {
  sortBy: 'createdAt' | 'likesCount' | 'commentsCount' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

export interface PostFeedOptions {
  filters?: PostFilters;
  sortOptions?: PostSortOptions;
  limit?: number;
  offset?: number;
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: string;
}

export interface PostStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  categoryBreakdown: Record<PostCategory, number>;
  topTags: Array<{ tag: string; count: number }>;
}

// Form state için
export interface PostFormData {
  content: string;
  category: PostCategory;
  images: File[];
  tags: string[];
  visibility: 'public' | 'followers' | 'private';
}

// UI durumları için
export interface PostUIState {
  isCreating: boolean;
  isLoading: boolean;
  error: string | null;
  selectedPost: Post | null;
  showCreateModal: boolean;
  showImageModal: boolean;
  selectedImage: PostImage | null;
}

export const POST_CATEGORIES: Array<{ value: PostCategory; label: string; icon: string }> = [
  { value: 'book', label: 'Kitap', icon: '📚' },
  { value: 'philosophy', label: 'Felsefe', icon: '🤔' },
  { value: 'culture', label: 'Kültür', icon: '🎭' },
  { value: 'thought', label: 'Düşünce', icon: '💭' },
  { value: 'general', label: 'Genel', icon: '💬' }
];

export const POST_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Herkese Açık', icon: '🌍' },
  { value: 'followers', label: 'Takipçilerime', icon: '👥' },
  { value: 'private', label: 'Sadece Ben', icon: '🔒' }
] as const;
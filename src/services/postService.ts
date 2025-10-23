import { 
  Post, 
  PostComment, 
  PostLike, 
  CreatePostData, 
  UpdatePostData, 
  PostFeedOptions, 
  CreateCommentData, 
  PostStats, 
  PostCategory,
  PostImage,
  User
} from '../types/post';

// Mock veriler
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'ahmet_okur',
    fullName: 'Ahmet Okur',
    profileImage: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=AO',
    city: 'İstanbul',
    followersCount: 342,
    followingCount: 156
  },
  {
    id: '2',
    username: 'zeynep_felsefe',
    fullName: 'Zeynep Aksoy',
    profileImage: 'https://via.placeholder.com/150/9C27B0/FFFFFF?text=ZA',
    city: 'Ankara',
    followersCount: 567,
    followingCount: 201
  },
  {
    id: '3',
    username: 'mustafa_kultur',
    fullName: 'Mustafa Kaya',
    profileImage: 'https://via.placeholder.com/150/FF5722/FFFFFF?text=MK',
    city: 'İzmir',
    followersCount: 234,
    followingCount: 89
  },
  {
    id: '4',
    username: 'elif_dusunce',
    fullName: 'Elif Yıldız',
    profileImage: 'https://via.placeholder.com/150/2196F3/FFFFFF?text=EY',
    city: 'Bursa',
    followersCount: 445,
    followingCount: 167
  }
];

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    userId: '1',
    user: MOCK_USERS[0],
    type: 'text-image',
    category: 'book',
    content: 'Bugün "Suç ve Ceza" kitabını bitirdim. Dostoyevski\'nin insan psikolojisini işleme biçimi gerçekten büyüleyici. Raskolnikov karakterinin iç çelişkileri modern insanın ruhsal durumunu da yansıtıyor gibi. Özellikle suçluluk duygusunun nasıl bireyi içten içe kemirdiğini gözler önüne seriyor.',
    images: [
      {
        id: 'img1',
        url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        alt: 'Suç ve Ceza kitabı',
        caption: 'Dostoyevski - Suç ve Ceza'
      }
    ],
    tags: ['dostoyevski', 'klasik', 'psikoloji', 'rus_edebiyatı'],
    likesCount: 24,
    commentsCount: 8,
    sharesCount: 3,
    isLiked: false,
    isBookmarked: true,
    createdAt: new Date('2025-10-23T10:30:00'),
    updatedAt: new Date('2025-10-23T10:30:00'),
    visibility: 'public'
  },
  {
    id: '2',
    userId: '2',
    user: MOCK_USERS[1],
    type: 'text',
    category: 'philosophy',
    content: 'Nietzsche\'nin "Böyle Buyurdu Zerdüşt" eserinde geçen "üst-insan" kavramı üzerine düşünüyorum. Acaba modern toplumda üst-insan olmak ne demek? Kendi değerlerini yaratmak, toplumsal normları sorgulamak... Bu çok cesaret gerektiren bir duruş.',
    tags: ['nietzsche', 'üst_insan', 'değerler', 'modern_felsefe'],
    likesCount: 31,
    commentsCount: 12,
    sharesCount: 7,
    isLiked: true,
    isBookmarked: false,
    createdAt: new Date('2025-10-23T08:15:00'),
    updatedAt: new Date('2025-10-23T08:15:00'),
    visibility: 'public'
  },
  {
    id: '3',
    userId: '3',
    user: MOCK_USERS[2],
    type: 'text-image',
    category: 'culture',
    content: 'İstanbul\'da gezdiğim bu eski mahallede rastladığım kahvehane. Duvarlardaki eski fotoğraflar, masa oyunları, hikaye anlatıcılığı... Dijital çağda kaybolmaya yüz tutmuş kültürel değerlerimiz. Bu mekanların korunması gerekmiyor mu?',
    images: [
      {
        id: 'img2',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
        alt: 'Eski kahvehane',
        caption: 'Tarihi İstanbul kahvehanesi'
      }
    ],
    tags: ['kültür', 'gelenek', 'istanbul', 'kahvehane'],
    likesCount: 18,
    commentsCount: 5,
    sharesCount: 2,
    isLiked: false,
    isBookmarked: true,
    createdAt: new Date('2025-10-22T16:45:00'),
    updatedAt: new Date('2025-10-22T16:45:00'),
    visibility: 'public'
  },
  {
    id: '4',
    userId: '4',
    user: MOCK_USERS[3],
    type: 'text',
    category: 'thought',
    content: 'Bazen düşünüyorum da, teknoloji bizi birbirimize yakınlaştırdı mı yoksa uzaklaştırdı mı? Sosyal medya sayesinde dünya çapında insanlarla iletişim kurabiliyoruz ama yanımızdaki insanla göz teması kurmakta zorlanıyoruz. Paradoks değil mi?',
    tags: ['teknoloji', 'sosyal_medya', 'insan_ilişkileri', 'modern_hayat'],
    likesCount: 45,
    commentsCount: 19,
    sharesCount: 11,
    isLiked: true,
    isBookmarked: false,
    createdAt: new Date('2025-10-22T14:20:00'),
    updatedAt: new Date('2025-10-22T14:20:00'),
    visibility: 'public'
  },
  {
    id: '5',
    userId: '1',
    user: MOCK_USERS[0],
    type: 'text',
    category: 'book',
    content: 'Kitap okuma alışkanlığı konusunda bir gözlem: Dijital kitaplar pratik olsa da, fiziksel kitapların o sayfa kokusu, dokunma hissi bambaşka. Sizin tercihiniz nedir? E-kitap mı, basılı kitap mı?',
    tags: ['kitap', 'okuma', 'dijital', 'basılı_kitap'],
    likesCount: 27,
    commentsCount: 15,
    sharesCount: 4,
    isLiked: false,
    isBookmarked: false,
    createdAt: new Date('2025-10-21T12:10:00'),
    updatedAt: new Date('2025-10-21T12:10:00'),
    visibility: 'public'
  }
];

const MOCK_COMMENTS: PostComment[] = [
  {
    id: '1',
    postId: '1',
    userId: '2',
    user: MOCK_USERS[1],
    content: 'Dostoyevski\'nin karakterleri gerçekten çok derinlikli. Ben de Raskolnikov\'un iç dünyasına hayran kalmıştım.',
    likesCount: 3,
    isLiked: false,
    createdAt: new Date('2025-10-23T11:00:00')
  },
  {
    id: '2',
    postId: '2',
    userId: '3',
    user: MOCK_USERS[2],
    content: 'Nietzsche\'nin üst-insan kavramı çok tartışmalı. Aslında kendi değerlerini yaratmak her insanın hakkı olmalı.',
    likesCount: 5,
    isLiked: true,
    createdAt: new Date('2025-10-23T09:30:00')
  }
];

export class PostService {
  private static posts: Post[] = [...MOCK_POSTS];
  private static comments: PostComment[] = [...MOCK_COMMENTS];
  private static likes: PostLike[] = [];

  // Post CRUD işlemleri
  static async getAllPosts(options: PostFeedOptions = {}): Promise<{ posts: Post[]; total: number }> {
    await this.delay(300); // API simülasyonu

    let filteredPosts = [...this.posts];

    // Filtreleme
    if (options.filters) {
      const { category, userId, tags, dateFrom, dateTo, hasImages } = options.filters;

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

      if (dateFrom) {
        filteredPosts = filteredPosts.filter(post => post.createdAt >= dateFrom);
      }

      if (dateTo) {
        filteredPosts = filteredPosts.filter(post => post.createdAt <= dateTo);
      }

      if (hasImages !== undefined) {
        filteredPosts = filteredPosts.filter(post => 
          hasImages ? (post.images && post.images.length > 0) : !post.images || post.images.length === 0
        );
      }
    }

    // Sıralama
    if (options.sortOptions) {
      const { sortBy, sortOrder } = options.sortOptions;
      
      filteredPosts.sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
          case 'createdAt':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case 'likesCount':
            comparison = a.likesCount - b.likesCount;
            break;
          case 'commentsCount':
            comparison = a.commentsCount - b.commentsCount;
            break;
          case 'popularity': {
            const aPopularity = a.likesCount + a.commentsCount + a.sharesCount;
            const bPopularity = b.likesCount + b.commentsCount + b.sharesCount;
            comparison = aPopularity - bPopularity;
            break;
          }
        }

        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Pagination
    const offset = options.offset || 0;
    const limit = options.limit || 10;
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    return {
      posts: paginatedPosts,
      total: filteredPosts.length
    };
  }

  static async getPostById(id: string): Promise<Post | null> {
    await this.delay(200);
    return this.posts.find(post => post.id === id) || null;
  }

  static async createPost(data: CreatePostData, userId: string): Promise<Post> {
    await this.delay(500);

    const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];
    
    // Simulate image upload
    const images: PostImage[] = data.images?.map((file, index) => ({
      id: `img_${Date.now()}_${index}`,
      url: URL.createObjectURL(file),
      alt: file.name,
      caption: `Uploaded image ${index + 1}`
    })) || [];

    const newPost: Post = {
      id: Date.now().toString(),
      userId,
      user,
      type: data.type,
      category: data.category,
      content: data.content,
      images: images.length > 0 ? images : undefined,
      tags: data.tags,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isBookmarked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      visibility: data.visibility || 'public'
    };

    this.posts.unshift(newPost);
    return newPost;
  }

  static async updatePost(id: string, data: UpdatePostData): Promise<Post | null> {
    await this.delay(300);

    const postIndex = this.posts.findIndex(post => post.id === id);
    if (postIndex === -1) return null;

    const updatedPost = {
      ...this.posts[postIndex],
      ...data,
      updatedAt: new Date()
    };

    this.posts[postIndex] = updatedPost;
    return updatedPost;
  }

  static async deletePost(id: string): Promise<boolean> {
    await this.delay(200);

    const postIndex = this.posts.findIndex(post => post.id === id);
    if (postIndex === -1) return false;

    this.posts.splice(postIndex, 1);
    
    // İlgili yorumları da sil
    this.comments = this.comments.filter(comment => comment.postId !== id);
    
    return true;
  }

  // Like işlemleri
  static async toggleLike(postId: string, userId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    await this.delay(200);

    const post = this.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const existingLike = this.likes.find(like => like.postId === postId && like.userId === userId);

    if (existingLike) {
      // Unlike
      this.likes = this.likes.filter(like => like !== existingLike);
      post.likesCount--;
      post.isLiked = false;
    } else {
      // Like
      const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];
      const newLike: PostLike = {
        id: Date.now().toString(),
        postId,
        userId,
        user,
        createdAt: new Date()
      };
      this.likes.push(newLike);
      post.likesCount++;
      post.isLiked = true;
    }

    return {
      isLiked: post.isLiked,
      likesCount: post.likesCount
    };
  }

  // Comment işlemleri
  static async getComments(postId: string): Promise<PostComment[]> {
    await this.delay(200);
    return this.comments.filter(comment => comment.postId === postId);
  }

  static async createComment(postId: string, userId: string, data: CreateCommentData): Promise<PostComment> {
    await this.delay(300);

    const post = this.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    const user = MOCK_USERS.find(u => u.id === userId) || MOCK_USERS[0];

    const newComment: PostComment = {
      id: Date.now().toString(),
      postId,
      userId,
      user,
      content: data.content,
      likesCount: 0,
      isLiked: false,
      createdAt: new Date(),
      parentCommentId: data.parentCommentId
    };

    this.comments.push(newComment);
    post.commentsCount++;

    return newComment;
  }

  // İstatistikler
  static async getPostStats(userId?: string): Promise<PostStats> {
    await this.delay(200);

    const userPosts = userId ? this.posts.filter(post => post.userId === userId) : this.posts;

    const totalLikes = userPosts.reduce((sum, post) => sum + post.likesCount, 0);
    const totalComments = userPosts.reduce((sum, post) => sum + post.commentsCount, 0);
    const totalShares = userPosts.reduce((sum, post) => sum + post.sharesCount, 0);

    const categoryBreakdown = userPosts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<PostCategory, number>);

    // En popüler taglar
    const tagCounts = userPosts.reduce((acc, post) => {
      post.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    return {
      totalPosts: userPosts.length,
      totalLikes,
      totalComments,
      totalShares,
      categoryBreakdown,
      topTags
    };
  }

  // Bookmark işlemleri
  static async toggleBookmark(postId: string): Promise<boolean> {
    await this.delay(200);

    const post = this.posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    post.isBookmarked = !post.isBookmarked;
    return post.isBookmarked;
  }

  // Trend taglar
  static async getTrendingTags(limit: number = 10): Promise<Array<{ tag: string; count: number }>> {
    await this.delay(200);

    const tagCounts = this.posts.reduce((acc, post) => {
      post.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  // Kullanıcı postları
  static async getUserPosts(userId: string, limit?: number): Promise<Post[]> {
    await this.delay(200);
    
    const userPosts = this.posts
      .filter(post => post.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return limit ? userPosts.slice(0, limit) : userPosts;
  }

  // Önerilen postlar (following kullanıcılardan)
  static async getRecommendedPosts(userId: string, limit: number = 10): Promise<Post[]> {
    await this.delay(300);
    
    // Simüle edilmiş öneri algoritması
    return this.posts
      .filter(post => post.userId !== userId && post.visibility === 'public')
      .sort((a, b) => {
        // Popülerlik skoruna göre sırala
        const aScore = a.likesCount * 2 + a.commentsCount * 3 + a.sharesCount;
        const bScore = b.likesCount * 2 + b.commentsCount * 3 + b.sharesCount;
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default PostService;
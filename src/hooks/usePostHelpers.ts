import { Post, PostCategory } from '../types/post';
import { usePostContext } from './usePostContext';

// Helper hooks for specific functionality
export const usePostById = (postId: string): Post | null => {
  const { posts } = usePostContext();
  return posts.find((post: Post) => post.id === postId) || null;
};

export const usePostsByCategory = (category: PostCategory): Post[] => {
  const { posts } = usePostContext();
  return posts.filter((post: Post) => post.category === category);
};

export const usePostsByUser = (userId: string): Post[] => {
  const { posts } = usePostContext();
  return posts.filter((post: Post) => post.userId === userId);
};

export const useTrendingPosts = (): Post[] => {
  const { posts } = usePostContext();
  return [...posts]
    .sort((a: Post, b: Post) => {
      const aScore = a.likesCount * 2 + a.commentsCount * 3 + a.sharesCount;
      const bScore = b.likesCount * 2 + b.commentsCount * 3 + b.sharesCount;
      return bScore - aScore;
    })
    .slice(0, 10);
};

export const usePostStats = () => {
  const { posts } = usePostContext();
  
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum: number, post: Post) => sum + post.likesCount, 0);
  const totalComments = posts.reduce((sum: number, post: Post) => sum + post.commentsCount, 0);
  const totalShares = posts.reduce((sum: number, post: Post) => sum + post.sharesCount, 0);
  
  const categoryBreakdown = posts.reduce((acc: Record<PostCategory, number>, post: Post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {} as Record<PostCategory, number>);

  const topTags = posts
    .flatMap((post: Post) => post.tags || [])
    .reduce((acc: Record<string, number>, tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const sortedTags = Object.entries(topTags)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return {
    totalPosts,
    totalLikes,
    totalComments,
    totalShares,
    categoryBreakdown,
    topTags: sortedTags,
    averageLikes: totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0,
    averageComments: totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0
  };
};
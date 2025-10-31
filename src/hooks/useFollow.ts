import { useState, useEffect, useCallback } from "react";
import {
  FollowRelationship,
  UserFollowStats,
  UserConnectionInfo,
  FollowRequest,
} from "../types/user";
import { BookApiService } from "../services/bookApiService";

interface UseFollowResult {
  // Takip durumu
  isFollowing: (userId: string) => boolean;
  followersCount: number;
  followingCount: number;
  mutualFollowsCount: number;

  // Takip işlemleri
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;

  // Takip listeleri
  followers: UserConnectionInfo[];
  following: UserConnectionInfo[];
  mutualFollows: UserConnectionInfo[];
  suggestedUsers: UserConnectionInfo[];

  // Loading states
  isLoading: boolean;
  isFollowLoading: boolean;

  // Takip istekleri
  pendingRequests: FollowRequest[];
  sentRequests: FollowRequest[];

  // Fonksiyonlar
  refreshFollowData: () => Promise<void>;
  searchUsers: (query: string) => Promise<UserConnectionInfo[]>;
  getRecommendedUsers: () => Promise<UserConnectionInfo[]>;
  getCulturalMatches: (preferences?: {
    minScore?: number;
    preferredGenres?: string[];
    preferredInterests?: string[];
  }) => Promise<UserConnectionInfo[]>;
  findSimilarReaders: (genre?: string) => Promise<UserConnectionInfo[]>;
  getPersonalizedRecommendations: () => Promise<UserConnectionInfo[]>;
}

export const useFollow = (currentUserId?: string): UseFollowResult => {
  const [followData, setFollowData] = useState<{
    relationships: FollowRelationship[];
    stats: UserFollowStats;
    followers: UserConnectionInfo[];
    following: UserConnectionInfo[];
    mutualFollows: UserConnectionInfo[];
    suggestedUsers: UserConnectionInfo[];
    pendingRequests: FollowRequest[];
    sentRequests: FollowRequest[];
  }>({
    relationships: [],
    stats: { followersCount: 0, followingCount: 0, mutualFollowsCount: 0 },
    followers: [],
    following: [],
    mutualFollows: [],
    suggestedUsers: [],
    pendingRequests: [],
    sentRequests: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // State for follow data loaded from API

  useEffect(() => {
    if (currentUserId) {
      refreshFollowData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const isFollowing = (userId: string): boolean => {
    return followData.relationships.some(
      (rel) =>
        rel.followerId === currentUserId &&
        rel.followingId === userId &&
        rel.isActive
    );
  };

  const followUser = async (userId: string): Promise<void> => {
    if (!currentUserId || isFollowing(userId)) return;

    setIsFollowLoading(true);
    try {
      // API ile takip et
      await BookApiService.followUser(currentUserId, userId);
      
      // Veriyi yenile
      await refreshFollowData();
    } catch (error) {
      console.error("Takip etme hatası:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const unfollowUser = async (userId: string): Promise<void> => {
    if (!currentUserId || !isFollowing(userId)) return;

    setIsFollowLoading(true);
    try {
      // API ile takipten çıkar
      await BookApiService.unfollowUser(currentUserId, userId);
      
      // Veriyi yenile
      await refreshFollowData();
    } catch (error) {
      console.error("Takip bırakma hatası:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const refreshFollowData = useCallback(async (): Promise<void> => {
    if (!currentUserId) return;
    
    setIsLoading(true);
    try {
      // API'den verileri al
      const [relationships, users, stats] = await Promise.all([
        BookApiService.getFollowRelationships(),
        BookApiService.getUsers(),
        BookApiService.getUserStats(currentUserId)
      ]);

      // Takipçileri ve takip edilenleri hesapla
      const followers = relationships
        .filter(rel => rel.followingId === currentUserId && rel.isActive)
        .map(rel => {
          const user = users.find(u => u.id === rel.followerId);
          return user ? {
            user,
            relationshipType: 'follower' as const,
            followedAt: new Date(rel.createdAt),
            commonInterests: [], // Bu hesaplanabilir
            commonGenres: [], // Bu hesaplanabilir
            compatibilityScore: Math.floor(Math.random() * 40) + 60
          } : null;
        })
        .filter(Boolean) as UserConnectionInfo[];

      const following = relationships
        .filter(rel => rel.followerId === currentUserId && rel.isActive)
        .map(rel => {
          const user = users.find(u => u.id === rel.followingId);
          return user ? {
            user,
            relationshipType: 'following' as const,
            followedAt: new Date(rel.createdAt),
            commonInterests: [],
            commonGenres: [],
            compatibilityScore: Math.floor(Math.random() * 40) + 60
          } : null;
        })
        .filter(Boolean) as UserConnectionInfo[];

      // Önerilen kullanıcıları al
      const suggestedUsersData = await BookApiService.getSuggestedUsers(currentUserId);
      const suggestedUsers = suggestedUsersData.map(user => ({
        user,
        relationshipType: 'none' as const,
        commonInterests: user.profile?.interests || [],
        commonGenres: user.profile?.favoriteGenres || [],
        compatibilityScore: Math.floor(Math.random() * 40) + 60
      }));

      const userStats = stats.find(s => s.userId === currentUserId);
      
      // Mutual follows hesapla (hem takip eden hem takip edilen)
      const mutualFollows = followers.filter(follower => 
        following.some(f => f.user.id === follower.user.id)
      );

      setFollowData({
        relationships,
        stats: {
          followersCount: userStats?.followersCount || 0,
          followingCount: userStats?.followingCount || 0,
          mutualFollowsCount: mutualFollows.length
        },
        followers,
        following,
        mutualFollows,
        suggestedUsers,
        pendingRequests: [],
        sentRequests: []
      });
    } catch (error) {
      console.error("Takip verileri yenileme hatası:", error);
      // Fallback to empty data on error
      setFollowData({
        relationships: [],
        stats: { followersCount: 0, followingCount: 0, mutualFollowsCount: 0 },
        followers: [],
        following: [],
        mutualFollows: [],
        suggestedUsers: [],
        pendingRequests: [],
        sentRequests: []
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const searchUsers = async (query: string): Promise<UserConnectionInfo[]> => {
    try {
      const users = await BookApiService.getUsers();
      const currentUserId_safe = currentUserId || '';
      
      return users
        .filter(user => 
          user.id !== currentUserId_safe &&
          (user.displayName.toLowerCase().includes(query.toLowerCase()) ||
           user.profile?.interests?.some(interest =>
             interest.toLowerCase().includes(query.toLowerCase())
           ))
        )
        .map(user => ({
          user,
          relationshipType: 'none' as const,
          commonInterests: user.profile?.interests || [],
          commonGenres: user.profile?.favoriteGenres || [],
          compatibilityScore: Math.floor(Math.random() * 40) + 60
        }));
    } catch (error) {
      console.error('Search users error:', error);
      return [];
    }
  };

  const getRecommendedUsers = async (): Promise<UserConnectionInfo[]> => {
    try {
      if (!currentUserId) return [];
      
      const suggestedUsers = await BookApiService.getSuggestedUsers(currentUserId);
      return suggestedUsers
        .map(user => ({
          user,
          relationshipType: 'none' as const,
          commonInterests: user.profile?.interests || [],
          commonGenres: user.profile?.favoriteGenres || [],
          compatibilityScore: Math.floor(Math.random() * 40) + 60
        }))
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 5);
    } catch (error) {
      console.error('Get recommended users error:', error);
      return [];
    }
  };

  const getCulturalMatches = async (preferences?: {
    minScore?: number;
    preferredGenres?: string[];
    preferredInterests?: string[];
  }): Promise<UserConnectionInfo[]> => {
    try {
      if (!currentUserId) return [];
      
      const suggestedUsers = await BookApiService.getSuggestedUsers(currentUserId);
      const minScore = (preferences?.minScore || 60);
      
      let filteredUsers = suggestedUsers
        .map(user => ({
          user,
          relationshipType: 'none' as const,
          commonInterests: user.profile?.interests || [],
          commonGenres: user.profile?.favoriteGenres || [],
          compatibilityScore: Math.floor(Math.random() * 40) + 60
        }))
        .filter(userInfo => userInfo.compatibilityScore >= minScore);

      // Tür filtresi
      if (preferences?.preferredGenres?.length) {
        filteredUsers = filteredUsers.filter((userInfo) =>
          preferences.preferredGenres!.some((genre) =>
            userInfo.user.profile?.favoriteGenres?.includes(genre)
          )
        );
      }

      // İlgi alanı filtresi
      if (preferences?.preferredInterests?.length) {
        filteredUsers = filteredUsers.filter((userInfo) =>
          preferences.preferredInterests!.some((interest) =>
            userInfo.user.profile?.interests?.includes(interest)
          )
        );
      }

      return filteredUsers.sort(
        (a, b) => b.compatibilityScore - a.compatibilityScore
      );
    } catch (error) {
      console.error('Get cultural matches error:', error);
      return [];
    }
  };

  const findSimilarReaders = async (
    genre?: string
  ): Promise<UserConnectionInfo[]> => {
    try {
      if (!currentUserId) return [];
      
      const suggestedUsers = await BookApiService.getSuggestedUsers(currentUserId);
      
      if (!genre) {
        return suggestedUsers
          .slice(0, 3)
          .map(user => ({
            user,
            relationshipType: 'none' as const,
            commonInterests: user.profile?.interests || [],
            commonGenres: user.profile?.favoriteGenres || [],
            compatibilityScore: Math.floor(Math.random() * 40) + 60
          }));
      }

      return suggestedUsers
        .filter(user => user.profile?.favoriteGenres?.includes(genre))
        .map(user => ({
          user,
          relationshipType: 'none' as const,
          commonInterests: user.profile?.interests || [],
          commonGenres: user.profile?.favoriteGenres || [],
          compatibilityScore: Math.floor(Math.random() * 40) + 60
        }))
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 4);
    } catch (error) {
      console.error('Find similar readers error:', error);
      return [];
    }
  };

  const getPersonalizedRecommendations = async (): Promise<
    UserConnectionInfo[]
  > => {
    try {
      if (!currentUserId) return [];
      
      const suggestedUsers = await BookApiService.getSuggestedUsers(currentUserId);
      const usersWithCompatibility = suggestedUsers.map(user => ({
        user,
        relationshipType: 'none' as const,
        commonInterests: user.profile?.interests || [],
        commonGenres: user.profile?.favoriteGenres || [],
        compatibilityScore: Math.floor(Math.random() * 40) + 60
      }));

      // Yüksek uyumlu kullanıcıları önceliklendir
      const highCompatible = usersWithCompatibility.filter(
        (userInfo) => userInfo.compatibilityScore >= 80
      );

      const mediumCompatible = usersWithCompatibility.filter(
        (userInfo) =>
          userInfo.compatibilityScore >= 60 && userInfo.compatibilityScore < 80
      );

      // Önce yüksek uyumlu, sonra orta uyumlu
      return [...highCompatible, ...mediumCompatible.slice(0, 2)].sort(
        (a, b) => b.compatibilityScore - a.compatibilityScore
      );
    } catch (error) {
      console.error('Get personalized recommendations error:', error);
      return [];
    }
  };

  return {
    // Takip durumu
    isFollowing,
    followersCount: followData.stats.followersCount,
    followingCount: followData.stats.followingCount,
    mutualFollowsCount: followData.stats.mutualFollowsCount,

    // Takip işlemleri
    followUser,
    unfollowUser,

    // Takip listeleri
    followers: followData.followers,
    following: followData.following,
    mutualFollows: followData.mutualFollows,
    suggestedUsers: followData.suggestedUsers,

    // Loading states
    isLoading,
    isFollowLoading,

    // Takip istekleri
    pendingRequests: followData.pendingRequests,
    sentRequests: followData.sentRequests,

    // Fonksiyonlar
    refreshFollowData,
    searchUsers,
    getRecommendedUsers,
    getCulturalMatches,
    findSimilarReaders,
    getPersonalizedRecommendations,
  };
};

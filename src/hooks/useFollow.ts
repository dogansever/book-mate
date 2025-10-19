import { useState, useEffect } from "react";
import {
  FollowRelationship,
  UserFollowStats,
  UserConnectionInfo,
  FollowRequest,
} from "../types/user";

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

  // Simüle edilmiş veri - gerçek uygulamada API'den gelecek
  const mockFollowData = {
    relationships: [
      {
        id: "rel1",
        followerId: currentUserId || "user1",
        followingId: "user2",
        createdAt: new Date(),
        isActive: true,
      },
    ] as FollowRelationship[],
    stats: {
      followersCount: 156,
      followingCount: 89,
      mutualFollowsCount: 23,
    } as UserFollowStats,
    followers: [
      {
        user: {
          id: "user2",
          email: "ahmet@example.com",
          displayName: "Ahmet Kaya",
          avatar: "",
          provider: "email" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: {
            city: "İstanbul",
            ageRange: "25-30",
            favoriteGenres: ["Roman", "Bilim Kurgu"],
            favoriteAuthors: ["Orhan Pamuk"],
            interests: ["Yazma", "Sinema"],
            intellectualBio: "Edebiyat ve sinema tutkunu",
            isProfileComplete: true,
          },
        },
        relationshipType: "follower" as const,
        followedAt: new Date(),
        commonInterests: ["Yazma", "Sinema"],
        commonGenres: ["Roman"],
        compatibilityScore: 85,
      },
    ] as UserConnectionInfo[],
    following: [
      {
        user: {
          id: "user3",
          email: "elif@example.com",
          displayName: "Elif Demir",
          avatar: "",
          provider: "email" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: {
            city: "Ankara",
            ageRange: "30-35",
            favoriteGenres: ["Felsefi", "Psikoloji"],
            favoriteAuthors: ["Milan Kundera"],
            interests: ["Felsefe", "Müzik"],
            intellectualBio: "Felsefi düşünce ve müzik sevdalısı",
            isProfileComplete: true,
          },
        },
        relationshipType: "following" as const,
        followedAt: new Date(),
        commonInterests: ["Müzik"],
        commonGenres: [],
        compatibilityScore: 72,
      },
    ] as UserConnectionInfo[],
    mutualFollows: [] as UserConnectionInfo[],
    suggestedUsers: [
      {
        user: {
          id: "user4",
          email: "can@example.com",
          displayName: "Can Özdemir",
          avatar: "",
          provider: "email" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: {
            city: "İzmir",
            ageRange: "25-30",
            favoriteGenres: ["Polisiye", "Tarih"],
            favoriteAuthors: ["Agatha Christie"],
            interests: ["Tarih", "Seyahat"],
            intellectualBio: "Tarih ve polisiye roman meraklısı",
            isProfileComplete: true,
          },
        },
        relationshipType: "none" as const,
        commonInterests: ["Seyahat"],
        commonGenres: ["Tarih"],
        compatibilityScore: 68,
      },
    ] as UserConnectionInfo[],
    pendingRequests: [] as FollowRequest[],
    sentRequests: [] as FollowRequest[],
  };

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
      // Simüle edilmiş API çağrısı
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newRelationship: FollowRelationship = {
        id: `rel_${Date.now()}`,
        followerId: currentUserId,
        followingId: userId,
        createdAt: new Date(),
        isActive: true,
      };

      setFollowData((prev) => ({
        ...prev,
        relationships: [...prev.relationships, newRelationship],
        stats: {
          ...prev.stats,
          followingCount: prev.stats.followingCount + 1,
        },
      }));
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
      // Simüle edilmiş API çağrısı
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFollowData((prev) => ({
        ...prev,
        relationships: prev.relationships.filter(
          (rel) =>
            !(rel.followerId === currentUserId && rel.followingId === userId)
        ),
        stats: {
          ...prev.stats,
          followingCount: prev.stats.followingCount - 1,
        },
      }));
    } catch (error) {
      console.error("Takip bırakma hatası:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const refreshFollowData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simüle edilmiş API çağrısı
      await new Promise((resolve) => setTimeout(resolve, 800));
      setFollowData(mockFollowData);
    } catch (error) {
      console.error("Takip verileri yenileme hatası:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (query: string): Promise<UserConnectionInfo[]> => {
    // Simüle edilmiş arama
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockFollowData.suggestedUsers.filter(
      (user) =>
        user.user.displayName.toLowerCase().includes(query.toLowerCase()) ||
        user.user.profile?.interests.some((interest) =>
          interest.toLowerCase().includes(query.toLowerCase())
        )
    );
  };

  const getRecommendedUsers = async (): Promise<UserConnectionInfo[]> => {
    // Simüle edilmiş öneri algoritması
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockFollowData.suggestedUsers
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 5);
  };

  const getCulturalMatches = async (preferences?: {
    minScore?: number;
    preferredGenres?: string[];
    preferredInterests?: string[];
  }): Promise<UserConnectionInfo[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const minScore = preferences?.minScore || 0.6;
    let filteredUsers = mockFollowData.suggestedUsers.filter(
      (userInfo) => userInfo.compatibilityScore >= minScore
    );

    // Tür filtresi
    if (preferences?.preferredGenres?.length) {
      filteredUsers = filteredUsers.filter((userInfo) =>
        preferences.preferredGenres!.some((genre) =>
          userInfo.user.profile?.favoriteGenres.includes(genre)
        )
      );
    }

    // İlgi alanı filtresi
    if (preferences?.preferredInterests?.length) {
      filteredUsers = filteredUsers.filter((userInfo) =>
        preferences.preferredInterests!.some((interest) =>
          userInfo.user.profile?.interests.includes(interest)
        )
      );
    }

    return filteredUsers.sort(
      (a, b) => b.compatibilityScore - a.compatibilityScore
    );
  };

  const findSimilarReaders = async (
    genre?: string
  ): Promise<UserConnectionInfo[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!genre) {
      return mockFollowData.suggestedUsers.slice(0, 3);
    }

    return mockFollowData.suggestedUsers
      .filter((userInfo) =>
        userInfo.user.profile?.favoriteGenres.includes(genre)
      )
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 4);
  };

  const getPersonalizedRecommendations = async (): Promise<
    UserConnectionInfo[]
  > => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Yüksek uyumlu kullanıcıları önceliklendir
    const highCompatible = mockFollowData.suggestedUsers.filter(
      (userInfo) => userInfo.compatibilityScore >= 80
    );

    const mediumCompatible = mockFollowData.suggestedUsers.filter(
      (userInfo) =>
        userInfo.compatibilityScore >= 60 && userInfo.compatibilityScore < 80
    );

    // Önce yüksek uyumlu, sonra orta uyumlu
    return [...highCompatible, ...mediumCompatible.slice(0, 2)].sort(
      (a, b) => b.compatibilityScore - a.compatibilityScore
    );
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

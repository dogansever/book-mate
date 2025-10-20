export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  provider?: "email" | "google" | "instagram";
  profile?: UserProfile;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}

export interface UserProfile {
  city?: string;
  location?: string; // Konum bilgisi
  ageRange?: string;
  favoriteGenres: string[];
  favoriteAuthors: string[];
  interests: string[];
  intellectualBio?: string;
  bio?: string; // Kısa bio
  readingGoal?: number; // Yıllık okuma hedefi
  socialConnections?: SocialConnection[];
  followStats?: UserFollowStats;
  isProfileComplete: boolean;
}

export interface SocialConnection {
  platform: "instagram" | "linkedin";
  username: string;
  profileUrl: string;
  isVerified: boolean;
  connectedAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

export interface SocialAuthProvider {
  provider: "google" | "instagram";
}

export interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  isActive: boolean;
}

export interface UserFollowStats {
  followersCount: number;
  followingCount: number;
  mutualFollowsCount: number;
}

export interface FollowRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserConnectionInfo {
  user: User;
  relationshipType: "following" | "follower" | "mutual" | "none";
  followedAt?: Date;
  commonInterests: string[];
  commonGenres: string[];
  compatibilityScore: number;
  culturalMatch?: CulturalMatchInfo;
}

export interface CulturalMatchInfo {
  overallScore: number;
  genreMatchScore: number;
  interestMatchScore: number;
  authorMatchScore: number;
  intellectualCompatibility: number;
  readingPatternSimilarity: number;
  matchReasons: string[];
  recommendationLevel: "high" | "medium" | "low";
}

export interface InterestAnalysis {
  category: string;
  interests: string[];
  weight: number;
  userHas: boolean;
  similarity: number;
}

export interface UserRecommendation {
  user: UserConnectionInfo;
  matchReasons: string[];
  culturalAnalysis: CulturalMatchInfo;
  suggestedActions: string[];
}

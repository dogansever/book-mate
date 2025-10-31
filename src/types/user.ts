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
  location?: string; // Konum bilgisi (şehir/bölge)
  coordinates?: {
    latitude: number;
    longitude: number;
  }; // GPS koordinatları
  age?: number;
  gender?: "male" | "female" | "other" | "prefer-not-to-say";
  ageRange?: string;
  favoriteGenres: string[];
  favoriteAuthors: string[];
  interests: string[];
  intellectualBio?: string;
  bio?: string; // Kısa bio
  readingGoal?: number; // Yıllık okuma hedefi
  culturalProfile?: CulturalProfile;
  worldview?: Worldview;
  valuesAndPhilosophy?: ValuesAndPhilosophy;
  academicInfo?: AcademicInfo;
  professionalInfo?: ProfessionalInfo;
  socialConnections?: SocialConnection[];
  followStats?: UserFollowStats;
  isProfileComplete: boolean;
}

export interface AcademicInfo {
  university?: string;
  department?: string;
  graduationYear?: number;
  degree?: "bachelor" | "master" | "phd" | "other";
  isVisible: boolean;
}

export interface ProfessionalInfo {
  company?: string;
  position?: string;
  salaryRange?: "0-30k" | "30k-60k" | "60k-100k" | "100k-150k" | "150k+";
  workExperience?: number; // Yıl cinsinden
  industry?: string;
  isVisible: boolean;
}

export interface CulturalProfile {
  readingMotivation?: ("knowledge" | "thinking" | "entertainment" | "escape" | "emotional-growth" | "social-connection")[];
  favoriteThemes?: string[];
  readingFrequency?: "daily" | "weekly" | "monthly" | "occasionally";
  preferredReadingTime?: "morning" | "afternoon" | "evening" | "night" | "anytime";
  readingEnvironment?: "quiet" | "music" | "cafe" | "nature" | "anywhere";
  isVisible: boolean;
}

export interface Worldview {
  cosmology?: "big-bang" | "creation" | "agnostic" | "other" | "prefer-not-to-say";
  cosmologyDetails?: string; // Açıklama için
  philosophical?: ("scientific-naturalist" | "humanist" | "spiritual" | "religious" | "existentialist" | "pragmatist" | "other")[];
  philosophicalDetails?: string;
  isVisible: boolean;
}

export interface ValuesAndPhilosophy {
  coreValues?: ("freedom" | "progress" | "balance" | "simplicity" | "knowledge" | "peace" | "justice" | "creativity" | "family" | "success" | "tradition" | "innovation" | "community" | "independence" | "compassion")[];
  lifePhilosophy?: string; // Serbest metin
  moralFramework?: "utilitarian" | "deontological" | "virtue-ethics" | "relativist" | "religious" | "personal" | "other";
  politicalLean?: "progressive" | "conservative" | "libertarian" | "socialist" | "centrist" | "apolitical" | "prefer-not-to-say";
  isVisible: boolean;
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
  userData?: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
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

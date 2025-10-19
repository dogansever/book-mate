export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  provider: "email" | "google" | "instagram";
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  city?: string;
  ageRange?: string;
  favoriteGenres: string[];
  favoriteAuthors: string[];
  interests: string[];
  intellectualBio?: string;
  isProfileComplete: boolean;
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

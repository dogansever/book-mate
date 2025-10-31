import React, { createContext, useReducer, ReactNode, useEffect } from "react";
import {
  User,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  SocialAuthProvider,
  UserProfile,
} from "../types/user";

interface AuthContextType {
  state: AuthState;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  socialLogin: (provider: SocialAuthProvider) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_ERROR"; payload: string }
  | { type: "UPDATE_PROFILE_SUCCESS"; payload: UserProfile }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      saveUserToStorage(action.payload); // localStorage'a kaydet
      return { ...state, isLoading: false, user: action.payload, error: null };
    case "LOGIN_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "UPDATE_PROFILE_SUCCESS":
      const updatedUser = state.user ? { ...state.user, profile: action.payload } : null;
      if (updatedUser) {
        saveUserToStorage(updatedUser); // localStorage'ı güncelle
      }
      return {
        ...state,
        user: updatedUser,
      };
    case "LOGOUT":
      removeUserFromStorage(); // localStorage'ı temizle
      return { ...state, user: null, isLoading: false, error: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

// localStorage utility functions
const STORAGE_KEY = 'book-mate-user';

const saveUserToStorage = (user: User) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

const getUserFromStorage = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      // Date objelerini geri çevir
      if (user.createdAt) user.createdAt = new Date(user.createdAt);
      if (user.updatedAt) user.updatedAt = new Date(user.updatedAt);
      if (user.lastLoginAt) user.lastLoginAt = new Date(user.lastLoginAt);
      return user;
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
};

const removeUserFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(), // Sayfa yüklendiğinde localStorage'dan kullanıcıyı yükle
  isLoading: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sayfa yüklendiğinde localStorage'dan user bilgilerini kontrol et
  useEffect(() => {
    const storedUser = getUserFromStorage();
    if (storedUser && !state.user) {
      // localStorage'da user var ama state'te yok, tekrar yükle
      dispatch({ type: "LOGIN_SUCCESS", payload: storedUser });
      console.log('👤 User restored from localStorage:', storedUser.displayName);
    }
  }, [state.user]);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "LOGIN_START" });

      // Simulated API call - replace with actual authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const user: User = {
        id: "1",
        email: credentials.email,
        displayName: credentials.email.split("@")[0],
        provider: "email",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } catch {
      dispatch({
        type: "LOGIN_ERROR",
        payload: "Giriş başarısız oldu. Lütfen tekrar deneyin.",
      });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: "LOGIN_START" });

      // Simulated API call - replace with actual registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful registration
      const user: User = {
        id: Date.now().toString(),
        email: credentials.email,
        displayName: credentials.displayName,
        provider: "email",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } catch {
      dispatch({
        type: "LOGIN_ERROR",
        payload: "Kayıt başarısız oldu. Lütfen tekrar deneyin.",
      });
    }
  };

  const socialLogin = async (provider: SocialAuthProvider) => {
    try {
      dispatch({ type: "LOGIN_START" });

      let user: User;
      
      if (provider.provider === "google" && provider.userData) {
        // Gerçek Google OAuth user data'sını kullan
        user = {
          id: provider.userData.id,
          email: provider.userData.email,
          displayName: provider.userData.name,
          avatar: provider.userData.picture,
          provider: "google",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      } else {
        // Diğer providerlar için simulated login (Instagram vs.)
        await new Promise((resolve) => setTimeout(resolve, 1500));
        user = {
          id: Date.now().toString(),
          email: `user@${provider.provider}.com`,
          displayName: `${provider.provider} User`,
          provider: provider.provider,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } catch (error) {
      console.error('Social login error:', error);
      dispatch({
        type: "LOGIN_ERROR",
        payload: `${provider.provider} ile giriş başarısız oldu.`,
      });
    }
  };

  const updateProfile = async (profile: UserProfile) => {
    try {
      // Simulated API call - replace with actual profile update
      await new Promise((resolve) => setTimeout(resolve, 500));

      dispatch({ type: "UPDATE_PROFILE_SUCCESS", payload: profile });
    } catch {
      dispatch({
        type: "LOGIN_ERROR",
        payload: "Profil güncellenirken bir hata oluştu.",
      });
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{ 
        state, 
        user: state.user, 
        login, 
        register, 
        socialLogin, 
        updateProfile, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

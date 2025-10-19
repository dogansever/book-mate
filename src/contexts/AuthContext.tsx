import React, { createContext, useReducer, ReactNode } from "react";
import {
  User,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  SocialAuthProvider,
} from "../types/user";

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  socialLogin: (provider: SocialAuthProvider) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      return { ...state, isLoading: false, user: action.payload, error: null };
    case "LOGIN_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "LOGOUT":
      return { ...state, user: null, isLoading: false, error: null };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

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

      // Simulated social auth - replace with actual OAuth implementation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock successful social login
      const user: User = {
        id: Date.now().toString(),
        email: `user@${provider.provider}.com`,
        displayName: `${provider.provider} User`,
        provider: provider.provider,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } catch {
      dispatch({
        type: "LOGIN_ERROR",
        payload: `${provider.provider} ile giriş başarısız oldu.`,
      });
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{ state, login, register, socialLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

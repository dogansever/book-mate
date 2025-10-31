import React from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./contexts/AuthContext";
import { UserBooksProvider } from "./contexts/UserBooksContext";
import { BookSwapProvider } from "./contexts/BookSwapContext";
import { useAuth } from "./hooks/useAuth";
import AuthWrapper from "./components/AuthWrapper";
import Dashboard from "./components/Dashboard";
import "./App.css";

const AppContent: React.FC = () => {
  const { state } = useAuth();

  if (state.user) {
    return <Dashboard />;
  }

  return <AuthWrapper />;
};

function App() {
  // Google OAuth Client ID - Bu production'da environment variable olmalı
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "test-client-id";
  
  // Development için uyarı
  if (googleClientId === "test-client-id" || googleClientId === "your_google_client_id_here") {
    console.warn("🚨 Google OAuth: Gerçek Client ID ayarlanmamış. GOOGLE_OAUTH_SETUP.md dosyasını kontrol edin.");
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <UserBooksProvider>
          <BookSwapProvider>
            <div className="App">
              <AppContent />
            </div>
          </BookSwapProvider>
        </UserBooksProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

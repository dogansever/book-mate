import React from "react";
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
  return (
    <AuthProvider>
      <UserBooksProvider>
        <BookSwapProvider>
          <div className="App">
            <AppContent />
          </div>
        </BookSwapProvider>
      </UserBooksProvider>
    </AuthProvider>
  );
}

export default App;

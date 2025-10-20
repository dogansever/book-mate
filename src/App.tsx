import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { UserBooksProvider } from "./contexts/UserBooksContext";
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
        <div className="App">
          <AppContent />
        </div>
      </UserBooksProvider>
    </AuthProvider>
  );
}

export default App;

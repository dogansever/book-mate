import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
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
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;

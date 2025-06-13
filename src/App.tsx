import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/AuthPage';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, isAuthenticated } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl"></div>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <ProfileSetup 
        onComplete={() => setShowProfileSetup(false)} 
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthPage 
        onAuthSuccess={() => {
          // Authentication successful - the useAuth hook will handle setting the user
          // No additional action needed here since isAuthenticated will become true
        }}
        onNeedProfile={() => setShowProfileSetup(true)}
      />
    );
  }

  return <Dashboard />;
}

export default App;
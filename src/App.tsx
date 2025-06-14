import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/AuthPage';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl"></div>
        </div>
      </div>
    );
  }

  // Show profile setup if user needs to complete profile
  if (showProfileSetup) {
    return (
      <ProfileSetup 
        onComplete={() => setShowProfileSetup(false)} 
      />
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthPage 
        onAuthSuccess={() => {
          // Check if user needs profile setup
          if (user && (!user.name || !user.location)) {
            setShowProfileSetup(true);
          }
        }}
        onNeedProfile={() => setShowProfileSetup(true)}
      />
    );
  }

  // Show dashboard if authenticated and profile is complete
  return <Dashboard />;
}

export default App;
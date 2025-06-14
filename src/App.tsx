import React, { useState } from 'react';
import { AuthPage } from './components/AuthPage';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl"></div>
          </div>
          <p className="text-gray-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile setup if user needs to complete profile
  if (showProfileSetup) {
    return (
      <ProfileSetup 
        onComplete={() => {
          setShowProfileSetup(false);
          // The user state will be updated automatically
        }} 
      />
    );
  }

  // Show dashboard if authenticated and profile is complete
  if (isAuthenticated && user) {
    // Check if profile needs completion (basic required fields)
    if (!user.name || !user.location || !user.schoolOrJob) {
      return (
        <ProfileSetup 
          onComplete={() => {
            setShowProfileSetup(false);
            // The user state will be updated automatically
          }} 
        />
      );
    }
    return <Dashboard />;
  }

  // Default to auth page for unauthenticated users
  return (
    <AuthPage 
      onAuthSuccess={() => {
        // User state will be updated automatically via auth state listener
        // No need to force reload
      }}
      onNeedProfile={() => setShowProfileSetup(true)}
    />
  );
}

export default App;
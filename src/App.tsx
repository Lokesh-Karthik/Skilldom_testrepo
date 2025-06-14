import React, { useState } from 'react';
import { AuthPage } from './components/AuthPage';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isAuthenticated } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Show profile setup if user needs to complete profile
  if (showProfileSetup) {
    return (
      <ProfileSetup 
        onComplete={() => {
          setShowProfileSetup(false);
          // Force reload to ensure proper state update
          window.location.href = '/';
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
            // Force reload to ensure proper state update
            window.location.href = '/';
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
        // Force reload to check user state
        window.location.href = '/';
      }}
      onNeedProfile={() => setShowProfileSetup(true)}
    />
  );
}

export default App;
import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthPage } from './components/AuthPage';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, isAuthenticated } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

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
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

  // IMPORTANT: If user is authenticated, always prioritize showing the dashboard
  // Only show profile setup if absolutely necessary (missing critical fields)
  if (isAuthenticated && user) {
    console.log('✅ User is authenticated, checking profile completeness...');
    
    // Check if profile needs completion (only check absolutely essential fields)
    const needsProfileSetup = !user.name || !user.location || !user.schoolOrJob;
    
    if (needsProfileSetup && !showProfileSetup) {
      console.log('⚠️ Profile incomplete, showing setup...');
      return (
        <ProfileSetup 
          onComplete={() => {
            console.log('✅ Profile setup completed');
            setShowProfileSetup(false);
            // The user state will be updated automatically
          }} 
        />
      );
    }

    // If we're in profile setup mode but user is authenticated
    if (showProfileSetup) {
      return (
        <ProfileSetup 
          onComplete={() => {
            console.log('✅ Profile setup completed');
            setShowProfileSetup(false);
            // The user state will be updated automatically
          }} 
        />
      );
    }

    // User is authenticated and profile is complete - show dashboard
    console.log('✅ Showing dashboard for authenticated user');
    return <Dashboard />;
  }

  // User is not authenticated - show auth page
  console.log('❌ User not authenticated, showing auth page');
  return (
    <AuthPage 
      onAuthSuccess={() => {
        console.log('✅ Auth success callback triggered');
        // User state will be updated automatically via auth state listener
        // No need to force reload or manual state changes
      }}
      onNeedProfile={() => {
        console.log('⚠️ Profile setup needed');
        setShowProfileSetup(true);
      }}
    />
  );
}

export default App;
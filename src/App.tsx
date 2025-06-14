import React from 'react';
import { AuthPage } from './components/AuthPage';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isAuthenticated, loading } = useAuth();

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

  // If user is authenticated, check profile completeness
  if (isAuthenticated && user) {
    console.log('✅ User is authenticated, profile complete:', user.profileComplete);
    
    if (!user.profileComplete) {
      console.log('⚠️ Profile incomplete, showing setup...');
      return (
        <ProfileSetup 
          onComplete={() => {
            console.log('✅ Profile setup completed');
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
    />
  );
}

export default App;
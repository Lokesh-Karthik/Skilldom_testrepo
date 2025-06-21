import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { testSupabaseConnection } from './lib/supabase';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);

  // Test Supabase connection on app start
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await testSupabaseConnection();
      } catch (error) {
        console.error('Database connection failed:', error);
      } finally {
        setConnectionChecked(true);
      }
    };
    checkConnection();
  }, []);

  // Show loading spinner while checking auth and connection for the first time
  if (loading || !connectionChecked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl"></div>
          </div>
          <p className="text-gray-400 text-lg">
            {!connectionChecked ? 'Connecting to database...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Handle profile completion callback
  const handleProfileComplete = () => {
    console.log('🔄 Profile setup completed, redirecting to dashboard...');
    setShowProfileSetup(false);
    // The user state will be updated automatically by the auth service
    // and the dashboard will be shown when user.profileComplete becomes true
  };

  // Show profile setup if explicitly requested or if user needs to complete profile
  if (showProfileSetup || (isAuthenticated && user && !user.profileComplete)) {
    return (
      <ProfileSetup 
        onComplete={handleProfileComplete}
      />
    );
  }

  // Show dashboard if authenticated and profile is complete
  if (isAuthenticated && user && user.profileComplete) {
    console.log('✅ User authenticated with complete profile, showing dashboard');
    return <Dashboard />;
  }

  // Default to auth page for unauthenticated users
  return (
    <AuthPage 
      onAuthSuccess={() => {
        console.log('🔄 Auth success callback triggered');
        // User state will be updated automatically by the auth service
        // If profile is incomplete, the checks above will handle showing ProfileSetup
      }}
      onNeedProfile={() => {
        console.log('🔄 Need profile callback triggered');
        setShowProfileSetup(true);
      }}
    />
  );
}

export default App;
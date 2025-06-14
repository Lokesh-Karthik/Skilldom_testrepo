import React, { useState, useEffect } from 'react';
import { AuthPage } from './src/components/AuthPage';
import { ProfileSetup } from './src/components/ProfileSetup';
import { Dashboard } from './src/components/Dashboard';
import { testSupabaseConnection } from './src/lib/supabase';
import { useAuth } from './src/hooks/useAuth';

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

  // Show loading spinner only while checking auth and connection for the first time
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

  // Show profile setup if user needs to complete profile
  if (showProfileSetup) {
    return (
      <ProfileSetup 
        onComplete={() => {
          setShowProfileSetup(false);
          // The user will be redirected to dashboard automatically
        }} 
      />
    );
  }

  // Show dashboard immediately if authenticated and profile is complete
  if (isAuthenticated && user) {
    // Check if profile needs completion
    if (!user.profileComplete) {
      return (
        <ProfileSetup 
          onComplete={() => {
            setShowProfileSetup(false);
            // The user will be redirected to dashboard automatically
          }} 
        />
      );
    }
    // User is authenticated and profile is complete - show dashboard immediately
    return <Dashboard />;
  }

  // Default to auth page for unauthenticated users
  return (
    <AuthPage 
      onAuthSuccess={() => {
        // User is authenticated, check if profile needs completion
        // This will be handled by the auth state change and the checks above
      }}
      onNeedProfile={() => setShowProfileSetup(true)}
    />
  );
}

export default App;
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

  // Show loading spinner only while checking auth for the first time AND connection is not checked
  // If user is authenticated, skip the connection loading screen
  if ((loading || !connectionChecked) && !isAuthenticated) {
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

  // If user is authenticated and has complete profile, show dashboard immediately
  if (isAuthenticated && user && user.profileComplete) {
    return <Dashboard />;
  }

  // If user is authenticated but profile is incomplete, show profile setup
  if (isAuthenticated && user && !user.profileComplete) {
    return (
      <ProfileSetup 
        onComplete={() => {
          setShowProfileSetup(false);
          // The user will be redirected to dashboard automatically via auth state change
        }} 
      />
    );
  }

  // Show profile setup if explicitly requested
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

  // Default to auth page for unauthenticated users (only after connection is checked)
  return (
    <AuthPage 
      onAuthSuccess={() => {
        // User is authenticated, auth state change will handle the redirect
      }}
      onNeedProfile={() => setShowProfileSetup(true)}
    />
  );
}

export default App;
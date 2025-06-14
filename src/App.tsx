import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { ProfileSetup } from './components/ProfileSetup';
import { Dashboard } from './components/Dashboard';
import { testSupabaseConnection } from './lib/supabase';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isAuthenticated } = useAuth();
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

  // Show loading spinner only while checking connection
  if (!connectionChecked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl"></div>
          </div>
          <p className="text-gray-400 text-lg">Connecting to database...</p>
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
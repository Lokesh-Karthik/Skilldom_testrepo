import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService, SignUpData } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Get initial user on mount
    const getInitialUser = async () => {
      try {
        console.log('🔄 Getting initial user...');
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          console.log('🔄 Initial user loaded:', currentUser ? 'authenticated' : 'not authenticated');
          if (currentUser) {
            console.log('🔄 Profile complete:', currentUser.profileComplete);
          }
        }
      } catch (error) {
        console.error('Error getting initial user:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialUser();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session ? 'has session' : 'no session');
      
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in, building user profile...');
        setLoading(true); // Show loading while building user profile
        
        try {
          const user = await authService.buildUserFromAuthUser(session.user);
          setUser(user);
          console.log('✅ User profile built successfully:', user ? 'found' : 'not found');
          if (user) {
            console.log('🔄 Profile complete:', user.profileComplete);
          }
        } catch (error) {
          console.error('❌ Error building user profile:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('🔄 User signed out or no session');
        setUser(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token refreshed, updating user...');
        try {
          const user = await authService.buildUserFromAuthUser(session.user);
          setUser(user);
        } catch (error) {
          console.error('❌ Error updating user after token refresh:', error);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array - effect runs only once

  const signUp = async (userData: SignUpData) => {
    setAuthLoading(true);
    try {
      const { user, error } = await authService.signUp(userData);
      if (error) {
        throw new Error(error);
      }
      return user;
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const { user, error } = await authService.signIn(email, password);
      if (error) {
        // Handle specific error types with custom error codes
        if (error === 'ACCOUNT_NOT_FOUND') {
          throw new Error('ACCOUNT_NOT_FOUND');
        }
        if (error === 'INCORRECT_PASSWORD') {
          throw new Error('INCORRECT_PASSWORD');
        }
        if (error === 'EMAIL_NOT_CONFIRMED') {
          throw new Error('EMAIL_NOT_CONFIRMED');
        }
        if (error === 'TOO_MANY_ATTEMPTS') {
          throw new Error('TOO_MANY_ATTEMPTS');
        }
        throw new Error(error);
      }
      
      return user;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const { error } = await authService.signInWithGoogle();
      if (error) {
        throw new Error(error);
      }
      // For OAuth, the user will be set via the auth state change listener
      return true;
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setAuthLoading(true);
    try {
      const { error } = await authService.resetPassword(email);
      if (error) {
        throw new Error(error);
      }
      return true;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    setAuthLoading(true);
    try {
      console.log('🔄 Signing out user...');
      
      // Clear user state immediately
      setUser(null);
      
      // Sign out from Supabase
      const { error } = await authService.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        // Even if there's an error, we've cleared the local state
      } else {
        console.log('✅ User signed out successfully');
      }
      
      // Force a page reload to ensure clean state
      window.location.href = '/';
      
    } catch (error: any) {
      console.error('❌ Unexpected sign out error:', error);
      // Even if there's an error, clear local state and redirect
      setUser(null);
      window.location.href = '/';
    } finally {
      setAuthLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return null;
    
    setAuthLoading(true);
    try {
      const updatedUser = await authService.updateProfile(user.id, updates);
      if (updatedUser) {
        console.log('✅ Profile updated, setting user immediately');
        setUser(updatedUser);
      }
      return updatedUser;
    } finally {
      setAuthLoading(false);
    }
  };

  // Legacy methods for backward compatibility
  const register = signUp;

  return {
    user,
    loading,
    authLoading,
    signUp,
    login,
    loginWithGoogle,
    resetPassword,
    logout,
    updateProfile,
    register, // Legacy
    isAuthenticated: !!user
  };
};
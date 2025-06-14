import { useState, useEffect } from 'react';
import { User } from '../types';
import { authService, SignUpData } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Changed from true to false
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    // Only listen to auth state changes, don't check for current user on mount
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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
      const { error } = await authService.signOut();
      if (error) {
        throw new Error(error);
      }
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
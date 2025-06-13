import { useState, useEffect } from 'react';
import { User } from '../types';
import { mockAuth } from '../services/mockBackend';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUser(mockAuth.currentUser);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await mockAuth.login(email, password);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const user = await mockAuth.loginWithGoogle();
      setUser(user);
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      const user = await mockAuth.demoLogin();
      setUser(user);
      return user;
    } catch (error) {
      console.error('Demo login error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'connections' | 'pendingRequests' | 'sentRequests' | 'createdAt'>) => {
    setLoading(true);
    try {
      const user = await mockAuth.register(userData);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    mockAuth.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    loginWithGoogle,
    demoLogin,
    register,
    logout,
    isAuthenticated: !!user
  };
};
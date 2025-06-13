import { useState, useEffect } from 'react';
import { User } from '../types';
import { mockAuth } from '../services/mockBackend';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for stored session on app load
    const storedUser = localStorage.getItem('skilldom_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        mockAuth.currentUser = userData;
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('skilldom_user');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await mockAuth.login(email, password);
      if (user) {
        setUser(user);
        localStorage.setItem('skilldom_user', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'connections' | 'pendingRequests' | 'sentRequests' | 'createdAt'>) => {
    setLoading(true);
    try {
      const user = await mockAuth.register(userData);
      if (user) {
        setUser(user);
        localStorage.setItem('skilldom_user', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setLoading(true);
    try {
      const user = await mockAuth.demoLogin();
      if (user) {
        setUser(user);
        localStorage.setItem('skilldom_user', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      console.error('Demo login error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    mockAuth.logout();
    setUser(null);
    localStorage.removeItem('skilldom_user');
  };

  return {
    user,
    loading,
    login,
    register,
    demoLogin,
    logout,
    isAuthenticated: !!user
  };
};
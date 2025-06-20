import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, UserPlus, LogIn, Sparkles, AlertCircle, CheckCircle, RotateCcw, Inbox, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { testSupabaseConnection } from '../lib/supabase';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onNeedProfile: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onNeedProfile }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const { login, signUp, loginWithGoogle, resetPassword, authLoading } = useAuth();

  // Test Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await testSupabaseConnection();
        setConnectionStatus('connected');
      } catch (error) {
        setConnectionStatus('error');
      }
    };
    checkConnection();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
    if (success) setSuccess(''); // Clear success when user starts typing
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('Name is required for sign up');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'ACCOUNT_NOT_FOUND':
        return 'No account found with this email address. Would you like to create a new account?';
      case 'INCORRECT_PASSWORD':
        return 'Incorrect password. Please try again or reset your password.';
      case 'EMAIL_NOT_CONFIRMED':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'TOO_MANY_ATTEMPTS':
        return 'Too many login attempts. Please wait a few minutes before trying again.';
      default:
        return errorCode;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (connectionStatus !== 'connected') {
      setError('Database connection error. Please check your Supabase configuration.');
      return;
    }

    if (!validateForm()) return;

    try {
      if (isLogin) {
        console.log('🔄 Attempting login...');
        const user = await login(formData.email, formData.password);
        if (user) {
          console.log('✅ Login successful, user will be redirected automatically');
          // Don't show success message or delay - let the auth state change handle the redirect
          onAuthSuccess();
        }
      } else {
        console.log('🔄 Attempting sign up...');
        setUserEmail(formData.email);
        
        const user = await signUp({
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
        
        // Show email confirmation message regardless of immediate user creation
        setShowEmailConfirmation(true);
        setFormData({ email: '', password: '', name: '', confirmPassword: '' });
      }
    } catch (err: any) {
      console.error('❌ Auth error:', err);
      
      const errorMessage = getErrorMessage(err.message);
      setError(errorMessage);
      
      // Handle specific error cases
      if (err.message === 'ACCOUNT_NOT_FOUND' && isLogin) {
        setShowForgotPassword(false); // Hide forgot password for this case
        // Auto-switch to sign up mode after showing the error
        setTimeout(() => {
          setIsLogin(false);
          setError('');
          setSuccess('Switched to sign up mode. Please create your account.');
        }, 3000);
      } else if (err.message === 'INCORRECT_PASSWORD' && isLogin) {
        setShowForgotPassword(true);
      } else if (err.message === 'EMAIL_NOT_CONFIRMED') {
        // Show resend confirmation option
        setUserEmail(formData.email);
        setTimeout(() => {
          setShowEmailConfirmation(true);
        }, 2000);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      setError('');
      setSuccess('');
      await resetPassword(formData.email);
      setSuccess('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setSuccess('');
      
      if (connectionStatus !== 'connected') {
        setError('Database connection error. Please check your Supabase configuration.');
        return;
      }

      console.log('🔄 Attempting Google login...');
      await loginWithGoogle();
      setSuccess('Redirecting to Google...');
    } catch (err: any) {
      console.error('❌ Google login error:', err);
      setError(err.message || 'Google sign in failed');
    }
  };

  const handleBackToSignUp = () => {
    setShowEmailConfirmation(false);
    setIsLogin(false);
    setError('');
    setSuccess('');
  };

  const handleResendConfirmation = async () => {
    try {
      setError('');
      setSuccess('');
      
      // Attempt to resend confirmation by trying to sign up again
      await signUp({
        email: userEmail,
        password: 'temp-password', // This won't be used since user already exists
        name: 'temp-name'
      });
      
      setSuccess('Confirmation email resent! Please check your inbox.');
    } catch (err: any) {
      // If user already exists, that's expected - just show success
      if (err.message.includes('already registered') || err.message.includes('already exists')) {
        setSuccess('Confirmation email resent! Please check your inbox.');
      } else {
        setError('Failed to resend confirmation email. Please try again.');
      }
    }
  };

  // Show email confirmation screen
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Database Connection Status - Bottom Right */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className="glass-effect rounded-lg p-3 border border-gray-700/50">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Database Connected</span>
            </div>
          </div>
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/25">
              <Inbox className="text-white text-3xl" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
              Check Your Email
            </h2>
            <p className="mt-3 text-gray-400 text-lg">
              We've sent you a confirmation link
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-8 shadow-2xl border border-gray-700/50">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="h-16 w-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                    <Mail className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Confirm Your Email Address
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    We've sent a confirmation email to:
                  </p>
                  <p className="text-blue-300 font-medium mt-1">
                    {userEmail}
                  </p>
                </div>

                <div className="glass-effect border border-blue-500/20 rounded-xl p-4">
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-400 text-xs font-bold">1</span>
                      </div>
                      <p>Check your email inbox (and spam folder)</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-400 text-xs font-bold">2</span>
                      </div>
                      <p>Click the confirmation link in the email</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-6 w-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-400 text-xs font-bold">3</span>
                      </div>
                      <p>Return here to complete your profile</p>
                    </div>
                  </div>
                </div>

                {success && (
                  <div className="flex items-center space-x-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResendConfirmation}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
                >
                  <Mail className="h-4 w-4" />
                  <span>{authLoading ? 'Sending...' : 'Resend Confirmation Email'}</span>
                </button>

                <button
                  onClick={handleBackToSignUp}
                  className="w-full px-4 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-200 font-medium"
                >
                  Back to Sign Up
                </button>
              </div>

              <div className="pt-4 border-t border-gray-700/50">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Didn't receive the email? Check your spam folder or try resending. 
                  If you continue to have issues, please contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Database Connection Status - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="glass-effect rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center space-x-2">
            {connectionStatus === 'checking' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500/30 border-t-yellow-500"></div>
                <span className="text-sm text-yellow-400">Checking...</span>
              </>
            )}
            {connectionStatus === 'connected' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">Database Connected</span>
              </>
            )}
            {connectionStatus === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">Connection Failed</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/25">
            <Sparkles className="text-white text-3xl" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Welcome to Skilldom
          </h2>
          <p className="mt-3 text-gray-400 text-lg">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          {/* Demo Account Info */}
          {isLogin && (
            <div className="mb-6 glass-effect border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-300 mb-1">Demo Account</h4>
                  <p className="text-xs text-gray-400 mb-2">
                    To test the application, you'll need to create an account first. Click "Don't have an account? Sign up" below.
                  </p>
                  <div className="text-xs text-gray-500">
                    <p>• Sign up with any email address</p>
                    <p>• Check your email for confirmation</p>
                    <p>• Return here to sign in</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="sr-only">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserPlus className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      className="relative block w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="relative block w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    className="relative block w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-700 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required={!isLogin}
                      className="relative block w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Forgot Password Section */}
            {showForgotPassword && isLogin && (
              <div className="glass-effect border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <RotateCcw className="h-4 w-4 text-blue-400" />
                  <h4 className="text-sm font-medium text-blue-300">Reset Password</h4>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  We'll send you a password reset link at {formData.email}
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={authLoading}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                  >
                    {authLoading ? 'Sending...' : 'Send Reset Email'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-3 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800/50 transition-all duration-200 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={authLoading || connectionStatus !== 'connected'}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                  {isLogin ? (
                    <LogIn className="h-5 w-5 text-purple-200 group-hover:text-purple-100" />
                  ) : (
                    <UserPlus className="h-5 w-5 text-purple-200 group-hover:text-purple-100" />
                  )}
                </span>
                {authLoading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Sign up')}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gray-900 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading || connectionStatus !== 'connected'}
                  className="w-full inline-flex justify-center py-4 px-4 border border-gray-700 rounded-xl shadow-sm bg-gray-800/50 text-sm font-medium text-gray-300 hover:bg-gray-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-3">Continue with Google</span>
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                  setShowForgotPassword(false);
                  setFormData({ email: '', password: '', name: '', confirmPassword: '' });
                }}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
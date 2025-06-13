import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, UserPlus, LogIn, Sparkles, User, Calendar, MapPin, GraduationCap, Plus, X, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Skill } from '../types';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onNeedProfile: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onNeedProfile }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    schoolOrJob: '',
    location: '',
    bio: ''
  });

  const [skillsToTeach, setSkillsToTeach] = useState<Skill[]>([]);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const [newSkill, setNewSkill] = useState({ name: '', rating: 1, description: '' });
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const { login, register, demoLogin, loading } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateSignupForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Required fields
    if (!signupData.name.trim()) newErrors.name = 'Name is required';
    if (!signupData.email.trim()) newErrors.email = 'Email is required';
    if (!signupData.password) newErrors.password = 'Password is required';
    if (!signupData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!signupData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!signupData.gender) newErrors.gender = 'Gender is required';
    if (!signupData.schoolOrJob.trim()) newErrors.schoolOrJob = 'School/Job is required';
    if (!signupData.location.trim()) newErrors.location = 'Location is required';

    // Email validation
    if (signupData.email && !validateEmail(signupData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (signupData.password && signupData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Age validation (must be at least 13)
    if (signupData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(signupData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = 'You must be at least 13 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLoginForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!loginData.email.trim()) newErrors.email = 'Email is required';
    if (!loginData.password) newErrors.password = 'Password is required';

    if (loginData.email && !validateEmail(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    const user = await login(loginData.email, loginData.password);
    if (user) {
      onAuthSuccess();
    } else {
      setErrors({ general: 'Invalid email or password' });
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    const userData = {
      ...signupData,
      skillsToTeach,
      skillsToLearn,
      interests
    };

    const user = await register(userData);
    if (user) {
      onAuthSuccess();
    } else {
      setErrors({ general: 'Registration failed. Please try again.' });
    }
  };

  const handleDemoLogin = async () => {
    const user = await demoLogin();
    if (user) {
      onAuthSuccess();
    } else {
      setErrors({ general: 'Demo login failed' });
    }
  };

  const handleInputChange = (field: string, value: string, isSignup = false) => {
    if (isSignup) {
      setSignupData(prev => ({ ...prev, [field]: value }));
    } else {
      setLoginData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSkillToTeach = () => {
    if (newSkill.name.trim()) {
      setSkillsToTeach(prev => [...prev, { ...newSkill, name: newSkill.name.trim() }]);
      setNewSkill({ name: '', rating: 1, description: '' });
    }
  };

  const removeSkillToTeach = (index: number) => {
    setSkillsToTeach(prev => prev.filter((_, i) => i !== index));
  };

  const addSkillToLearn = () => {
    if (newLearnSkill.trim() && !skillsToLearn.includes(newLearnSkill.trim())) {
      setSkillsToLearn(prev => [...prev, newLearnSkill.trim()]);
      setNewLearnSkill('');
    }
  };

  const removeSkillToLearn = (skill: string) => {
    setSkillsToLearn(prev => prev.filter(s => s !== skill));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests(prev => [...prev, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(prev => prev.filter(i => i !== interest));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-2xl w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/25">
            <Sparkles className="text-white text-3xl" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Welcome to Skilldom
          </h2>
          <p className="mt-3 text-gray-400 text-lg">
            {isLogin ? 'Sign in to your account' : 'Create your account and start learning'}
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          {/* Demo Login Button */}
          <div className="mb-6">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-green-500/25"
            >
              <Sparkles className="h-5 w-5" />
              <span>{loading ? 'Loading...' : 'Try Demo Account'}</span>
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              Quick access to explore the platform
            </p>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="mb-6 text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {errors.general}
            </div>
          )}

          {isLogin ? (
            /* LOGIN FORM */
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div className="space-y-4">
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
                      className={`relative block w-full pl-12 pr-4 py-4 bg-gray-800/50 border ${errors.email ? 'border-red-500' : 'border-gray-700'} placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Email address"
                      value={loginData.email}
                      onChange={(e) => handleInputChange('email', e.target.value, false)}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
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
                      autoComplete="current-password"
                      required
                      className={`relative block w-full pl-12 pr-12 py-4 bg-gray-800/50 border ${errors.password ? 'border-red-500' : 'border-gray-700'} placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => handleInputChange('password', e.target.value, false)}
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
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                    <LogIn className="h-5 w-5 text-purple-200 group-hover:text-purple-100" />
                  </span>
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form className="space-y-6" onSubmit={handleSignupSubmit}>
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        className={`pl-12 w-full p-4 bg-gray-800/50 border ${errors.name ? 'border-red-500' : 'border-gray-700'} text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400`}
                        placeholder="Full Name *"
                        value={signupData.name}
                        onChange={(e) => handleInputChange('name', e.target.value, true)}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        className={`pl-12 w-full p-4 bg-gray-800/50 border ${errors.email ? 'border-red-500' : 'border-gray-700'} text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400`}
                        placeholder="Email Address *"
                        value={signupData.email}
                        onChange={(e) => handleInputChange('email', e.target.value, true)}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`pl-12 pr-12 w-full p-4 bg-gray-800/50 border ${errors.password ? 'border-red-500' : 'border-gray-700'} text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400`}
                        placeholder="Password *"
                        value={signupData.password}
                        onChange={(e) => handleInputChange('password', e.target.value, true)}
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
                    {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`pl-12 pr-12 w-full p-4 bg-gray-800/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400`}
                        placeholder="Confirm Password *"
                        value={signupData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value, true)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        className={`pl-12 w-full p-4 bg-gray-800/50 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-700'} text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        value={signupData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value, true)}
                      />
                    </div>
                    {errors.dateOfBirth && <p className="mt-1 text-sm text-red-400">{errors.dateOfBirth}</p>}
                  </div>

                  <div>
                    <select
                      className={`w-full p-4 bg-gray-800/50 border ${errors.gender ? 'border-red-500' : 'border-gray-700'} text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      value={signupData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value, true)}
                    >
                      <option value="">Select Gender *</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-sm text-red-400">{errors.gender}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        className={`pl-12 w-full p-4 bg-gray-800/50 border ${errors.schoolOrJob ? 'border-red-500' : 'border-gray-700'} text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400`}
                        placeholder="School/Job *"
                        value={signupData.schoolOrJob}
                        onChange={(e) => handleInputChange('schoolOrJob', e.target.value, true)}
                      />
                    </div>
                    {errors.schoolOrJob && <p className="mt-1 text-sm text-red-400">{errors.schoolOrJob}</p>}
                  </div>

                  <div>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        className={`pl-12 w-full p-4 bg-gray-800/50 border ${errors.location ? 'border-red-500' : 'border-gray-700'} text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400`}
                        placeholder="Location *"
                        value={signupData.location}
                        onChange={(e) => handleInputChange('location', e.target.value, true)}
                      />
                    </div>
                    {errors.location && <p className="mt-1 text-sm text-red-400">{errors.location}</p>}
                  </div>
                </div>

                <div>
                  <textarea
                    rows={3}
                    className="w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    placeholder="Tell us about yourself..."
                    value={signupData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value, true)}
                  />
                </div>
              </div>

              {/* Skills to Teach */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-purple-300">Skills I can teach (optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Skill name"
                    className="p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <select
                    className="p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={newSkill.rating}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addSkillToTeach}
                    className="px-4 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-purple-500/25"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Brief description"
                  className="w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                  value={newSkill.description}
                  onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                />

                <div className="space-y-2">
                  {skillsToTeach.map((skill, index) => (
                    <div key={index} className="skill-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-purple-200">{skill.name}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < skill.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">{skill.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSkillToTeach(index)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills to Learn */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-cyan-300">Skills I want to learn (optional)</h3>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Enter a skill"
                    className="flex-1 p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    value={newLearnSkill}
                    onChange={(e) => setNewLearnSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillToLearn())}
                  />
                  <button
                    type="button"
                    onClick={addSkillToLearn}
                    className="px-4 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-cyan-500/25"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillsToLearn.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkillToLearn(skill)}
                        className="ml-2 text-cyan-400 hover:text-cyan-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-300">Interests (optional)</h3>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Enter an interest"
                    className="flex-1 p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="px-4 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-2 text-blue-400 hover:text-blue-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                    <UserPlus className="h-5 w-5 text-purple-200 group-hover:text-purple-100" />
                  </span>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setLoginData({ email: '', password: '' });
                setSignupData({
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  dateOfBirth: '',
                  gender: '',
                  schoolOrJob: '',
                  location: '',
                  bio: ''
                });
                setSkillsToTeach([]);
                setSkillsToLearn([]);
                setInterests([]);
              }}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
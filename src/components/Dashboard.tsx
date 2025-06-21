import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Users, User, Menu, X, Sparkles, LogOut, ChevronUp, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useScrollDirection } from '../hooks/useScrollDirection';
import { UserSearch } from './UserSearch';
import { ConnectionRequests } from './ConnectionRequests';
import { ChatInterface } from './ChatInterface';
import { UserProfile } from './UserProfile';
import { SkillDiscovery } from './SkillDiscovery';

type TabType = 'discover' | 'connections' | 'messages' | 'profile' | 'skill-discovery';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, authLoading } = useAuth();
  const { isVisible, scrollY } = useScrollDirection();

  const tabs = [
    { id: 'discover' as TabType, name: 'Discover', icon: Search },
    { id: 'skill-discovery' as TabType, name: 'Start Skilling Up 📈', icon: TrendingUp },
    { id: 'connections' as TabType, name: 'Requests', icon: Users },
    { id: 'messages' as TabType, name: 'Messages', icon: MessageCircle },
    { id: 'profile' as TabType, name: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <UserSearch />;
      case 'skill-discovery':
        return <SkillDiscovery />;
      case 'connections':
        return <ConnectionRequests />;
      case 'messages':
        return <ChatInterface />;
      case 'profile':
        return <UserProfile />;
      default:
        return <UserSearch />;
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('🔄 User clicked sign out');
      await logout();
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Force redirect even if there's an error
      window.location.href = '/';
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && !(event.target as Element).closest('.sidebar-container')) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  // Don't render if user is not available
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Modern Navigation Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isVisible 
            ? 'transform translate-y-0 opacity-100' 
            : 'transform -translate-y-full opacity-0'
        }`}
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="mx-4 mt-4">
          <nav className="glass-effect rounded-2xl border border-gray-700/50 shadow-2xl shadow-black/20">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Enhanced Logo & Brand (Left Side) */}
                <div className="flex items-center space-x-4 group">
                  <div className="relative">
                    {/* Logo with enhanced design */}
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-purple-500/50">
                      <Sparkles className="text-white text-xl transition-transform duration-300 group-hover:rotate-12" />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </div>
                  
                  {/* Enhanced Brand Name */}
                  <div className="relative">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent tracking-wide transition-all duration-300 group-hover:tracking-wider">
                      Skilldom
                    </h1>
                    {/* Subtle underline accent */}
                    <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>

                {/* Enhanced Menu Button (Right Side) */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="group relative p-4 rounded-2xl bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                  aria-label="Toggle navigation menu"
                  aria-expanded={sidebarOpen}
                >
                  {/* Background glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  
                  {/* Icon with enhanced animations */}
                  <div className="relative w-7 h-7 flex items-center justify-center">
                    <span className={`absolute inset-0 transition-all duration-300 ${sidebarOpen ? 'rotate-180 scale-90 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
                      <Menu className="w-7 h-7 text-purple-300 group-hover:text-purple-200 transition-colors duration-300" />
                    </span>
                    <span className={`absolute inset-0 transition-all duration-300 ${sidebarOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-90 opacity-0'}`}>
                      <X className="w-7 h-7 text-purple-300 group-hover:text-purple-200 transition-colors duration-300" />
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Sliding Menu Panel */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
        sidebarOpen ? 'visible' : 'invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sliding Panel */}
        <div className={`sidebar-container absolute right-0 top-0 h-full w-80 max-w-[85vw] glass-effect border-l border-gray-700/50 shadow-2xl transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="text-white text-lg" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                    Navigation
                  </h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* User Info in Panel */}
              <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-purple-600/10 to-cyan-600/10 border border-purple-500/20">
                <div className="h-12 w-12 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.location}</p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-6">
              <ul className="space-y-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-500/10'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-gray-600/50 border border-transparent'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          activeTab === tab.id 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-gray-700/50 text-gray-400 group-hover:text-gray-300'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-lg">{tab.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Panel Footer */}
            <div className="p-6 border-t border-gray-700/50">
              <button
                onClick={handleSignOut}
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-3 px-4 py-4 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 font-medium border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <LogOut className="h-5 w-5" />
                <span>{authLoading ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24">
        {renderContent()}
      </div>

      {/* Scroll to Top Button */}
      {scrollY > 300 && !isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
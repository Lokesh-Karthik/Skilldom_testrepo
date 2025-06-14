import React, { useState } from 'react';
import { Search, MessageCircle, Users, User, Menu, X, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserSearch } from './UserSearch';
import { ConnectionRequests } from './ConnectionRequests';
import { ChatInterface } from './ChatInterface';
import { UserProfile } from './UserProfile';

type TabType = 'discover' | 'connections' | 'messages' | 'profile';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, authLoading } = useAuth();

  if (!user) return null;

  const tabs = [
    { id: 'discover' as TabType, name: 'Discover', icon: Search },
    { id: 'connections' as TabType, name: 'Requests', icon: Users },
    { id: 'messages' as TabType, name: 'Messages', icon: MessageCircle },
    { id: 'profile' as TabType, name: 'Profile', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <UserSearch />;
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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile header */}
      <div className="lg:hidden glass-effect border-b border-gray-700/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white text-sm" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Skilldom
          </h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
        >
          {sidebarOpen ? <X className="h-6 w-6 text-gray-300" /> : <Menu className="h-6 w-6 text-gray-300" />}
        </button>
      </div>

      <div className="flex h-screen lg:h-auto">
        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 glass-effect border-r border-gray-700/50 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="hidden lg:flex items-center space-x-3 p-6 border-b border-gray-700/50">
              <div className="h-12 w-12 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Sparkles className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Skilldom
              </h1>
            </div>

            {/* User info */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
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

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <li key={tab.id}>
                      <button
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border border-purple-500/30'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-700/50">
              <button
                onClick={handleSignOut}
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 font-medium border border-red-500/20 hover:border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="h-4 w-4" />
                <span>{authLoading ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 lg:ml-0 bg-gray-900">
          {renderContent()}
        </div>

        {/* Mobile bottom navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-gray-700/50">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-400'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs mt-1 font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
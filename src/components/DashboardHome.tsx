import React, { useState } from 'react';
import { 
  Sparkles, Users, MessageCircle, BookOpen, Trophy, Calendar, 
  TrendingUp, Star, Clock, Target, Zap, Award, Bell, Settings,
  Play, Plus, ArrowRight, ChevronRight, Activity, BarChart3,
  Brain, Coffee, Lightbulb, Heart, CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  if (!user) return null;

  // Mock data for dashboard
  const stats = {
    activeConnections: 12,
    pendingRequests: 3,
    recentMessages: 8,
    skillsLearning: 4,
    skillsTeaching: 6,
    hoursThisWeek: 15,
    studentsHelped: 23,
    learningStreak: 7
  };

  const recentActivity = [
    { type: 'message', user: 'Alice Johnson', action: 'sent you a message about React hooks', time: '2 hours ago', avatar: 'AJ' },
    { type: 'session', user: 'Bob Smith', action: 'completed a Python session with you', time: '4 hours ago', avatar: 'BS' },
    { type: 'connection', user: 'Emma Davis', action: 'accepted your connection request', time: '1 day ago', avatar: 'ED' },
    { type: 'achievement', user: 'You', action: 'earned the "Consistent Learner" badge', time: '2 days ago', avatar: user.name.charAt(0) }
  ];

  const learningProgress = [
    { skill: 'Python', progress: 75, timeSpent: '12h', nextSession: 'Tomorrow 2 PM' },
    { skill: 'Machine Learning', progress: 45, timeSpent: '8h', nextSession: 'Friday 10 AM' },
    { skill: 'Data Science', progress: 30, timeSpent: '5h', nextSession: 'Monday 3 PM' }
  ];

  const teachingStats = [
    { skill: 'UI/UX Design', students: 8, rating: 4.9, sessions: 15 },
    { skill: 'Figma', students: 5, rating: 4.8, sessions: 12 },
    { skill: 'Design Thinking', students: 3, rating: 5.0, sessions: 8 }
  ];

  const upcomingEvents = [
    { title: 'Python Basics with Bob', type: 'Learning Session', time: 'Today 3:00 PM', duration: '1h' },
    { title: 'UX Design Workshop', type: 'Teaching Session', time: 'Tomorrow 10:00 AM', duration: '2h' },
    { title: 'Design Thinking Meetup', type: 'Community Event', time: 'Friday 6:00 PM', duration: '3h' }
  ];

  const achievements = [
    { name: 'Consistent Learner', description: '7-day learning streak', icon: '🔥', earned: true },
    { name: 'Knowledge Sharer', description: 'Helped 20+ students', icon: '🎓', earned: true },
    { name: 'Community Builder', description: '10+ connections made', icon: '🤝', earned: true },
    { name: 'Skill Master', description: 'Master 5 skills', icon: '⭐', earned: false }
  ];

  const quickActions = [
    { title: 'Start Learning Session', icon: Play, color: 'from-green-500 to-emerald-500' },
    { title: 'Message Connections', icon: MessageCircle, color: 'from-blue-500 to-cyan-500' },
    { title: 'Schedule Session', icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { title: 'Find New Skills', icon: Plus, color: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-8">
      {/* Welcome Header */}
      <div className="glass-effect rounded-2xl p-6 lg:p-8 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-16 w-16 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Welcome back, {user.name.split(' ')[0]}!
                </h1>
                <p className="text-gray-400 text-lg">Ready to learn and teach today?</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Last active: 2 hours ago</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400">{stats.learningStreak} day streak</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg">
              <Play className="h-5 w-5" />
              <span>Start Session</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-all duration-200">
              <Calendar className="h-5 w-5" />
              <span>Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="glass-effect rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <Users className="h-8 w-8 text-purple-400" />
            <span className="text-2xl lg:text-3xl font-bold text-white">{stats.activeConnections}</span>
          </div>
          <p className="text-gray-400 text-sm">Active Connections</p>
          <div className="flex items-center mt-2 text-xs text-green-400">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+2 this week</span>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <MessageCircle className="h-8 w-8 text-cyan-400" />
            <span className="text-2xl lg:text-3xl font-bold text-white">{stats.recentMessages}</span>
          </div>
          <p className="text-gray-400 text-sm">New Messages</p>
          <div className="flex items-center mt-2 text-xs text-cyan-400">
            <Bell className="h-3 w-3 mr-1" />
            <span>3 unread</span>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="h-8 w-8 text-green-400" />
            <span className="text-2xl lg:text-3xl font-bold text-white">{stats.hoursThisWeek}</span>
          </div>
          <p className="text-gray-400 text-sm">Hours This Week</p>
          <div className="flex items-center mt-2 text-xs text-green-400">
            <Target className="h-3 w-3 mr-1" />
            <span>Goal: 20h</span>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl lg:text-3xl font-bold text-white">{stats.studentsHelped}</span>
          </div>
          <p className="text-gray-400 text-sm">Students Helped</p>
          <div className="flex items-center mt-2 text-xs text-yellow-400">
            <Award className="h-3 w-3 mr-1" />
            <span>+5 this month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Zap className="h-6 w-6 mr-2 text-purple-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="group p-4 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:scale-105"
            >
              <div className={`h-12 w-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:shadow-lg transition-all duration-300`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                {action.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress */}
        <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Brain className="h-6 w-6 mr-2 text-cyan-400" />
              Learning Progress
            </h2>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {learningProgress.map((item, index) => (
              <div key={index} className="skill-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">{item.skill}</h3>
                  <span className="text-sm text-gray-400">{item.timeSpent}</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2 mb-3">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-cyan-400">{item.progress}% complete</span>
                  <span className="text-gray-400">Next: {item.nextSession}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teaching Dashboard */}
        <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Lightbulb className="h-6 w-6 mr-2 text-yellow-400" />
              Teaching Impact
            </h2>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
              View Details
            </button>
          </div>
          <div className="space-y-4">
            {teachingStats.map((item, index) => (
              <div key={index} className="skill-card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{item.skill}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-yellow-400">{item.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{item.students} students</span>
                  <span>{item.sessions} sessions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-effect rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Activity className="h-6 w-6 mr-2 text-purple-400" />
              Recent Activity
            </h2>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-800/30 transition-all duration-200">
                <div className="h-10 w-10 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">{activity.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 text-sm">
                    <span className="font-medium text-white">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-green-400" />
              Upcoming
            </h2>
            <button className="text-green-400 hover:text-green-300 text-sm font-medium">
              Calendar
            </button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="skill-card">
                <div className="mb-2">
                  <h3 className="font-medium text-white text-sm">{event.title}</h3>
                  <p className="text-xs text-gray-400">{event.type}</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-400">{event.time}</span>
                  <span className="text-gray-400">{event.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements & Skill Exchange */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-400" />
              Achievements
            </h2>
            <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className={`skill-card ${achievement.earned ? 'border-yellow-500/30' : 'opacity-60'}`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <h3 className="font-medium text-white text-sm mb-1">{achievement.name}</h3>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                  {achievement.earned && (
                    <CheckCircle className="h-4 w-4 text-green-400 mx-auto mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Exchange Hub */}
        <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Heart className="h-6 w-6 mr-2 text-pink-400" />
              Skill Exchange
            </h2>
            <button className="text-pink-400 hover:text-pink-300 text-sm font-medium">
              Explore
            </button>
          </div>
          <div className="space-y-4">
            <div className="skill-card border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-300">Active Exchange</span>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-white text-sm mb-1">Teaching: UI/UX Design</p>
              <p className="text-gray-400 text-sm">Learning: Python from Bob Smith</p>
            </div>
            
            <div className="skill-card border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-300">Suggested Match</span>
                <AlertCircle className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-white text-sm mb-1">Teach: Figma</p>
              <p className="text-gray-400 text-sm">Learn: Motion Graphics</p>
              <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium">
                Connect →
              </button>
            </div>

            <div className="text-center py-4">
              <button className="flex items-center space-x-2 mx-auto text-pink-400 hover:text-pink-300 text-sm font-medium">
                <Plus className="h-4 w-4" />
                <span>Find New Exchanges</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Suggestions */}
      <div className="glass-effect rounded-2xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Coffee className="h-6 w-6 mr-2 text-orange-400" />
          Smart Suggestions
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="skill-card border-orange-500/30">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Practice Reminder</p>
                <p className="text-gray-400 text-xs">You haven't practiced Python in 3 days</p>
              </div>
            </div>
          </div>
          
          <div className="skill-card border-purple-500/30">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">New Connection</p>
                <p className="text-gray-400 text-xs">3 people want to learn UI/UX Design</p>
              </div>
            </div>
          </div>
          
          <div className="skill-card border-cyan-500/30">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Goal Progress</p>
                <p className="text-gray-400 text-xs">75% towards your weekly learning goal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
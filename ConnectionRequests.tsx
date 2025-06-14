import React, { useState, useEffect } from 'react';
import { Users, Check, X, MessageCircle, Calendar, Sparkles } from 'lucide-react';
import { ConnectionRequest, User } from '../types';
import { mockConnectionService, mockUserService } from '../services/mockBackend';
import { useAuth } from '../hooks/useAuth';

export const ConnectionRequests: React.FC = () => {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConnectionRequests();
    }
  }, [user]);

  const loadConnectionRequests = async () => {
    if (!user) return;
    
    try {
      const connectionRequests = await mockConnectionService.getConnectionRequests(user.id);
      setRequests(connectionRequests);

      const userPromises = connectionRequests.map(request => 
        mockUserService.getUserById(request.from)
      );
      const userResults = await Promise.all(userPromises);
      
      const usersMap: { [key: string]: User } = {};
      userResults.forEach(user => {
        if (user) {
          usersMap[user.id] = user;
        }
      });
      setUsers(usersMap);
    } catch (error) {
      console.error('Error loading connection requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const success = await mockConnectionService.acceptConnectionRequest(requestId);
      if (success) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      const success = await mockConnectionService.rejectConnectionRequest(requestId);
      if (success) {
        setRequests(prev => prev.filter(req => req.id !== requestId));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <div className="flex justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <Users className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Connection Requests
          </h1>
        </div>
        <p className="text-gray-400 text-lg">People who want to connect with you</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="relative mb-6">
            <Users className="h-20 w-20 text-gray-600 mx-auto" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No connection requests</h3>
          <p className="text-gray-400">When people send you connection requests, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => {
            const requestUser = users[request.from];
            if (!requestUser) return null;

            return (
              <div key={request.id} className="connection-card p-6 hover:scale-[1.01] transition-all duration-300">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="h-16 w-16 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
                    <span className="text-white font-semibold text-xl">
                      {requestUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* User Info */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white truncate">
                        {requestUser.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(request.timestamp)}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">
                      {requestUser.schoolOrJob} • {requestUser.location}
                    </p>

                    {/* Skills Preview */}
                    <div className="mb-4">
                      {requestUser.skillsToTeach.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm text-purple-300 font-medium">Teaches: </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {requestUser.skillsToTeach.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {requestUser.skillsToLearn.length > 0 && (
                        <div>
                          <span className="text-sm text-cyan-300 font-medium">Learning: </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {requestUser.skillsToLearn.slice(0, 3).map((skill, index) => (
                              <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div className="glass-effect rounded-xl p-4 mb-4 border border-gray-700/30">
                      <div className="flex items-center mb-2">
                        <MessageCircle className="h-4 w-4 text-purple-400 mr-2" />
                        <span className="text-sm font-medium text-purple-300">Message:</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{request.message}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={actionLoading === request.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-green-500/25"
                      >
                        <Check className="h-4 w-4" />
                        <span>{actionLoading === request.id ? 'Accepting...' : 'Accept'}</span>
                      </button>
                      
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={actionLoading === request.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                      >
                        <X className="h-4 w-4" />
                        <span>{actionLoading === request.id ? 'Rejecting...' : 'Decline'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
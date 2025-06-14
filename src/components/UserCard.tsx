import React, { useState } from 'react';
import { MapPin, Star, MessageCircle, Calendar, GraduationCap, Sparkles } from 'lucide-react';
import { User } from '../types';
import { mockConnectionService } from '../services/mockBackend';
import { ConnectionRequestModal } from '../../ConnectionRequestModal';

interface UserCardProps {
  user: User;
}

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSendRequest = async (message: string) => {
    setLoading(true);
    try {
      const success = await mockConnectionService.sendConnectionRequest(user.id, message);
      if (success) {
        setShowRequestModal(false);
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="connection-card overflow-hidden group hover:scale-[1.02] transition-all duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 h-24 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10"></div>
          <div className="absolute -bottom-8 left-6">
            <div className="h-16 w-16 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/25 border-2 border-gray-800">
              <span className="text-2xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <Sparkles className="h-5 w-5 text-purple-400 opacity-60" />
          </div>
        </div>

        <div className="pt-10 p-6">
          {/* User Info */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">{user.name}</h3>
            <div className="flex items-center text-gray-400 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{user.location}</span>
              <span className="mx-2">•</span>
              <Calendar className="h-4 w-4 mr-1" />
              <span>{calculateAge(user.dateOfBirth)} years old</span>
            </div>
            <div className="flex items-center text-gray-400 text-sm mb-3">
              <GraduationCap className="h-4 w-4 mr-1" />
              <span className="truncate">{user.schoolOrJob}</span>
            </div>
            <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">{user.bio}</p>
          </div>

          {/* Skills to Teach */}
          {user.skillsToTeach.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-purple-300 mb-3 flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Can teach:
              </h4>
              <div className="space-y-2">
                {user.skillsToTeach.slice(0, 2).map((skill, index) => (
                  <div key={index} className="skill-card">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-200">{skill.name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < skill.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {user.skillsToTeach.length > 2 && (
                  <p className="text-xs text-gray-500">+{user.skillsToTeach.length - 2} more skills</p>
                )}
              </div>
            </div>
          )}

          {/* Skills to Learn */}
          {user.skillsToLearn.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-cyan-300 mb-2">Wants to learn:</h4>
              <div className="flex flex-wrap gap-2">
                {user.skillsToLearn.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30"
                  >
                    {skill}
                  </span>
                ))}
                {user.skillsToLearn.length > 3 && (
                  <span className="px-3 py-1 text-xs bg-gray-700/50 text-gray-400 rounded-full border border-gray-600/30">
                    +{user.skillsToLearn.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Interests */}
          {user.interests.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">Interests:</h4>
              <div className="flex flex-wrap gap-2">
                {user.interests.slice(0, 3).map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 3 && (
                  <span className="px-3 py-1 text-xs bg-gray-700/50 text-gray-400 rounded-full border border-gray-600/30">
                    +{user.interests.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Connect Button */}
          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-200 font-medium shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Send Connection Request</span>
          </button>
        </div>
      </div>

      <ConnectionRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSend={handleSendRequest}
        recipientName={user.name}
        loading={loading}
      />
    </>
  );
};
import React, { useState } from 'react';
import { Edit3, MapPin, Calendar, GraduationCap, Star, Plus, X, Save, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Skill } from '../types';
import { mockUserService } from '../services/mockBackend';

export const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [editData, setEditData] = useState({
    name: user?.name || '',
    schoolOrJob: user?.schoolOrJob || '',
    location: user?.location || '',
    bio: user?.bio || ''
  });
  
  const [skillsToTeach, setSkillsToTeach] = useState<Skill[]>(user?.skillsToTeach || []);
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>(user?.skillsToLearn || []);
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  
  const [newSkill, setNewSkill] = useState({ name: '', rating: 1, description: '' });
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  if (!user) return null;

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

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = {
        ...editData,
        skillsToTeach,
        skillsToLearn,
        interests
      };
      
      const updatedUser = await mockUserService.updateProfile(user.id, updates);
      if (updatedUser) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: user.name,
      schoolOrJob: user.schoolOrJob,
      location: user.location,
      bio: user.bio
    });
    setSkillsToTeach(user.skillsToTeach);
    setSkillsToLearn(user.skillsToLearn);
    setInterests(user.interests);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-400 text-lg">Manage your personal information and skills</p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-purple-500/25"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="glass-effect rounded-2xl border border-gray-700/50 overflow-hidden">
        {/* Cover & Avatar */}
        <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 h-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10"></div>
          <div className="absolute -bottom-12 left-8">
            <div className="h-24 w-24 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25 border-4 border-gray-900">
              <span className="text-3xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          {/* Basic Info */}
          <div className="mb-8">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">School/Job</label>
                  <input
                    type="text"
                    value={editData.schoolOrJob}
                    onChange={(e) => handleInputChange('schoolOrJob', e.target.value)}
                    className="w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    rows={4}
                    value={editData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">{user.name}</h2>
                <div className="space-y-3 text-gray-400">
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-3 text-purple-400" />
                    <span>{user.schoolOrJob}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-cyan-400" />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                    <span>{calculateAge(user.dateOfBirth)} years old</span>
                  </div>
                </div>
                <p className="text-gray-300 mt-6 leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>

          {/* Skills to Teach */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-purple-300 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2" />
              Skills I Can Teach
            </h3>
            {isEditing && (
              <div className="mb-4 space-y-4">
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
              </div>
            )}
            
            <div className="space-y-4">
              {skillsToTeach.map((skill, index) => (
                <div key={index} className="skill-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-purple-200">{skill.name}</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < skill.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeSkillToTeach(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <p className="text-purple-100 text-sm mt-2">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills to Learn */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-cyan-300 mb-4">Skills I Want to Learn</h3>
            {isEditing && (
              <div className="flex space-x-3 mb-4">
                <input
                  type="text"
                  placeholder="Enter a skill"
                  className="flex-1 p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                  value={newLearnSkill}
                  onChange={(e) => setNewLearnSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkillToLearn()}
                />
                <button
                  type="button"
                  onClick={addSkillToLearn}
                  className="px-4 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-cyan-500/25"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {skillsToLearn.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                >
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkillToLearn(skill)}
                      className="ml-2 text-cyan-400 hover:text-cyan-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-300 mb-4">Interests</h3>
            {isEditing && (
              <div className="flex space-x-3 mb-4">
                <input
                  type="text"
                  placeholder="Enter an interest"
                  className="flex-1 p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="px-4 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30"
                >
                  {interest}
                  {isEditing && (
                    <button
                      onClick={() => removeInterest(interest)}
                      className="ml-2 text-blue-400 hover:text-blue-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-500/25"
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
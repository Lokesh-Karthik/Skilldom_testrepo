import React, { useState } from 'react';
import { User, Calendar, MapPin, GraduationCap, Star, Plus, X, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Skill } from '../types';

interface ProfileSetupProps {
  onComplete: () => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
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

  const { register, loading } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleComplete = async () => {
    const userData = {
      ...formData,
      email: 'new@example.com',
      skillsToTeach,
      skillsToLearn,
      interests,
      profileImage: undefined
    };

    const user = await register(userData);
    if (user) {
      onComplete();
    }
  };

  const isStep1Valid = formData.name && formData.dateOfBirth && formData.gender && formData.schoolOrJob && formData.location;
  const isStep2Valid = skillsToTeach.length > 0 || skillsToLearn.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/25">
            <Sparkles className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-gray-400 mt-3 text-lg">Help others find you and connect based on your skills and interests</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step >= stepNum 
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/25' 
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                    step > stepNum ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 text-sm text-gray-400">
            <span>
              {step === 1 ? 'Basic Information' : step === 2 ? 'Skills' : 'Interests & Bio'}
            </span>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-8 border border-gray-700/50">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      className="pl-12 w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      className="pl-12 w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gender *
                  </label>
                  <select
                    className="w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      className="pl-12 w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                      placeholder="City, State/Country"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  School/Job *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    className="pl-12 w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    placeholder="Your school or current job"
                    value={formData.schoolOrJob}
                    onChange={(e) => handleInputChange('schoolOrJob', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-white">Skills</h2>
              
              {/* Skills to Teach */}
              <div>
                <h3 className="text-lg font-medium text-purple-300 mb-4">Skills I can teach</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Skill name"
                      className="p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <select
                        className="flex-1 p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        value={newSkill.rating}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                      >
                        {[1, 2, 3, 4, 5].map(rating => (
                          <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Describe your skill (optional)"
                      className="flex-1 p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                      value={newSkill.description}
                      onChange={(e) => setNewSkill(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={addSkillToTeach}
                      className="px-4 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-purple-500/25"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
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
                          {skill.description && (
                            <p className="text-sm text-gray-400">{skill.description}</p>
                          )}
                        </div>
                        <button
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
              <div>
                <h3 className="text-lg font-medium text-cyan-300 mb-4">Skills I want to learn</h3>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Enter a skill you want to learn"
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
                <div className="mt-4 flex flex-wrap gap-2">
                  {skillsToLearn.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkillToLearn(skill)}
                        className="ml-2 text-cyan-400 hover:text-cyan-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">Interests & Bio</h2>
              
              <div>
                <h3 className="text-lg font-medium text-blue-300 mb-4">Interests</h3>
                <div className="flex space-x-3">
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
                <div className="mt-4 flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      {interest}
                      <button
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  rows={4}
                  className="w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Tell others about yourself, your passions, and what you're looking for..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>
            
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !isStep1Valid : step === 2 ? !isStep2Valid : false}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-green-500/25"
              >
                {loading ? 'Creating Profile...' : 'Complete Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Users, Filter, X, Sparkles } from 'lucide-react';
import { User, SearchFilters } from '../types';
import { mockUserService } from '../services/mockBackend';
import { UserCard } from '../../UserCard';

export const UserSearch: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchInputs, setSearchInputs] = useState({
    location: '',
    skillsToTeach: '',
    skillsToLearn: '',
    interests: ''
  });

  useEffect(() => {
    searchUsers();
  }, []);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const searchFilters: SearchFilters = {
        ...filters,
        skillsToTeach: searchInputs.skillsToTeach ? [searchInputs.skillsToTeach] : undefined,
        skillsToLearn: searchInputs.skillsToLearn ? [searchInputs.skillsToLearn] : undefined,
        interests: searchInputs.interests ? [searchInputs.interests] : undefined,
        location: searchInputs.location || undefined
      };
      
      const results = await mockUserService.searchUsers(searchFilters);
      setUsers(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchInputChange = (field: string, value: string) => {
    setSearchInputs(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchInputs({
      location: '',
      skillsToTeach: '',
      skillsToLearn: '',
      interests: ''
    });
    setFilters({});
  };

  const hasActiveFilters = Object.values(searchInputs).some(value => value.trim() !== '') || 
                          Object.keys(filters).length > 0;

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Discover People
          </h1>
        </div>
        <p className="text-gray-400 text-lg">Find people to learn from and teach your skills to</p>
      </div>

      {/* Search Controls */}
      <div className="glass-effect rounded-2xl p-6 mb-8 border border-gray-700/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location..."
              className="pl-12 w-full p-4 bg-gray-800/50 border border-gray-700 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={searchInputs.location}
              onChange={(e) => handleSearchInputChange('location', e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Star className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Skills they teach..."
              className="pl-12 w-full p-4 bg-gray-800/50 border border-gray-700 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={searchInputs.skillsToTeach}
              onChange={(e) => handleSearchInputChange('skillsToTeach', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Users className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Skills they want to learn..."
              className="pl-12 w-full p-4 bg-gray-800/50 border border-gray-700 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={searchInputs.skillsToLearn}
              onChange={(e) => handleSearchInputChange('skillsToLearn', e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Common interests..."
              className="pl-12 w-full p-4 bg-gray-800/50 border border-gray-700 placeholder-gray-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={searchInputs.interests}
              onChange={(e) => handleSearchInputChange('interests', e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={searchUsers}
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-purple-500/25"
          >
            {loading ? 'Searching...' : 'Search People'}
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center px-4 py-4 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-200"
          >
            <Filter className="h-5 w-5 mr-2" />
            Advanced Filters
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center px-4 py-4 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
            >
              <X className="h-5 w-5 mr-2" />
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <h3 className="text-lg font-medium text-white mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      ageRange: [parseInt(e.target.value) || 18, prev.ageRange?.[1] || 65]
                    }))}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full p-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      ageRange: [prev.ageRange?.[0] || 18, parseInt(e.target.value) || 65]
                    }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <select
                  className="w-full p-3 bg-gray-800/50 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    gender: e.target.value || undefined
                  }))}
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">
          {users.length} {users.length === 1 ? 'person' : 'people'} found
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
          {users.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="relative mb-6">
                <Users className="h-20 w-20 text-gray-600 mx-auto" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No people found</h3>
              <p className="text-gray-400">Try adjusting your search criteria to find more people.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
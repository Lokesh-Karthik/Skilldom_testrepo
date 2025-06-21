import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, X, Star, MapPin, GraduationCap, Sparkles, RotateCcw, Info } from 'lucide-react';
import { User } from '../types';
import { mockUserService } from '../services/mockBackend';
import { useAuth } from '../hooks/useAuth';

interface SwipeableCard {
  user: User;
  skill: {
    name: string;
    rating: number;
    description: string;
  };
}

export const SkillDiscovery: React.FC = () => {
  const [cards, setCards] = useState<SwipeableCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    loadSkillCards();
    // Hide tooltip after 5 seconds
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const loadSkillCards = async () => {
    try {
      setLoading(true);
      const users = await mockUserService.searchUsers({});
      
      // Create cards for each skill from each user
      const skillCards: SwipeableCard[] = [];
      users.forEach(u => {
        if (u.id !== user?.id && u.skillsToTeach.length > 0) {
          u.skillsToTeach.forEach(skill => {
            skillCards.push({
              user: u,
              skill: {
                name: skill.name,
                rating: skill.rating,
                description: skill.description || `Learn ${skill.name} from an experienced practitioner`
              }
            });
          });
        }
      });

      // Shuffle the cards for random discovery
      const shuffledCards = skillCards.sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
    } catch (error) {
      console.error('Error loading skill cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || currentIndex >= cards.length) return;

    setIsAnimating(true);
    setSwipeDirection(direction);

    // Simulate API call for interest/decline
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
      setIsAnimating(false);
      
      // Load more cards if running low
      if (currentIndex >= cards.length - 3) {
        loadSkillCards();
      }
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    setShowTooltip(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || isAnimating) return;
    
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    if (cardRef.current) {
      const rotation = deltaX * 0.1;
      const opacity = Math.max(0.7, 1 - Math.abs(deltaX) * 0.001);
      
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
      cardRef.current.style.opacity = opacity.toString();
      
      // Show swipe direction hints
      if (Math.abs(deltaX) > 50) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setSwipeDirection(null);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || isAnimating) return;
    
    const deltaX = currentX.current - startX.current;
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold) {
      handleSwipe(deltaX > 0 ? 'right' : 'left');
    } else {
      // Snap back to center
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0px) rotate(0deg)';
        cardRef.current.style.opacity = '1';
      }
      setSwipeDirection(null);
    }
    
    isDragging.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return;
    startX.current = e.clientX;
    isDragging.current = true;
    setShowTooltip(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || isAnimating) return;
    
    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    
    if (cardRef.current) {
      const rotation = deltaX * 0.1;
      const opacity = Math.max(0.7, 1 - Math.abs(deltaX) * 0.001);
      
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
      cardRef.current.style.opacity = opacity.toString();
      
      if (Math.abs(deltaX) > 50) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setSwipeDirection(null);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging.current || isAnimating) return;
    
    const deltaX = currentX.current - startX.current;
    const threshold = 100;
    
    if (Math.abs(deltaX) > threshold) {
      handleSwipe(deltaX > 0 ? 'right' : 'left');
    } else {
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0px) rotate(0deg)';
        cardRef.current.style.opacity = '1';
      }
      setSwipeDirection(null);
    }
    
    isDragging.current = false;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-xl"></div>
          </div>
          <p className="text-gray-400 text-lg">Finding amazing skills to learn...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <Sparkles className="h-20 w-20 text-purple-400 mx-auto" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full blur-xl"></div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">You've seen all skills!</h2>
          <p className="text-gray-400 mb-8">Check back later for new learning opportunities, or explore your connections.</p>
          <button
            onClick={() => {
              setCurrentIndex(0);
              loadSkillCards();
            }}
            className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-purple-500/25"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Discover More Skills</span>
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background with subtle pattern */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Start Skilling Up 📈
              </h1>
              <p className="text-gray-400">Discover amazing skills to learn</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {currentIndex + 1} / {cards.length}
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {showTooltip && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="glass-effect rounded-xl p-4 border border-purple-500/30 shadow-2xl">
            <div className="flex items-center space-x-2 text-purple-300">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">Swipe right to learn, left to pass</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="relative w-full max-w-sm">
          {/* Current Card */}
          <div
            ref={cardRef}
            className={`relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing transition-all duration-300 ${
              swipeDirection === 'right' ? 'shadow-green-500/25' : 
              swipeDirection === 'left' ? 'shadow-red-500/25' : 'shadow-purple-500/25'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Background Image with Skill Theme */}
            <div className="absolute inset-0">
              <div className={`w-full h-full bg-gradient-to-br ${
                currentCard.skill.name.toLowerCase().includes('design') ? 'from-pink-600/80 via-purple-600/80 to-blue-600/80' :
                currentCard.skill.name.toLowerCase().includes('programming') || currentCard.skill.name.toLowerCase().includes('code') ? 'from-green-600/80 via-blue-600/80 to-purple-600/80' :
                currentCard.skill.name.toLowerCase().includes('data') || currentCard.skill.name.toLowerCase().includes('analytics') ? 'from-blue-600/80 via-cyan-600/80 to-teal-600/80' :
                currentCard.skill.name.toLowerCase().includes('marketing') || currentCard.skill.name.toLowerCase().includes('business') ? 'from-orange-600/80 via-red-600/80 to-pink-600/80' :
                'from-purple-600/80 via-blue-600/80 to-cyan-600/80'
              }`}></div>
              <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Swipe Direction Overlay */}
            {swipeDirection && (
              <div className={`absolute inset-0 ${
                swipeDirection === 'right' ? 'bg-green-500/20' : 'bg-red-500/20'
              } transition-all duration-200`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`p-4 rounded-full ${
                    swipeDirection === 'right' ? 'bg-green-500/30 border-2 border-green-400' : 'bg-red-500/30 border-2 border-red-400'
                  }`}>
                    {swipeDirection === 'right' ? (
                      <Heart className="h-12 w-12 text-green-400" />
                    ) : (
                      <X className="h-12 w-12 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Card Content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-8">
              {/* Top Section - Skill Info */}
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                  {currentCard.skill.name}
                </h2>
                
                {/* Star Rating */}
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < currentCard.skill.rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-400'
                      } drop-shadow-lg`}
                    />
                  ))}
                </div>

                <p className="text-lg text-white/90 leading-relaxed drop-shadow-md">
                  {currentCard.skill.description}
                </p>
              </div>

              {/* Bottom Section - User Info */}
              <div className="glass-effect rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                    <span className="text-2xl font-bold text-white">
                      {currentCard.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {currentCard.user.name}
                    </h3>
                    <div className="flex items-center text-white/80 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{currentCard.user.location}</span>
                      <span className="mx-2">•</span>
                      <span>{calculateAge(currentCard.user.dateOfBirth)} years old</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-white/80 text-sm mb-3">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span>{currentCard.user.schoolOrJob}</span>
                </div>

                <p className="text-white/90 text-sm leading-relaxed">
                  {currentCard.user.bio}
                </p>
              </div>
            </div>
          </div>

          {/* Next Card Preview (slightly behind) */}
          {currentIndex + 1 < cards.length && (
            <div className="absolute inset-0 -z-10 transform scale-95 opacity-50">
              <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-600/80 via-gray-700/80 to-gray-800/80"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 p-6">
        <div className="flex justify-center space-x-8">
          <button
            onClick={() => handleSwipe('left')}
            disabled={isAnimating}
            className="group p-4 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500/30 hover:border-red-500/50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            <X className="h-8 w-8 text-red-400 group-hover:text-red-300 transition-colors" />
          </button>
          
          <button
            onClick={() => handleSwipe('right')}
            disabled={isAnimating}
            className="group p-4 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/30 hover:border-green-500/50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            <Heart className="h-8 w-8 text-green-400 group-hover:text-green-300 transition-colors" />
          </button>
        </div>
      </div>

      {/* Gesture Hints */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-30">
        <ChevronLeft className="h-8 w-8 text-red-400 animate-pulse" />
      </div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-30">
        <ChevronRight className="h-8 w-8 text-green-400 animate-pulse" />
      </div>
    </div>
  );
};
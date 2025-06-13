export interface User {
  id: string;
  email: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  schoolOrJob: string;
  location: string;
  bio: string;
  profileImage?: string;
  skillsToTeach: Skill[];
  skillsToLearn: string[];
  interests: string[];
  connections: string[];
  pendingRequests: string[];
  sentRequests: string[];
  createdAt: string;
}

export interface Skill {
  name: string;
  rating: number;
  description: string;
}

export interface ConnectionRequest {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
}

export interface SearchFilters {
  location?: string;
  ageRange?: [number, number];
  skillsToTeach?: string[];
  skillsToLearn?: string[];
  interests?: string[];
  gender?: string;
}
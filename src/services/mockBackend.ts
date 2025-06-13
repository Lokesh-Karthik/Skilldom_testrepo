import { User, ConnectionRequest, Message, Chat, SearchFilters } from '../types';

// Mock data storage
let users: User[] = [
  {
    id: '1',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    dateOfBirth: '1995-03-15',
    gender: 'female',
    schoolOrJob: 'Software Engineer at TechCorp',
    location: 'San Francisco, CA',
    bio: 'Passionate about web development and teaching others. Love hiking and photography in my free time.',
    skillsToTeach: [
      { name: 'React', rating: 5, description: 'Expert in React development with 5+ years experience' },
      { name: 'TypeScript', rating: 4, description: 'Strong TypeScript skills for scalable applications' }
    ],
    skillsToLearn: ['Python', 'Machine Learning'],
    interests: ['Photography', 'Hiking', 'Cooking'],
    connections: ['2'],
    pendingRequests: [],
    sentRequests: [],
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    email: 'bob@example.com',
    name: 'Bob Smith',
    dateOfBirth: '1990-07-20',
    gender: 'male',
    schoolOrJob: 'Data Scientist at DataCorp',
    location: 'New York, NY',
    bio: 'Data science enthusiast with a passion for AI and machine learning. Always excited to share knowledge.',
    skillsToTeach: [
      { name: 'Python', rating: 5, description: 'Expert Python developer with ML experience' },
      { name: 'Machine Learning', rating: 4, description: 'Practical ML applications and algorithms' }
    ],
    skillsToLearn: ['JavaScript', 'React'],
    interests: ['Gaming', 'Reading', 'Basketball'],
    connections: ['1'],
    pendingRequests: [],
    sentRequests: [],
    createdAt: '2024-01-10T10:00:00Z'
  }
];

let connectionRequests: ConnectionRequest[] = [];
let messages: Message[] = [];
let chats: Chat[] = [
  {
    id: '1-2',
    participants: ['1', '2'],
    messages: [
      {
        id: '1',
        from: '1',
        to: '2',
        content: 'Hi Bob! I saw you teach Python. I\'d love to learn more about machine learning.',
        timestamp: '2024-01-16T10:00:00Z',
        read: true
      },
      {
        id: '2',
        from: '2',
        to: '1',
        content: 'Hi Alice! I\'d be happy to help you with ML. Maybe we can trade - I\'m interested in learning React!',
        timestamp: '2024-01-16T10:15:00Z',
        read: true
      }
    ]
  }
];

// Mock authentication
export const mockAuth = {
  currentUser: null as User | null,
  
  async login(email: string, password: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    const user = users.find(u => u.email === email);
    if (user) {
      this.currentUser = user;
      return user;
    }
    return null;
  },
  
  async loginWithGoogle(): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate Google login - in real app, this would use Google OAuth
    const user = users[0]; // Return first user for demo
    this.currentUser = user;
    return user;
  },
  
  async register(userData: Omit<User, 'id' | 'connections' | 'pendingRequests' | 'sentRequests' | 'createdAt'>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      connections: [],
      pendingRequests: [],
      sentRequests: [],
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.currentUser = newUser;
    return newUser;
  },
  
  logout() {
    this.currentUser = null;
  }
};

// Mock user service
export const mockUserService = {
  async searchUsers(filters: SearchFilters): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filteredUsers = users.filter(u => u.id !== mockAuth.currentUser?.id);
    
    if (filters.location) {
      filteredUsers = filteredUsers.filter(u => 
        u.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters.skillsToTeach?.length) {
      filteredUsers = filteredUsers.filter(u => 
        u.skillsToTeach.some(skill => 
          filters.skillsToTeach!.some(searchSkill => 
            skill.name.toLowerCase().includes(searchSkill.toLowerCase())
          )
        )
      );
    }
    
    if (filters.skillsToLearn?.length) {
      filteredUsers = filteredUsers.filter(u => 
        u.skillsToLearn.some(skill => 
          filters.skillsToLearn!.some(searchSkill => 
            skill.toLowerCase().includes(searchSkill.toLowerCase())
          )
        )
      );
    }
    
    if (filters.interests?.length) {
      filteredUsers = filteredUsers.filter(u => 
        u.interests.some(interest => 
          filters.interests!.some(searchInterest => 
            interest.toLowerCase().includes(searchInterest.toLowerCase())
          )
        )
      );
    }
    
    return filteredUsers;
  },
  
  async getUserById(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return users.find(u => u.id === id) || null;
  },
  
  async updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      return users[userIndex];
    }
    return null;
  }
};

// Mock connection service
export const mockConnectionService = {
  async sendConnectionRequest(toUserId: string, message: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!mockAuth.currentUser) return false;
    
    const request: ConnectionRequest = {
      id: Date.now().toString(),
      from: mockAuth.currentUser.id,
      to: toUserId,
      message,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    connectionRequests.push(request);
    
    // Update user data
    const fromUser = users.find(u => u.id === mockAuth.currentUser!.id);
    const toUser = users.find(u => u.id === toUserId);
    
    if (fromUser && toUser) {
      fromUser.sentRequests.push(request.id);
      toUser.pendingRequests.push(request.id);
    }
    
    return true;
  },
  
  async getConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return connectionRequests.filter(r => r.to === userId && r.status === 'pending');
  },
  
  async acceptConnectionRequest(requestId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const request = connectionRequests.find(r => r.id === requestId);
    if (!request) return false;
    
    request.status = 'accepted';
    
    // Update user connections
    const fromUser = users.find(u => u.id === request.from);
    const toUser = users.find(u => u.id === request.to);
    
    if (fromUser && toUser) {
      fromUser.connections.push(toUser.id);
      toUser.connections.push(fromUser.id);
      
      // Remove from pending requests
      toUser.pendingRequests = toUser.pendingRequests.filter(id => id !== requestId);
      fromUser.sentRequests = fromUser.sentRequests.filter(id => id !== requestId);
      
      // Create chat
      const chat: Chat = {
        id: `${request.from}-${request.to}`,
        participants: [request.from, request.to],
        messages: []
      };
      chats.push(chat);
    }
    
    return true;
  },
  
  async rejectConnectionRequest(requestId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const request = connectionRequests.find(r => r.id === requestId);
    if (!request) return false;
    
    request.status = 'rejected';
    
    // Remove from pending requests
    const toUser = users.find(u => u.id === request.to);
    const fromUser = users.find(u => u.id === request.from);
    
    if (toUser && fromUser) {
      toUser.pendingRequests = toUser.pendingRequests.filter(id => id !== requestId);
      fromUser.sentRequests = fromUser.sentRequests.filter(id => id !== requestId);
    }
    
    return true;
  }
};

// Mock chat service
export const mockChatService = {
  async getChats(userId: string): Promise<Chat[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return chats.filter(chat => chat.participants.includes(userId));
  },
  
  async sendMessage(chatId: string, fromUserId: string, content: string): Promise<Message> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const message: Message = {
      id: Date.now().toString(),
      from: fromUserId,
      to: chatId.split('-').find(id => id !== fromUserId) || '',
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      chat.messages.push(message);
      chat.lastMessage = message;
    }
    
    return message;
  },
  
  async getMessages(chatId: string): Promise<Message[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const chat = chats.find(c => c.id === chatId);
    return chat ? chat.messages : [];
  }
};
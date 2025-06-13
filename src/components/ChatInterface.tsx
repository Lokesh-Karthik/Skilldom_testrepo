import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, ArrowLeft, Sparkles } from 'lucide-react';
import { Chat, Message, User } from '../types';
import { mockChatService, mockUserService } from '../services/mockBackend';
import { useAuth } from '../hooks/useAuth';

export const ChatInterface: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    if (!user) return;
    
    try {
      const userChats = await mockChatService.getChats(user.id);
      setChats(userChats);

      const userIds = new Set<string>();
      userChats.forEach(chat => {
        chat.participants.forEach(id => {
          if (id !== user.id) {
            userIds.add(id);
          }
        });
      });

      const userPromises = Array.from(userIds).map(id => mockUserService.getUserById(id));
      const userResults = await Promise.all(userPromises);
      
      const usersMap: { [key: string]: User } = {};
      userResults.forEach(u => {
        if (u) {
          usersMap[u.id] = u;
        }
      });
      setUsers(usersMap);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const chatMessages = await mockChatService.getMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    setSendingMessage(true);
    try {
      const message = await mockChatService.sendMessage(selectedChat.id, user.id, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, lastMessage: message }
          : chat
      ));
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const getChatPartner = (chat: Chat) => {
    const partnerId = chat.participants.find(id => id !== user?.id);
    return partnerId ? users[partnerId] : null;
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatChatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
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
    <div className="max-w-6xl mx-auto p-4 lg:p-6 h-[calc(100vh-8rem)]">
      <div className="glass-effect rounded-2xl border border-gray-700/50 h-full flex overflow-hidden">
        {/* Chat List */}
        <div className={`w-full lg:w-1/3 border-r border-gray-700/50 ${selectedChat ? 'hidden lg:block' : 'block'}`}>
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-6 w-6 text-purple-400" />
              <h1 className="text-xl font-bold text-white">Messages</h1>
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {chats.length === 0 ? (
              <div className="p-6 text-center">
                <div className="relative mb-4">
                  <MessageCircle className="h-16 w-16 text-gray-600 mx-auto" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
                </div>
                <p className="text-gray-400 font-medium">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Accept connection requests to start chatting
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/30">
                {chats.map((chat) => {
                  const partner = getChatPartner(chat);
                  if (!partner) return null;

                  return (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`w-full p-4 text-left hover:bg-gray-800/30 transition-all duration-200 ${
                        selectedChat?.id === chat.id ? 'bg-purple-500/10 border-r-2 border-purple-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <span className="text-white font-semibold">
                            {partner.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-white truncate">{partner.name}</p>
                            {chat.lastMessage && (
                              <span className="text-xs text-gray-500">
                                {formatChatTime(chat.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 truncate">
                            {chat.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col ${selectedChat ? 'block' : 'hidden lg:flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700/50 flex items-center space-x-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="lg:hidden p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-400" />
                </button>
                
                {(() => {
                  const partner = getChatPartner(selectedChat);
                  return partner ? (
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-semibold">
                          {partner.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h2 className="font-semibold text-white">{partner.name}</h2>
                        <p className="text-sm text-gray-400">{partner.location}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.from === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.from === user?.id
                          ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-gray-800/50 text-gray-200 border border-gray-700/50'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.from === user?.id ? 'text-purple-100' : 'text-gray-500'
                        }`}
                      >
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-700/50">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mb-6">
                  <MessageCircle className="h-20 w-20 text-gray-600 mx-auto" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
                <p className="text-gray-400">Choose a chat from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
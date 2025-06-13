import React, { useState } from 'react';
import { X, MessageCircle, Sparkles } from 'lucide-react';

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  recipientName: string;
  loading: boolean;
}

export const ConnectionRequestModal: React.FC<ConnectionRequestModalProps> = ({
  isOpen,
  onClose,
  onSend,
  recipientName,
  loading
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
    }
  };

  const suggestedMessages = [
    `Hi ${recipientName}! I'd love to connect and learn more about your skills.`,
    `Hello! I noticed we have similar interests and thought we could help each other learn.`,
    `Hi there! I'm interested in the skills you teach and would love to connect.`,
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-effect rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700/50">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Connect with {recipientName}
              </h2>
              <p className="text-sm text-gray-400">Send a connection request</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Introduce yourself (max 200 characters)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={4}
              className="w-full p-4 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none placeholder-gray-400"
              placeholder="Write a brief introduction message..."
              required
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                {message.length}/200 characters
              </span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-300 mb-3">Quick suggestions:</p>
            <div className="space-y-2">
              {suggestedMessages.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMessage(suggestion)}
                  className="w-full text-left p-3 text-sm border border-gray-700 rounded-xl hover:bg-gray-800/30 hover:border-purple-500/30 transition-all duration-200 text-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-effect border border-purple-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-medium text-purple-300">What happens next?</h4>
            </div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Your message will be sent to {recipientName}</li>
              <li>• They can accept or decline your request</li>
              <li>• If accepted, you can start chatting freely</li>
              <li>• Keep your message friendly and genuine</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg shadow-purple-500/25"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
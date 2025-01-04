import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';

interface ChatMessageProps {
  content: string;
  username: string;
  avatarUrl?: string;
  timestamp: string;
  isOwnMessage: boolean;
}

export function ChatMessage({ content, username, avatarUrl, timestamp, isOwnMessage }: ChatMessageProps) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>
        <div className={`mx-2 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          <div className="flex items-center mb-1">
            <span className="text-sm font-medium text-gray-900">{username}</span>
            <span className="ml-2 text-xs text-gray-500">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </span>
          </div>
          <div className={`rounded-lg px-4 py-2 ${
            isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
          }`}>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
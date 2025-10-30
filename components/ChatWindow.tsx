'use client';

import { ChatMessage } from '@/utils/api';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping: boolean;
}

export default function ChatWindow({ messages, isTyping }: ChatWindowProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Bot className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Marketa AI
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Your personal marketing assistant is ready to help. Ask me anything about your marketing strategy, campaigns, content ideas, or analytics.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-gray-600" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-5 py-3 shadow-sm',
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-gray-600" />
              </div>
              <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

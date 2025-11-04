'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface CampaignChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function CampaignChatMessage({
  role,
  content,
}: CampaignChatMessageProps) {
  return (
    <div
      className={cn(
        'flex gap-2 sm:gap-3 lg:gap-4 animate-fade-in',
        role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {role === 'assistant' && (
        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <Bot className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] lg:max-w-[60%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 shadow-sm animation-fade-in',
          role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        )}
      >
        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </p>
      </div>

      {role === 'user' && (
        <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
        </div>
      )}
    </div>
  );
}

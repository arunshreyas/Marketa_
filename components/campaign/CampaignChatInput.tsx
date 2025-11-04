'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

interface CampaignChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function CampaignChatInput({
  onSendMessage,
  disabled,
}: CampaignChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3 sm:p-4 lg:p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-2 sm:gap-3 items-end">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Marketa about this campaign..."
            disabled={disabled}
            className="min-h-[44px] sm:min-h-[48px] lg:min-h-[52px] max-h-[120px] sm:max-h-[160px] lg:max-h-[200px] resize-none flex-1 text-sm sm:text-base"
            rows={1}
          />
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="h-[44px] sm:h-[48px] lg:h-[52px] px-3 sm:px-4 lg:px-6 bg-blue-600 hover:bg-blue-700 flex-shrink-0"
          >
            {disabled ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

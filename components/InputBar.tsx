'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function InputBar({ onSendMessage, disabled }: InputBarProps) {
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
    <div className="border-t border-gray-200 bg-white p-6">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Marketa anything about your marketing..."
            disabled={disabled}
            className="min-h-[52px] max-h-[200px] resize-none flex-1"
            rows={1}
          />
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="h-[52px] px-6 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}

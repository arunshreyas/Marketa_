'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CampaignHeader from '@/components/CampaignHeader';
import CampaignChatMessage from '@/components/CampaignChatMessage';
import CampaignChatInput from '@/components/CampaignChatInput';
import { campaignAPI, getAuthToken, getUserData } from '@/utils/api';
import { Loader } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CampaignChatProps {
  campaignId: string;
}

export default function CampaignChat({ campaignId }: CampaignChatProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = `campaign-chat-${campaignId}`;

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }

        const campaignData = await campaignAPI.getCampaign(campaignId, token);
        setCampaign(campaignData);

        const savedMessages = localStorage.getItem(STORAGE_KEY);
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          setMessages(
            parsed.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          );
        }

        setError(null);
      } catch (err) {
        console.error('Error loading campaign:', err);
        setError('Failed to load campaign. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [campaignId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessages = (newMessages: ChatMessage[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setIsSending(true);

    try {
      const token = getAuthToken();
      const user = getUserData();

      if (!token || !user) {
        router.push('/login');
        return;
      }

      const response = await campaignAPI.sendCampaignMessage(
        campaignId,
        content,
        user.id,
        token
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveMessages(finalMessages);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {error || 'Campaign not found'}
          </h2>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <CampaignHeader campaign={campaign} />

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full px-4 py-6">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Start your conversation</h3>
                  <p className="text-sm text-gray-600">
                    Ask Marketa AI questions about {campaign.name} to optimize your campaign strategy
                  </p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <CampaignChatMessage key={index} message={message} />
            ))}

            {isSending && (
              <div className="flex justify-start mb-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-end gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <CampaignChatInput onSendMessage={handleSendMessage} disabled={isSending} />
      </div>
    </div>
  );
}

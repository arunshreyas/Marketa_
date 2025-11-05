'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import CampaignHeader from '@/components/campaign/CampaignHeader';
import CampaignChatMessage from '@/components/campaign/CampaignChatMessage';
import CampaignChatInput from '@/components/campaign/CampaignChatInput';
import { getAuthToken, getUserData, campaignAPI } from '@/utils/api';
import { Menu, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Campaign {
  id: string;
  name: string;
  goal: string;
  audience: string;
  budget: number;
  status: string;
}

export default function CampaignChatClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('id') || '';

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();
        if (!token) {
          router.push('/login');
          return;
        }
        const campaignData = await campaignAPI.getCampaign(campaignId, token);
        setCampaign(campaignData);

        const savedMessages = localStorage.getItem(
          `campaign-chat-${campaignId}`
        );
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          setMessages(
            parsedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          );
        }
      } catch (err) {
        setError('Failed to load campaign');
        console.error('Error fetching campaign:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    const token = getAuthToken();
    const userData = getUserData();

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await campaignAPI.sendCampaignMessage(
        campaignId,
        content,
        userData.id,
        token
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      localStorage.setItem(
        `campaign-chat-${campaignId}`,
        JSON.stringify(updatedMessages)
      );
    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Sorry, I encountered an error. Please try again or check your campaign details.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Error sending message:', err);
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className="hidden lg:block">
          <Sidebar isOpen={false} />
        </div>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className="hidden lg:block">
          <Sidebar isOpen={false} />
        </div>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </header>

          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {error || 'Campaign not found'}
              </p>
              <Button onClick={() => router.push('/campaigns')}>
                View All Campaigns
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar isOpen={false} />
      </div>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </header>

        <CampaignHeader campaign={campaign} />

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center px-4">
              <div className="text-center space-y-4 max-w-md w-full">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    Campaign Chat
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Ask Marketa AI anything about this campaign. Get insights,
                    suggestions, and strategic guidance.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <CampaignChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isTyping && (
                <div className="flex gap-2 sm:gap-3 lg:gap-4 justify-start">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div className="bg-white text-gray-900 border border-gray-200 rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <CampaignChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}

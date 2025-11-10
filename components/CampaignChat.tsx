'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import CampaignHeader from '@/components/CampaignHeader';
import CampaignChatMessage from '@/components/CampaignChatMessage';
import CampaignChatInput from '@/components/CampaignChatInput';
import { campaignAPI, getAuthToken, getUserData } from '@/utils/api';
import { Loader, Menu } from 'lucide-react';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    ai_model?: string;
    tokens_used?: number;
    campaign_suggestions?: string[];
  };
}

interface CampaignChatProps {
  campaignId: string;
}

export default function CampaignChat({ campaignId }: CampaignChatProps) {
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

        setConversationId(campaignId);

        // Try loading from server first for canonical history
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/messages/campaign/${campaignId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const serverMessages = await res.json();
            const mapped = (serverMessages || []).map((m: any) => ({
              id: m._id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.createdAt || Date.now()),
            }));
            setMessages(mapped);
            saveMessages(mapped);
          } else {
            // fallback to local storage
            const savedMessages = localStorage.getItem(STORAGE_KEY);
            if (savedMessages) {
              const parsed = JSON.parse(savedMessages);
              setMessages(parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
            }
          }
        } catch (_) {
          const savedMessages = localStorage.getItem(STORAGE_KEY);
          if (savedMessages) {
            const parsed = JSON.parse(savedMessages);
            setMessages(parsed.map((msg: any) => ({ ...msg, timestamp: new Date(msg.timestamp) })));
          }
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

  // Subscribe to server-sent events for real-time assistant messages
  useEffect(() => {
    if (!campaignId) return;
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/messages/stream/${campaignId}`;
    const source = new EventSource(url);

    const onNewMessage = (e: MessageEvent) => {
      try {
        const aiMessage = JSON.parse(e.data);
        // map to UI ChatMessage
        const mapped = {
          id: aiMessage._id,
          role: aiMessage.role,
          content: aiMessage.content,
          timestamp: new Date(aiMessage.createdAt || Date.now()),
        } as ChatMessage;
        setMessages(prev => {
          const next = [...prev, mapped];
          saveMessages(next);
          return next;
        });
      } catch (err) {
        // ignore parse errors
      }
    };

    source.addEventListener('message:new', onNewMessage);
    source.onerror = () => {
      // EventSource auto-retries by default; no-op
    };

    return () => {
      source.removeEventListener('message:new', onNewMessage as any);
      source.close();
    };
  }, [campaignId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessages = (newMessages: ChatMessage[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
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
      // If server already returned an aiMessage synchronously, append it now
      if (response && response.aiMessage && response.aiMessage.content) {
        const ai = response.aiMessage;
        const assistantMessage: ChatMessage = {
          id: ai._id || `assistant-${Date.now()}`,
          role: ai.role || 'assistant',
          content: ai.content,
          timestamp: new Date(ai.createdAt || Date.now()),
        };
        setMessages(prev => {
          // de-dupe by id + content
          if (prev.some(m => (m as any).id === assistantMessage.id && m.content === assistantMessage.content)) return prev;
          const next = [...prev, assistantMessage];
          saveMessages(next);
          return next;
        });
      } else {
        // Fallback: short-poll for assistant reply if SSE hasn't arrived yet
        const poll = async (attempt = 0) => {
          if (attempt > 20) return; // ~20s max if 1s interval
          try {
            const auth = getAuthToken();
            // 1) Try responses (as requested)
            const resResponses = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/responses/by-campaign/${campaignId}`, {
              headers: auth ? { 'Authorization': `Bearer ${auth}` } : {}
            });
            if (resResponses.ok) {
              const responses = await resResponses.json();
              const last = (responses || []).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).pop();
              if (last && last.response) {
                const mapped: ChatMessage = {
                  id: last._id,
                  role: 'assistant',
                  content: last.response,
                  timestamp: new Date(last.created_at || Date.now()),
                };
                setMessages(prev => {
                  if (prev.some(p => (p as any).id === mapped.id)) return prev;
                  const next = [...prev, mapped];
                  saveMessages(next);
                  return next;
                });
                return; // stop polling after found
              }
            }

            // 2) Fallback to messages
            const resMessages = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/messages/campaign/${campaignId}`, {
              headers: auth ? { 'Authorization': `Bearer ${auth}` } : {}
            });
            if (resMessages.ok) {
              const serverMessages = await resMessages.json();
              const lastAssistant = (serverMessages || []).reverse().find((m: any) => m.role === 'assistant');
              if (lastAssistant) {
                const mapped: ChatMessage = {
                  id: lastAssistant._id,
                  role: lastAssistant.role,
                  content: lastAssistant.content,
                  timestamp: new Date(lastAssistant.createdAt || Date.now()),
                };
                setMessages(prev => {
                  if (prev.some(p => (p as any).id === mapped.id)) return prev;
                  const next = [...prev, mapped];
                  saveMessages(next);
                  return next;
                });
                return; // stop polling after found
              }
            }
          } catch (_) { /* ignore */ }
          setTimeout(() => poll(attempt + 1), 1000);
        };
        poll();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{campaign?.name}</h1>
        </div>

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
    </div>
  );
}

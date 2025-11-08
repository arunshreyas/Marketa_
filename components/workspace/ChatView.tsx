'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { getAuthToken, getUserData, removeAuthToken } from '@/utils/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  campaign: string;
  sender: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: string;
  message_id?: string;
}

interface ChatViewProps {
  campaignId: string;
  campaignName: string;
}

interface AIResponse {
  message_id: string;
  reply: string;
  timestamp?: string;
}

export default function ChatView({ campaignId, campaignName }: ChatViewProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const processedResponsesRef = useRef<Set<string>>(new Set());

  const API_BASE = 'https://marketa-server.onrender.com';

  useEffect(() => {
    fetchMessages();
  }, [campaignId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  useEffect(() => {
    if (messages.length > 0 && !pollingActive) {
      setPollingActive(true);
      startPolling();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [messages.length, pollingActive]);

  const startPolling = async () => {
    pollingIntervalRef.current = setInterval(async () => {
      await pollForResponses();
    }, 2000);
  };

  const pollForResponses = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/response`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        router.push('/login');
        return;
      }

      if (!response.ok) {
        return;
      }

      const allResponses = await response.json();

      if (Array.isArray(allResponses) && allResponses.length > 0) {
        for (const aiResponse of allResponses) {
          const responseMessageId = aiResponse.message_id;
          const campaignId_response = aiResponse.campaign?._id || aiResponse.campaign;

          if (
            responseMessageId &&
            campaignId_response === campaignId &&
            !processedResponsesRef.current.has(responseMessageId)
          ) {
            console.log('Attaching AI response:', responseMessageId, aiResponse.response);
            attachAIResponse(responseMessageId, aiResponse.response);
            processedResponsesRef.current.add(responseMessageId);
          }
        }
      }
    } catch (err) {
      console.error('Error polling for responses:', err);
    }
  };

  const attachAIResponse = (messageId: string, reply: string) => {
    setMessages((prevMessages) => {
      const messageIndex = prevMessages.findIndex((msg) => msg.message_id === messageId || msg._id === messageId);

      if (messageIndex === -1) {
        console.warn(`Message with id ${messageId} not found in chat state`);
        return prevMessages;
      }

      const newMessages = [...prevMessages];
      const aiMessage: Message = {
        _id: `${messageId}-response-${Date.now()}`,
        campaign: campaignId,
        sender: 'ai',
        content: reply,
        role: 'assistant',
        createdAt: new Date().toISOString(),
      };

      newMessages.splice(messageIndex + 1, 0, aiMessage);
      return newMessages;
    });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE}/messages/campaign/${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const content = inputMessage.trim();
    setInputMessage('');

    try {
      setIsSending(true);
      const token = getAuthToken();
      const userData = getUserData();

      if (!userData?.id) {
        toast.error('User not authenticated');
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaign: campaignId,
          sender: userData.id,
          content: content,
          role: 'user',
        }),
      });

      if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const sentMessage = await response.json();
      const receivedMessageId = sentMessage.message_id || sentMessage._id;

      const userMessage: Message = {
        _id: sentMessage._id,
        campaign: campaignId,
        sender: userData.id,
        content: content,
        role: 'user',
        createdAt: sentMessage.createdAt || new Date().toISOString(),
        message_id: receivedMessageId,
      };

      setMessages((prev) => [...prev, userMessage]);

      if (receivedMessageId) {
        console.log('Message sent with ID:', receivedMessageId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      setInputMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-slate-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">
                  Start Your Conversation
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Ask Marketa AI about {campaignName}. Get insights, strategies, and
                  real-time optimization suggestions.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const time = new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={message._id}
                  className={cn(
                    'flex gap-4 animate-fade-in',
                    isUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      'flex flex-col max-w-xl',
                      isUser ? 'items-end' : 'items-start'
                    )}
                  >
                    <div
                      className={cn(
                        'px-5 py-3 rounded-2xl shadow-lg',
                        isUser
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none'
                          : 'bg-slate-800/80 backdrop-blur-sm text-slate-100 border border-slate-700 rounded-bl-none'
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 mt-2 px-1">{time}</span>
                  </div>

                  {isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="flex gap-4 justify-start animate-fade-in">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl rounded-bl-none px-5 py-3 shadow-lg">
                  <div className="flex gap-1.5">
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end bg-slate-800/50 rounded-2xl p-3 border border-slate-700 focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 transition-all">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Marketa AI anything..."
              disabled={isSending}
              className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm resize-none outline-none max-h-[120px] min-h-[24px]"
              rows={1}
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="h-10 w-10 p-0 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/25"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

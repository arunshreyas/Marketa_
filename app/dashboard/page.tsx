'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import InputBar from '@/components/InputBar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { chatAPI, getAuthToken, getUserData, ChatMessage, setAuthToken } from '@/utils/api';

export default function DashboardPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Check if there's a token in the URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setAuthToken(token);
        // Remove token from URL after storing it
        window.history.replaceState({}, document.title, '/dashboard');
      }
    }
    // 2. Check localStorage for token as before
    const storedToken = getAuthToken();
    if (!storedToken) {
      router.push('/login');
      return;
    }
    const data = getUserData();
    setUserData(data);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const token = getAuthToken();
      const user = getUserData();

      if (!token || !user) {
        router.push('/login');
        return;
      }

      const response = await chatAPI.sendMessage(content, user.id, token);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketa AI</h1>
            <p className="text-sm text-gray-600 mt-0.5">Your Personal Marketing Assistant</p>
          </div>
          <Avatar className="w-10 h-10 bg-blue-600">
            <AvatarFallback className="bg-blue-600 text-white font-medium">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </header>

        <div className="flex-1 flex flex-col min-h-0">
          <ChatWindow messages={messages} isTyping={isTyping} />
          <div ref={messagesEndRef} />
          <InputBar onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
}

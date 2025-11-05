'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, MessageSquare, Users, Settings, Loader2 } from 'lucide-react';
import { getAuthToken, removeAuthToken } from '@/utils/api';
import WorkspaceSidebar from './WorkspaceSidebar';
import ChatView from './ChatView';
import AgentsView from './AgentsView';
import CampaignSettingsView from './CampaignSettingsView';
import toast, { Toaster } from 'react-hot-toast';

interface CampaignWorkspaceProps {
  campaignId: string;
}

type TabType = 'chat' | 'agents' | 'settings';

interface Campaign {
  _id: string;
  campaign_name: string;
  status: string;
  goals: string;
  channels: string;
  budget: number;
  start_date: string;
  end_date: string;
  audience: string;
  content: string;
}

export default function CampaignWorkspace({ campaignId }: CampaignWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = 'https://marketa-server.onrender.com';

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCampaign();
  }, [campaignId, router]);

  const fetchCampaign = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE}/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }

      const data = await response.json();
      setCampaign(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError('Failed to load campaign');
      toast.error('Failed to load campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignUpdate = (updatedCampaign: Campaign) => {
    setCampaign(updatedCampaign);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-lg">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-200 mb-4">
            {error || 'Campaign not found'}
          </h2>
          <button
            onClick={() => router.push('/campaigns')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <Toaster position="top-right" />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-300" />
          </button>
          <h1 className="text-lg font-bold text-slate-100 truncate flex-1 mx-4">
            {campaign.campaign_name}
          </h1>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
          w-80 lg:w-80 flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <WorkspaceSidebar
          campaign={campaign}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        {activeTab === 'chat' && (
          <ChatView campaignId={campaignId} campaignName={campaign.campaign_name} />
        )}
        {activeTab === 'agents' && <AgentsView campaignId={campaignId} />}
        {activeTab === 'settings' && (
          <CampaignSettingsView
            campaign={campaign}
            onUpdate={handleCampaignUpdate}
          />
        )}
      </div>
    </div>
  );
}

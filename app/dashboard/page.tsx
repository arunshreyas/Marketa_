'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, User, LogOut, LayoutDashboard, Menu, MessageSquare, Plus, Loader } from 'lucide-react';
import { chatAPI, getAuthToken, getUserData, setAuthToken, removeAuthToken, campaignAPI } from '@/utils/api';

export default function DashboardPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // 1. Check if there's a token in the URL
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
          setAuthToken(token);
          window.history.replaceState({}, document.title, '/dashboard');
        }
      }
      // 2. Check localStorage for token
      const storedToken = getAuthToken();
      if (!storedToken) {
        router.push('/login');
        return;
      }
      const data = getUserData();
      setUserData(data);

      // 3. Fetch campaigns
      try {
        const campaignsData = await campaignAPI.getCampaigns(storedToken);
        setCampaigns(campaignsData || []);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    loadData();
  }, [router]);

  const handleLogout = () => {
    removeAuthToken();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userData');
      } catch {}
    }
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Marketa AI</h1>
            <p className="hidden sm:block text-xs sm:text-sm text-gray-600 mt-0.5 truncate">Your Personal Marketing Assistant</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full cursor-pointer flex-shrink-0">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all">
                  {userData?.profile_picture && (
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://marketa-server.onrender.com'}${userData.profile_picture}`}
                      alt={userData?.name || 'User'}
                    />
                  )}
                  <AvatarFallback className="bg-blue-600 text-white font-medium text-sm">
                    {userData?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userData?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userData?.email || ''}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard')} className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/brand')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Brand Info</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Campaigns</h2>
              <p className="text-gray-600">Manage and chat with your marketing campaigns</p>
            </div>

            {isLoadingCampaigns ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-6">Create your first campaign to get started</p>
                <button onClick={() => router.push('/campaigns?new=1')} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-5 h-5" />
                  Create Campaign
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id || campaign._id}
                    onClick={() => router.push(`/campaigns/${campaign.id || campaign._id}/chat`)}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {campaign.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status || 'draft'}
                        </span>
                      </div>

                      {campaign.goal && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          <span className="font-medium text-gray-700">Goal:</span> {campaign.goal}
                        </p>
                      )}

                      {campaign.audience && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          <span className="font-medium text-gray-700">Audience:</span> {campaign.audience}
                        </p>
                      )}

                      {campaign.budget && (
                        <p className="text-sm text-gray-600 mb-4">
                          <span className="font-medium text-gray-700">Budget:</span> ${campaign.budget.toLocaleString()}
                        </p>
                      )}

                      <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(campaign.createdAt || campaign.created_at).toLocaleDateString()}
                        </span>
                        <MessageSquare className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

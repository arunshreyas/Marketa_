'use client';

import { MessageSquare, Users, Settings, X, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Campaign {
  _id: string;
  campaign_name: string;
  status: string;
}

type TabType = 'chat' | 'agents' | 'settings';

interface WorkspaceSidebarProps {
  campaign: Campaign;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onClose: () => void;
}

const tabs = [
  { id: 'chat' as TabType, label: 'Chat', icon: MessageSquare },
  { id: 'agents' as TabType, label: 'Agents', icon: Users },
  { id: 'settings' as TabType, label: 'Campaign Settings', icon: Settings },
];

export default function WorkspaceSidebar({
  campaign,
  activeTab,
  onTabChange,
  onClose,
}: WorkspaceSidebarProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'paused':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="h-full bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-100">Marketa</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-100 leading-tight line-clamp-2">
            {campaign.campaign_name}
          </h2>
          <div
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border',
              getStatusColor(campaign.status)
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {campaign.status}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                onClose();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="px-4 py-3 bg-slate-800/50 rounded-lg">
          <p className="text-xs font-medium text-slate-400 mb-1">Workspace ID</p>
          <p className="text-xs font-mono text-slate-300 truncate">{campaign._id}</p>
        </div>
      </div>
    </div>
  );
}

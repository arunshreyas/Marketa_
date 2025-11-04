'use client';

import { ArrowLeft, Target, Users, DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CampaignHeaderProps {
  campaign: {
    name: string;
    goal?: string;
    audience?: string;
    budget?: number;
    status?: 'active' | 'paused' | 'completed' | 'draft';
    createdAt?: string;
  };
}

const statusConfig = {
  active: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2, label: 'Active' },
  paused: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock, label: 'Paused' },
  completed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: CheckCircle2, label: 'Completed' },
  draft: { bg: 'bg-gray-50', text: 'text-gray-700', icon: AlertCircle, label: 'Draft' },
};

export default function CampaignHeader({ campaign }: CampaignHeaderProps) {
  const router = useRouter();
  const statusKey = (campaign.status || 'draft').toString().toLowerCase() as keyof typeof statusConfig;
  const config = statusConfig[statusKey] || statusConfig.draft;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{campaign.name || (campaign as any).campaign_name}</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {campaign.goal && (
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Goal</p>
                    <p className="text-sm text-gray-900 mt-1">{campaign.goal}</p>
                  </div>
                </div>
              )}

              {campaign.audience && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Audience</p>
                    <p className="text-sm text-gray-900 mt-1">{campaign.audience}</p>
                  </div>
                </div>
              )}

              {campaign.budget && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</p>
                    <p className="text-sm text-gray-900 mt-1">${campaign.budget.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.text}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
                  <div className={`inline-flex items-center gap-2 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                    {config.label}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

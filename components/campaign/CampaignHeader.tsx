'use client';

import { Badge } from '@/components/ui/badge';
import { Target, Users, DollarSign, Zap } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  goal: string;
  audience: string;
  budget: number;
  status: string;
}

interface CampaignHeaderProps {
  campaign: Campaign;
}

export default function CampaignHeader({ campaign }: CampaignHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate mb-2">
              {campaign.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`${getStatusColor(campaign.status)} capitalize`}>
                {campaign.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-gray-600">Goal</p>
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {campaign.goal || 'N/A'}
            </p>
          </div>

          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-medium text-gray-600">Audience</p>
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {campaign.audience || 'N/A'}
            </p>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <p className="text-xs font-medium text-gray-600">Budget</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              ${campaign.budget?.toLocaleString() || '0'}
            </p>
          </div>

          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-orange-600" />
              <p className="text-xs font-medium text-gray-600">ID</p>
            </div>
            <p className="text-xs font-mono font-semibold text-gray-900 truncate">
              {campaign.id?.slice(0, 8)}...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

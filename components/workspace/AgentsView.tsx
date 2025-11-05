'use client';

import { useState } from 'react';
import { Megaphone, TrendingUp, BarChart3, FileText, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface AgentsViewProps {
  campaignId: string;
}

const agents = [
  {
    id: 'funnel-builder',
    name: 'Funnel Builder',
    description: 'Design and optimize your marketing funnel with AI-powered insights. Map customer journeys and identify conversion opportunities.',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/25',
  },
  {
    id: 'ad-generator',
    name: 'Ad Generator',
    description: 'Create compelling ad copy and creative concepts. Generate platform-specific ads optimized for engagement and conversions.',
    icon: Megaphone,
    color: 'from-purple-500 to-pink-500',
    shadowColor: 'shadow-purple-500/25',
  },
  {
    id: 'analytics-optimizer',
    name: 'Analytics Optimizer',
    description: 'Analyze campaign performance and get actionable recommendations. Track KPIs and identify optimization opportunities in real-time.',
    icon: BarChart3,
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/25',
  },
  {
    id: 'content-strategist',
    name: 'Content Strategist',
    description: 'Plan and execute content strategies that resonate. Get topic ideas, content calendars, and distribution strategies.',
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/25',
  },
];

export default function AgentsView({ campaignId }: AgentsViewProps) {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const handleUseAgent = (agentId: string, agentName: string) => {
    setActiveAgent(agentId);
    toast.success(`${agentName} activated for this campaign!`);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">AI-Powered Agents</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-100">
            Choose Your Marketing Agent
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Select an AI agent to help you with specific aspects of your campaign. Each agent
            specializes in different marketing functions.
          </p>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const isActive = activeAgent === agent.id;

            return (
              <div
                key={agent.id}
                className={cn(
                  'group relative bg-slate-800/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]',
                  isActive
                    ? 'border-blue-500/50 shadow-xl shadow-blue-500/20'
                    : 'border-slate-700 hover:border-slate-600'
                )}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Check className="w-3 h-3" />
                    ACTIVE
                  </div>
                )}

                <div className="space-y-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-14 h-14 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg',
                      agent.color,
                      agent.shadowColor
                    )}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-100">{agent.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {agent.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleUseAgent(agent.id, agent.name)}
                    disabled={isActive}
                    className={cn(
                      'w-full font-medium transition-all',
                      isActive
                        ? 'bg-slate-700 text-slate-300 cursor-default'
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25'
                    )}
                  >
                    {isActive ? 'Currently Active' : 'Use Agent'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-100">How AI Agents Work</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Each agent is trained on specific marketing tasks and can help you optimize
                different aspects of your campaign. You can switch between agents at any time,
                and they'll remember the context of your campaign to provide personalized
                recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

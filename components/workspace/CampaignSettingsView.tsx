'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getAuthToken, removeAuthToken } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';

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

interface CampaignSettingsViewProps {
  campaign: Campaign;
  onUpdate: (campaign: Campaign) => void;
}

export default function CampaignSettingsView({
  campaign,
  onUpdate,
}: CampaignSettingsViewProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    campaign_name: '',
    status: '',
    goals: '',
    channels: '',
    budget: '',
    start_date: '',
    end_date: '',
    audience: '',
    content: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const API_BASE = 'https://marketa-server.onrender.com';

  useEffect(() => {
    if (campaign) {
      setFormData({
        campaign_name: campaign.campaign_name || '',
        status: campaign.status || '',
        goals: campaign.goals || '',
        channels: campaign.channels || '',
        budget: campaign.budget?.toString() || '',
        start_date: campaign.start_date
          ? new Date(campaign.start_date).toISOString().split('T')[0]
          : '',
        end_date: campaign.end_date
          ? new Date(campaign.end_date).toISOString().split('T')[0]
          : '',
        audience: campaign.audience || '',
        content: campaign.content || '',
      });
    }
  }, [campaign]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = getAuthToken();

      const payload = {
        campaign_name: formData.campaign_name,
        status: formData.status,
        goals: formData.goals,
        channels: formData.channels,
        budget: Number(formData.budget),
        start_date: new Date(formData.start_date),
        end_date: new Date(formData.end_date),
        audience: formData.audience,
        content: formData.content,
      };

      const response = await fetch(`${API_BASE}/campaigns/${campaign._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        removeAuthToken();
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update campaign');
      }

      const updatedCampaign = await response.json();
      onUpdate(updatedCampaign);
      setHasChanges(false);
      toast.success('Campaign updated successfully!');
    } catch (err) {
      console.error('Error updating campaign:', err);
      toast.error('Failed to update campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      campaign_name: campaign.campaign_name || '',
      status: campaign.status || '',
      goals: campaign.goals || '',
      channels: campaign.channels || '',
      budget: campaign.budget?.toString() || '',
      start_date: campaign.start_date
        ? new Date(campaign.start_date).toISOString().split('T')[0]
        : '',
      end_date: campaign.end_date
        ? new Date(campaign.end_date).toISOString().split('T')[0]
        : '',
      audience: campaign.audience || '',
      content: campaign.content || '',
    });
    setHasChanges(false);
    toast.success('Changes discarded');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-100">Campaign Settings</h1>
          <p className="text-slate-400">
            Update your campaign details and configuration
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_name" className="text-slate-300">
                  Campaign Name *
                </Label>
                <Input
                  id="campaign_name"
                  name="campaign_name"
                  value={formData.campaign_name}
                  onChange={handleChange}
                  placeholder="Summer Launch 2024"
                  className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-300">
                  Status *
                </Label>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-100 focus:border-blue-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goals" className="text-slate-300">
                Campaign Goals *
              </Label>
              <Textarea
                id="goals"
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                placeholder="Increase brand awareness and drive traffic..."
                rows={3}
                className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              Budget & Timeline
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-slate-300">
                  Budget ($) *
                </Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="10000"
                  min="0"
                  step="0.01"
                  className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-slate-300">
                  Start Date *
                </Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="bg-slate-900/50 border-slate-600 text-slate-100 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-slate-300">
                  End Date *
                </Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="bg-slate-900/50 border-slate-600 text-slate-100 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Targeting */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-500 rounded-full" />
              Targeting & Strategy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="channels" className="text-slate-300">
                  Marketing Channels *
                </Label>
                <Input
                  id="channels"
                  name="channels"
                  value={formData.channels}
                  onChange={handleChange}
                  placeholder="Social Media, Email, SEO"
                  className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience" className="text-slate-300">
                  Target Audience *
                </Label>
                <Input
                  id="audience"
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  placeholder="Ages 25-40, Tech professionals"
                  className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-slate-300">
                Content Strategy *
              </Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Blog posts, video content, infographics..."
                rows={3}
                className="bg-slate-900/50 border-slate-600 text-slate-100 placeholder:text-slate-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="sticky bottom-0 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">You have unsaved changes</span>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {!hasChanges && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">All changes saved</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

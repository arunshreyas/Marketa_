"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCampaignModalProps) {
  const [formData, setFormData] = useState({
    campaign_name: "",
    status: "Active",
    goals: "",
    channels: "",
    budget: "",
    start_date: "",
    end_date: "",
    audience: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = typeof window !== 'undefined'
        ? localStorage.getItem("userId") || "default-user-id"
        : "default-user-id";

      const payload = {
        userId: userId,
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

      const response = await fetch(
        "https://marketa-server.onrender.com/campaigns/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast.success("Campaign created successfully!");
        setFormData({
          campaign_name: "",
          status: "Active",
          goals: "",
          channels: "",
          budget: "",
          start_date: "",
          end_date: "",
          audience: "",
          content: "",
        });
        onClose();
        onSuccess();
      } else {
        toast.error("Failed to create campaign");
      }
    } catch (error) {
      toast.error("Error creating campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Create New Campaign
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="campaign_name" className="text-slate-700">
                Campaign Name *
              </Label>
              <Input
                id="campaign_name"
                name="campaign_name"
                value={formData.campaign_name}
                onChange={handleChange}
                required
                placeholder="Summer Launch 2024"
                className="border-slate-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-700">
                Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="border-slate-200 focus:border-violet-500 focus:ring-violet-500">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Paused">Paused</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals" className="text-slate-700">
              Goals *
            </Label>
            <Textarea
              id="goals"
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              required
              placeholder="Increase brand awareness and drive traffic..."
              rows={3}
              className="border-slate-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="channels" className="text-slate-700">
                Channels *
              </Label>
              <Input
                id="channels"
                name="channels"
                value={formData.channels}
                onChange={handleChange}
                required
                placeholder="Social Media, Email, SEO"
                className="border-slate-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="text-slate-700">
                Budget ($) *
              </Label>
              <Input
                id="budget"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={handleChange}
                required
                placeholder="10000"
                min="0"
                step="0.01"
                className="border-slate-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-slate-700">
                Start Date *
              </Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="border-slate-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-slate-700">
                End Date *
              </Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="border-slate-200 focus:border-violet-500 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience" className="text-slate-700">
              Target Audience *
            </Label>
            <Input
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              required
              placeholder="Ages 25-40, Tech professionals, Urban areas"
              className="border-slate-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-slate-700">
              Content Strategy *
            </Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Blog posts, video content, infographics..."
              rows={3}
              className="border-slate-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            >
              {loading ? "Creating..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

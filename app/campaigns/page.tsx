"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateCampaignModal from "@/components/CreateCampaignModal";
import toast, { Toaster } from "react-hot-toast";

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

export default function CampaignsPage() {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		fetchCampaigns();
	}, []);

	const fetchCampaigns = async () => {
		setLoading(true);
		try {
			let userId = typeof window !== 'undefined'
				? localStorage.getItem("userId") || ""
				: "";
			let userEmail = typeof window !== 'undefined'
				? localStorage.getItem('userEmail') || ""
				: "";
			if (!userId && typeof window !== 'undefined') {
				const token = localStorage.getItem('authToken') || '';
				if (token && token.split('.').length === 3) {
					try {
						const payload = JSON.parse(atob(token.split('.')[1]));
						if (payload?.id) {
							userId = payload.id;
							localStorage.setItem('userId', userId);
						}
					} catch {}
				}
			}
			// Build identifier: prefer userId, fallback to email
			const identifier = userId || (userEmail ? encodeURIComponent(userEmail) : "");
			if (!identifier) {
				toast.error('User not authenticated');
				setCampaigns([]);
				return;
			}
			const response = await fetch(
				`https://marketa-server.onrender.com/campaigns/user/${identifier}`
			);
			if (response.ok) {
				const data = await response.json();
				setCampaigns(Array.isArray(data) ? data : []);
			} else {
				toast.error("Failed to fetch campaigns");
			}
		} catch (error) {
			toast.error("Error loading campaigns");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (campaignId: string) => {
		if (!confirm("Are you sure you want to delete this campaign?")) return;

		try {
			const response = await fetch(
				`https://marketa-server.onrender.com/campaigns/${campaignId}`,
				{ 
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					}
				}
			);
			
			if (response.ok) {
				const data = await response.json().catch(() => ({}));
				toast.success(data.message || "Campaign deleted successfully!");
				fetchCampaigns();
			} else {
				const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
				console.error("Delete error:", errorData);
				toast.error(errorData.message || `Failed to delete campaign (${response.status})`);
			}
		} catch (error: any) {
			console.error("Delete error:", error);
			toast.error(error.message || "Error deleting campaign");
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "bg-green-500";
			case "paused":
				return "bg-yellow-500";
			case "completed":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	const campaignsArray = Array.isArray(campaigns) ? campaigns : [];
	const filteredCampaigns = campaignsArray.filter((campaign) =>
		(campaign.campaign_name || '').toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			<Toaster position="top-right" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
					<div>
						<h1 className="text-4xl font-bold text-slate-900">Campaigns</h1>
						<p className="text-slate-600 mt-1">Manage and track your marketing campaigns</p>
					</div>
					<Button
						onClick={() => setIsModalOpen(true)}
						className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
					>
						<Plus className="w-4 h-4 mr-2" />
						New Campaign
					</Button>
				</div>

				<div className="mb-6">
					<div className="relative max-w-md">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
						<Input
							type="text"
							placeholder="Search campaigns..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 bg-white border-slate-200 focus:border-violet-500 focus:ring-violet-500"
						/>
					</div>
				</div>

				{loading ? (
					<div className="flex justify-center items-center py-20">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
					</div>
				) : filteredCampaigns.length === 0 ? (
					<Card className="p-12 text-center bg-white border-slate-200">
						<div className="max-w-md mx-auto">
							<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Search className="w-8 h-8 text-slate-400" />
							</div>
							<h3 className="text-xl font-semibold text-slate-900 mb-2">
								{searchQuery ? "No campaigns found" : "No campaigns yet"}
							</h3>
							<p className="text-slate-600 mb-6">
								{searchQuery
									? "Try adjusting your search query"
									: "Get started by creating your first campaign"}
							</p>
							{!searchQuery && (
								<Button
									onClick={() => setIsModalOpen(true)}
									className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
								>
									<Plus className="w-4 h-4 mr-2" />
									Create Campaign
								</Button>
							)}
						</div>
					</Card>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredCampaigns.map((campaign) => (
							<Card
								key={campaign._id}
								className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow duration-200"
							>
								<div className="flex justify-between items-start mb-4">
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-slate-900 mb-2">
											{campaign.campaign_name}
										</h3>
										<Badge
											className={`${getStatusColor(
												campaign.status
											)} text-white border-0`}
										>
											{campaign.status}
										</Badge>
									</div>
								</div>

								<div className="space-y-3 mb-4">
									<div>
										<p className="text-sm text-slate-500">Budget</p>
										<p className="text-lg font-semibold text-slate-900">
											${campaign.budget.toLocaleString()}
										</p>
									</div>
									<div>
										<p className="text-sm text-slate-500">Duration</p>
										<p className="text-sm text-slate-700">
											{new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
										</p>
									</div>
									<div>
										<p className="text-sm text-slate-500">Channels</p>
										<p className="text-sm text-slate-700">{campaign.channels}</p>
									</div>
								</div>

								<div className="flex gap-2 pt-4 border-t border-slate-100">
									<Button
										variant="outline"
										size="sm"
										className="flex-1 border-slate-200 hover:bg-slate-50"
									>
										<Eye className="w-4 h-4 mr-2" />
										View
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleDelete(campaign._id)}
										className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</Card>
						))}
					</div>
				)}
			</div>

			<CreateCampaignModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={fetchCampaigns}
			/>
		</div>
	);
}


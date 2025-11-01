"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save, Trash2, User, Briefcase, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/Sidebar";
import toast, { Toaster } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3500";

interface UserData {
  _id: string;
  user_id: string;
  username: string;
  name: string;
  email: string;
  profile_picture?: string;
  business_profile?: {
    industry?: string;
    target_audience?: string;
    marketing_goals?: string;
  };
  subscription?: {
    plan?: string;
    status?: string;
  };
  usage_metrics?: {
    ai_requests_this_month?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingPicture, setDeletingPicture] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    industry: "",
    target_audience: "",
    marketing_goals: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      const user = data.user;
      setUserData(user);

      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        industry: user.business_profile?.industry || "",
        target_audience: user.business_profile?.target_audience || "",
        marketing_goals: user.business_profile?.marketing_goals || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim()) {
      toast.error("Name, username, and email are required");
      return;
    }

    if (!userData?._id) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/users/${userData._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          business_profile: {
            industry: formData.industry,
            target_audience: formData.target_audience,
            marketing_goals: formData.marketing_goals,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      toast.success("Profile updated successfully!");
      fetchUserData();
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPicture = async () => {
    if (!selectedFile || !userData?._id) return;

    setUploadingPicture(true);
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("profile_picture", selectedFile);

      const response = await fetch(`${API_BASE_URL}/users/${userData._id}/profile-picture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile picture");
      }

      toast.success("Profile picture updated!");
      setPreviewImage(null);
      setSelectedFile(null);
      fetchUserData();
    } catch (error) {
      console.error("Error uploading picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleCancelUpload = () => {
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const handleDeletePicture = async () => {
    if (!userData?._id) return;

    setDeletingPicture(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/users/${userData._id}/profile-picture`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile picture");
      }

      toast.success("Profile picture removed");
      fetchUserData();
    } catch (error) {
      console.error("Error deleting picture:", error);
      toast.error("Failed to delete profile picture");
    } finally {
      setDeletingPicture(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Failed to load user data</p>
            <Button onClick={fetchUserData}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal details and profile picture
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-200">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage
                        src={
                          previewImage ||
                          (userData.profile_picture
                            ? `${API_BASE_URL}${userData.profile_picture}`
                            : "")
                        }
                        alt={userData.name}
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-2xl">
                        {userData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="profile-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Profile Picture
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG, GIF or WebP. Max size 5MB.
                      </p>
                    </div>
                    {previewImage ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUploadPicture}
                          disabled={uploadingPicture}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {uploadingPicture ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save Picture
                        </Button>
                        <Button
                          onClick={handleCancelUpload}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : userData.profile_picture ? (
                      <Button
                        onClick={handleDeletePicture}
                        disabled={deletingPicture}
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        {deletingPicture ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Remove Picture
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* User Information */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="johndoe"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user_id">User ID</Label>
                    <Input
                      id="user_id"
                      value={userData.user_id}
                      disabled
                      className="bg-gray-100 border-gray-300 text-gray-600"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Member Since</Label>
                    <Input
                      value={`Joined ${formatDate(userData.createdAt)}`}
                      disabled
                      className="bg-gray-100 border-gray-300 text-gray-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Profile Section */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Business Profile</CardTitle>
                    <CardDescription>
                      Tell us about your business and marketing goals
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="E-commerce, SaaS, etc."
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Input
                      id="target_audience"
                      name="target_audience"
                      value={formData.target_audience}
                      onChange={handleInputChange}
                      placeholder="Young adults, professionals, etc."
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="marketing_goals">Marketing Goals</Label>
                    <Textarea
                      id="marketing_goals"
                      name="marketing_goals"
                      value={formData.marketing_goals}
                      onChange={handleInputChange}
                      placeholder="Describe your marketing objectives..."
                      rows={4}
                      className="border-gray-300 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription & Usage Section */}
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      Subscription & Usage
                    </CardTitle>
                    <CardDescription>
                      View your current plan and usage statistics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Current Plan
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {userData.subscription?.plan || "Free"}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Status
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {userData.subscription?.status || "Active"}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-900 mb-1">
                      AI Requests
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {userData.usage_metrics?.ai_requests_this_month || 0}
                      <span className="text-sm font-normal text-purple-500 ml-1">
                        / month
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSaveChanges}
                disabled={saving}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

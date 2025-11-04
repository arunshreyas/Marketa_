'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import { brandAPI } from '@/utils/api';

export default function BrandForm() {
  const router = useRouter();
  const [brandName, setBrandName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [brandTone, setBrandTone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userId = typeof window !== 'undefined' ? (localStorage.getItem('userId') || '') : '';
      if (!userId) {
        router.push('/login');
        return;
      }

      await brandAPI.saveBrand({
        user_id: userId,
        brand_name: brandName,
        product_description: productDescription,
        target_audience: targetAudience,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save brand information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Brand Setup</CardTitle>
              <CardDescription className="text-base">
                Tell us about your brand to personalize your experience
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-base font-medium">
                Brand Name
              </Label>
              <Input
                id="brandName"
                type="text"
                placeholder="Enter your brand name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription" className="text-base font-medium">
                Product Description
              </Label>
              <Textarea
                id="productDescription"
                placeholder="Describe your product or service..."
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                required
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-base font-medium">
                Target Audience
              </Label>
              <Input
                id="targetAudience"
                type="text"
                placeholder="e.g., Small business owners, Tech enthusiasts"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandTone" className="text-base font-medium">
                Brand Tone
              </Label>
              <Select value={brandTone} onValueChange={setBrandTone} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-base font-medium"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2 } from 'lucide-react';
import { setAuthToken, getAuthToken, setUserData } from '@/utils/api';

interface AuthCardProps {
  mode: 'login' | 'signup';
}

export default function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      router.push('/dashboard');
      return;
    }

    const tokenFromUrl = searchParams.get('token');
    const userIdFromUrl = searchParams.get('userId');
    const userEmailFromUrl = searchParams.get('userEmail');
    const userNameFromUrl = searchParams.get('userName');
    const profilePictureFromUrl = searchParams.get('profilePicture');

    if (tokenFromUrl) {
      setAuthToken(tokenFromUrl);
      if (userIdFromUrl) {
        localStorage.setItem('userId', userIdFromUrl);
        localStorage.setItem('userEmail', userEmailFromUrl || '');
        localStorage.setItem('userName', userNameFromUrl || '');
        setUserData({
          id: userIdFromUrl,
          email: userEmailFromUrl || '',
          name: userNameFromUrl || '',
          profile_picture: profilePictureFromUrl || null,
        });
      }
      router.push('/dashboard');
    }
  }, [router, searchParams]);

  const handleOAuthLogin = (provider: 'github' | 'discord') => {
    setLoading(true);
    setError('');
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://marketa-server.onrender.com';
      window.location.href = `${base}/auth/${provider}`;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Marketa</CardTitle>
            <CardDescription className="text-base mt-2">
              {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="button"
            className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-base font-medium flex items-center justify-center gap-2 transition-all"
            disabled={loading}
            onClick={() => handleOAuthLogin('github')}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </>
            )}
          </Button>

          <Button
            type="button"
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-medium flex items-center justify-center gap-2 transition-all"
            disabled={loading}
            onClick={() => handleOAuthLogin('discord')}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.975 14.975 0 0 0 1.293-2.1a.07.07 0 0 0-.038-.098a13.11 13.11 0 0 1-1.872-.892a.072.072 0 0 1-.007-.12a10.149 10.149 0 0 0 .372-.294a.071.071 0 0 1 .074-.01c3.928 1.793 8.18 1.793 12.062 0a.071.071 0 0 1 .075.009q.186.15.372.294a.072.072 0 0 1-.006.12a12.993 12.993 0 0 1-1.872.892a.07.07 0 0 0-.039.098a14.97 14.97 0 0 0 1.293 2.1a.078.078 0 0 0 .084.028a19.963 19.963 0 0 0 6.002-3.03a.079.079 0 0 0 .033-.057c.5-4.565-.838-8.535-3.547-12.047a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.191-.93 2.157-2.157 2.157zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.191-.931 2.157-2.157 2.157z" />
                </svg>
                Continue with Discord
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-600 pt-2">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/signup')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

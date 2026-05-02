'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCurrentUser } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    const hydrate = async () => {
      try {
        const response = await fetchCurrentUser();
        if (response.code === 0 && response.data) {
          setAuth(response.data);
          const callbackUrl = sessionStorage.getItem('oauth_callback_url') || '/';
          sessionStorage.removeItem('oauth_callback_url');
          router.replace(callbackUrl);
          router.refresh();
          return;
        }
        setError(response.message || 'OAuth login failed.');
      } catch {
        setError('OAuth login failed.');
      }
    };

    hydrate();
  }, [router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {error ? (
          <p className="text-sm font-semibold text-rose-600">{error}</p>
        ) : (
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Completing Google sign-in...</p>
        )}
      </div>
    </div>
  );
}

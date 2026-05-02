'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AuthShell from '@/components/auth/AuthShell';
import AuthCard from '@/components/auth/AuthCard';
import AuthField from '@/components/auth/AuthField';
import AuthMessage from '@/components/auth/AuthMessage';
import AuthDivider from '@/components/auth/AuthDivider';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { API_ORIGIN } from '@/lib/constants';

export default function Pagelogin() {
  const { login, isLoading, errorMsg } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ username, password });
  };

  return (
    <AuthShell subtitle="Premium Artisanal Imports">
      <AuthCard>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="text-sm text-slate-500 mt-1">Please enter your details to sign in.</p>
        </div>

        {errorMsg ? <AuthMessage variant="error">{errorMsg}</AuthMessage> : null}

        <form className="space-y-5" onSubmit={handleLogin}>
          <AuthField
            label="Username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Ex: johndoe"
          />

          <AuthField
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            rightSlot={<a href="#" className="text-[10px] font-bold text-sky-600 hover:text-sky-500 transition-colors uppercase tracking-wider">Forgot?</a>}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-sky-900 dark:bg-sky-500 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6">
          <AuthDivider label="Or continue with" />
          <GoogleAuthButton
            onClick={() => {
              const searchParams = new URLSearchParams(window.location.search);
              const callbackUrl = searchParams.get('callbackUrl') || '/';
              sessionStorage.setItem('oauth_callback_url', callbackUrl);
              window.location.href = `${API_ORIGIN}/oauth2/authorization/google`;
            }}
            label="Google"
          />
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?
            <Link href="/register" className="ml-1 text-sky-600 font-bold hover:underline">Register</Link>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

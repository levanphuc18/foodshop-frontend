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

export default function Pageregister() {
  const { registerUser, isLoading, errorMsg, successMsg, setErrorMsg } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    await registerUser({
      username: formData.username,
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      password: formData.password,
    });
  };

  return (
    <AuthShell subtitle="The Art of Artisanal Preservation" maxWidthClassName="max-w-[500px]">
      <AuthCard>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h2>
          <p className="text-sm text-slate-500 mt-1">Start your journey with our premium collection.</p>
        </div>

        {errorMsg ? <AuthMessage variant="error">{errorMsg}</AuthMessage> : null}
        {successMsg ? <AuthMessage variant="success">{successMsg}</AuthMessage> : null}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthField label="Username" type="text" name="username" required value={formData.username} onChange={handleChange} placeholder="johndoe" />
            <AuthField label="Full Name" type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="John Doe" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthField label="Email" type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@example.com" />
            <AuthField label="Phone" type="text" name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} placeholder="0123456789" />
          </div>

          <AuthField label="Address" type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="123 Ocean Drive" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthField label="Password" type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
            <AuthField label="Confirm" type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-6 bg-sky-900 dark:bg-sky-500 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6">
          <AuthDivider label="Or join with" />
          <GoogleAuthButton onClick={() => alert('Google Register coming soon!')} label="Google" />
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500">
            Already a member?
            <Link href="/login" className="ml-1 text-sky-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

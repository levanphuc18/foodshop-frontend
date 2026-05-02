'use client';

import React, { useEffect, useState } from 'react';
import AccountPageShell from '@/components/shop/account/AccountPageShell';
import AccountSectionHeader from '@/components/shop/account/AccountSectionHeader';
import { getMyProfile, updateMyProfile } from '@/lib/api/profile';

type ProfileForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
};

const EMPTY_FORM: ProfileForm = {
  fullName: '',
  email: '',
  phoneNumber: '',
  address: '',
};

export default function Pageprofile() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMyProfile();
        setForm({
          fullName: res.data.fullName ?? '',
          email: res.data.email ?? '',
          phoneNumber: res.data.phoneNumber ?? '',
          address: res.data.address ?? '',
        });
      } catch (error) {
        setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load profile.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const onChange = (field: keyof ProfileForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await updateMyProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        address: form.address.trim(),
      });
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Update failed.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AccountPageShell active="profile">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        <AccountSectionHeader
          eyebrow="My Account"
          title="Personal Profile"
          description="Update your information and manage your preferences."
        />

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-sky-600 to-slate-800" />
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-10 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg bg-slate-100" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-lg">
                <span className="material-symbols-outlined text-[14px]">verified</span> Customer
              </span>
            </div>

            {message && (
              <div
                className={`mb-5 rounded-xl border px-4 py-3 text-sm ${
                  message.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <form className="space-y-5" onSubmit={onSubmit}>
              <FormField
                label="Full Name"
                value={form.fullName}
                onChange={onChange('fullName')}
                disabled={isLoading || isSaving}
              />
              <FormField
                label="Email Address"
                type="email"
                value={form.email}
                onChange={onChange('email')}
                disabled={isLoading || isSaving}
              />
              <FormField
                label="Phone Number"
                type="tel"
                value={form.phoneNumber}
                onChange={onChange('phoneNumber')}
                disabled={isLoading || isSaving}
              />
              <FormField
                label="Address"
                value={form.address}
                onChange={onChange('address')}
                disabled={isLoading || isSaving}
              />

              <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isLoading || isSaving}
                  className="w-full sm:w-auto px-8 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AccountPageShell>
  );
}

function FormField({
  label,
  value,
  type = 'text',
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all disabled:opacity-70"
      />
    </div>
  );
}


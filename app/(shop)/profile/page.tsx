'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AccountPageShell from '@/components/shop/account/AccountPageShell';
import AccountSectionHeader from '@/components/shop/account/AccountSectionHeader';
import { getMyProfile, updateMyProfile } from '@/lib/api/profile';
import { profileSchema, type ProfileFormData } from '@/schemas/profile';

export default function Pageprofile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMyProfile();
        reset({
          fullName: res.data.fullName ?? '',
          email: res.data.email ?? '',
          phoneNumber: res.data.phoneNumber ?? '',
          address: res.data.address ?? '',
        });
      } catch (error) {
        setMessage({
          type: 'error',
          text: error instanceof Error ? error.message : 'Không thể tải thông tin cá nhân.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [reset]);

  const onFormSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateMyProfile({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phoneNumber: data.phoneNumber?.trim() || '',
        address: data.address?.trim() || '',
      });
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Cập nhật thất bại.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AccountPageShell active="profile">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        <AccountSectionHeader
          eyebrow="Tài khoản"
          title="Thông tin cá nhân"
          description="Cập nhật thông tin và quản lý tài khoản của bạn."
        />

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-sky-600 to-slate-800" />
          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-10 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg bg-slate-100" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-lg">
                <span className="material-symbols-outlined text-[14px]">verified</span> Khách hàng
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

            <form className="space-y-5" onSubmit={handleSubmit(onFormSubmit)}>
              <FormField
                label="Họ và tên"
                {...register('fullName')}
                error={errors.fullName?.message}
                disabled={isLoading || isSaving}
              />
              <FormField
                label="Địa chỉ email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                disabled={isLoading || isSaving}
              />
              <FormField
                label="Số điện thoại"
                type="tel"
                {...register('phoneNumber')}
                error={errors.phoneNumber?.message}
                disabled={isLoading || isSaving}
              />
              <FormField
                label="Địa chỉ"
                {...register('address')}
                error={errors.address?.message}
                disabled={isLoading || isSaving}
              />

              <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isLoading || isSaving}
                  className="w-full sm:w-auto px-8 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AccountPageShell>
  );
}

const FormField = React.forwardRef<
  HTMLInputElement,
  {
    label: string;
    type?: string;
    error?: string;
    disabled?: boolean;
  } & React.InputHTMLAttributes<HTMLInputElement>
>(({ label, type = 'text', error, disabled, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</label>
      <input
        ref={ref}
        type={type}
        disabled={disabled}
        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all disabled:opacity-70 ${
          error ? 'border-red-500/50 ring-2 ring-red-500/10' : 'border-slate-200 dark:border-slate-700'
        }`}
        {...props}
      />
      {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
    </div>
  );
});

FormField.displayName = 'FormField';

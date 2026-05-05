'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import AuthShell from '@/components/auth/AuthShell';
import AuthCard from '@/components/auth/AuthCard';
import AuthMessage from '@/components/auth/AuthMessage';
import AuthDivider from '@/components/auth/AuthDivider';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { API_ORIGIN } from '@/lib/constants';

export default function PageLogin() {
  const { login, isLoading, errorMsg } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <AuthShell subtitle="Hải Sản Khô Cao Cấp">
      <AuthCard>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Chào mừng trở lại</h2>
          <p className="text-sm text-slate-500 mt-1">Vui lòng nhập thông tin để đăng nhập.</p>
        </div>

        {errorMsg ? <AuthMessage variant="error">{errorMsg}</AuthMessage> : null}

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Username Field */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Tên đăng nhập
            </label>
            <input
              {...register('username')}
              type="text"
              placeholder="VD: johndoe"
              className={`w-full px-4 py-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.username
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-sky-300 focus:border-sky-400'
              }`}
            />
            {errors.username && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Mật khẩu
              </label>
              <a href="#" className="text-[10px] font-bold text-sky-600 hover:text-sky-500 transition-colors uppercase tracking-wider">
                Quên?
              </a>
            </div>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.password
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-sky-300 focus:border-sky-400'
              }`}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-sky-900 dark:bg-sky-500 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-6">
          <AuthDivider label="Hoặc đăng nhập với" />
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
            Chưa có tài khoản?
            <Link href="/register" className="ml-1 text-sky-600 font-bold hover:underline">Đăng ký</Link>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

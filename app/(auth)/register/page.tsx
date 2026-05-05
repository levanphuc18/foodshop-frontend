'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import AuthShell from '@/components/auth/AuthShell';
import AuthCard from '@/components/auth/AuthCard';
import AuthField from '@/components/auth/AuthField';
import AuthMessage from '@/components/auth/AuthMessage';
import AuthDivider from '@/components/auth/AuthDivider';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import { registerSchema, type RegisterFormData } from '@/schemas/auth';

export default function Pageregister() {
  const { registerUser, isLoading, errorMsg, successMsg } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
      password: '',
      confirmPassword: '',
      role: 'CUSTOMER',
    },
  });

  const onFormSubmit = async (data: RegisterFormData) => {
    await registerUser({
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber || '',
      address: data.address || '',
      password: data.password,
    });
  };

  return (
    <AuthShell subtitle="Nghệ Thuật Bảo Quản Truyền Thống" maxWidthClassName="max-w-[500px]">
      <AuthCard>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tạo tài khoản</h2>
          <p className="text-sm text-slate-500 mt-1">Bắt đầu hành trình với bộ sưu tập cao cấp của chúng tôi.</p>
        </div>

        {errorMsg ? <AuthMessage variant="error">{errorMsg}</AuthMessage> : null}
        {successMsg ? <AuthMessage variant="success">{successMsg}</AuthMessage> : null}

        <form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthField
              label="Tên đăng nhập"
              type="text"
              {...register('username')}
              error={errors.username?.message}
              placeholder="johndoe"
            />
            <AuthField
              label="Họ và tên"
              type="text"
              {...register('fullName')}
              error={errors.fullName?.message}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthField
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="name@example.com"
            />
            <AuthField
              label="Số điện thoại"
              type="text"
              {...register('phoneNumber')}
              error={errors.phoneNumber?.message}
              placeholder="0123456789"
            />
          </div>

          <AuthField
            label="Địa chỉ"
            type="text"
            {...register('address')}
            error={errors.address?.message}
            placeholder="123 Đường ABC"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthField
              label="Mật khẩu"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="••••••••"
            />
            <AuthField
              label="Xác nhận"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-6 bg-sky-900 dark:bg-sky-500 text-white font-bold rounded-2xl shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="mt-6">
          <AuthDivider label="Hoặc đăng ký với" />
          <GoogleAuthButton onClick={() => alert('Google Register coming soon!')} label="Google" />
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500">
            Đã có tài khoản?
            <Link href="/login" className="ml-1 text-sky-600 font-bold hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginApi, register as registerApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/error';
import { useAuthStore } from '@/store/authStore';
import type { AuthRequest, RegisterRequest } from '@/types/auth';

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const login = async (credentials: AuthRequest) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await loginApi(credentials);
      if (response.code === 0 && response.data) {
        store.setAuth(response.data);

        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get('callbackUrl') || '/';

        router.push(callbackUrl);
        router.refresh();
        return true;
      }

      setErrorMsg(response.message || 'Dang nhap that bai.');
      return false;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi xay ra khi ket noi may chu.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (credentials: RegisterRequest) => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await registerApi(credentials);
      if (response.code === 0) {
        setSuccessMsg('Dang ky thanh cong! Dang chuyen huong...');
        setTimeout(() => router.push('/login'), 2000);
        return true;
      }

      setErrorMsg(response.message || 'Dang ky that bai');
      return false;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi xay ra khi ket noi may chu.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...store,
    isLoading,
    errorMsg,
    successMsg,
    setErrorMsg,
    login,
    registerUser,
  };
}

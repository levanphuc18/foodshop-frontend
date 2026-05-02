import { API_BASE_URL } from '@/lib/constants';
import type { AuthRequest, RegisterRequest, AuthResponse, JwtResponse } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

/**
 * Tiện ích đơn giản để lưu token vào cookies ở phía client.
 * (Để chuẩn nhất với Next.js SSR/Middleware, nên dùng Next.js Server Actions hoặc thư viện 'cookies-next')
 */
export const setAuthCookies = async (accessToken: string, refreshToken: string) => {
  // SECURITY FIX [P0]: Dùng HttpOnly cookie thông qua internal API Route thay vì document.cookie (chống XSS)
  if (typeof window !== 'undefined') {
    await fetch('/api/auth/cookies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken }),
    });
  }
};

export const clearAuthCookies = async () => {
  // SECURITY FIX [P0]: Clear cookie thông qua internal API Route
  if (typeof window !== 'undefined') {
    try {
      await fetch('/api/auth/cookies', { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to clear HttpOnly cookies via API');
    }
    // Dọn dẹp cả token cũ còn sót lại (legacy non-HttpOnly)
    document.cookie = 'auth-token=; path=/; max-age=0';
    document.cookie = 'refresh-token=; path=/; max-age=0';
  }
};

export const getAuthHeaders = (): HeadersInit => {
  // SECURITY FIX [P0]: Token giờ là HttpOnly, Client JS không thể đọc được.
  // API requests cần sử dụng credentials: 'include' hoặc thông qua Next.js Proxy.
  return {};
};

export async function login(data: AuthRequest): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<AuthResponse> = await res.json();
  if (!res.ok && !result.code) throw new Error(result.message || 'Login failed');

  if (result.code === 0 && result.data) {
    setAuthCookies(result.data.accessToken, result.data.refreshToken);
  }
  return result;
}

export async function register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, role: data.role || 'CUSTOMER' }),
  });

  const result: ApiResponse<AuthResponse> = await res.json();
  if (!res.ok) throw new Error(result.message || 'Registration failed');

  return result;
}

export async function refreshToken(token: string): Promise<ApiResponse<JwtResponse>> {
  const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token }),
  });

  const result: ApiResponse<JwtResponse> = await res.json();
  if (!res.ok) throw new Error(result.message || 'Refresh token failed');

  if (result.code === 0 && result.data) {
    setAuthCookies(result.data.accessToken, result.data.refreshToken);
  }
  return result;
}

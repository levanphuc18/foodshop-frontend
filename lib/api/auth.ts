import { API_BASE_URL } from '@/lib/constants';
import type { AuthRequest, RegisterRequest, AuthResponse, JwtResponse } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

/**
 * Tiện ích đơn giản để lưu token vào cookies ở phía client.
 * (Để chuẩn nhất với Next.js SSR/Middleware, nên dùng Next.js Server Actions hoặc thư viện 'cookies-next')
 */
export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  if (typeof document !== 'undefined') {
    // Thời hạn cookie theo cấu hình backend (mặc định set tạm 7 ngày)
    document.cookie = `auth-token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `refresh-token=${refreshToken}; path=/; max-age=604800; SameSite=Lax`;
  }
};

export const clearAuthCookies = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'auth-token=; path=/; max-age=0';
    document.cookie = 'refresh-token=; path=/; max-age=0';
  }
};

export const getAuthHeaders = (): HeadersInit => {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('auth-token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      return {
        'Authorization': `Bearer ${token}`,
      };
    }
  }
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

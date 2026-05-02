import { API_BASE_URL } from '@/lib/constants';
import { getAuthHeaders, refreshToken } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

/**
 * Custom fetcher that automatically includes the auth token 
 * and handles 401 Unauthorized errors (refresh token logic or redirect).
 */
// Prevents multiple reloads/redirects when multiple requests fail simultaneously
let isRedirecting = false;

export async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Prepare headers, merge with auth headers
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const authHeaders = getAuthHeaders() as Record<string, string>;
  if (authHeaders['Authorization']) {
    headers.set('Authorization', authHeaders['Authorization']);
  }

  // SECURITY FIX [P0]: Đảm bảo cookie (HttpOnly) được gửi đi kèm request
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', 
  };

  let response = await fetch(url, config);

  // Intercept 401 Unauthorized or 403 Forbidden
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined') {
      try {
        // SECURITY FIX: Client không thể đọc refresh-token.
        // Hãy gọi endpoint POST /api/auth/refresh (Next.js proxy route) 
        // để proxy này tự lấy HttpOnly cookie cũ, gọi sang Java BE, và set HttpOnly cookie mới.
        await fetch('/api/auth/refresh', { method: 'POST' });

        // Retry the original request
        response = await fetch(url, config);
      } catch {
        handleUnauthorized();
        throw new Error('Session expired.');
      }
    } else {
      throw new Error('Unauthorized');
    }
  }

  function handleUnauthorized() {
    if (isRedirecting) return;
    isRedirecting = true;
    
    // Clear Zustand store (this also calls clearAuthCookies internally)
    if (typeof window !== 'undefined') {
      useAuthStore.getState().logout();
      
      const path = window.location.pathname;
      if (path.startsWith('/admin') || path.startsWith('/account') || path.startsWith('/checkout')) {
        window.location.href = '/login?callbackUrl=' + encodeURIComponent(path);
      } else {
        window.location.reload();
      }
    }
  }

  // Safely parse JSON to avoid "Unexpected end of JSON input" on empty 403 responses
  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok || data?.code !== 0) {
    throw new Error(data?.message || 'API request failed');
  }

  return data as T;
}

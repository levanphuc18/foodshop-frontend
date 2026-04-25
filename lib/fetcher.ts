import { API_BASE_URL } from '@/lib/constants';
import { getAuthHeaders, clearAuthCookies, refreshToken } from '@/lib/api/auth';

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

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // Intercept 401 Unauthorized or 403 Forbidden
  if (response.status === 401 || response.status === 403) {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      const refreshCookie = cookies.find(c => c.trim().startsWith('refresh-token='));

      if (refreshCookie) {
        const token = refreshCookie.split('=')[1];
        try {
          // Attempt to refresh the token
          await refreshToken(token);

          // Retry the original request with the new token
          const newAuthHeaders = getAuthHeaders() as Record<string, string>;
          headers.set('Authorization', newAuthHeaders['Authorization']);
          response = await fetch(url, { ...config, headers });
        } catch (error) {
          // Refresh failed, logout the user
          handleUnauthorized();
          throw new Error('Session expired.');
        }
      } else {
        // No refresh token available, logout
        handleUnauthorized();
        throw new Error('Unauthorized.');
      }
    } else {
      throw new Error('Unauthorized');
    }
  }

  function handleUnauthorized() {
    if (isRedirecting) return;
    
    const currentToken = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='));
    if (!currentToken) return;

    isRedirecting = true;
    
    // Clear Zustand store (this also calls clearAuthCookies internally)
    if (typeof window !== 'undefined') {
      const { useAuthStore } = require('@/store/authStore');
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
  } catch (error) {
    data = {};
  }

  if (!response.ok || data?.code !== 0) {
    throw new Error(data?.message || 'API request failed');
  }

  return data as T;
}

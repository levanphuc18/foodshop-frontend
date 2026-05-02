import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL } from '@/lib/constants';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh-token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ success: false, message: 'No refresh token' }, { status: 401 });
    }

    // Call Java Backend to rotate token
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await res.json();
    if (!res.ok || result.code !== 0) {
      // Refresh failed, clear cookies
      cookieStore.delete('auth-token');
      cookieStore.delete('refresh-token');
      return NextResponse.json({ success: false, message: 'Session expired' }, { status: 401 });
    }

    // Set new tokens
    cookieStore.set({
      name: 'auth-token',
      value: result.data.accessToken,
      httpOnly: true,
      path: '/',
      maxAge: 86400, // 1 day
      sameSite: 'lax',
    });

    cookieStore.set({
      name: 'refresh-token',
      value: result.data.refreshToken,
      httpOnly: true,
      path: '/',
      maxAge: 604800, // 7 days
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

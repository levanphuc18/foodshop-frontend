import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken } = await request.json();
    const cookieStore = await cookies();
    
    if (accessToken) {
      cookieStore.set({
        name: 'auth-token',
        value: accessToken,
        httpOnly: true,
        path: '/',
        maxAge: 86400, // 1 day
        sameSite: 'lax',
      });
    }

    if (refreshToken) {
      cookieStore.set({
        name: 'refresh-token',
        value: refreshToken,
        httpOnly: true,
        path: '/',
        maxAge: 604800, // 7 days
        sameSite: 'lax',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to set cookies' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  cookieStore.delete('refresh-token');
  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// ── Schema: validate payload trước khi set cookie ─────────────────────────────
const setCookieSchema = z.object({
  accessToken: z.string().min(10, 'accessToken không hợp lệ').optional(),
  refreshToken: z.string().min(10, 'refreshToken không hợp lệ').optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 🛡️ Validate payload — reject malformed requests early
    const parsed = setCookieSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid token payload', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { accessToken, refreshToken } = parsed.data;
    const cookieStore = await cookies();

    if (accessToken) {
      cookieStore.set({
        name: 'auth-token',
        value: accessToken,
        httpOnly: true,
        path: '/',
        maxAge: 86400,   // 1 day
        sameSite: 'lax',
      });
    }

    if (refreshToken) {
      cookieStore.set({
        name: 'refresh-token',
        value: refreshToken,
        httpOnly: true,
        path: '/',
        maxAge: 604800,  // 7 days
        sameSite: 'lax',
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to set cookies' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  cookieStore.delete('refresh-token');
  return NextResponse.json({ success: true });
}

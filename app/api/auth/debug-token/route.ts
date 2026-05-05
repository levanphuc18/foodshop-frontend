import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ── Debug endpoint: decode JWT payload để kiểm tra cấu trúc ─────────────────
// ⚠️ CHỈ DÙNG ĐỂ DEBUG — XÓA SAU KHI ĐÃ XÁC NHẬN CẤU TRÚC JWT
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No auth-token cookie found' }, { status: 401 });
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ error: 'Not a valid JWT format' }, { status: 400 });
    }

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const payload = JSON.parse(atob(base64));

    return NextResponse.json({
      message: 'JWT payload decoded successfully. Check the "payload" field below.',
      payload,
      // Hiển thị tất cả keys để debug
      keys: Object.keys(payload),
      tokenLength: token.length,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to decode JWT' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── JWT Helpers (Edge Runtime compatible) ────────────────────────────────────

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isAdminToken(payload: Record<string, unknown>): boolean {
  // Kiểm tra tất cả tên field phổ biến của Spring Security JWT
  const candidates = [
    payload.role,        // custom: "ADMIN" hoặc "ROLE_ADMIN"
    payload.roles,       // custom array: ["ADMIN"]
    payload.authorities, // Spring Security default: ["ROLE_ADMIN"] hoặc [{authority: "ROLE_ADMIN"}]
    payload.scope,       // OAuth2: "ADMIN CUSTOMER"
  ];

  for (const candidate of candidates) {
    // Case 1: Chuỗi đơn — "ADMIN" hoặc "ROLE_ADMIN"
    if (typeof candidate === 'string') {
      if (candidate === 'ADMIN' || candidate === 'ROLE_ADMIN') return true;
      // Comma/space separated scope: "ADMIN CUSTOMER" hoặc "ROLE_ADMIN,ROLE_CUSTOMER"
      if (candidate.split(/[\s,]+/).some((s) => s === 'ADMIN' || s === 'ROLE_ADMIN')) return true;
    }

    // Case 2: Mảng — ["ADMIN"] hoặc ["ROLE_ADMIN"]
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        // Mảng chuỗi thông thường
        if (typeof item === 'string') {
          if (item === 'ADMIN' || item === 'ROLE_ADMIN') return true;
        }
        // Spring Security GrantedAuthority object: { authority: "ROLE_ADMIN" }
        if (typeof item === 'object' && item !== null && 'authority' in item) {
          const auth = (item as { authority: unknown }).authority;
          if (auth === 'ADMIN' || auth === 'ROLE_ADMIN') return true;
        }
      }
    }
  }

  return false;
}

function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload.exp as number | undefined;
  if (!exp) return false;
  return Date.now() >= exp * 1000;
}

// ── Proxy Logic ──────────────────────────────────────────────────────────────

const ADMIN_PATHS = ['/admin'];
const AUTH_PATHS = ['/login', '/register'];
const PROTECTED_PATHS = ['/profile', '/orders', '/checkout'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // 1. Redirect authenticated users away from login/register
  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Protect routes
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected || isAdminPath) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(token);
    if (!payload || isTokenExpired(payload)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth-token');
      return response;
    }

    // Admin role check
    if (isAdminPath && !isAdminToken(payload)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

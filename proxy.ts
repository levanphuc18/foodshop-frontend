import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = ['/admin'];
const AUTH_PATHS = ['/login', '/register'];
const PROTECTED_PATHS = [
  '/profile',
  '/orders',
  '/checkout'
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Use the cookie name defined in auth.ts
  const token = request.cookies.get('auth-token')?.value;

  // 1. Redirect authenticated users away from login/register
  if (AUTH_PATHS.some(p => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Protect private user routes
  if (PROTECTED_PATHS.some(p => pathname.startsWith(p)) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Protect admin routes
  if (ADMIN_PATHS.some(p => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

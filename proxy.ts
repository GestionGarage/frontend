import { NextRequest, NextResponse } from 'next/server';

const ADMIN_LOGIN = '/admin/login';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept Next.js internals, static files, or the public boutique
  const isPublic =
    pathname === ADMIN_LOGIN ||
    pathname.startsWith('/boutique') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.');

  const token = request.cookies.get('access_token')?.value;

  // Unauthenticated user hitting a protected route → /admin/login
  if (!isPublic && !token) {
    const loginUrl = new URL(ADMIN_LOGIN, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user landing on /admin/login → /admin/dashboard
  if (token && pathname === ADMIN_LOGIN) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

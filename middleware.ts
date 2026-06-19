import { NextRequest, NextResponse } from 'next/server';

const ADMIN_LOGIN = '/admin/login';

// "admin_session" is a Vercel-domain httpOnly cookie set by POST /api/auth/session
// right after a successful backend login.  The backend's own "access_token" cookie
// is scoped to Render's domain and is invisible here (different origin).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept Next.js internals, static assets, API routes, or the boutique
  const isPublic =
    pathname === ADMIN_LOGIN ||
    pathname.startsWith('/boutique') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.');

  const hasSession = request.cookies.has('admin_session');

  // Unauthenticated user hitting a protected route → /admin/login
  if (!isPublic && !hasSession) {
    const loginUrl = new URL(ADMIN_LOGIN, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already-authenticated user landing on /admin/login → /admin/dashboard
  if (hasSession && pathname === ADMIN_LOGIN) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

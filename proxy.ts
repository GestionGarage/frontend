import { NextRequest, NextResponse } from 'next/server';

// TODO: REVERT AUTH BYPASS — replace this entire file with the ORIGINAL block below
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

/* ORIGINAL — TODO: REVERT AUTH BYPASS — restore this function and remove the one above
const PUBLIC_PATHS = ['/login', '/boutique'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.');

  const token = request.cookies.get('access_token')?.value;

  if (!isPublic && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
*/

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

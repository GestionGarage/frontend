import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Gate all /admin/* routes except the login page itself.
// The "admin_session" cookie is a Vercel-domain httpOnly cookie set by
// POST /api/auth/session right after a successful backend login.  The
// backend's own access_token cookie is scoped to Render's domain and
// cannot be read here, hence this two-cookie approach.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page is always public — never redirect it
  if (pathname.startsWith('/admin/login')) return NextResponse.next();

  if (!request.cookies.has('admin_session')) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run only on /admin routes; /api, /_next, static assets are skipped
  matcher: ['/admin/:path*'],
};

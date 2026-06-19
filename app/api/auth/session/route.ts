import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Lifetime matches the backend JWT access token so both expire together.
const MAX_AGE_SECONDS = 8 * 60 * 60; // 8 h

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  // lax is fine: Vercel and the frontend share the same eTLD+1 subdomain,
  // so cross-site restrictions don't apply.
  sameSite: 'lax' as const,
  maxAge: MAX_AGE_SECONDS,
  path: '/',
};

// POST /api/auth/session
// Called by LoginForm right after a successful backend login.
// Stores the JWT in a Vercel-domain httpOnly cookie so that:
//  1. The Next.js middleware can gate /admin/* routes.
//  2. SSR Server Components can forward the JWT to the backend.
export async function POST(request: NextRequest) {
  let token: string | undefined;
  try {
    const body = (await request.json()) as { token?: string };
    token = body.token;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid body' }, { status: 400 });
  }

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
  }

  (await cookies()).set('admin_session', token, cookieOpts);
  return NextResponse.json({ ok: true });
}

// DELETE /api/auth/session
// Called on logout to clear the Vercel-domain session cookie.
export async function DELETE() {
  (await cookies()).delete('admin_session');
  return NextResponse.json({ ok: true });
}

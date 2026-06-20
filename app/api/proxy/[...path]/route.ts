import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Uses the server-only API_URL — never exposed to the browser.
// All authenticated client-side fetches are routed here so they use the
// Vercel-domain admin_session cookie instead of relying on cross-site
// delivery of the Render-domain access_token cookie (which can be blocked
// by Safari ITP and other privacy controls).
const BACKEND_URL = process.env.API_URL ?? 'http://localhost:3001/admin';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params;
  const backendPath = path.join('/');
  const search = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/${backendPath}${search ? `?${search}` : ''}`;

  const cookieStore = await cookies();
  const jwt = cookieStore.get('admin_session')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(jwt ? { Cookie: `access_token=${jwt}` } : {}),
  };

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const text = await request.text();
    if (text) init.body = text;
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    return NextResponse.json(
      { statusCode: 503, message: 'Backend inaccessible' },
      { status: 503 },
    );
  }

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return NextResponse.json(
      { statusCode: res.status, message: 'Réponse invalide du serveur' },
      { status: res.status },
    );
  }

  return NextResponse.json(data, { status: res.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

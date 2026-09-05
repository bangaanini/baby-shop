import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

interface SessionData {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    [key: string]: unknown;
  };
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    [key: string]: unknown;
  };
}

/**
 * Helper to fetch and verify active session data in Next.js middleware.
 * Uses internal loopback (127.0.0.1) first to avoid VPS NAT hairpinning issues.
 */
async function getSessionData(request: NextRequest): Promise<SessionData | null> {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return null;
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const hostHeader = request.headers.get('host') || 'localhost:3000';
  const port = process.env.PORT || '3000';

  const urlsToTry = [
    `http://127.0.0.1:${port}/api/auth/get-session`,
    `${request.nextUrl.origin}/api/auth/get-session`,
  ];

  for (const targetUrl of urlsToTry) {
    try {
      const response = await fetch(targetUrl, {
        headers: {
          cookie: cookieHeader,
          host: hostHeader,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.user && data.session) {
          return data as SessionData;
        }
      }
    } catch {
      // Try next URL
    }
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const currentPathWithQuery = `${pathname}${search}`;
  const sessionCookie = getSessionCookie(request);

  // 1. Admin route protection: /admin/:path*
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      const loginUrl = new URL(
        `/auth/login?redirect=${encodeURIComponent(pathname)}`,
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }

    const sessionData = await getSessionData(request);
    // If session verification returned data and user is not admin
    if (sessionData && sessionData.user.role !== 'admin') {
      const unauthorizedUrl = new URL('/auth/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // If sessionCookie exists but sessionData could not be resolved in middleware,
    // let it pass to the server component / layout which validates directly via DB
    return NextResponse.next();
  }

  // 2. User route & checkout protection: /user/:path* and /checkout
  if (pathname.startsWith('/user') || pathname === '/checkout' || pathname.startsWith('/checkout/')) {
    if (!sessionCookie) {
      const loginUrl = new URL(
        `/auth/login?redirect=${encodeURIComponent(currentPathWithQuery)}`,
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Auth pages: /auth/login, /auth/register
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (sessionCookie) {
      const sessionData = await getSessionData(request);
      if (sessionData) {
        const redirectParam = request.nextUrl.searchParams.get('redirect');

        // If user is admin
        if (sessionData.user.role === 'admin') {
          if (redirectParam && redirectParam.startsWith('/admin')) {
            return NextResponse.redirect(new URL(redirectParam, request.url));
          }
          return NextResponse.redirect(new URL('/admin', request.url));
        }

        // For non-admin (buyer):
        if (
          redirectParam &&
          redirectParam.startsWith('/') &&
          !redirectParam.startsWith('//') &&
          !redirectParam.startsWith('/auth')
        ) {
          if (redirectParam.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
          }
          return NextResponse.redirect(new URL(redirectParam, request.url));
        }

        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*', '/checkout', '/checkout/:path*', '/auth/login', '/auth/register'],
};

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
 */
async function getSessionData(request: NextRequest): Promise<SessionData | null> {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return null;
  }

  try {
    const origin =
      request.nextUrl.origin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000';

    const response = await fetch(`${origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data || !data.user || !data.session) {
      return null;
    }

    return data as SessionData;
  } catch (error) {
    console.error('Middleware: Error verifying session token:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const currentPathWithQuery = `${pathname}${search}`;

  // 1. Admin route protection: /admin/:path*
  if (pathname.startsWith('/admin')) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      const loginUrl = new URL(
        `/auth/login?redirect=${encodeURIComponent(pathname)}`,
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }

    const sessionData = await getSessionData(request);
    if (!sessionData) {
      const loginUrl = new URL(
        `/auth/login?redirect=${encodeURIComponent(pathname)}`,
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }

    if (sessionData.user.role !== 'admin') {
      const unauthorizedUrl = new URL('/auth/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    return NextResponse.next();
  }

  // 2. User route protection: /user/:path*
  if (pathname.startsWith('/user')) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      const loginUrl = new URL(
        `/auth/login?redirect=${encodeURIComponent(currentPathWithQuery)}`,
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }

    const sessionData = await getSessionData(request);
    if (!sessionData) {
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
    const sessionCookie = getSessionCookie(request);
    if (sessionCookie) {
      const sessionData = await getSessionData(request);
      if (sessionData) {
        const redirectParam = request.nextUrl.searchParams.get('redirect');

        // If user is admin and didn't specify redirect, or redirect is to admin
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
          // If trying to redirect to /admin as buyer, send to unauthorized
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
  matcher: ['/admin/:path*', '/user/:path*', '/auth/login', '/auth/register'],
};

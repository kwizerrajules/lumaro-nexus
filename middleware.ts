import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge guard for admin UI. APIs remain protected by roleMiddleware.
 * Cookie is set client-side on successful /login (see app/login/page.tsx).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('adminAccessToken')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

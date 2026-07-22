import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SUSPENDED_PAGE_HTML } from '@/lib/suspendedPageHtml';

/**
 * Edge guard:
 * - Site suspension (hosting-style 503) — controlled by SITE_SUSPENDED_IN_CODE
 *   so a GitHub push activates it without env access on the client's Vercel.
 * - To restore after payment: set SITE_SUSPENDED_IN_CODE to false, then push.
 * - Optional override: env SITE_SUSPENDED=false forces the site live.
 * - /admin → cookie check when site is live (APIs remain protected by roleMiddleware)
 * Security headers (CSP, frame deny, nosniff, etc.) are set in next.config.js.
 */
const SITE_SUSPENDED_IN_CODE = false;

const SITE_IS_SUSPENDED =
  process.env.SITE_SUSPENDED === 'false' ? false : SITE_SUSPENDED_IN_CODE;

export function middleware(request: NextRequest) {
  if (SITE_IS_SUSPENDED) {
    return new NextResponse(SUSPENDED_PAGE_HTML, {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Retry-After': '86400',
      },
    });
  }

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
  matcher: [
    /*
     * Match all paths except Next.js internals and common static files
     * so the suspension page (and normal browsing) still get CSS/assets when needed.
     * When suspended we still return HTML 503 for page/API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};

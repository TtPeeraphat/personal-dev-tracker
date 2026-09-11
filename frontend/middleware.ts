import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Edge Middleware — Admin route protection.
 *
 * Strategy:
 *  - After a successful admin login, the client sets a lightweight
 *    `admin_session=1` cookie (non-sensitive — the real JWT stays in localStorage).
 *  - This middleware reads that cookie at the edge (before React renders) and
 *    redirects unauthenticated visitors to /admin/login.
 *  - The actual JWT is still validated by the backend on every API call.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('admin_session')

  // Redirect already-authenticated admins away from the login page
  if (pathname === '/admin/login' && session?.value) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Protect all /admin/* routes except /admin/login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!session?.value) {
      const loginUrl = new URL('/admin/login', request.url)
      // Preserve the original destination so we can redirect back after login
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  // Match /admin and all sub-paths, but skip static assets and API routes
  matcher: ['/admin/:path*'],
}

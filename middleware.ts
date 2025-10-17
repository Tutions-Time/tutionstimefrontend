import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Get auth state
  const isAuthenticated = request.cookies.has('auth')

  // Public paths that don't require auth
  const publicPaths = ['/login', '/signup', '/admin-login', '/']
  if (publicPaths.includes(path)) {
    if (isAuthenticated) {
      // Redirect authenticated users away from auth pages to role-specific dashboard
      const cookie = request.cookies.get('auth')?.value || '{}'
      let role = 'student'
      try {
        const parsed = JSON.parse(cookie)
        if (parsed?.role) role = parsed.role
      } catch {}
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url))
    }
    return NextResponse.next()
  }

  // Check auth for protected routes
  if (!isAuthenticated) {
    // Remember the page they tried to visit
    const searchParams = new URLSearchParams([
      ['returnUrl', path],
    ])
    return NextResponse.redirect(new URL(`/login?${searchParams}`, request.url))
  }

  // Profile completion check for dashboard routes
  if (path.startsWith('/dashboard') && !path.includes('/profile/complete')) {
    const user = JSON.parse(request.cookies.get('auth')?.value || '{}')
    if (user && user.role && user.isProfileComplete === false) {
      return NextResponse.redirect(new URL(`/dashboard/${user.role}/profile/complete`, request.url))
    }
  }

  return NextResponse.next()
}

// Specify which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
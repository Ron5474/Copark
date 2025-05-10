import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const { pathname } = request.nextUrl

  // Static files should bypass middleware
  if (pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Normalize path to handle both /login and /admin/login
  const isLoginPath = pathname === '/login' || pathname === '/admin/login'

  // If there's no session and we're not on the login page, redirect to login
  if (!session && !isLoginPath) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // If there's a session and we're on the login page, redirect to home
  if (session && isLoginPath) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths under /admin and root paths
    '/admin/:path*',
    '/',
    '/login'
  ],
}
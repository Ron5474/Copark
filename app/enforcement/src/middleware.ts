import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('sessionEnf')
  const { pathname } = request.nextUrl

  // Static files should bypass middleware
  if (pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  const isLoginPath = pathname === '/login' || pathname === '/enforcement/login'

  if (!session && !isLoginPath) {
    console.log('No session, redirecting to login')
    return NextResponse.redirect(new URL('/enforcement/login', request.url))
  }

  if (session && isLoginPath) {
    console.log('Has session, redirecting to home')
    return NextResponse.redirect(new URL('/enforcement', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/enforcement/:path*',
    '/',
    '/login'
  ],
}
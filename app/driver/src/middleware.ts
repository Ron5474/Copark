// import createMiddleware from 'next-intl/middleware';
// import {routing} from './i18n/routing';
 
// export default createMiddleware(routing);

// export const config = {
//   matcher: ['/', '/(en|es)/:path*'],
// };
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'


const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request)

  const pathname = request.nextUrl.pathname
  const isDashboard = pathname.startsWith('/en/dashboard') || pathname.startsWith('/es/dashboard')

  const sessionToken = request.cookies.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string)


  if (isDashboard && !sessionToken) {
    // const locale = pathname.split('/')[1] // 'en' or 'es'
    const locale = request.nextUrl.locale || 'en' // Default to 'en' if locale is not set
    const loginUrl = new URL(`/driver/${locale}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/', '/(en|es)/:path*'],
}
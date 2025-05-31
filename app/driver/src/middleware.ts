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

export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request)

  const pathname = request.nextUrl.pathname
  const isDashboard = pathname.startsWith('/en/dashboard') || pathname.startsWith('/es/dashboard')

  const sessionToken = request.cookies.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string)


  if (isDashboard) {
    console.log(isDashboard)
    // const locale = pathname.split('/')[1] // 'en' or 'es'
    const locale = request.nextUrl.locale || 'en' // Default to 'en' if locale is not set
    if (!sessionToken) {
      const loginUrl = new URL(`/driver/${locale}/login`, request.url)
      return NextResponse.redirect(loginUrl)
    } else {
        const res = await fetch("http://localhost:3010/api/v0/auth/driver/login", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${sessionToken.value}`,
            },
          });
          
          if (res.status !== 201 && res.status !== 200 && res.status !== 204) {
            request.cookies.delete(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);
            const url = new URL(`/driver/${locale}/signup`, request.url)
            return NextResponse.redirect(url);
          }
        
          const data = await res.json();
          if (data?.onboardingState !== "complete") {
            if (data?.onboardingState === "tos") {
              console.log('here');
              const url = new URL(`/driver/${locale}/onboarding/tos`, request.url)
              return NextResponse.redirect(url);
              }
              else if (data?.onboardingState === "first-vehicle") {
                const url = new URL(`/driver/${locale}/onboarding/add-vehicle`, request.url)
                return NextResponse.redirect(url);
              } else {
                request.cookies.delete(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME as string);
                const url = new URL(`/driver/${locale}/signup`, request.url)
                return NextResponse.redirect(url);
              }
            }      
    }
  }

  return response
}

export const config = {
  matcher: ['/', '/(en|es)/:path*'],
}
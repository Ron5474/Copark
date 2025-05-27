// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   const session = request.cookies.get('sessionEnf')
//   const { pathname } = request.nextUrl

//   // Static files should bypass middleware
//   if (pathname.startsWith('/_next')) {
//     return NextResponse.next()
//   }

//   const isLoginPath = pathname === '/login' || pathname === '/enforcement/login'

//   if (!session && !isLoginPath) {
//     console.log('No session, redirecting to login')
//     return NextResponse.redirect(new URL('/enforcement/login', request.url))
//   }

//   if (session && isLoginPath) {
//     console.log('Has session, redirecting to home')
//     return NextResponse.redirect(new URL('/enforcement', request.url))
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: [
//     '/enforcement/:path*',
//     '/',
//     '/login'
//   ],
// }
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('sessionEnf')?.value
  const { pathname } = request.nextUrl

  const isLoginPath = pathname === '/login' || pathname === '/enforcement/login'
  const isStatic = pathname.startsWith('/_next')

  // Skip static files
  if (isStatic) return NextResponse.next()

  if (!session && !isLoginPath) {
    console.log('No session, redirecting to login')
    return NextResponse.redirect(new URL('/enforcement/login', request.url))
  }

  if (session) {
    try {
      const checkResponse = await fetch('http://localhost:3010/api/v0/auth/check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(["enforcement"]),
      })

      if (!checkResponse.ok) {
        throw new Error('Check endpoint rejected the token')
      }

    } catch {
      const response = NextResponse.redirect(new URL('/enforcement/login', request.url))
      response.cookies.delete('sessionEnf')
      return response
    }

    if (isLoginPath) {
      // console.log('Valid session, redirecting to dashboard')
      return NextResponse.redirect(new URL('/enforcement', request.url))
    }
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


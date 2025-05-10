import { NextResponse } from 'next/server'
import { middleware } from '../src/middleware'
import { NextRequest } from 'next/server'
import { beforeEach, expect, it, vi } from 'vitest'

const mockRedirect = vi.spyOn(NextResponse, 'redirect')

beforeEach(() => {
  vi.clearAllMocks()
})

it('redirects to enforcement login if session is missing and path is protected', async () => {
  const request = new NextRequest(new URL('http://localhost:3001/enforcement'), {
    headers: new Headers({ cookie: '' }),
  })

  await middleware(request)
  expect(mockRedirect).toHaveBeenCalledWith(
    new URL('/enforcement/login', 'http://localhost:3001')
  )
})

it('allows access to enforcement login page without session', async () => {
  const request = new NextRequest(new URL('http://localhost:3001/enforcement/login'), {
    headers: new Headers({ cookie: '' }),
  })

  await middleware(request)
  expect(mockRedirect).not.toHaveBeenCalled()
})

it('allows access to protected routes with valid session', async () => {
  const request = new NextRequest(new URL('http://localhost:3001/enforcement'), {
    headers: new Headers({ cookie: 'session=valid-session-id' }),
  })

  await middleware(request)
  expect(mockRedirect).not.toHaveBeenCalled()
})

it('redirects to /enforcement if logged in and accesses login page', async () => {
  const request = new NextRequest(new URL('http://localhost:3001/enforcement/login'), {
    headers: new Headers({ cookie: 'session=valid-session-id' }),
  })

  await middleware(request)
  expect(mockRedirect).toHaveBeenCalledWith(
    new URL('/enforcement', 'http://localhost:3001')
  )
})

it('bypasses middleware for static files', async () => {
  const request = new NextRequest(new URL('http://localhost:3001/_next/static/test.js'), {
    headers: new Headers({ cookie: '' }),
  })

  await middleware(request)
  expect(mockRedirect).not.toHaveBeenCalled()
})

import { NextResponse } from 'next/server'
import { middleware } from '../src/middleware'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { url } from 'inspector'

const mockRedirect = vi.spyOn(NextResponse, 'redirect')

beforeEach(() => {
    vi.clearAllMocks()
})

it('redirects to login for protected routes without session', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'), {
        headers: new Headers({
            'cookie': ''
        })
    })

    await middleware(request)
    expect(mockRedirect).toHaveBeenCalledWith(new URL('/login', 'http://localhost:3000/'))
})

it('allows access to login page without session', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/login'), {
        headers: new Headers({
            'cookie': ''
        })
    })

    await middleware(request)
    expect(mockRedirect).not.toHaveBeenCalled()  
})

it('allows access to protected routes with valid session', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/'), {
        headers: new Headers({
            'cookie': 'session=valid-session-id'
        })
    })

    await middleware(request)
    expect(mockRedirect).not.toHaveBeenCalled()
})

it('redirects to home when accessing login with valid session', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/login'), {
        headers: new Headers({
            'cookie': 'session=valid-session-id'
        })
    })

    await middleware(request)
    expect(mockRedirect).toHaveBeenCalledWith(new URL('/', 'http://localhost:3000/'))
})

it('bypasses middleware for static files', async () => {
    const request = new NextRequest(new URL('http://localhost:3000/_next/static/test.js'), {
        headers: new Headers({
            'cookie': ''
        })
    })

    await middleware(request)

    expect(mockRedirect).toHaveBeenCalledWith(new URL('login', 'http://localhost:3000/'))
})
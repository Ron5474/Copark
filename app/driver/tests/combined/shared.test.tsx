// process.env.NEXT_PUBLIC_GOOGLE_ID = 'mock-google-id'
// process.env.NEXT_PUBLIC_GOOGLE_SECRET = 'mock-google-secret'

import { vi, it, afterEach, expect, beforeEach } from 'vitest'
import { /*render, screen, */cleanup } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'

import { getUser } from '../../src/app/[locale]/shared/actions'



vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('next/headers', () => {
  const mockCookies = {
    get: vi.fn((name) => {
      if (name === 'next-auth.session-token') {
        return { value: 'mocked-auth-token-123' }
      }
      return undefined
    }),
    getAll: vi.fn(() => [
      { name: 'auth-token', value: 'mocked-auth-token-123' },
    ]),
    set: vi.fn(),
    delete: vi.fn(),
  }

  return {
    cookies: () => mockCookies,
    headers: () => new Headers(),
  }
})

vi.mock('next-intl', () => ({
  useTranslations: () => (
    vi.fn((x: string) => {
      switch (x) {
        case 'Do Not Sell My Personal Info':
          return 'Do Not Sell My Personal Info'
        case 'Privacy Policy':
          return 'Privacy Policy'
        case 'Terms of Service':
          return 'Terms of Service'
        case 'Contact Us':
          return 'Contact Us'
        case 'Dark Mode':
          return 'Dark Mode'
        case 'Rights Reserved':
          return '© 2025 Copark. All rights reserved.'
        default:
          return x
      }
    })
  ),
}))

vi.mock('next-auth/next', () => {
  return {
    getServerSession: vi.fn(() => Promise.resolve({
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.png',
      },
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
    })),
  }
})



beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})



it('returns session when user is authenticated', async () => {
  const session = await getUser()
  expect(session?.user?.email).toBe('test@example.com')
})

it('returns undefined when user is unauthenticated', async () => {
  const mock = vi.mocked(await import('next-auth/next')).getServerSession
  mock.mockResolvedValueOnce(undefined)

  const session = await getUser()
  expect(session).toBeUndefined()
})

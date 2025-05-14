import { vi, it, afterEach, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, /*waitFor*/ } from '@testing-library/react'
import {setupServer} from 'msw/node'

import '../setup'
import { auth } from './mockService'
import Page from '@/app/[locale]/dashboard/page'



Object.defineProperty(window, 'location', {
  writable: true,
  value: {
    ...window.location,
    href: 'http://localhost:3000/driver/en/dashboard',
    origin: 'http://localhost:3000',
    assign: vi.fn(),
    replace: vi.fn(),
  },
});

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockImplementation(() => {
    return Promise.resolve({
      user: {
        name: 'Bryant Oliver',
        email: 'bryant@oliver.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  }),
  signOut: vi.fn(() => Promise.resolve()),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}));

const server = setupServer()
const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/dashboard',
    basePath: '',
    route: '/dashboard',
  }),
}));

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

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
  }),
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
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



beforeAll(() => server.listen())
afterAll(() => server.close())

beforeEach(() => {
  vi.resetModules()
  auth(server)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  server.resetHandlers()
})



it('Redirects to login', async () => {
  auth(server, true)
  render( <Page/> )
  expect(await screen.findByText("Garage")).toBeDefined()
})

it('Does not redirect to login', async () => {
  auth(server)
  render( <Page/> )
  expect(await screen.findByText("Garage")).toBeDefined()
})
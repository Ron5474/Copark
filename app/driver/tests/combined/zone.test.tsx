import { vi, it, afterEach, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, /*waitFor*/ } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {setupServer} from 'msw/node'

import { mockNextIntl } from '../ui/mockTranslations'
mockNextIntl()
import { auth, permit } from './mockService'
import { getZoneDetails } from '../../src/app/[locale]/zone/actions'
import MemberView from '../../src/app/[locale]/zone/View'


const server = setupServer()


vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('next/headers', () => {
  const mockCookies = {
    get: vi.fn((name) => {
      if (name === 'auth-token') {
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

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockImplementation(() => {
    return Promise.resolve({
      user: {
        name: 'Derik Driver',
        email: 'derik@copark.space',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  }),
  signOut: vi.fn(() => Promise.resolve()),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}))

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



beforeAll(() => server.listen())
afterAll(() => {
  server.close()
  vi.useRealTimers()
})

beforeEach(() => {
  vi.resetModules()
  auth(server)
  permit(server)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  server.resetHandlers()
})




it('Zone Details fetch failed', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  permit(server, true) // force failure
  await expect(getZoneDetails('187')).rejects.toThrow('Failed to connect')
})

it('Fetch Zone Details', async () => {
  vi.setSystemTime(new Date('2025-05-20T10:30:00'))
  render(<MemberView />)
  const user = userEvent.setup()
  const input = screen.getByLabelText('Enter parking zone number')
  await user.type(input, '123')
  await user.click(screen.getByText('Confirm Zone'))

  expect(await screen.findByText('What parking rate works for you?')).toBeDefined()
})

/**
 * @file Zone.test.tsx
 * @description This file contains the test cases for the Zone step in zone checkout.
 * @author Bryant Oliver
 */

import { vi, it, beforeEach, afterEach, expect, afterAll } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '../setup'

import MemberView from '../../src/app/[locale]/zone/View'
import Zone from '../../src/app/[locale]/zone/Zone'
import { getZoneDetails } from '../../src/app/[locale]/zone/actions'
import { ZoneProvider } from '../../src/app/[locale]/zone/Context'


vi.mock('../../src/app/[locale]/zone/actions', () => ({
  getZoneDetails: vi.fn()
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  handler: vi.fn(),
  GET: vi.fn(),
  POST: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (
    vi.fn((x: string) => {
      switch (x) {
        case 'Do Not Sell My Personal Info':
          return 'Do Not Sell My Personal Info';
        case 'Privacy Policy':
          return 'Privacy Policy';
        case 'Terms of Service':
          return 'Terms of Service';
        case 'Contact Us':
          return 'Contact Us';
        case 'Dark Mode':
          return 'Dark Mode';
        case 'Rights Reserved':
          return '© 2025 Copark. All rights reserved.';
        default:
          return x;
      }
    })
  ),
}))

vi.mock('@/app/[locale]/shared/actions', () => ({
  getUser: vi.fn().mockResolvedValue({
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/image.jpg',
  }),
}))

vi.mock('next/headers', () => {
  const mockCookies = {
    get: vi.fn((name) => {
      if (name === 'auth-token') {
        return { value: 'mocked-auth-token-123' };
      }
      return null;
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


beforeEach(() => {
  vi.mocked(getZoneDetails).mockResolvedValue({
    daily: 2.50,
    maxDuration: { hours: 2, minutes: 0 },
    openTime: '07:00',
    closeTime: '20:00',
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

afterAll(() => {
  vi.useRealTimers()
})


it('Renders guest', async () => {
  render(<MemberView />)
  expect(await screen.findByText('Where are you parking?')).toBeDefined()
})

it('Renders zone entry', async () => {
  render(<Zone />)
  expect(await screen.findByText('Where are you parking?')).toBeDefined()
})


it('Error if zone # is empty', async () => {
  render(<Zone />)
  const user = userEvent.setup()
  await user.click(screen.getByText('Confirm Zone'))

  expect(await screen.findByText('Zone number is required')).toBeDefined()
})

it('Error if zone # does not exist', async () => {
  render(
    <ZoneProvider>
      <Zone />
    </ZoneProvider>
  )
  const user = userEvent.setup()
  const input = screen.getByLabelText('Enter parking zone number')
  await user.type(input, '000')
  vi.mocked(getZoneDetails).mockRejectedValue(new Error('Zone does not exist'))
  await user.click(screen.getByText('Confirm Zone'))

  expect(await screen.findByText('Zone does not exist')).toBeDefined()
})

it('Confirm Zone takes you to duration step', async () => {
  vi.setSystemTime(new Date('2025-05-20T10:30:00'))
  render(<MemberView />)
  const user = userEvent.setup()
  const input = screen.getByLabelText('Enter parking zone number')
  await user.type(input, '123')
  await user.click(screen.getByText('Confirm Zone'))

  expect(await screen.findByText('What parking rate works for you?')).toBeDefined()
})

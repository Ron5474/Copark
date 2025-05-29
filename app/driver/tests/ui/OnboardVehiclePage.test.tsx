/**
 * @file Vehicle.test.tsx
 * @description This file contains the test cases for the Vehicle page in zone checkout.
 * @author Ronak Patel
 */

import { vi, it, afterEach, expect, beforeEach, afterAll } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import '../setup'
import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import Page from '@/app/[locale]/onboarding/add-vehicle/page'

const push = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push
  }),
  Link: ({ children, href, ...props }: { children: React.ReactNode, href: string, [key: string]: any }) => (
    <a href={href} {...props}>{children}</a>
  ),
  usePathname: () => '/test',
}))

vi.mock('../../src/app/[locale]/vehicle/actions', () => ({
  addVehicle: vi.fn().mockImplementation((vehicle) =>
    Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000', ...vehicle })),
  getDefaultVehicle: vi.fn().mockResolvedValue({ plate: 'ABC123' }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children
}))

vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  handler: vi.fn(),
  GET: vi.fn(),
  POST: vi.fn(),
}))

vi.mock('@/app/[locale]/shared/actions', () => ({
  getUser: vi.fn().mockResolvedValue({
    name: 'Some User',
    email: 'user@wow.com',
    image: 'https://example.com/image.jpg',
  }),
}))

vi.mock('@/app/[locale]/signup/actions', () => ({
  signUp: vi.fn(),
  setOnBoardingState: vi.fn()
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


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
})

afterAll(() => {
  vi.useRealTimers()
})

it('Renders Splash Screen', async () => {
  render(<Page />)
  expect(await screen.findByText('Add Your First Vehicle')).toBeDefined()
})

it('Renders Add Vehicle', async () => {
  render(<Page />)
  const user = userEvent.setup()
  await user.click(await screen.findByText('Add Your First Vehicle'))
  expect(await screen.findByText('Alabama')).toBeDefined()
})
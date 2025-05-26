/**
 * @file Zone.test.tsx
 * @description This file contains the test cases for the Zone step in zone checkout.
 * @author Bryant Oliver
 */

import { vi, it, afterEach, afterAll, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '../setup'

import { mockNextIntl } from './mockTranslations'
mockNextIntl()
import MemberView from '../../src/app/[locale]/zone/View'
import Duration from '../../src/app/[locale]/zone/Duration'
import { ZoneProvider } from '../../src/app/[locale]/zone/Context'

const mockZoneDetails = {
  hourly: 2.50,
  maxDuration: {hours: 2, minutes: 0},
  openTime: '07:00',
  closeTime: '20:00',
}

vi.mock('@/app/[locale]/zone/actions', () => ({
  getZoneDetails: vi.fn().mockResolvedValue({
    hourly: 2.50,
    maxDuration: {hours: 2, minutes: 0},
    openTime: '07:00',
    closeTime: '20:00',
  }),
}))

vi.mock('../../src/app/[locale]/vehicle/actions', () => ({
  getVehicles: vi.fn().mockResolvedValue([{
    plate: 'C0P4RK',
    country: 'United States',
    state: 'California',
  }]),
  addVehicle: vi.fn().mockImplementation((vehicle) =>
    Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000', ...vehicle }))
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


afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

afterAll(() => {
  vi.useRealTimers()
})


it('Renders duration options', async () => {
  vi.setSystemTime(new Date('2025-05-20T10:30:00'))
  render(
    <ZoneProvider initialZoneDetails={mockZoneDetails}>
      <Duration />
    </ZoneProvider>
  )
  expect(await screen.findByText('Maximum Parking Time')).toBeDefined()
})


it('Error if option unchosen', async () => {
  vi.setSystemTime(new Date('2025-05-20T10:30:00'))
  render(
    <ZoneProvider initialZoneDetails={mockZoneDetails}>
      <Duration />
    </ZoneProvider>
  )
  const user = userEvent.setup()
  await user.click(screen.getByLabelText('Confirm duration'))

  expect(await screen.findByText('Please select a parking rate')).toBeDefined()
})

// it('Continue takes you to vehicle step', async () => {
//   render(<MemberView />)
//   const user = userEvent.setup()
//   await user.click(screen.getByText('Maximum Parking Time'))
//   await user.click(screen.getByLabelText('Confirm duration'))

//   // expect(await screen.findByText('Which Vehicle?')).toBeDefined()
//   expect(await screen.findByText('Please select a parking rate')).toBeDefined()
// })

it('Continue takes you to vehicle step', async () => {
  vi.setSystemTime(new Date('2025-05-20T10:30:00'))
  render(<MemberView />)
  const user = userEvent.setup()
  const input = screen.getByLabelText('Enter parking zone number')
  await user.type(input, '123')
  await user.click(screen.getByText('Confirm Zone'))
  
  await user.click(screen.getByText('Maximum Parking Time'))
  await user.click(screen.getByLabelText('Confirm duration'))

  expect(await screen.findByText('Which Vehicle?')).toBeDefined()
  // expect(await screen.findByText('Please select a parking rate')).toBeDefined()
})

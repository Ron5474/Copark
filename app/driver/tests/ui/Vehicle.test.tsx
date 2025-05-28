/**
 * @file Vehicle.test.tsx
 * @description This file contains the test cases for the Vehicle page in zone checkout.
 * @author Bryant Oliver
 */

import { vi, it, afterEach, expect, beforeEach, afterAll } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '../setup'

import { mockNextIntl } from './mockTranslations'
mockNextIntl()

import GuestView from '../../src/app/[locale]/vehicle/guest/View'
import MemberVehicle from '../../src/app/[locale]/vehicle/member/Vehicle'
import AddVehicle from '../../src/app/[locale]/vehicle/AddForm'
import MemberView from '../../src/app/[locale]/zone/View'

import { getVehicles } from '../../src/app/[locale]/vehicle/actions'

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
  getVehicles: vi.fn(),
  addVehicle: vi.fn().mockImplementation((vehicle) =>
    Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000', ...vehicle }))
}))

vi.mock('@/app/[locale]/zone/actions', () => ({
  getZoneDetails: vi.fn().mockResolvedValue({
    hourly: 2.50,
    maxDuration: {hours: 2, minutes: 0},
    openTime: '07:00',
    closeTime: '20:00',
  }),
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

beforeEach(() => {
  vi.mocked(getVehicles).mockResolvedValue([
    {
      plate: 'ABC123',
      country: 'United States',
      state: 'California',
      nickname: 'My Car',
    },
    {
      plate: 'XYZ789',
      country: 'United States',
      state: 'New York',
      nickname: 'Work Car',
    },
    {
      plate: 'C0P4RK',
      country: 'United States',
      state: 'California',
    },
  ])
})

afterAll(() => {
  vi.useRealTimers()
})

it('Renders guest', async () => {
  render(<GuestView />)
  expect(await screen.findByText('Add Vehicle')).toBeDefined()
})

it('Renders member', async () => {
  render(<MemberVehicle />)
  expect(await screen.findByText('Your Vehicles')).toBeDefined()
})

it('Renders member checkout', async () => {
  render(<MemberVehicle isCheckout={true} />)
  expect(await screen.findByText('Which Vehicle?')).toBeDefined()
})

it('Renders license plate field', async () => {
  render(<AddVehicle />)
  expect(screen.findByLabelText('Enter license plate number')).toBeDefined()
})

it('Error if license # is empty', async () => {
  render(<AddVehicle />)
  const user = userEvent.setup()
  await user.click(screen.getByLabelText('Submit vehicle'))

  expect(await screen.findByText('License plate number is required')).toBeDefined()
})

it('Can not enter more than 10 characters', async () => {
  render(<AddVehicle />)
  const user = userEvent.setup()
  const input = screen.getByLabelText('Enter license plate number')
  await user.type(input, '012345678912345')

  expect((input as HTMLInputElement).value).toBe('0123456789')
})

it('Renders country menu', async () => {
  render(<AddVehicle />)
  expect(screen.getByLabelText('Select a country')).toBeDefined()
})

it('Changes country', async () => {
  render(<AddVehicle />)
  const user = userEvent.setup()
  const field = screen.getByLabelText('Select a country')
  await user.click(field)
  await user.click(screen.getByText('Mexico'))

  expect(field.textContent).toContain('Mexico')
})

it('Renders state menu', () => {
  render(<AddVehicle />)
  expect(screen.getByLabelText('Select a state')).toBeDefined()
})

it('Changes state', async () => {
  render(<AddVehicle />)
  const user = userEvent.setup()
  const field = screen.getByLabelText('Select a state')
  await user.click(field)
  await user.click(screen.getByText('California'))

  expect(field.textContent).toContain('California')
})

it('Renders nickname entry', () => {
  render(<AddVehicle />)
  expect(screen.getByLabelText('Enter nickname')).toBeDefined()
})

it('Enter nickname', async () => {
  render(<AddVehicle />)
  const user = userEvent.setup()
  const input = await screen.findByLabelText('Enter nickname')
  await user.type(input, 'Henry')

  expect((input as HTMLInputElement).value).toBe('Henry')
})

it('Open and close AddForm dialog', async () => {
  render(<MemberVehicle />)
  const user = userEvent.setup()
  const add = (await screen.findAllByLabelText('Add a vehicle'))[0]
  await user.click(add)
  const backdrop = document.querySelector('.MuiBackdrop-root')
  if (backdrop) {
    await user.click(backdrop)
  }
  await user.click(await screen.findByLabelText("Close vehicle form"))

  expect(screen.queryByLabelText("Submit vehicle")).toBeNull()
})

it('Open and use escape to close AddForm dialog', async () => {
  render(<MemberVehicle />)
  const user = userEvent.setup()
  const add = (await screen.findAllByLabelText('Add a vehicle'))[0]
  await user.click(add)
  await user.keyboard('[Escape]')

  expect(screen.queryByLabelText("Submit vehicle")).toBeNull()
})

it('Empty garage appears', async () => {
  vi.mocked(getVehicles).mockResolvedValue([])
  render(<MemberVehicle />)
  expect(await screen.findByText("No vehicles yet")).toBeDefined()
})

it('Adding vehicle closes the dialog', async () => {
  render(<MemberVehicle />)
  const user = userEvent.setup()
  await user.click((await screen.findAllByLabelText("Add a vehicle"))[0])
  const input = screen.getByLabelText('Enter license plate number')
  await user.type(input, 'TEST123')

  await user.click(await screen.findByText('Save'))
  expect(screen.queryByText('Save')).toBeNull()
})

it('Error if vehicle unchosen', async () => {
  render(<MemberVehicle />)
  const user = userEvent.setup()
  await user.click(await screen.findByText('Edit'))

  expect(await screen.findByText('Please select a vehicle')).toBeDefined()
})

it('Edit vehicle button', async () => { // TODO edit this after edit vehicle is integrated
  render(<MemberVehicle />)
  const user = userEvent.setup()
  await user.click(await screen.findByText("C0P4RK"))
  await user.click(await screen.findByText('Edit'))

  expect(await screen.findByText('Your Vehicles')).toBeDefined()
})

it('Continues to next page', async () => {
  vi.setSystemTime(new Date('2025-05-20T10:30:00'))
  render(<MemberView />)
  const user = userEvent.setup()

  const input = screen.getByLabelText('Enter parking zone number')
  await user.type(input, '123')
  await user.click(screen.getByText('Confirm Zone'))
  
  await user.click(await screen.findByText('Maximum Parking Time'))
  await user.click(screen.getByLabelText('Confirm duration'))

  await user.click(await screen.findByText("C0P4RK"))
  await user.click(await screen.findByText('Continue'))

  expect(await screen.findByText('Review Order')).toBeDefined()
})

// it('Adding vehicle displays new vehicle (rerenders)', async () => {
//   render(<MemberVehicle />)
//   const user = userEvent.setup()
//   await user.click((await screen.findAllByLabelText("Add a vehicle"))[0])
//   const input = screen.getByLabelText('Enter license plate number')
//   await user.type(input, 'TEST123')
//   await user.click(await screen.findByText('Save'))

//   expect(await screen.findByText('TEST123')).toBeDefined()
// })

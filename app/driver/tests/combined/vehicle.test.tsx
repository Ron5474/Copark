import { vi, it, afterEach, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, /*waitFor*/ } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {setupServer} from 'msw/node'

import { mockNextIntl } from '../ui/mockTranslations'
mockNextIntl()
import { auth, vehicle } from './mockService'
import { getVehicles, addVehicle } from '../../src/app/[locale]/vehicle/actions'
import VehicleList from '../../src/app/[locale]/vehicle/member/Vehicle'
// import AddForm from '../../src/app/[locale]/vehicle/AddForm'


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



beforeAll(() => server.listen())
afterAll(() => server.close())

beforeEach(() => {
  vi.resetModules()
  auth(server)
  vehicle(server)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  server.resetHandlers()
})



it('Garage empty', async () => {
  render( <VehicleList/> )
  expect(await screen.findByText("No vehicles yet")).toBeDefined()
})

it('Vehicle fetch fail', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vehicle(server, true) // force failure
  await expect(getVehicles()).rejects.toThrow('Failed to fetch vehicles')
})

it('Add vehicle', async () => {
  render(<VehicleList />)
  const user = userEvent.setup()
  await user.click((await screen.findAllByLabelText("Add a vehicle"))[0])
  const input = screen.getByLabelText('Enter license plate number')
  await user.type(input, 'TEST123')
  await user.click(await screen.findByText('Save'))

  expect(await screen.findByText('TEST123')).toBeDefined()
})

it('Vehicle add failed', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vehicle(server, false, true) // fail add
  const newVehicle = {
    plate: '1ABC123',
    country: 'United States',
    state: 'California',
  }
  await expect(addVehicle(newVehicle)).rejects.toThrow('Failed to register vehicle')
})

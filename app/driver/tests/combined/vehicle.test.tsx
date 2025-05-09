import { vi, it, afterEach, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, /*waitFor*/ } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {setupServer} from 'msw/node'

import { auth, vehicle } from './mockService'
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



afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  server.resetHandlers()
})

beforeAll( async () => {
  return server.listen()
})

afterAll(() => {
  server.close()
})

beforeEach(() => {
  vi.resetModules()
  // vi.spyOn(console, 'error').mockImplementation(() => {})
  auth(server)
  vehicle(server)
})



it('Garage empty', async () => {
  render( <VehicleList/> )

  expect(await screen.findByText("No vehicles yet")).toBeDefined()
})

// it('Vehicle fetch fail', async () => {
//   vehicle(server, true) // Fail fetch
//   await expect(async () => {
//     render(<VehicleList />)
//     await waitFor(() => expect(fetch).toHaveBeenCalled())
//   }).rejects.toThrow()
// })

// it('shows an error if vehicle fetch fails', async () => {
//   const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
//   vehicle(server, true) // fail fetch

//   render(<VehicleList />)

//   await waitFor(() => {
//     expect(errorSpy).toHaveBeenCalled()
//   })

//   errorSpy.mockRestore()
// })

it('Add vehicle', async () => {
  render(<VehicleList />)
  const user = userEvent.setup()
  await user.click((await screen.findAllByLabelText("Add a vehicle"))[0])
  const input = screen.getByLabelText('Enter license plate number')
  await user.type(input, 'TEST123')
  await user.click(await screen.findByText('Save'))

  expect(await screen.findByText('TEST123')).toBeDefined()
})

// it('Vehicle add failed', async () => {
//   vehicle(server, false, true) // fail add
//   await expect(async () => {
//     render(<AddForm />)

//     const user = userEvent.setup()
//     const input = screen.getByLabelText('Enter license plate number')
//     await user.type(input, 'TEST123')
//     await user.click(await screen.findByText('Save'))

//     await waitFor(() => expect(fetch).toHaveBeenCalled())
//   }).rejects.toThrow()
// })

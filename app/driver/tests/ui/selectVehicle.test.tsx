/**
 * @file selectVehicle.test.tsx
 * @description This file contains the test cases for the Vehicle page in zone checkout.
 * @author Bryant Oliver
 */

import { vi, it, afterEach, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '../setup'

import GuestView from '../../src/app/[locale]/selectVehicle/guest/View'
import MemberView from '../../src/app/[locale]/selectVehicle/member/View'
import AddVehicle from '../../src/app/[locale]/selectVehicle/AddForm'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

beforeEach(() => {
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
      }
    )),
  }))

  vi.mock('@/app/[locale]/shared/actions', async () => {
    return {
      getUser: vi.fn().mockResolvedValue({
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/image.jpg',
        // add more user props as needed
      }),
    };
  });

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
    };

    return {
      cookies: () => mockCookies,
      headers: () => new Headers(),
    };
  });

  vi.mock('../../src/app/[locale]/selectVehicle/actions', () => {
    return {
      getVehicles: vi.fn().mockResolvedValue([
        {
          plate: 'ABC123',
          country: 'United States',
          state: 'California',
          nickname: 'My Car'
        },
        {
          plate: 'XYZ789',
          country: 'United States',
          state: 'New York',
          nickname: 'Work Car'
        }
      ]),
      addVehicle: vi.fn().mockImplementation((vehicle) => {
        return Promise.resolve({
          id: '123e4567-e89b-12d3-a456-426614174000',
          ...vehicle
        });
      })
    };
  });
})

it('Renders guest', async () => {
  await render(<GuestView />)
  expect(await screen.findByText('Add Vehicle')).toBeDefined()
})

it('Renders member', async () => {
  await render(<MemberView />)
  expect(await screen.findByText('Which Vehicle?')).toBeDefined()
})

it('Renders license plate field', async () => {
  await render(<AddVehicle />)
  expect(screen.findByLabelText('Enter license plate number')).toBeDefined()
})

it('Error if license # is empty', async () => {
  await render(<AddVehicle />)
  const user = userEvent.setup()
  await user.click(screen.getByLabelText('Submit vehicle'))

  expect(await screen.findByText('License plate number is required')).toBeDefined()
})

it('Can not enter more than 10 characters', async () => {
  await render(<AddVehicle />)
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
  // const field = screen.getByText('United States')
  const field = screen.getByLabelText('Select a country')
  await user.click(field)
  await user.click(screen.getByText('Mexico'))

  // expect(screen.queryByText('United States')).toBeNull()
  expect(field.textContent).toContain('Mexico')
})

it('Renders state menu', () => {
  render(<AddVehicle />)
  expect(screen.getByLabelText('Select a state')).toBeDefined()
})

it('Changes state', async () => {
  render(<AddVehicle />)
  const user = userEvent.setup()
  // const field = screen.getByText('Alabama')
  const field = screen.getByLabelText('Select a state')
  await user.click(field)
  await user.click(screen.getByText('California'))

  // expect(screen.queryByText('Alabama')).toBeNull()
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
  render(<MemberView />)
  const user = userEvent.setup()
  const input = (await screen.findAllByLabelText('Add a vehicle'))[0]
  await user.click(input)
  const backdrop = document.querySelector('.MuiBackdrop-root')
  if (backdrop) {
    await user.click(backdrop)
  }
  await user.click(await screen.findByLabelText("Close vehicle form"))

  expect(screen.queryByLabelText("Submit vehicle")).toBeNull()
})


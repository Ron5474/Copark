/**
 * @file selectVehicle.test.tsx
 * @description This file contains the test cases for the Vehicle page in zone checkout.
 * @author Bryant Oliver
 */

import { vi, it, afterEach, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import View from '../../src/app/[locale]/selectVehicle/guest/View'
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
      })),
    }));
  })

it('Renders', async () => {
  await render(<View />)
  expect(await screen.findByText('Add Vehicle')).toBeDefined()
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
  const field = screen.getByText('United States')
  await user.click(field)
  await user.click(screen.getByText('Mexico'))

  expect(screen.queryByText('United States')).toBeNull()
})

it('Renders state menu', () => {
  render(<AddVehicle />)
  expect(screen.getByLabelText('Select a state')).toBeDefined()
})

it('Changes state', async () => {
  render(<AddVehicle />)
  const user = userEvent.setup()
  const field = screen.getByText('Alabama')
  await user.click(field)
  await user.click(screen.getByText('California'))

  expect(screen.queryByText('Alabama')).toBeNull()
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

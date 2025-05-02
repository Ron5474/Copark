import { vi, it, afterEach, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import View from '../../src/app/addVehicle/View'
import AddVehicle from '../../src/app/addVehicle/Form'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Renders', async () => {
  render(<View />)
  expect(await screen.findByText('Add Vehicle')).toBeDefined()
})

it('Renders license plate field', () => {
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
  const input = screen.getByPlaceholderText('e.g. 1ABC123')
  await user.type(input, '012345678912345')

  expect((input as HTMLInputElement).value).toBe('0123456789')
})

it('Renders country menu', () => {
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


// it('shows loading text when login is clicked', async () => {
//   render(<EnforcementLoginPage />)
//   const user = userEvent.setup()

//   await user.type(screen.getByLabelText('Your Email'), 'test@copark.com')
//   await user.type(screen.getByLabelText('Password'), 'secret')
//   await user.click(screen.getByRole('button', { name: /login/i }))

//   expect(await screen.findByText('Logging in...')).toBeDefined()
// })

// it('displays invalid credentials message after delay', async () => {
//   render(<Page />)
//   const user = userEvent.setup()

//   await user.type(screen.getByLabelText('Your Email'), 'wrong@copark.com')
//   await user.type(screen.getByLabelText('Password'), 'wrongpass')
//   await user.click(screen.getByRole('button', { name: /login/i }))

//   expect(await screen.findByText('Invalid credentials')).toBeDefined()
// })
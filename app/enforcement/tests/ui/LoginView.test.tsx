import { vi, it, afterEach, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Page from '../../src/app/login/page'
import EnforcementLoginPage from '@/app/login/View'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Renders', async () => {
  render(<Page />)
  expect(await screen.findByText('Enforcement Login')).toBeDefined()
})

it('renders the email input field', () => {
  render(<EnforcementLoginPage />)
  expect(screen.getByLabelText('Your Email')).toBeDefined()
})

it('renders the password input field', () => {
  render(<EnforcementLoginPage />)
  expect(screen.getByLabelText('Password')).toBeDefined()
})

it('shows error if fields are empty', async () => {
  render(<EnforcementLoginPage />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /login/i }))

  expect(await screen.findByText('Both fields are required.')).toBeDefined()
})

it('shows loading text when login is clicked', async () => {
  render(<EnforcementLoginPage />)
  const user = userEvent.setup()

  await user.type(screen.getByLabelText('Your Email'), 'test@copark.com')
  await user.type(screen.getByLabelText('Password'), 'secret')
  await user.click(screen.getByRole('button', { name: /login/i }))

  expect(await screen.findByText('Logging in...')).toBeDefined()
})

it('displays invalid credentials message after delay', async () => {
  render(<Page />)
  const user = userEvent.setup()

  await user.type(screen.getByLabelText('Your Email'), 'wrong@copark.com')
  await user.type(screen.getByLabelText('Password'), 'wrongpass')
  await user.click(screen.getByRole('button', { name: /login/i }))

  expect(await screen.findByText('Invalid credentials')).toBeDefined()
})
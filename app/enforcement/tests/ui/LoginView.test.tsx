import { vi, it, afterEach, expect, beforeEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Page from '../../src/app/login/page'
import EnforcementLoginPage from '@/app/login/View'
import { login } from '@/app/login/actions'

// Mock the login action
vi.mock('../../src/app/login/actions', () => ({
  login: vi.fn(),
}))

// Mock Next.js useRouter
const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}))

beforeEach(() => {
  push.mockClear()
  sessionStorage.clear()
  localStorage.clear()
})

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

it('shows loading text when login is clicked', async () => {
  vi.mocked(login).mockImplementation(() =>
    new Promise((resolve) => setTimeout(() => resolve(null), 300))
  )

  render(<EnforcementLoginPage />)
  const user = userEvent.setup()

  await user.type(screen.getByLabelText('Your Email'), 'test@copark.com')
  await user.type(screen.getByLabelText('Password'), 'secret')
  await user.click(screen.getByRole('button', { name: /login/i }))

  expect(screen.getByText('Logging in...')).toBeDefined()
})

it('displays invalid credentials message after delay', async () => {
  render(<Page />)
  const user = userEvent.setup()

  await user.type(screen.getByLabelText('Your Email'), 'wrong@copark.com')
  await user.type(screen.getByLabelText('Password'), 'wrongpass')
  await user.click(screen.getByRole('button', { name: /login/i }))

  expect(await screen.findByText('Invalid credentials')).toBeDefined()
})

it('redirects to home on successful login', async () => {
  vi.mocked(login).mockResolvedValue({ name: 'Test User' })

  render(<EnforcementLoginPage />)
  const user = userEvent.setup()

  await user.type(screen.getByLabelText('Your Email'), 'test@copark.com')
  await user.type(screen.getByLabelText('Password'), 'secret')
  await user.click(screen.getByRole('button', { name: /login/i }))

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith('/')
    expect(sessionStorage.getItem('name')).toBe('Test User')
  })
})
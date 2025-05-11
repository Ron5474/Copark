import { vi, it, expect, afterEach, beforeAll, afterAll } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'

import EnforcementLoginPage from '@/app/login/page'
import { authHandlers } from './mockService'

const server = setupServer()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('next/headers', () => {
  const mockCookies = {
    get: vi.fn(),
    getAll: vi.fn(() => []),
    set: vi.fn(),
    delete: vi.fn(),
  }

  return {
    cookies: () => mockCookies,
    headers: () => new Headers(),
  }
})

const push = vi.fn()

beforeAll(() => {
  server.listen()
})

afterAll(() => {
  server.close()
})

afterEach(() => {
  server.resetHandlers()
  cleanup()
  vi.clearAllMocks()
  push.mockClear()
  sessionStorage.clear()
})

it('logs in successfully with Auth microservice', async () => {
  server.use(authHandlers.success)

  render(<EnforcementLoginPage />)
  const user = userEvent.setup()

  await user.type(screen.getByLabelText('Your Email'), 'officer1@outlook.com')
  await user.type(screen.getByLabelText('Password'), 'password1')
  await user.click(screen.getByLabelText('login-button'))

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith('/')
  })

  expect(sessionStorage.getItem('name')).toBe('Officer Joe')
})

it('shows error when Auth microservice denies login', async () => {
  server.use(authHandlers.failure)

  render(<EnforcementLoginPage />)
  const user = userEvent.setup()

  await user.type(screen.getByLabelText('Your Email'), 'bad@copark.com')
  await user.type(screen.getByLabelText('Password'), 'wrong')
  await user.click(screen.getByLabelText('login-button'))

  expect(await screen.findByText(/invalid credentials/i)).not.toBeNull()
  expect(push).not.toHaveBeenCalled()
})

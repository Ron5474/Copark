import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, afterEach, it, vi, expect } from 'vitest'
import LogoutButton from '@/app/login/LogoutButton'
import { logout } from '@/app/login/actions'

// Mock logout action
vi.mock('@/app/login/actions', () => ({
  logout: vi.fn(),
}))

// Mock Next.js router
const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}))

beforeEach(() => {
  push.mockClear()
  sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// --- Tests ---

it('calls logout when button is clicked', async () => {
  vi.mocked(logout).mockResolvedValue(undefined)
  render(<LogoutButton />)

  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /logout/i }))

  expect(logout).toHaveBeenCalled()
})

it('clears sessionStorage after logout', async () => {
  sessionStorage.setItem('name', 'Test User')
  vi.mocked(logout).mockResolvedValue(undefined)

  render(<LogoutButton />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /logout/i }))

  expect(sessionStorage.getItem('name')).toBeNull()
})

it('navigates to login after logout', async () => {
  vi.mocked(logout).mockResolvedValue(undefined)

  render(<LogoutButton />)
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /logout/i }))

  expect(push).toHaveBeenCalledWith('/login')
})

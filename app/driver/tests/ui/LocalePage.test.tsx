import { render, cleanup, waitFor } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import { vi, it, expect, afterEach, beforeEach } from 'vitest'

import Page from '@/app/[locale]/page'
import { getUser } from '@/app/[locale]/shared/actions'

const push = vi.fn()

vi.mock('@/i18n/navigation', () => ({
    useRouter: () => ({
      push
    })
  }))

vi.mock('../../src/app/[locale]/shared/actions', () => ({
    getUser: vi.fn(),
  }))

beforeEach(() => {
  vi.mocked(getUser).mockResolvedValue({
    user: {
      name: "Test User",
      email: "test@example.com"
    },
    expires: "2025-01-01T00:00:00.000Z"
  })
})

afterEach(() => {
    cleanup()
    vi.resetAllMocks()
  })

it('Redirects to dashboard', async () => {
  render(<Page />)

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith('/dashboard')
  })
})

it('Redirects to login', async () => {
  vi.mocked(getUser).mockResolvedValue(undefined)
  render(<Page />)

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith('/login')
  })
})
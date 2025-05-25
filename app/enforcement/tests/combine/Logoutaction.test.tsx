import { vi, it, expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'

import { logout } from '../../src/app/login/actions'

const server = setupServer()

vi.mock('next/navigation', () => {
  return {
    redirect: vi.fn(),
    useRouter: () => ({ push: vi.fn() }),
  }
})


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
  // push.mockClear()
  sessionStorage.clear()
})

it('deletes session cookie and redirects to /login', async () => {
  const { redirect } = await import('next/navigation')
  const { cookies } = await import('next/headers')
  const mockCookies = cookies()

  await logout()

  expect((await mockCookies).delete).toHaveBeenCalledWith('sessionEnf')
  expect(redirect).toHaveBeenCalledWith('/login')
})
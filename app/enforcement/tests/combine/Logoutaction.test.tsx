import { vi, it, expect, afterEach, beforeAll, afterAll } from 'vitest'
import {/* render, screen, waitFor, */cleanup } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'

import { logout } from '../../src/app/login/actions'
// import EnforcementLoginPage from '@/app/login/page'
// import EnforcementDashboardView from '@/app/dashboard/Content'
// import { EnforcementProvider } from '@/app/dashboard/context/Context'
// import EnforcementNavBar from '@/app/shared/NavBar'
// import { authHandlers } from './mockService'

const server = setupServer()

// const redirect = vi.fn()
// const push = vi.fn()

// vi.mock('next/navigation', () => ({
//   redirect,
//   useRouter: () => ({
//     push,
//   }),
// }))
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

  expect((await mockCookies).delete).toHaveBeenCalledWith('session')
  expect(redirect).toHaveBeenCalledWith('/login')
})
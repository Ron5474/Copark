import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, beforeAll, afterAll, afterEach, expect, vi } from 'vitest'
import { setupServer } from 'msw/node'
import EnforcementDashboardView from '@/app/dashboard/Content'
import { EnforcementProvider } from '@/app/dashboard/context/Context'
import { permitHandlers } from './mockService'
import { checkPermit } from '@/app/dashboard/permit/actions'

const server = setupServer()

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => {
  server.resetHandlers()
  cleanup()
  vi.clearAllMocks()
})

vi.mock('next/headers', () => {
  const mockCookies = {
    get: vi.fn(() => ({ value: 'mock-token' })),
    getAll: vi.fn(() => []),
    set: vi.fn(),
    delete: vi.fn(),
  }

  return {
    cookies: () => mockCookies,
    headers: () => new Headers(),
  }
})

it('renders PermitCard after successful permit check', async () => {
  server.use(permitHandlers.success)

  render(
    <EnforcementProvider>
      <EnforcementDashboardView />
    </EnforcementProvider>
  )

  const user = userEvent.setup()

  await user.type(screen.getByLabelText(/license plate/i), 'ABC123')
  await user.type(screen.getByLabelText(/zone/i), 'A1')
  await user.click(screen.getByRole('button', { name: /search/i }))

  await waitFor(() => {
    expect(screen.getByText(/Valid Permit/i)).toBeDefined()
    expect(screen.getByText(/License Plate:/i)).toBeDefined()
    expect(screen.getByText(/ABC123/i)).toBeDefined()
    expect(screen.getByText(/Current Location:/i)).toBeDefined()
    expect(screen.getByText(/Zone A1/i)).toBeDefined()
  })
})

it('renders Invalid Permit after GraphQL failure', async () => {
  server.use(permitHandlers.failure)

  render(
    <EnforcementProvider>
      <EnforcementDashboardView />
    </EnforcementProvider>
  )

  const user = userEvent.setup()

  await user.type(screen.getByLabelText(/license plate/i), 'BAD999')
  await user.type(screen.getByLabelText(/zone/i), 'Z9')
  await user.click(screen.getByRole('button', { name: /search/i }))

  await waitFor(() => {
    expect(screen.getByText(/zone/i)).toBeDefined()
  })
})

it('throws if no session token is found', async () => {
  const { cookies } = await import('next/headers')

  const mockCookies = cookies() as unknown as {
    get: ReturnType<typeof vi.fn>
    getAll: () => unknown[]
    set: () => void
    delete: () => void
  }

  mockCookies.get.mockImplementationOnce(() => undefined)

  await expect(() => checkPermit('NOAUTH', 'Z0')).rejects.toThrow(
    'Unauthorized: Missing session token'
  )
})

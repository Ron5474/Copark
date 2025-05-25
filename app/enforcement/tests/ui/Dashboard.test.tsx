import { vi, it, beforeEach, expect, afterAll } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EnforcementDashboardView from '@/app/dashboard/Content'

import View from '@/app/page'
import { EnforcementProvider } from '@/app/dashboard/context/Context'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}))

beforeEach(() => {
  cleanup()
})

afterAll(() => {
  vi.resetAllMocks()
})

it('Renders Enforcement Dashboard', async () => {
  render(
    <EnforcementProvider>
      <View />
    </EnforcementProvider>
  )
  expect(await screen.findByText('Dashboard')).toBeDefined()
})

it('renders dashboard intro text and form title', async () => {
  render(
    <EnforcementProvider>
      <EnforcementDashboardView />
    </EnforcementProvider>
  )
  expect(await screen.findByText('Manual License Plate Entry')).toBeDefined()
  expect(screen.getByText('Enter Plate Details')).toBeDefined()
})

it('renders license plate input', () => {
  render(
    <EnforcementProvider>
      <EnforcementDashboardView />
    </EnforcementProvider>
  )
  expect(screen.getByLabelText('License Plate')).toBeDefined()
})

it('can type in the plate input', async () => {
  render(
      <EnforcementProvider>
        <EnforcementDashboardView />
      </EnforcementProvider>
    )
  const user = userEvent.setup()
  const input = screen.getByLabelText('License Plate')
  await user.type(input, 'helloworld')
  expect((input as HTMLInputElement).value).toBe('helloworld')
})

it('License plate is required', async () => {
  render(
      <EnforcementProvider>
        <EnforcementDashboardView />
      </EnforcementProvider>
    )
  const user = userEvent.setup()
  const searchButton = screen.getByLabelText('Search License Plate')
  await user.click(searchButton)

  expect(screen.getByText('Please enter a license plate')).toBeDefined()
})

import { vi, it, beforeEach, expect, afterAll } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
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

it('renders SuccessMessage when showSuccess is true', () => {
  render(
    <EnforcementProvider
      initialShowSuccess={true}
      initialPlate="XYZ123"
      initialIsValidated={true}
      initialIsIssuingViolation={true}
    >
      <EnforcementDashboardView />
    </EnforcementProvider>
  )

  expect(screen.getByText(/Violation Submitted/i)).toBeDefined()
  expect(screen.getByRole('button', { name: /Back to Search/i })).toBeDefined()
})

it('renders IssueViolationForm when plate and isIssuingViolation are true', () => {
  render(
    <EnforcementProvider
      initialPlate="XYZ123"
      initialIsValidated={true}
      initialIsIssuingViolation={true}
    >
      <EnforcementDashboardView />
    </EnforcementProvider>
  )

  expect(screen.getByText(/Issue Violation/i)).toBeDefined()
})

it('clicking "Back to Search" resets all context values', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider
      initialShowSuccess={true}
      initialPlate="XYZ123"
      initialIsValidated={true}
      initialIsIssuingViolation={true}
    >
      <EnforcementDashboardView />
    </EnforcementProvider>
  )

  await user.click(screen.getByRole('button', { name: /Back to Search/i }))

  expect(await screen.findByText('Manual License Plate Entry')).toBeDefined()
  expect(screen.getByText('Enter Plate Details')).toBeDefined()
  expect(screen.getByLabelText('License Plate')).toBeDefined()
})

it('clicking cancel hides IssueViolationForm', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider
      initialPlate="ABC123"
      initialIsValidated={true}
      initialIsIssuingViolation={true}
    >
      <EnforcementDashboardView />
    </EnforcementProvider>
  )

  expect(screen.getByText(/Issue Violation/i)).toBeDefined()

  const cancelBtn = screen.getByLabelText('Cancel')
  await user.click(cancelBtn)

  await waitFor(() => {
    expect(screen.queryByText(/Issue Violation/i)).toBeNull()
  })
})


it('throws error when EnforcementDashboardView is rendered without provider', () => {
  expect(() => render(<EnforcementDashboardView />)).toThrow(
    'useEnforcement must be used within EnforcementProvider'
  )
})

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
  expect(await screen.findByText('Enforcement Dashboard')).toBeDefined()
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

it('Zone and plate are required', async () => {
  render(
      <EnforcementProvider>
        <EnforcementDashboardView />
      </EnforcementProvider>
    )
  const user = userEvent.setup()
  const input = screen.getByLabelText('License Plate')
  const searchButton = screen.getByLabelText('Search')

  await user.type(input, 'TEST123')
  await user.click(searchButton)

  expect(await screen.getByText('Please enter a license plate and zone')).toBeDefined()
})

// it('starts a new scan use types a new license plate', async () => {
//   render(
//       <EnforcementProvider>
//         <EnforcementDashboardView />
//       </EnforcementProvider>
//     )
//   const user = userEvent.setup()

//   const input = screen.getByLabelText('License Plate')
//   const searchButton = screen.getByRole('button', { name: /Search/i })
//   await user.type(input, 'ABC999')
//   await user.click(searchButton)

//   const newScanButton = await screen.findByRole('button', { name: /New Scan/i })
//   await user.click(newScanButton)

//   expect(await screen.findByLabelText('Manual Entry')).toBeDefined()
// })

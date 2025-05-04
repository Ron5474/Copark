import { vi, it, afterEach, expect } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import EnforcementDashboardView from '@/app/dashboard/Content'

import View from '@/app/page'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

it('Renders Enforcement Dashboard', async () => {
  render(<View />)
  expect(await screen.findByText('Enforcement Dashboard')).toBeDefined()
})

it('renders the camera feed title', async () => {
    render(<EnforcementDashboardView />)
    expect(await screen.getByText('Camera Feed')).toBeDefined()
})

it('renders scan button', () => {
    render(<EnforcementDashboardView />)
    expect(screen.getByRole('button', { name: /Capture License Plate/i })).toBeDefined()
})

it('renders license plate input', () => {
  render(<EnforcementDashboardView />)
  expect(screen.getByLabelText('License Plate')).toBeDefined()
})

// it('shows retry button after scan fails', async () => {
//   render(<EnforcementDashboardView />)
//   const user = userEvent.setup()
//   await user.click(screen.getByRole('button', { name: /scan license plate/i }))
//   expect(await screen.findByRole('button', { name: /retry/i })).toBeDefined()
// })

it('can type in the plate input', async () => {
  render(<EnforcementDashboardView />)
  const user = userEvent.setup()
  const input = screen.getByLabelText('License Plate')
  await user.type(input, 'helloworld')
  expect((input as HTMLInputElement).value).toBe('helloworld')
})

it('Turn on camera', async () => {
  render(<EnforcementDashboardView />)
  const user = userEvent.setup()
  const cameraOn = screen.getByLabelText('Camera Off')
  await user.click(cameraOn)
  const captureButton = screen.getByRole('button', { name: /Capture License Plate/i })
  expect(captureButton.hasAttribute('disabled')).toBe(false)

})
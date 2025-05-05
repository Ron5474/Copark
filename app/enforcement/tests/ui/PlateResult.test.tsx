import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect, afterEach, vi } from 'vitest'

import PlateResult from '@/app/dashboard/plate/PlateResult'
import { EnforcementProvider } from '@/app/dashboard/context/Context'

afterEach(() => {
  cleanup()
})

it('renders nothing if plate is null', () => {
  const { container } = render(
    <EnforcementProvider>
      <PlateResult />
    </EnforcementProvider>
  )

  expect(container.firstChild).toBeNull()
})

it('shows the "License Plate Detected" message', async () => {
  render(
    <EnforcementProvider initialPlate="TEST123">
      <PlateResult showActions />
    </EnforcementProvider>
  )

  expect(await screen.findByText(/License Plate Detected/i)).toBeDefined()
})

it('shows the detected plate number', async () => {
  render(
    <EnforcementProvider initialPlate="TEST123">
      <PlateResult showActions />
    </EnforcementProvider>
  )

  expect(screen.getByText(/TEST123/i)).toBeDefined()
})

// fix me later
it('calls validate callback when Validate button is clicked', async () => {
  const user = userEvent.setup()
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

  render(
    <EnforcementProvider initialPlate="TEST123">
      <PlateResult showActions />
    </EnforcementProvider>
  )

  const validateBtn = await screen.findByRole('button', { name: /Validate/i })
  await user.click(validateBtn)

  expect(logSpy).toHaveBeenCalledWith('Validating permit for: TEST123')
  logSpy.mockRestore()
})

it('hides New Scan button when showActions is false', () => {
  render(
    <EnforcementProvider initialPlate="TEST123">
      <PlateResult showActions={false} />
    </EnforcementProvider>
  )

  expect(screen.queryByRole('button', { name: /New Scan/i })).toBeNull()
})

it('hides Validate button when showActions is false', () => {
  render(
    <EnforcementProvider initialPlate="TEST123">
      <PlateResult showActions={false} />
    </EnforcementProvider>
  )

  expect(screen.queryByRole('button', { name: /Validate/i })).toBeNull()
})

it('displays captured image preview if capturedImage is present', async () => {
  render(
    <EnforcementProvider
      initialPlate="ABC123"
      initialCapturedImage="data:image/png;base64,abc123"
    >
      <PlateResult />
    </EnforcementProvider>
  )

  const img = await screen.findByAltText('Captured license plate')
  expect(img).toBeDefined()
})

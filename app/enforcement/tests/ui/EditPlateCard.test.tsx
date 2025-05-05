import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect, afterEach } from 'vitest'
import EditPlateCard from '@/app/dashboard/plate/EditPlateCard'
import PlateResult from '@/app/dashboard/plate/PlateResult'
import { EnforcementProvider } from '@/app/dashboard/context/Context'

afterEach(() => {
  cleanup()
})

it('shows error message when saving empty input', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider initialPlate="XYZ123">
      <EditPlateCard />
    </EnforcementProvider>
  )

  const input = screen.getByLabelText(/license plate/i)
  await user.clear(input)

  const saveBtn = screen.getByRole('button', { name: /save/i })
  await user.click(saveBtn)

  expect(await screen.findByText(/please enter a license plate/i)).toBeDefined()
})

it('saves valid edited plate and updates result view', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider initialPlate="XYZ123">
      <>
        <EditPlateCard />
        <PlateResult />
      </>
    </EnforcementProvider>
  )

  const input = screen.getByLabelText(/license plate/i)
  await user.clear(input)
  await user.type(input, 'abc999')

  const saveBtn = screen.getByRole('button', { name: /save/i })
  await user.click(saveBtn)

  expect(await screen.findByText('ABC999')).toBeDefined()
})

it('cancels edit and restores original plate input', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider initialPlate="ZZZ888">
      <>
        <EditPlateCard />
        <PlateResult />
      </>
    </EnforcementProvider>
  )

  const input = screen.getByLabelText(/license plate/i)
  await user.clear(input)
  await user.type(input, 'somethingElse')

  const cancelBtn = screen.getByRole('button', { name: /cancel/i })
  await user.click(cancelBtn)

  // Should reset input field back to 'ZZZ888'
  expect((screen.getByLabelText(/license plate/i) as HTMLInputElement).value).toBe('ZZZ888')
})

it('does not render image if capturedImage is null', () => {
  render(
    <EnforcementProvider>
      <EditPlateCard />
    </EnforcementProvider>
  )

  const image = screen.queryByAltText(/captured license plate/i)
  expect(image).toBeNull()
})

it('renders captured image if present', () => {
  render(
    <EnforcementProvider initialCapturedImage="data:image/png;base64,abc123">
      <EditPlateCard />
    </EnforcementProvider>
  )

  const image = screen.getByAltText(/captured license plate/i)
  expect(image).toBeDefined()
  // expect((image as HTMLImageElement).src).toContain('data:image/png;base64,abc123')
})

it('throws error if used outside EnforcementProvider', () => {
  expect(() => render(<EditPlateCard />)).toThrow(
    'useEnforcement must be used within EnforcementProvider'
  )
})
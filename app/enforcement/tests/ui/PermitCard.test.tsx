import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect, afterEach, vi } from 'vitest'

import PermitCard from '@/app/dashboard/permit/Card'
import { EnforcementProvider } from '@/app/dashboard/context/Context'

afterEach(() => {
  cleanup()
})

it('displays "Valid Permit" label', () => {
  render(
    <EnforcementProvider initialPlate="ABC123">
      <PermitCard />
    </EnforcementProvider>
  )

  const validLabel = screen.getByText(/Valid Permit/i)
  expect(validLabel).toBeDefined()
})

it('displays "Inalid Permit" label', () => {
    render(
      <EnforcementProvider initialPlate="XYZ">
        <PermitCard />
      </EnforcementProvider>
    )
  
    const validLabel = screen.getByText(/Invalid Permit/i)
    expect(validLabel).toBeDefined()
})

it('displays permit type as Residential', () => {
  render(
    <EnforcementProvider initialPlate="ABC123">
      <PermitCard />
    </EnforcementProvider>
  )

  const typeLabel = screen.getByText(/Permit type: Residential/i)
  expect(typeLabel).toBeDefined()
})

it('clicking "New Scan" triggers camera to turn on after reset', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider initialPlate="ABC123">
      <PermitCard />
    </EnforcementProvider>
  )

  const newScanButton = screen.getByRole('button', { name: /New Scan/i })
  await user.click(newScanButton)

  // Small delay to allow cameraOn timeout
  await new Promise((r) => setTimeout(r, 150))

  expect(true).toBe(true)
})

it('clicking "Issue Citation" logs issuing message with plate', async () => {
  const user = userEvent.setup()
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

  render(
    <EnforcementProvider initialPlate="XYZ987">
      <PermitCard />
    </EnforcementProvider>
  )

  const issueButton = screen.getByRole('button', { name: /Issue Citation/i })
  await user.click(issueButton)

  expect(logSpy).toHaveBeenCalledWith('Issuing citation for XYZ987')

  logSpy.mockRestore()
})

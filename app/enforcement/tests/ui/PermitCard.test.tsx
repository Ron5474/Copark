import { render, screen, cleanup } from '@testing-library/react'
import { it, expect, vi, afterEach, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { EnforcementProvider, useEnforcement } from '@/app/dashboard/context/Context'
import PermitCard from '@/app/dashboard/permit/Card'
import ManualEntryCard from '@/app/dashboard/plate/ManualEntry'

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function TestPermitCardWithResult({
  permitResult,
}: {
  permitResult: { isValid: boolean; type: string; zone: string }
}) {
  const { setPermitResult, setIsValidated } = useEnforcement()

  React.useEffect(() => {
    setPermitResult(permitResult)
    setIsValidated(true)
  }, [setPermitResult, setIsValidated, permitResult])

  return <PermitCard />
}

it('Checks for valid permit', async () => {
  render(
    <EnforcementProvider initialPlate="XYZ123" initialManualInput="" initialZone="A1">
      <TestPermitCardWithResult
        permitResult={{ isValid: true, type: 'Residential', zone: 'A1' }}
      />
    </EnforcementProvider>
  )

  expect(await screen.findByText(/Valid parking permit found/i)).toBeDefined()
})

it('show the entered zone in the permit card', async () => {
  render(
    <EnforcementProvider initialPlate="XYZ123" initialManualInput="" initialZone="A1">
      <TestPermitCardWithResult
        permitResult={{ isValid: true, type: 'Residential', zone: 'A1' }}
      />
    </EnforcementProvider>
  )
  expect(screen.getByText(/Zone: A1/i)).toBeDefined()
})

it('Shows invalid permit message', async () => {
  render(
    <EnforcementProvider initialPlate="XYZ123" initialManualInput="" initialZone="A1">
      <TestPermitCardWithResult
        permitResult={{ isValid: false, type: 'Residential', zone: 'A1' }}
      />
    </EnforcementProvider>
  )
  expect(screen.getByText(/No valid permit found for this vehicle/i)).toBeDefined()
  expect(screen.getByText(/Zone: A1/i)).toBeDefined()
})



it('Shows invalid permit and show license plate', async () => {
  render(
    <EnforcementProvider initialPlate="XYZ123" initialManualInput="" initialZone="A1">
      <TestPermitCardWithResult
        permitResult={{ isValid: false, type: 'Residential', zone: 'A1' }}
      />
    </EnforcementProvider>
  )

  expect(await screen.findByText(/Invalid Permit/i)).toBeDefined()
  expect(screen.getByText(/Plate Number: XYZ123/i)).toBeDefined()
})

it('clicking new scan redirects you to manual entry', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider initialPlate="XYZ987">
      <PermitCard />
      <ManualEntryCard/>
    </EnforcementProvider>
  )

  const newScan = screen.getByLabelText('New Scan')
  await user.click(newScan)

  expect(screen.getByLabelText('Search'))
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
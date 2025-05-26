import { render, screen, cleanup } from '@testing-library/react'
import { it, expect, vi, afterEach, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { EnforcementProvider, useEnforcement } from '@/app/dashboard/context/Context'
import PermitCard from '@/app/dashboard/permit/Card'
// import ManualEntryCard from '@/app/dashboard/plate/ManualEntry'
import IssueViolationForm from '@/app/dashboard/violation/IssueViolationForm'
import EnforcementDashboardView from '@/app/dashboard/Content'

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

type PermitResult = [{
  type: string
  area: string
}] | [] | null

function TestPermitCardWithResult({
  permitResult,
}: {
  permitResult: PermitResult
}) {
  const { setPermitResult, setIsValidated } = useEnforcement()

  React.useEffect(() => {
    setPermitResult(permitResult)
    setIsValidated(true)
  }, [setPermitResult, setIsValidated, permitResult])

  return <PermitCard />
}

it('Shows permit found', async () => {
  render(
    <EnforcementProvider initialPlate="XYZ123" >
      <TestPermitCardWithResult
        permitResult={[{ type: 'Residential', area: 'A1' }]}
      />
    </EnforcementProvider>
  )

  expect(await screen.findByText(/Permit Found/i)).toBeDefined()
  expect(screen.getByText(/License Plate:/i)).toBeDefined()
  expect(screen.getByText(/XYZ123/i)).toBeDefined()
  expect(screen.getByText(/Residential - A1/i)).toBeDefined()
})

it('shows No Permit Found', async () => {
  render(
    <EnforcementProvider initialPlate="XYZ123">
      <TestPermitCardWithResult
      permitResult={[]}
      />
    </EnforcementProvider>
  )
  expect(await screen.findByText(/No Permit Found/i)).toBeDefined()
  expect(screen.getByText(/License Plate:/i)).toBeDefined()
  expect(screen.getByText(/XYZ123/i)).toBeDefined()
  expect(screen.getByText(/N\/A/i)).toBeDefined()
})

it('clicking new search redirects you to manual entry', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider initialPlate="XYZ987">
      <PermitCard />
      <EnforcementDashboardView/>
    </EnforcementProvider>
  )

  const newScan = screen.getByLabelText('New Search')
  await user.click(newScan)
  
  expect(await screen.findByText('Manual License Plate Entry')).toBeDefined()
})

it('clicking "Issue Citation" displays IssueViolationForm', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider initialPlate="XYZ987">
      <PermitCard />
      <IssueViolationForm onCancel={function (): void {
        throw new Error('Function not implemented.')
      } }/>
    </EnforcementProvider>
  )

  expect(screen.getByText(/Permit Types:/i)).toBeDefined()

  const issueButton = screen.getByLabelText('Issue Citation')
  await user.click(issueButton)
  expect(await screen.findByText('Issue Violation')).toBeDefined()
  expect(screen.getByLabelText('Reason')).toBeDefined()
})

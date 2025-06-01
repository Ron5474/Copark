import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { it, expect, afterEach, vi } from 'vitest'

import ManualEntryCard from '@/app/dashboard/plate/ManualEntry'
import { EnforcementProvider } from '@/app/dashboard/context/Context'
import PermitCard from '@/app/dashboard/permit/Card'

// Mock checkPermit
vi.mock('@/app/dashboard/permit/actions', async () => {
  return {
    checkPermit: vi.fn(async () => ({
      isValid: true,
      type: 'Lot',
      area: 'A1',
    })),
  }
})

afterEach(() => {
  cleanup()
})

it('searching sets plate from manual input', async () => {
  const user = userEvent.setup()

  render(
    <EnforcementProvider>
      <>
        <ManualEntryCard />
        <PermitCard />
      </>
    </EnforcementProvider>
  )

  const plateInput = screen.getByLabelText('License Plate')
  const searchBtn = screen.getByLabelText('Search License Plate')

  await user.type(plateInput, 'abc123')
  const field = screen.getByLabelText('Select a state')
  await user.click(field)
  await user.click(screen.getByText('California'))
  await user.click(searchBtn)

  expect(screen.getByText(/Permit Found/i)).toBeDefined()
})

it('handles checkPermit failure and sets fallback permit result', async () => {
  const user = userEvent.setup()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const { checkPermit } = await import('@/app/dashboard/permit/actions')
  vi.mocked(checkPermit).mockRejectedValueOnce(new Error('Permit service failed'))

  render(
    <EnforcementProvider>
      <>
        <ManualEntryCard />
        <PermitCard />
      </>
    </EnforcementProvider>
  )

  const plateInput = screen.getByLabelText('License Plate')
  const searchBtn = screen.getByLabelText('Search License Plate')

  await user.type(plateInput, 'FAIL999')
  const field = screen.getByLabelText('Select a state')
  await user.click(field)
  await user.click(screen.getByText('California'))
  await user.click(searchBtn)

  expect(await screen.findByText(/No Permit Found/i)).toBeDefined()
})

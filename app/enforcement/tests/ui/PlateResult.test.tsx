import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, afterEach } from 'vitest'

import PlateResult from '@/app/dashboard/PlateResult'
  
afterEach(() => {
  cleanup()
})

it('renders detected plate info', () => {
  render(
    <PlateResult showActions={true}
    />
  )
  expect(screen.getByText(/TEST123/i)).toBeDefined()
})

it('calls callback functions on button click', async () => {
  const onNewScan = vi.fn()
  const onValidate = vi.fn()
  const user = userEvent.setup()

  render(
    <PlateResult showActions={true}
    />
  )

  await user.click(screen.getByRole('button', { name: /New Scan/i }))
  expect(onNewScan).toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: /Validate/i }))
  expect(onValidate).toHaveBeenCalled()
})

it('does not show action buttons if showActions is false', () => {
  render(
    <PlateResult showActions={false}
    />
  )

  expect(screen.queryByRole('button', { name: /New Scan/i })).toBeNull()
})

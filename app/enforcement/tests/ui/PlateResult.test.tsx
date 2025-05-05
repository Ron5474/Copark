import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, afterEach } from 'vitest'

import PlateResult from '@/app/dashboard/PlateResult'

const mockPlate = 'TEST123'
const mockImage = 'data:image/png;base64,123abc'


  
afterEach(() => {
  cleanup()
})

it('renders detected plate info', () => {
  render(
    <PlateResult
      plate={mockPlate}
      capturedImage={mockImage}
      onNewScan={vi.fn()}
      onValidate={vi.fn()}
      showActions={true}
    />
  )
  expect(screen.getByText(/TEST123/i)).toBeDefined()
})

it('calls callback functions on button click', async () => {
  const onNewScan = vi.fn()
  const onValidate = vi.fn()
  const user = userEvent.setup()

  render(
    <PlateResult
      plate={mockPlate}
      capturedImage={mockImage}
      onNewScan={onNewScan}
      onValidate={onValidate}
      showActions={true}
    />
  )

  await user.click(screen.getByRole('button', { name: /New Scan/i }))
  expect(onNewScan).toHaveBeenCalled()

  await user.click(screen.getByRole('button', { name: /Validate/i }))
  expect(onValidate).toHaveBeenCalled()
})

it('does not show action buttons if showActions is false', () => {
  render(
    <PlateResult
      plate={mockPlate}
      capturedImage={mockImage}
      onNewScan={vi.fn()}
      onValidate={vi.fn()}
      showActions={false}
    />
  )

  expect(screen.queryByRole('button', { name: /New Scan/i })).toBeNull()
})

import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, afterEach, beforeEach } from 'vitest'

import IssueViolationForm from '@/app/dashboard/violation/IssueViolationForm'
import PermitCard from '@/app/dashboard/permit/Card'
import { EnforcementProvider } from '@/app/dashboard/context/Context'

vi.mock('@/app/dashboard/violation/actions', () => ({
  issueTicket: vi.fn(),
}))

afterEach(() => cleanup())

const onCancelMock = vi.fn()

const setup = (plate = 'ABC123', zone = 'A1') => {
  render(
    <EnforcementProvider initialPlate={plate} initialZone={zone} initialManualInput={plate}>
      <IssueViolationForm onCancel={onCancelMock} />
    </EnforcementProvider>
  )
}


beforeEach(() => {
  vi.clearAllMocks()
})

it('renders read-only license plate from context', () => {
  setup()
  expect(screen.getByDisplayValue('ABC123')).toBeDefined()
})

it('renders reason dropdown and updates on selection', async () => {
  setup()
  const user = userEvent.setup()

  const reasonSelect = screen.getByLabelText(/Reason/i)
  await user.click(reasonSelect)

  const option = await screen.findByText('Expired Permit')
  await user.click(option)

  expect(screen.getByDisplayValue('Expired Permit')).toBeDefined()
})

it('shows custom note field when "Other" is selected', async () => {
  setup()
  const user = userEvent.setup()

  const reasonSelect = screen.getByLabelText(/Reason/i)
  await user.click(reasonSelect)
  await user.click(screen.getByRole('option', { name: 'Other' }))

  expect(screen.getByLabelText(/Custom Note/i)).toBeDefined()
})

it('allows photo upload and shows file count', async () => {
  setup()

  const file = new File(['dummy content'], 'photo.png', { type: 'image/png' })
  const input = screen.getByLabelText('Upload Violation Photos')

  fireEvent.change(input, { target: { files: [file] } })

  expect(await screen.findByText(/1 file\(s\) selected/i)).toBeDefined()
})

it('calls onCancel when cancel button is clicked', async () => {
  render(
    <EnforcementProvider initialPlate="ABC123">
      <IssueViolationForm onCancel={onCancelMock} />
      <PermitCard />
    </EnforcementProvider>
  )

  const user = userEvent.setup()
  const cancelBtn = screen.getByRole('button', { name: /Cancel/i })
  await user.click(cancelBtn)

  expect(onCancelMock).toHaveBeenCalled()
})

it('shows validation error if required fields are missing', async () => {
  setup('')
  const user = userEvent.setup()

  const submit = screen.getByRole('button', { name: /Submit Violation/i })
  await user.click(submit)

  expect(screen.getByText(/License plate is required/i)).toBeDefined()
  expect(screen.getByText(/Reason is required/i)).toBeDefined()
})

it('clears field errors when user fills input', async () => {
  setup('')
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: /Submit Violation/i }))
  const plateField = screen.getByLabelText(/License Plate/i)
  await user.type(plateField, 'ZZZ999')

  expect(screen.queryByText(/License plate is required/i)).toBeNull()
})

it('calls issueTicket on successful submission', async () => {
  setup()
  const user = userEvent.setup()

  await user.click(screen.getByLabelText(/Reason/i))
  await user.click(screen.getByRole('option', { name: 'No Valid Permit' }))

  await user.click(screen.getByRole('button', { name: /Submit Violation/i }))

  const { issueTicket } = await import('@/app/dashboard/violation/actions')

  await waitFor(() => {
    expect(issueTicket).toHaveBeenCalledWith({
      plate: 'ABC123',
      reason: 'No Valid Permit',
      note: '',
      images: null,
    })
  })
})

it('clears reason field error when a reason is selected', async () => {
  setup('')
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: /Submit Violation/i }))
  expect(screen.getByText(/Reason is required/i)).toBeDefined()

  await user.click(screen.getByLabelText(/Reason/i))
  await user.click(screen.getByRole('option', { name: 'Blocking Driveway' }))

  expect(screen.queryByText(/Reason is required/i)).toBeNull()
})


// it('shows alert and logs error when issueTicket fails', async () => {
//   const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
//   const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
//   const { issueTicket } = await import('@/app/dashboard/violation/actions')
//   issueTicket.mockRejectedValueOnce(new Error('Mock failure'))

//   setup()
//   const user = userEvent.setup()

//   await user.click(screen.getByLabelText(/Reason/i))
//   await user.click(screen.getByRole('option', { name: 'No Valid Permit' }))
//   await user.click(screen.getByRole('button', { name: /Submit Violation/i }))

//   await waitFor(() => {
//     expect(alertSpy).toHaveBeenCalledWith('Failed to issue ticket.')
//     expect(errorSpy).toHaveBeenCalledWith(
//       'Ticket issuing failed:',
//       expect.any(Error)
//     )
//   })

//   alertSpy.mockRestore()
//   errorSpy.mockRestore()
// })


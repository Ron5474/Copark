import { render, screen, cleanup,  waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, beforeEach, beforeAll } from 'vitest'

import IssueViolationForm from '@/app/dashboard/violation/IssueViolationForm'
import { EnforcementProvider } from '@/app/dashboard/context/Context'
import { issueTicket } from '@/app/dashboard/violation/actions'

vi.mock('@/app/dashboard/violation/actions', () => ({
  issueTicket: vi.fn(),
}))

const onCancelMock = vi.fn()

const setup = (plate = 'ABC123') => {
  render(
    <EnforcementProvider initialPlate={plate} initialManualInput={plate}>
      <IssueViolationForm onCancel={onCancelMock} />
    </EnforcementProvider>
  )
}

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-photo-url')
  global.URL.revokeObjectURL = vi.fn()
})


beforeEach(() => {
  cleanup()
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

it('uploads photo and deletes it via removePhoto', async () => {
  setup()
  const file = new File(['dummy content'], 'photo.png', { type: 'image/png' })

  const input = screen.getByLabelText('Upload or Take Photo')
  await userEvent.upload(input, file)

  const deleteBtn = await screen.findByLabelText('Remove photo')
  await userEvent.click(deleteBtn)

  await waitFor(() => {
    expect(screen.queryByLabelText('Remove photo')).toBeNull()
  })
})

it('converts photo to base64 and submits with image', async () => {
  setup()
  const file = new File(['dummy content'], 'photo.png', { type: 'image/png' })

  const input = screen.getByLabelText('Upload or Take Photo')
  await userEvent.upload(input, file)

  await userEvent.click(screen.getByLabelText('Reason'))
  await userEvent.click(screen.getByRole('option', { name: 'No Valid Permit' }))

  const submit = screen.getByLabelText('Submit Violation')
  await userEvent.click(submit)

  await waitFor(() => {
    expect(issueTicket).toHaveBeenCalled()
    const calledArgs = vi.mocked(issueTicket).mock.calls[0][0]
    expect(calledArgs.images).toMatch(/^data:image\/png;base64,/)
  })
})

it('includes custom note when reason is "Other"', async () => {
  setup()
  const user = userEvent.setup()

  await user.click(screen.getByLabelText('Reason'))
  await user.click(screen.getByRole('option', { name: 'Other' }))

  const noteField = await screen.findByLabelText('Custom Note')
  await user.type(noteField, 'Custom explanation')
  const file = new File(['dummy content'], 'photo.png', { type: 'image/png' })

  const input = screen.getByLabelText('Upload or Take Photo')
  await userEvent.upload(input, file)

  const submit = screen.getByLabelText('Submit Violation')
  await user.click(submit)

  await waitFor(() => {
    expect(issueTicket).toHaveBeenCalledWith(expect.objectContaining({
      note: 'Custom explanation',
    }))
  })
})

it('renders with empty plate when none is set', () => {
  render(
    <EnforcementProvider initialPlate={undefined}>
      <IssueViolationForm onCancel={vi.fn()} />
    </EnforcementProvider>
  )

  const input = screen.getByLabelText('License Plate') as HTMLInputElement
  expect(input.value).toBe('')
})


it('updates note state when user types in custom note field', async () => {
  setup()
  const user = userEvent.setup()

  await user.click(screen.getByLabelText('Reason'))
  await user.click(screen.getByRole('option', { name: 'Other' }))

  const noteField = await screen.findByLabelText('Custom Note')
  await user.type(noteField, 'Test Note')

  expect((noteField as HTMLInputElement).value).toBe('Test Note')
})


it('calls onCancel when cancel is clicked', async () => {
  setup()
  const user = userEvent.setup()

  const cancelBtn = screen.getByLabelText('Cancel')
  await user.click(cancelBtn)

  expect(onCancelMock).toHaveBeenCalled()
})

it('displays alert when issueTicket throws', async () => {
  const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {})
  const user = userEvent.setup()
  setup()

  await user.click(screen.getByLabelText('Reason'))
  await user.click(screen.getByRole('option', { name: 'No Valid Permit' }))
  const file = new File(['dummy content'], 'photo.png', { type: 'image/png' })

  const input = screen.getByLabelText('Upload or Take Photo')
  await userEvent.upload(input, file)

  vi.mocked(issueTicket).mockRejectedValueOnce(new Error('server broke'))

  const submit = screen.getByLabelText('Submit Violation')
  await user.click(submit)

  await waitFor(() => {
    expect(mockAlert).toHaveBeenCalledWith('Failed to issue ticket.')
  })

  mockAlert.mockRestore()
})

it('shows validation error if required fields are missing', async () => {
  setup('')
  const user = userEvent.setup()

  const submitBtn = screen.getByLabelText('Submit Violation')
  await user.click(submitBtn)

  expect(screen.getByText(/A photo is required./i)).toBeDefined()
  expect(screen.getByText(/Reason is required/i)).toBeDefined()
})

it('clears field errors when user fills input', async () => {
  setup('')
  const user = userEvent.setup()

  const submitBtn = screen.getByLabelText('Submit Violation')
  await user.click(submitBtn)
  const file = new File(['dummy content'], 'photo.png', { type: 'image/png' })

  const input = screen.getByLabelText('Upload or Take Photo')
  await userEvent.upload(input, file)

  expect(screen.queryByText(/A photo is required./i)).toBeNull()
})

it('clears reason field error when a reason is selected', async () => {
  setup('')
  const user = userEvent.setup()

  const submitBtn = screen.getByLabelText('Submit Violation')
  await user.click(submitBtn)
  expect(screen.getByText(/Reason is required/i)).toBeDefined()

  const reasonSelect = screen.getByLabelText('Reason')
  await user.click(reasonSelect)
  await user.click(await screen.findByRole('option', { name: 'No Valid Permit' }))

  expect(screen.queryByText(/Reason is required/i)).toBeNull()
})

it('calls issueTicket on successful submission', async () => {
  setup()
  const user = userEvent.setup()

  const reasonInput = screen.getByLabelText('Reason')
  await user.click(reasonInput)
  await user.click(await screen.findByRole('option', { name: 'No Valid Permit' }))
  const file = new File(['dummy content'], 'photo.png', { type: 'image/png' })

  const input = screen.getByLabelText('Upload or Take Photo')
  await userEvent.upload(input, file)


  await user.click(screen.getByLabelText('Submit Violation'))

  const { issueTicket } = await import('@/app/dashboard/violation/actions')

  await waitFor(() => {
    expect(issueTicket).toHaveBeenCalledWith({
      plate: 'ABC123',
      reason: 'No Valid Permit',
      note: '',
      images: expect.any(String),
    })
  })
})

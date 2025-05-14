import { render, screen,  cleanup, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, it, expect, afterEach} from 'vitest'

import IssueViolationForm from '@/app/dashboard/violation/IssueViolationForm'
import PermitCard from '@/app/dashboard/permit/Card'
import { EnforcementProvider } from '@/app/dashboard/context/Context'

afterEach(() => cleanup())

const onCancelMock = vi.fn()

const setup = () => {
  render(
    <EnforcementProvider initialPlate="ABC123">
      <IssueViolationForm onCancel={onCancelMock} />
    </EnforcementProvider>
  )
}

it('renders read only license plate from context', () => {
  setup()
  expect(screen.getByDisplayValue('ABC123')).toBeDefined()
})

it('renders reason dropdown and updates on selection', async () => {
  const user = userEvent.setup()
  setup()

  const reasonSelect = screen.getByLabelText(/reason/i)
  await user.click(reasonSelect)

  const option = await screen.findByText('Expired Permit')
  await user.click(option)

  expect(screen.getByDisplayValue('Expired Permit')).toBeDefined()
})

it('shows custom note field when "Other" is selected', async () => {
  const user = userEvent.setup()
  setup()

  const reasonSelect = screen.getByLabelText(/reason/i)
  await user.click(reasonSelect)
  const otherOption = await screen.findByRole('option', { name: 'Other' })
  await user.click(otherOption)

  const noteField = await screen.findByLabelText(/custom note/i)
  expect(noteField).toBeDefined()
})

it('allows photo upload and shows file count', async () => {
    setup()
  
    const file = new File(['dummy content'], 'photo.png', { type: 'image/png' })
  
    const input = screen.getByLabelText('Upload Violation Photos')
    fireEvent.change(input, {
      target: { files: [file] }
    })
  
    const fileInfo = await screen.findByText(/1 file\(s\) selected/i)
    expect(fileInfo).toBeDefined()
  })
  

it('calls onCancel when cancel button is clicked', async () => {
  const user = userEvent.setup()
  render(
    <EnforcementProvider initialPlate="ABC123">
      <IssueViolationForm onCancel={onCancelMock} />
      <PermitCard/>
    </EnforcementProvider>
  )

  const cancelBtn = screen.getByRole('button', { name: /cancel/i })
  await user.click(cancelBtn)

  expect(onCancelMock).toHaveBeenCalled()
})

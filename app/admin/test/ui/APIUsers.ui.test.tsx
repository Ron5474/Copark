import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react'
import { ThemeProvider } from '@mui/material'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import theme from '../../src/app/theme'
import AddAPIUser from '../../src/app/components/AddAPIUser'
import ManageAPIUsers from '../../src/app/components/ManageAPIUsers'
import { addAPIUser, getAPIUsers, suspendAPIUser, reinstateAPIUser, deleteAPIUser } from '../../src/api/actions'


vi.mock('../../src/api/actions', () => ({
  addAPIUser: vi.fn(),
  getAPIUsers: vi.fn(),
  suspendAPIUser: vi.fn(),
  reinstateAPIUser: vi.fn(),
  deleteAPIUser: vi.fn()
}))

const mockOnClose = vi.fn()
const mockOnUserAdded = vi.fn()

beforeEach(() => {
  cleanup();
  vi.clearAllMocks()
})

it('renders correctly', () => {
  render(
    <ThemeProvider theme={theme}>
      <AddAPIUser
        open={true}
        onClose={mockOnClose}
        onUserAdded={mockOnUserAdded}
      />
    </ThemeProvider>
  )

  expect(screen.getByText('Add API User')).toBeDefined()
  expect(screen.getByLabelText('Organization Name')).toBeDefined()
  expect(screen.getByLabelText('Organization Email')).toBeDefined()
})

it('handles form submission', async () => {
  render(
    <ThemeProvider theme={theme}>
      <AddAPIUser
        open={true}
        onClose={mockOnClose}
        onUserAdded={mockOnUserAdded}
      />
    </ThemeProvider>
  )

  fireEvent.change(screen.getByLabelText('Organization Name'), {
    target: { value: 'Test Organization' }
  })
  fireEvent.change(screen.getByLabelText('Organization Email'), {
    target: { value: 'test@organization.com' }
  })

  fireEvent.click(screen.getByText('Add'))

  await waitFor(() => {
    expect(addAPIUser).toHaveBeenCalledWith({
      name: 'Test Organization',
      email: 'test@organization.com',
      role: 'payroll'
    })
    expect(mockOnUserAdded).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })
})

it('handles role selection change', async () => {
  render(
    <ThemeProvider theme={theme}>
      <AddAPIUser
        open={true}
        onClose={mockOnClose}
        onUserAdded={mockOnUserAdded}
      />
    </ThemeProvider>
  )

  fireEvent.change(screen.getByLabelText('Organization Name'), {
    target: { value: 'Test Organization' }
  })
  fireEvent.change(screen.getByLabelText('Organization Email'), {
    target: { value: 'test@organization.com' }
  })

  fireEvent.mouseDown(screen.getByLabelText('Role'))
  fireEvent.click(screen.getByText('Registrar'))

  fireEvent.click(screen.getByText('Add'))

  await waitFor(() => {
    expect(addAPIUser).toHaveBeenCalledWith({
      name: 'Test Organization',
      email: 'test@organization.com',
      role: 'registrar'
    })
    expect(mockOnUserAdded).toHaveBeenCalled()
    expect(mockOnClose).toHaveBeenCalled()
  })
})

it('closes dialog when cancel is clicked', () => {
  render(
    <ThemeProvider theme={theme}>
      <AddAPIUser
        open={true}
        onClose={mockOnClose}
        onUserAdded={mockOnUserAdded}
      />
    </ThemeProvider>
  )

  fireEvent.click(screen.getByText('Cancel'))
  expect(mockOnClose).toHaveBeenCalled()
})

const mockNavigate = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()

  vi.mocked(getAPIUsers).mockResolvedValue([
    {
      id: '1',
      name: 'Test Org',
      email: 'test@org.com',
      role: 'registrar',
      accountStatus: 'active',
    }
  ])
})

it('renders correctly', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={mockNavigate} />
    </ThemeProvider>
  )

  expect(screen.getByText('Manage API Users')).toBeDefined()

  await waitFor(() => {
    expect(screen.getByText('Test Org')).toBeDefined()
  })
})

it('opens add dialog when add button is clicked', () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={mockNavigate} />
    </ThemeProvider>
  )

  fireEvent.click(screen.getByText('Add API User'))
  expect(screen.getByRole('dialog')).toBeDefined()
})

it('opens add dialog and closes it properly', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={mockNavigate} />
    </ThemeProvider>
  )

  fireEvent.click(screen.getByText('Add API User'))
  expect(screen.getByRole('dialog')).toBeDefined()

  fireEvent.click(screen.getByText('Cancel'))

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull()
  }, { timeout: 2000 })
})

it('shows no users message when api returns empty array', async () => {
  vi.mocked(getAPIUsers).mockResolvedValueOnce([])

  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={mockNavigate} />
    </ThemeProvider>
  )

  await waitFor(() => {
    expect(screen.getByText('No API users found')).toBeDefined()
  })
})

it('handles suspending and reinstating an API user', async () => {
  const mockUser = {
    id: '1',
    name: 'Test Org',
    email: 'test@org.com',
    role: 'registrar',
    accountStatus: 'active'
  }

  vi.mocked(getAPIUsers)
    .mockResolvedValueOnce([mockUser])
    .mockResolvedValueOnce([{
      ...mockUser,
      accountStatus: 'suspended'
    }])
    .mockResolvedValueOnce([{
      ...mockUser,
      accountStatus: 'active'
    }])

  vi.mocked(suspendAPIUser).mockResolvedValueOnce([{
    ...mockUser,
    accountStatus: 'suspended'
  }])

  vi.mocked(reinstateAPIUser).mockResolvedValueOnce([{
    ...mockUser,
    accountStatus: 'active'
  }])

  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={mockNavigate} />
    </ThemeProvider>
  )

  await waitFor(() => {
    expect(screen.getByText('Test Org')).toBeDefined()
    expect(screen.getByLabelText('Suspend user')).toBeDefined()
  })

  const suspendButton = screen.getByLabelText('Suspend user')
  fireEvent.click(suspendButton)

  await waitFor(() => {
    expect(suspendAPIUser).toHaveBeenCalledWith('1')
    expect(screen.getByText('suspended')).toBeDefined()
    expect(screen.getByLabelText('Reinstate user')).toBeDefined()
  })

  const reinstateButton = screen.getByLabelText('Reinstate user')
  fireEvent.click(reinstateButton)

  await waitFor(() => {
    expect(reinstateAPIUser).toHaveBeenCalledWith('1')
    expect(screen.getByText('active')).toBeDefined()
  })
})

it('handles deleting an API user', async () => {
  const mockUser = {
    id: '1',
    name: 'Test Org',
    email: 'test@org.com',
    role: 'registrar',
    accountStatus: 'active'
  }

  // Mock initial state and after deletion
  vi.mocked(getAPIUsers)
    .mockResolvedValueOnce([mockUser])  // Initial load
    .mockResolvedValueOnce([])  // After deletion

  // Mock delete response
  vi.mocked(deleteAPIUser).mockResolvedValueOnce([{
    ...mockUser,
    accountStatus: 'deleted'
  }])

  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={mockNavigate} />
    </ThemeProvider>
  )

  // Verify initial render
  await waitFor(() => {
    expect(screen.getByText('Test Org')).toBeDefined()
    expect(screen.getByLabelText('Delete user')).toBeDefined()
  })

  // Click delete button
  const deleteButton = screen.getByLabelText('Delete user')
  fireEvent.click(deleteButton)

  // Verify deletion
  await waitFor(() => {
    expect(deleteAPIUser).toHaveBeenCalledWith('1')
    expect(screen.getByText('No API users found')).toBeDefined()
  })
})


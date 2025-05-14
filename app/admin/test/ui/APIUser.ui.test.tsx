import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { ThemeProvider } from '@mui/material'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import theme from '../../src/app/theme'
import AddAPIUser from '../../src/app/components/AddAPIUser'
import ManageAPIUsers from '../../src/app/components/ManageAPIUsers'
import { addAPIUser, getAPIUsers } from '../../src/api/actions'

// Mock the API actions with more detailed implementation
vi.mock('../../src/api/actions', () => ({
  addAPIUser: vi.fn(),
  getAPIUsers: vi.fn()
}))

const mockOnClose = vi.fn()
const mockOnUserAdded = vi.fn()

beforeEach(() => {
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
  cleanup()
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
  cleanup()
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
  cleanup(); 
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
  // Set up default mock implementation for other tests
  vi.mocked(getAPIUsers).mockResolvedValue([
    { 
      id: '1', 
      name: 'Test Org', 
      email: 'test@org.com', 
      role: 'api_user' 
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
  cleanup(); 
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={mockNavigate} />
    </ThemeProvider>
  )

  fireEvent.click(screen.getByText('Add API User'))
  expect(screen.getByRole('dialog')).toBeDefined()
})

it('opens add dialog and closes it properly', async () => {
  cleanup()
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
  // Setup mock to return empty array
  vi.mocked(getAPIUsers).mockResolvedValueOnce([])
  
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={mockNavigate} />
    </ThemeProvider>
  )

  // Wait for and verify the "no users" message
  await waitFor(() => {
    expect(screen.getByText('No API users found')).toBeDefined()
  })
})
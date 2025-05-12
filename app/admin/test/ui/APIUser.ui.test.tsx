import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { ThemeProvider } from '@mui/material'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import theme from '../../src/app/theme'
import AddAPIUser from '../../src/app/components/AddAPIUser'
import ManageAPIUsers from '../../src/app/components/ManageAPIUsers'
import { addAPIUser } from '../../src/api/actions'

// Mock the API actions
vi.mock('../../src/api/actions', () => ({
  addAPIUser: vi.fn(),
  getAPIUsers: vi.fn(() => Promise.resolve([
    { id: '1', name: 'Test Org', email: 'test@org.com', role: 'api_user' }
  ]))
}))

const mockOnClose = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

it('renders correctly', () => {
  render(
    <ThemeProvider theme={theme}>
      <AddAPIUser open={true} onClose={mockOnClose} />
    </ThemeProvider>
  )

  expect(screen.getByText('Add API User')).toBeDefined()
  expect(screen.getByLabelText('Organization Name')).toBeDefined()
  expect(screen.getByLabelText('Organization Email')).toBeDefined()
})

it('handles form submission', async () => {
  cleanup(); 
  render(
    <ThemeProvider theme={theme}>
      <AddAPIUser open={true} onClose={mockOnClose} />
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
      role: 'api_user'
    })
    expect(mockOnClose).toHaveBeenCalled()
  })
})

it('closes dialog when cancel is clicked', () => {
  cleanup(); 
  render(
    <ThemeProvider theme={theme}>
      <AddAPIUser open={true} onClose={mockOnClose} />
    </ThemeProvider>
  )

  fireEvent.click(screen.getByText('Cancel'))
  expect(mockOnClose).toHaveBeenCalled()
})

const mockNavigate = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

it('renders correctly', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={mockNavigate} />
    </ThemeProvider>
  )

  expect(screen.getByText('Manage API Users')).toBeDefined()

  // No Get API Users service yet!
  // await waitFor(() => {
  //   expect(screen.getByText('Test Org')).toBeDefined()
  // })
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

it('navigates home when home button is clicked', () => {
  cleanup(); 
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={mockNavigate} />
    </ThemeProvider>
  )

  fireEvent.click(screen.getByTestId('HomeIcon').parentElement!)
  expect(mockNavigate).toHaveBeenCalledWith('home')
})
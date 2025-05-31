import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { vi, it, expect, beforeEach } from 'vitest'
import AllPermitsTable from '../../src/app/charts/AllPermitsTable'
import { getAllPermits } from '../../src/permit/actions'

// Mock the getAllPermits action
vi.mock('../../src/permit/actions', () => ({
  getAllPermits: vi.fn()
}))

const mockPermits = [
  {
    type: 'zone',
    area: 'A1',
    purchaseDate: '2025-05-19T10:00:00Z',
    activeDate: '2025-05-19T10:00:00Z',
    expireDate: '2025-05-19T22:00:00Z'
  },
  {
    type: 'lot',
    area: 'B2',
    purchaseDate: '2025-05-18T09:00:00Z',
    activeDate: '2025-05-18T09:00:00Z',
    expireDate: '2025-05-18T21:00:00Z'
  }
]

beforeEach(() => {
  cleanup(); 
  vi.clearAllMocks()
})

it('shows loading state initially', () => {
  vi.mocked(getAllPermits).mockImplementation(() => new Promise(() => {}))
  render(<AllPermitsTable />)
  expect(screen.getByText('Loading...')).toBeDefined()
})

it('shows no permits message when empty', async () => {
  vi.mocked(getAllPermits).mockResolvedValue([])
  render(<AllPermitsTable />)
  
  await waitFor(() => {
    expect(screen.getByText('No permits found.')).toBeDefined()
  })
})

it('displays permits when data is loaded', async () => {
  vi.mocked(getAllPermits).mockResolvedValue(mockPermits)
  render(<AllPermitsTable />)

  await waitFor(() => {
    expect(screen.getByText('zone')).toBeDefined()
    expect(screen.getByText('A1')).toBeDefined()
    expect(screen.getByText('lot')).toBeDefined()
    expect(screen.getByText('B2')).toBeDefined()
  })
})

it('toggles between active and all permits', async () => {
  vi.mocked(getAllPermits).mockResolvedValue(mockPermits)
  render(<AllPermitsTable />)

  // Initially shows "Active Only"
  expect(screen.getByText('All Permits (Active Only)')).toBeDefined()

  // Find and click the switch
  const toggle = screen.getByRole('checkbox')
  fireEvent.click(toggle)

  // Should show "All" and call getAllPermits with false
  await waitFor(() => {
    expect(screen.getByText('All Permits (All)')).toBeDefined()
    expect(getAllPermits).toHaveBeenCalledWith(false)
  })
})

it('formats dates correctly', async () => {
  vi.mocked(getAllPermits).mockResolvedValue([mockPermits[0]])
  render(<AllPermitsTable />)

  await waitFor(() => {
    const purchaseDate = new Date(mockPermits[0].purchaseDate).toLocaleString()
    const activeDate = new Date(mockPermits[0].activeDate).toLocaleString()
    const expireDate = new Date(mockPermits[0].expireDate).toLocaleString()

    // Check for purchase and active dates (which are the same in the mock data)
    const sameDateElements = screen.getAllByText(purchaseDate)
    expect(sameDateElements).toHaveLength(2) // Should find 2 elements with this date

    // Check for expire date
    expect(screen.getByText(expireDate)).toBeDefined()
  })
})

it('handles errors gracefully', async () => {
  const error = 'Failed to fetch permit data'
  vi.mocked(getAllPermits).mockRejectedValue(new Error(error))
  render(<AllPermitsTable />)

  await waitFor(() => {
    expect(screen.getByText(`Error: ${error}`)).toBeDefined()
  })
})
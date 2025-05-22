import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import TicketsByEnforcerPerDay from '../../src/app/charts/TicketsByEnforcerPerDay';
import { getTicketsByEnforcer } from '../../src/ticket/actions';
import { getEnforcers } from '../../src/enforcement/actions';

// Mock the chart component
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">A cool chart.</div>
}));

// Mock the actions
vi.mock('../../src/ticket/actions', () => ({
  getTicketsByEnforcer: vi.fn()
}));

vi.mock('../../src/enforcement/actions', () => ({
  getEnforcers: vi.fn()
}));

// Mock data
const mockEnforcers = [
  { id: '1', name: 'Enforcer 1', email: 'enforcer1@test.com', accountStatus: 'active' },
  { id: '2', name: 'Enforcer 2', email: 'enforcer2@test.com', accountStatus: 'active' }
];

const mockTicketStats = [
  {
    date: '2025-05-19',
    tickets: [
      { id: '1', issuedDate: '2025-05-19T10:00:00Z' }
    ]
  },
  {
    date: '2025-05-20',
    tickets: [
      { id: '2', issuedDate: '2025-05-20T10:00:00Z' },
      { id: '3', issuedDate: '2025-05-20T11:00:00Z' }
    ]
  }
];

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('renders enforcer selector and chart', async () => {
  vi.mocked(getEnforcers).mockResolvedValue(mockEnforcers);
  vi.mocked(getTicketsByEnforcer).mockResolvedValue(mockTicketStats);

  render(<TicketsByEnforcerPerDay />);

  // Check if loading state is shown initially
  expect(screen.getByText('Loading...')).toBeDefined();

  // Wait for enforcers to load and verify select is rendered
  await waitFor(() => {
    expect(screen.getByRole('combobox')).toBeDefined();
    expect(screen.getByText('Enforcer 1')).toBeDefined();
  });

  // Verify chart is rendered
  expect(screen.getByTestId('mock-chart')).toBeDefined();
});

it('handles enforcer selection change', async () => {
  vi.mocked(getEnforcers).mockResolvedValue(mockEnforcers);
  vi.mocked(getTicketsByEnforcer).mockResolvedValue(mockTicketStats);

  render(<TicketsByEnforcerPerDay />);

  // Wait for select to be loaded
  await waitFor(() => {
    expect(screen.getByRole('combobox')).toBeDefined();
  });

  // Change selected enforcer using the combobox
  const select = screen.getByRole('combobox');
  fireEvent.mouseDown(select);
  
  // Select the new option
  const option = screen.getByText('Enforcer 2');
  fireEvent.click(option);

  await waitFor(() => {
    expect(getTicketsByEnforcer).toHaveBeenCalledWith('2');
  });
});

it('handles error in tickets fetch', async () => {
  vi.mocked(getEnforcers).mockResolvedValue(mockEnforcers);
  vi.mocked(getTicketsByEnforcer).mockRejectedValue(new Error('Failed to fetch tickets'));

  render(<TicketsByEnforcerPerDay />);

  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch ticket data')).toBeDefined();
  });
});

it('handles empty ticket data', async () => {
  vi.mocked(getEnforcers).mockResolvedValue(mockEnforcers);
  vi.mocked(getTicketsByEnforcer).mockResolvedValue([]);

  render(<TicketsByEnforcerPerDay />);

  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });
});
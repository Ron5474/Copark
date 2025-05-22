import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import ViewStatistics from '../../src/app/components/ViewStatistics';
import { getTicketsByDay } from '../../src/ticket/actions';
import { getTicketsByEnforcer } from '../../src/ticket/actions';
import { getEnforcers } from '../../src/enforcement/actions';
import { getAllPermitsByDay } from '../../src/permit/actions';

// Mock all required actions
vi.mock('../../src/ticket/actions', () => ({
  getTicketsByDay: vi.fn(),
  getTicketsByEnforcer: vi.fn()
}));

vi.mock('../../src/enforcement/actions', () => ({
  getEnforcers: vi.fn()
}));

vi.mock('../../src/permit/actions', () => ({
  getAllPermitsByDay: vi.fn()
}));

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">A cool chart.</div>
}));

// Mock data
const mockEnforcers = [
  { id: '1', name: 'Enforcer 1', email: 'enforcer1@test.com', accountStatus: 'active' },
  { id: '2', name: 'Enforcer 2', email: 'enforcer2@test.com', accountStatus: 'active' }
];

const mockTicketsByEnforcer = [
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

it('handles non-array data from getTicketsByDay', async () => {
  vi.mocked(getTicketsByDay).mockResolvedValue({
    someData: 'not an array'
  } as any);

  render(<ViewStatistics />);

  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });

  const chartElement = screen.getByTestId('mock-chart');
  expect(chartElement).toBeDefined();
});

it('renders chart with valid ticket data', async () => {
  vi.mocked(getTicketsByDay).mockResolvedValue([
  {
    "date": "2025-05-19",
    "tickets": [
      {
        id: "1",
        issuedDate: "2025-05-19T21:18:42.753Z"
      }
    ]
  },
  {
    date: "2025-05-20",
    tickets: [
      {
        id: "2",
        issuedDate: "2025-05-20T21:17:42.748Z"
      },
      {
        id: "3",
        issuedDate: "2025-05-20T21:18:42.750Z"
      },
    ]
  }
]);

  render(<ViewStatistics />);

  await waitFor(() => {
    expect(screen.getByText('Statistics')).toBeDefined();
  });

  const chartElement = screen.getByTestId('mock-chart');
  expect(chartElement).toBeDefined();
});

it('handles error from getTicketsByDay', async () => {
  // Mock getTicketsByDay to throw an error
  vi.mocked(getTicketsByDay).mockRejectedValue(new Error('Failed to fetch tickets'));

  render(<ViewStatistics />);

  // Wait for error message to appear
  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch ticket data')).toBeDefined();
  });

  // Verify chart is not rendered when there's an error
  expect(screen.queryByTestId('mock-chart')).toBeNull();
});

it('handles data with only date field', async () => {
  vi.mocked(getTicketsByDay).mockResolvedValue([
    {
      date: '2025-05-19',
      tickets: []
    }
  ]);

  render(<ViewStatistics />);
  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });
});

it('handles data with only created_at field', async () => {
  vi.mocked(getTicketsByDay).mockResolvedValue([
    {
      created_at: '2025-05-19T10:00:00Z',
      tickets: []
    }
  ]);

  render(<ViewStatistics />);
  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });
});

it('handles data with non-array tickets field', async () => {
  vi.mocked(getTicketsByDay).mockResolvedValue([
    {
      date: '2025-05-19',
      tickets: 'not an array' as any
    }
  ]);

  render(<ViewStatistics />);
  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });
});

it('handles data with missing tickets field', async () => {
  vi.mocked(getTicketsByDay).mockResolvedValue([
    {
      date: '2025-05-19'
    }
  ]);

  render(<ViewStatistics />);
  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });
});

it('handles complete valid data', async () => {
  vi.mocked(getTicketsByDay).mockResolvedValue([
    {
      date: '2025-05-19',
      created_at: '2025-05-19T10:00:00Z',
      tickets: [
        { id: '1', created_at: '2025-05-19T10:00:00Z' }
      ]
    },
    {
      date: null,
      created_at: '2025-05-20T10:00:00Z',
      tickets: [
        { id: '2', created_at: '2025-05-20T10:00:00Z' }
      ]
    }
  ]);

  render(<ViewStatistics />);
  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });
});

it('renders enforcer selector and chart', async () => {
  vi.mocked(getEnforcers).mockResolvedValue(mockEnforcers);
  vi.mocked(getTicketsByEnforcer).mockResolvedValue(mockTicketsByEnforcer);

  render(<ViewStatistics />);

  // Switch to enforcer view
  const enforcerTab = screen.getByText('Tickets by Enforcer');
  fireEvent.click(enforcerTab);
}, 20000);

it('handles error in enforcer tickets fetch', async () => {
  vi.mocked(getEnforcers).mockResolvedValue(mockEnforcers);
  vi.mocked(getTicketsByEnforcer).mockRejectedValue(new Error('Failed to fetch enforcer tickets'));

  render(<ViewStatistics />);

  // Switch to enforcer view
  const enforcerTab = screen.getByText('Tickets by Enforcer');
  fireEvent.click(enforcerTab);

  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch ticket data')).toBeDefined();
  });
});

it('renders permits chart when permits tab is clicked', async () => {
  // Mock the permit data
  vi.mocked(getAllPermitsByDay).mockResolvedValue([
    {
      date: "2025-05-19",
      permits: [
        {
          vehicle: "ABC123",
          type: "zone",
          area: "A1",
          activeDate: "2025-05-19T10:00:00Z",
          expireDate: "2025-05-19T12:00:00Z"
        }
      ]
    },
    {
      date: "2025-05-20", 
      permits: [
        {
          vehicle: "DEF456",
          type: "zone",
          area: "B2",
          activeDate: "2025-05-20T14:00:00Z",
          expireDate: "2025-05-20T16:00:00Z"
        },
        {
          vehicle: "GHI789",
          type: "zone", 
          area: "C3",
          activeDate: "2025-05-20T15:00:00Z",
          expireDate: "2025-05-20T17:00:00Z"
        }
      ]
    }
  ]);

  render(<ViewStatistics />);

  // Click the permits tab
  const permitsTab = screen.getByText('Permits by Day');
  fireEvent.click(permitsTab);

  // Wait for chart to render
  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });

  // Verify the chart is rendered
  const chartElement = screen.getByTestId('mock-chart');
  expect(chartElement).toBeDefined();

  // Verify getAllPermitsByDay was called
  expect(getAllPermitsByDay).toHaveBeenCalled();
});

// Add error handling test
it('handles error in permits fetch', async () => {
  vi.mocked(getAllPermitsByDay).mockRejectedValue(new Error('Failed to fetch permits'));

  render(<ViewStatistics />);

  // Click the permits tab
  const permitsTab = screen.getByText('Permits by Day');
  fireEvent.click(permitsTab);

  // Wait for error message
  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch permit data')).toBeDefined();
  });

  // Verify chart is not rendered when there's an error
  expect(screen.queryByTestId('mock-chart')).toBeNull();
});

import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import Page from '../../src/app/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })
}));

vi.mock('../../src/enforcement/actions', () => ({
  getEnforcers: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'Test Enforcer',
      email: 'test@example.com',
      accountStatus: 'active'
    },
    {
      id: '2',
      name: 'Test Enforcer 2',
      email: 'test2@example.com',
      accountStatus: 'suspended'
    }
  ]),
  addEnforcer: vi.fn(),
  suspendUser: vi.fn()
}));

vi.mock('../../src/driver/actions', () => ({
  getDrivers: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'Driver One',
      email: 'driver1@example.com',
      accountStatus: 'active',
    },
    {
      id: '2',
      name: 'Driver Two',
      email: 'driver2@example.com',
      accountStatus: 'suspended',
    },
  ]),
  suspendUser: vi.fn().mockResolvedValue({}),
  reinstateUser: vi.fn().mockResolvedValue({}),
  deleteUser: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../src/api/actions', () => ({
  getAPIUsers: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'API User One',
      email: 'apiuser1@example.com',
      role: 'payroll',
      accountStatus: 'active',
    },
    {
      id: '2',
      name: 'API User Two',
      email: 'apiuser2@example.com',
      role: 'registrar',
      accountStatus: 'suspended',
    },
  ]),
}));

vi.mock('../../src/ticket/actions', () => ({
  getTicketsByDay: vi.fn().mockResolvedValue([
    {
      date: '2024-05-20',
      tickets: [
        { id: '1', created_at: '2024-05-20T10:00:00Z' },
        { id: '2', created_at: '2024-05-20T11:00:00Z' }
      ]
    },
    {
      date: '2024-05-21',
      tickets: [
        { id: '3', created_at: '2024-05-21T09:00:00Z' }
      ]
    }
  ]),
  getChallengedTickets: vi.fn().mockResolvedValue([
    {
      id: '1',
      vehicle: 'ABC-123',
      enforcer: 'enforcer-1',
      issuedDate: '2024-05-20T10:00:00Z',
      violation: 'No Valid Permit',
      fine: 75.00,
      ticketStatus: 'challenged',
      images: 'image1.jpg',
      note: 'Parked in reserved spot',
      challengeReason: 'I had a valid permit'
    },
    {
      id: '2',
      vehicle: 'XYZ-789',
      enforcer: 'enforcer-2',
      issuedDate: '2024-05-21T11:00:00Z',
      violation: 'Expired Permit',
      fine: 50.00,
      ticketStatus: 'challenged',
      images: 'image2.jpg',
      note: 'Vehicle in no parking zone',
      challengeReason: 'My permit was valid but not visible'
    }
  ])
}));

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">Ticket Statistics</div>
}));

vi.mock('../../src/permit/actions', () => ({
  getZones: vi.fn().mockResolvedValue([
    {
      zone: "1",
      hourly: 2.50,
      maxDuration: {
        hours: 2,
        minutes: 0
      },
      openTime: "08:00",
      closeTime: "18:00"
    },
    {
      zone: "2",
      hourly: 3.50,
      maxDuration: {
        hours: 4,
        minutes: 0
      },
      openTime: "07:00",
      closeTime: "20:00"
    }
  ]),
  getPermitReport: vi.fn().mockResolvedValue({
    totalPermits: 100,
    activePermits: 75,
    expiredPermits: 25,
    totalRevenue: 5000,
    zoneBreakdown: [
      { area: 'Zone 1', totalPermits: 50 },
      { area: 'Zone 2', totalPermits: 50 }
    ],
    lotBreakdown: [
      { area: 'Lot A', totalPermits: 40 },
      { area: 'Lot B', totalPermits: 60 }
    ]
  })
}));

const mockRouter = {
  push: vi.fn(),
};

beforeEach(() => {
  cleanup();
});

it('renders main page with required elements', () => {
  render(<Page />);
  expect(screen.getByText("Admin Dashboard")).toBeDefined();
});

it('displays user name from session storage', () => {
  window.sessionStorage.setItem('name', 'Jason Xiong');
  render(<Page />);
  expect(screen.getByText("Logged in as: Jason Xiong")).toBeDefined();
});

it('handles logout action', async () => {
  render(<Page />);
  const logoutButton = screen.getByText('Logout');
  fireEvent.click(logoutButton);
  await waitFor(() => {
    expect(window.sessionStorage.getItem('name')).toBeNull();
  });
});

it('renders without user name when session is empty', () => {
  render(<Page />);
  expect(screen.queryByText(/Jason Xiong/)).toBeNull();
});

it('displays enforcers list when navigating to manage enforcement', async () => {
  render(<Page />);
  const manageEnforcementButton = screen.getByText('Manage Enforcement');
  fireEvent.click(manageEnforcementButton);
  await waitFor(() => {
    expect(screen.getByText('Test Enforcer')).toBeDefined();
    expect(screen.getByText('Test Enforcer 2')).toBeDefined();
    expect(screen.getByText('active')).toBeDefined();
    expect(screen.getByText('suspended')).toBeDefined();
  });
});

it('handles enforcer suspension', async () => {
  render(<Page />);
  const manageEnforcementButton = screen.getByText('Manage Enforcement');
  fireEvent.click(manageEnforcementButton);
  await waitFor(() => {
    const suspendButton = screen.getAllByRole('button')[0];
    fireEvent.click(suspendButton);
  });
  await waitFor(() => {
    expect(screen.getByText('active')).toBeDefined();
  });
});

it('navigates to Manage Enforcers section', async () => {
  render(<Page />);
  const manageEnforcementButton = screen.getByText('Manage Enforcement');
  const clickableItem = manageEnforcementButton.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText(/Enforcer Count: \d+/i)).toBeDefined();
  });
});

it('navigates to Statistics section', async () => {
  render(<Page />);
  const statisticsText = screen.getByText('View Statistics');
  const clickableItem = statisticsText.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });
});

it('navigates to Reports section', async () => {
  render(<Page />);
  const reportsText = screen.getByText('Download PDF');
  const clickableItem = reportsText.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText('Number of days', { exact: false })).toBeDefined();
  });
});

it('navigates to API Users section', async () => {
  render(<Page />);
  const apiUsersText = screen.getByText('Manage API Users');
  const clickableItem = apiUsersText.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText('Add API User')).toBeDefined();
  });
});

it('navigates to Manage Zones section', async () => {
  render(<Page />);
  const manageZonesText = screen.getByText('Manage Zones');
  const clickableItem = manageZonesText.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText(/Zone Count: \d+/i)).toBeDefined();
  });
});

it('navigates to Manage Tickets section', async () => {
  render(<Page />);
  const manageChallengesText = screen.getByText('Manage Tickets');
  const clickableItem = manageChallengesText.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText(/Active Challenges:/)).toBeDefined();
  });
});

it('navigates to Manage Lots section', async () => {
  render(<Page />);
  const manageLotsText = screen.getByText('Manage Lots');
  const clickableItem = manageLotsText.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText('Add New Lot')).toBeDefined();
  });
});

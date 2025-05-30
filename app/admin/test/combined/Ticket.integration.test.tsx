import { it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import ViewStatistics from '../../src/app/components/ViewStatistics';
import { 
  getTicketsByEnforcer, 
  getChallengedTickets, 
  acceptTicketChallenge, 
  rejectTicketChallenge,
  getAcceptedTickets,
  getUnpaidTickets
} from '../../src/ticket/actions';

// Mock permit actions
vi.mock('../../src/permit/actions', () => ({
  getPermitReport: vi.fn().mockResolvedValue({
    totalPermits: 100,
    activePermits: 75,
    expiredPermits: 25,
    totalRevenue: 5000,
    zoneBreakdown: [
      { area: 'Zone A', totalPermits: 50 },
      { area: 'Zone B', totalPermits: 50 }
    ],
    lotBreakdown: [
      { area: 'Lot 1', totalPermits: 40 },
      { area: 'Lot 2', totalPermits: 60 }
    ]
  })
}));

const server = setupServer();

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'mock-token' }),
  }),
}));

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">A cool chart.</div>
}));

beforeAll(() => server.listen());
afterAll(() => server.close());
beforeEach(() => {
  server.resetHandlers();
  cleanup();
});

it('successfully displays ticket data from API', async () => {
  const mockTicketData = [
    {
      date: '2024-01-01',
      tickets: [
        { id: '1', created_at: '2024-01-01T10:00:00Z' },
        { id: '2', created_at: '2024-01-01T11:00:00Z' }
      ]
    }
  ];

  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json({
        data: {
          getTicketsByDay: mockTicketData
        }
      });
    })
  );

  render(<ViewStatistics />);
  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
    expect(screen.getByText('Statistics')).toBeDefined();
  });
});

it('handles unauthorized API response', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json(
        { errors: [{ message: 'Unauthorized' }] },
        { status: 401 }
      );
    })
  );

  render(<ViewStatistics />);
  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch ticket data')).toBeDefined();
  });
});

it('handles network errors gracefully', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.error();
    })
  );

  render(<ViewStatistics />);
  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch ticket data')).toBeDefined();
  });
});

it('successfully fetches tickets by enforcer', async () => {
  const mockTicketData = [
    {
      date: '2024-01-01',
      tickets: [
        { id: '1', issuedDate: '2024-01-01T10:00:00Z' },
        { id: '2', issuedDate: '2024-01-01T11:00:00Z' }
      ]
    }
  ];

  server.use(
    http.post('http://localhost:4002/graphql', ({ request }) => {
      return HttpResponse.json({
        data: {
          getTicketsPerDayFromEnforcer: mockTicketData
        }
      });
    })
  );

  const result = await getTicketsByEnforcer('enforcer-123');
  expect(result).toEqual(mockTicketData);
});

it('handles error response from tickets by enforcer endpoint', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json({
        errors: [{ message: 'Failed to fetch enforcer tickets' }]
      });
    })
  );

  await expect(getTicketsByEnforcer('enforcer-123')).rejects.toThrow(
    'Failed to fetch enforcer tickets'
  );
});

it('handles network error when fetching tickets by enforcer', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.error();
    })
  );

  await expect(getTicketsByEnforcer('enforcer-123')).rejects.toThrow();
});

it('successfully fetches challenged tickets', async () => {
  const mockChallengedTickets = [
    {
      id: '1',
      vehicle: 'ABC123',
      enforcer: 'enforcer-1',
      issuedDate: '2024-01-01T10:00:00Z',
      violation: 'Invalid Parking',
      fine: 50.00,
      ticketStatus: 'challenged',
      images: 'image1.jpg',
      note: 'Parked in reserved spot',
      challengeReason: 'I had a valid permit'
    }
  ];

  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json({
        data: {
          getChallengedTickets: mockChallengedTickets
        }
      });
    })
  );

  const result = await getChallengedTickets();
  expect(result).toEqual(mockChallengedTickets);
});

it('successfully accepts a ticket challenge', async () => {
  const mockUpdatedTicket = {
    id: '1',
    ticketStatus: 'accepted',
    violation: 'Invalid Parking',
    fine: 50.00,
    issuedDate: '2024-01-01T10:00:00Z'
  };

  server.use(
    http.post('http://localhost:4002/graphql', ({ request }) => {
      return HttpResponse.json({
        data: {
          acceptTicketChallenge: mockUpdatedTicket
        }
      });
    })
  );

  const result = await acceptTicketChallenge('1');
  expect(result).toEqual(mockUpdatedTicket);
});

it('successfully rejects a ticket challenge', async () => {
  const mockUpdatedTicket = {
    id: '1',
    ticketStatus: 'rejected',
    violation: 'Invalid Parking',
    fine: 50.00,
    issuedDate: '2024-01-01T10:00:00Z'
  };

  server.use(
    http.post('http://localhost:4002/graphql', ({ request }) => {
      return HttpResponse.json({
        data: {
          rejectTicketChallenge: mockUpdatedTicket
        }
      });
    })
  );

  const result = await rejectTicketChallenge('1');
  expect(result).toEqual(mockUpdatedTicket);
});

it('handles error when fetching challenged tickets', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json({
        errors: [{ message: 'Failed to fetch challenged tickets' }]
      });
    })
  );

  await expect(getChallengedTickets()).rejects.toThrow(
    'Failed to fetch challenged tickets'
  );
});

it('handles error when accepting challenge', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json({
        errors: [{ message: 'Failed to accept challenge' }]
      });
    })
  );

  await expect(acceptTicketChallenge('1')).rejects.toThrow(
    'Failed to accept challenge'
  );
});

it('handles error when rejecting challenge', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json({
        errors: [{ message: 'Failed to reject challenge' }]
      });
    })
  );

  await expect(rejectTicketChallenge('1')).rejects.toThrow(
    'Failed to reject challenge'
  );
});

it('successfully fetches accepted tickets', async () => {
  const mockAcceptedTickets = [
    {
      id: '1',
      vehicle: 'ABC123',
      enforcer: 'enforcer-1',
      issuedDate: '2024-01-01T10:00:00Z',
      violation: 'Invalid Parking',
      fine: 50.00,
      ticketStatus: 'accepted',
      images: 'image1.jpg',
      note: 'Parked in reserved spot'
    }
  ];

  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json({
        data: {
          getAcceptedTickets: mockAcceptedTickets
        }
      });
    })
  );

  const result = await getAcceptedTickets();
  expect(result).toEqual(mockAcceptedTickets);
});

it('handles error when fetching accepted tickets', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json({
        errors: [{ message: 'Failed to fetch accepted tickets' }]
      });
    })
  );

  await expect(getAcceptedTickets()).rejects.toThrow(
    'Failed to fetch accepted tickets'
  );
});

it('handles network error when fetching accepted tickets', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.error();
    })
  );

  await expect(getAcceptedTickets()).rejects.toThrow();
});

it('successfully fetches unpaid tickets', async () => {
  const mockUnpaidTickets = [
    {
      id: '1',
      vehicle: 'ABC123',
      enforcer: 'enforcer-1', 
      issuedDate: '2024-01-01T10:00:00Z',
      violation: 'Invalid Parking',
      fine: 50.00,
      ticketStatus: 'unpaid',
      images: 'image1.jpg',
      note: 'Parked in reserved spot'
    }
  ];

  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json({
        data: {
          getUnpaidTickets: mockUnpaidTickets
        }
      });
    })
  );

  const result = await getUnpaidTickets();
  expect(result).toEqual(mockUnpaidTickets);
});

it('handles error when fetching unpaid tickets', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.json({
        errors: [{ message: 'Failed to fetch unpaid tickets' }]
      });
    })
  );

  await expect(getUnpaidTickets()).rejects.toThrow(
    'Failed to fetch unpaid tickets'
  );
});

it('handles network error when fetching unpaid tickets', async () => {
  server.use(
    http.post('http://localhost:4002/graphql', () => {
      return HttpResponse.error();
    })
  );

  await expect(getUnpaidTickets()).rejects.toThrow();
});


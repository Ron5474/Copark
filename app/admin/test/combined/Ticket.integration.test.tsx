import { it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import ViewStatistics from '../../src/app/components/ViewStatistics';
import { getTicketsByEnforcer } from '../../src/ticket/actions';

const server = setupServer();

// Mock next/headers for auth token
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'mock-token' }),
  }),
}));

// Mock react-chartjs-2
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
    expect(screen.getByText('Ticket Statistics')).toBeDefined();
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


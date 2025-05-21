import { it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import ViewStatistics from '../../src/app/components/ViewStatistics';

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
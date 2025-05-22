import { it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import PermitsPerDay from '../../src/app/charts/PermitsPerDay';

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

it('renders permit statistics chart with data', async () => {
  // Mock the GraphQL response
  server.use(
    http.post('http://localhost:4003/graphql', () => {
      return HttpResponse.json({
        data: {
          getPermitStats: [
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
                }
              ]
            }
          ]
        }
      });
    })
  );

  render(<PermitsPerDay />);

  // Chart should render after data loads
  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });
});

it('handles error when fetching permit data', async () => {
  // Mock error response
  server.use(
    http.post('http://localhost:4003/graphql', () => {
      return HttpResponse.json({
        errors: [{ message: 'Failed to fetch permits' }]
      });
    })
  );

  render(<PermitsPerDay />);

  // Should show error message
  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch permit data')).toBeDefined();
  });
});


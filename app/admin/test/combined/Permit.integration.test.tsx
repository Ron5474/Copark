import { it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import PermitsPerDay from '../../src/app/charts/PermitsPerDay';
import ManageZones from '../../src/app/components/ManageZones';
import { ThemeProvider } from '@mui/material';
import theme from '../../src/app/theme';

// Mock data
const mockZones = [
  {
    zone: "1",
    hourly: 2.50,
    maxDuration: { hours: 2, minutes: 0 },
    openTime: "08:00",
    closeTime: "18:00"
  }
];

// Track current state
let zonesData = [...mockZones];

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">A cool chart.</div>
}));

beforeAll(() => {
  mockFetch.mockImplementation(async (url, options) => {
    if (url === 'http://localhost:4003/graphql') {
      const body = JSON.parse(options?.body as string);
      
      if (body.query.includes('getZones')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { getZones: zonesData } })
        });
      }

      if (body.query.includes('createZone')) {
        const newZone = {
          ...body.variables.input,
          hourly: body.variables.input.weekday.hourly,
          maxDuration: body.variables.input.weekday.maxDuration,
          openTime: body.variables.input.weekday.openTime,
          closeTime: body.variables.input.weekday.closeTime
        };
        zonesData.push(newZone);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { createZone: true } })
        });
      }

      if (body.query.includes('getPermitStats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
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
                }
              ]
            }
          })
        });
      }
    }

    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  zonesData = [...mockZones]; // Reset data before each test
  vi.mock('next/headers', () => ({
    cookies: () => ({
      get: (name: string) => {
        if (name === 'session') {
          return {
            name: 'session',
            value: 'mock-auth-token',
            path: '/',
            expires: new Date(Date.now() + 86400000).toISOString(),
          };
        }
        return null;
      },
      getAll: () => [{
        name: 'session',
        value: 'mock-auth-token',
        path: '/',
        expires: new Date(Date.now() + 86400000).toISOString(),
      }],
    }),
  }));
});

it('renders permit statistics chart with data', async () => {
  render(<PermitsPerDay />);

  // Chart should render after data loads
  await waitFor(() => {
    expect(screen.getByTestId('mock-chart')).toBeDefined();
  });
});

it('handles error when fetching permit data', async () => {
  // Mock error response
  mockFetch.mockImplementationOnce(async (url, options) => {
    if (url === 'http://localhost:4003/graphql') {
      const body = JSON.parse(options?.body as string);
      
      if (body.query.includes('getPermitStats')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            errors: [{ message: 'Failed to fetch permits' }]
          })
        });
      }
    }

    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });

  render(<PermitsPerDay />);

  // Should show error message
  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch permit data')).toBeDefined();
  });
});

it('successfully creates a new zone', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  // Open create dialog
  fireEvent.click(screen.getByText('Add New Zone'));

  // Fill in form
  fireEvent.change(screen.getByLabelText('Zone Number'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Hourly Rate'), { target: { value: '4.50' } });
  fireEvent.change(screen.getByLabelText('Max Hours'), { target: { value: '2' } });
  fireEvent.change(screen.getByLabelText('Max Minutes'), { target: { value: '30' } });
  fireEvent.change(screen.getByLabelText('Open Time'), { target: { value: '09:00' } });
  fireEvent.change(screen.getByLabelText('Close Time'), { target: { value: '17:00' } });

  // Submit form
  fireEvent.click(screen.getByText('Create'));

  // Dialog should close after successful creation
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

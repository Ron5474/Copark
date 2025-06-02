import { it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import PermitsPerDay from '../../src/app/charts/PermitsPerDay';
import ManageZones from '../../src/app/components/ManageZones';
import { ThemeProvider } from '@mui/material';
import theme from '../../src/app/theme';
import AllPermitsTable from '@/app/charts/AllPermitsTable';
import PermitStatsByZone from '@/app/charts/PermitStatsByZone';
import PermitStatsByLot from '@/app/charts/PermitStatsByLot';
import ViewStatistics from '@/app/components/ViewStatistics';

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
  Line: () => <div data-testid="mock-line-chart">A cool line chart.</div>,
  Bar: () => <div data-testid="mock-bar-chart">A cool bar chart.</div>
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

      if (body.query.includes('allPermits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              allPermits: [
                {
                  type: 'zone',
                  area: 'A1',
                  purchaseDate: '2025-05-19T10:00:00Z',
                  activeDate: '2025-05-19T10:00:00Z',
                  expireDate: '2025-05-19T22:00:00Z'
                }
              ]
            }
          })
        });
      }

      if (body.query.includes('allZoneStats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              allZoneStats: [
                { area: '1', totalPermits: 10 },
                { area: '2', totalPermits: 5 }
              ]
            }
          })
        });
      }

      if (body.query.includes('allLotStats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              allLotStats: [
                { area: 'A', totalPermits: 10 },
                { area: 'B', totalPermits: 5 }
              ]
            }
          })
        });
      }

      if (body.query.includes('adminPermitReport')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              adminPermitReport: {
                totalPermits: 100,
                activePermits: 75,
                expiredPermits: 25,
                totalRevenue: 5000,
                zoneBreakdown: [
                  { area: '1', totalPermits: 10 },
                  { area: '2', totalPermits: 5 }
                ],
                lotBreakdown: [
                  { area: 'A', totalPermits: 10 },
                  { area: 'B', totalPermits: 5 }
                ]
              }
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
    expect(screen.getByTestId('mock-line-chart')).toBeDefined();
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

it('shows loading state while fetching permits', async () => {
  // Add delay to mock loading state
  mockFetch.mockImplementationOnce(async (url, options) => {
    if (url === 'http://localhost:4003/graphql') {
      const body = JSON.parse(options?.body as string);
      if (body.query.includes('getPermitStats')) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: { getPermitStats: [] }
          })
        });
      }
    }
    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });

  render(<PermitsPerDay />);
  expect(screen.getByText('Loading...')).toBeDefined();
});

it('successfully fetches and displays all permits', async () => {
  const mockPermitData = [
    {
      type: 'zone',
      area: 'A1',
      purchaseDate: '2025-05-19T10:00:00Z',
      activeDate: '2025-05-19T10:00:00Z',
      expireDate: '2025-05-19T22:00:00Z'
    }
  ];

  mockFetch.mockImplementationOnce(async (url, options) => {
    if (url === 'http://localhost:4003/graphql') {
      const body = JSON.parse(options?.body as string);
      if (body.query.includes('allPermits')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: { allPermits: mockPermitData }
          })
        });
      }
    }
    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });

  render(<AllPermitsTable />);

  // Check loading state
  expect(screen.getByText('Loading...')).toBeDefined();

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText('All Permits (Active Only)')).toBeDefined();
    expect(screen.getByText('zone')).toBeDefined();
    expect(screen.getByText('A1')).toBeDefined();
  });

  // Test active/all toggle
  const toggle = screen.getByRole('checkbox');
  fireEvent.click(toggle);

  await waitFor(() => {
    expect(screen.getByText('All Permits (All)')).toBeDefined();
  });
});

it('handles error when fetching all permits', async () => {
  mockFetch.mockImplementationOnce(async (url, options) => {
    if (url === 'http://localhost:4003/graphql') {
      const body = JSON.parse(options?.body as string);
      if (body.query.includes('allPermits')) {
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

  render(<AllPermitsTable />);

  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch permit data')).toBeDefined();
  });
});

it('successfully fetches and displays zone permit statistics', async () => {
  const mockZoneStats = [
    { area: '1', totalPermits: 10 },
    { area: '2', totalPermits: 5 }
  ];

  mockFetch.mockImplementationOnce(async (url, options) => {
    if (url === 'http://localhost:4003/graphql') {
      const body = JSON.parse(options?.body as string);
      if (body.query.includes('allZoneStats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: { allZoneStats: mockZoneStats }
          })
        });
      }
    }
    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });

  render(<PermitStatsByZone />);

  // Wait for data to load and chart to display
  await waitFor(() => {
    expect(screen.getByTestId('mock-bar-chart')).toBeDefined();
  });
});

it('successfully fetches and displays lot permit statistics', async () => {
  const mockLotStats = [
    { area: 'A', durationType: 'daily', totalPermits: 10 },
    { area: 'B', durationType: 'yearly', totalPermits: 5 }
  ];

  mockFetch.mockImplementationOnce(async (url, options) => {
    if (url === 'http://localhost:4003/graphql') {
      const body = JSON.parse(options?.body as string);
      if (body.query.includes('allLotStats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: { allLotStats: mockLotStats }
          })
        });
      }
    }
    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });

  render(<PermitStatsByLot />);

  // Wait for data to load and chart to display
  await waitFor(() => {
    expect(screen.getByTestId('mock-bar-chart')).toBeDefined();
  });
});

it('successfully fetches and displays permit report statistics', async () => {
  const mockPermitReport = {
    totalPermits: 100,
    activePermits: 75,
    expiredPermits: 25,
    totalRevenue: 5000,
    zoneBreakdown: [
      { area: '1', totalPermits: 10 },
      { area: '2', totalPermits: 5 }
    ],
    lotBreakdown: [
      { area: 'A', totalPermits: 10 },
      { area: 'B', totalPermits: 5 }
    ]
  };

  mockFetch.mockImplementationOnce(async (url, options) => {
    if (url === 'http://localhost:4003/graphql') {
      const body = JSON.parse(options?.body as string);
      if (body.query.includes('adminPermitReport')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: { adminPermitReport: mockPermitReport }
          })
        });
      }
    }
    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });

  render(<ViewStatistics />);

  // Wait for data to load and verify summary statistics
  await waitFor(() => {
    expect(screen.getByText('Total Permits')).toBeDefined();
    expect(screen.getByText('Active Permits')).toBeDefined();
    expect(screen.getByText('Expired Permits')).toBeDefined();
    expect(screen.getByText('Total Revenue ($)')).toBeDefined();
  });
});

it('successfully updates zone price and details', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  // Wait for initial zone data to load
  await waitFor(() => {
    expect(screen.getByText('Zone 1')).toBeDefined();
  });

  // Click edit button on the first zone
  fireEvent.click(screen.getByText('Edit'));

  // Update zone details
  fireEvent.change(screen.getByLabelText('Hourly Rate'), { target: { value: '3.50' } });
  fireEvent.change(screen.getByLabelText('Max Hours'), { target: { value: '3' } });
  fireEvent.change(screen.getByLabelText('Max Minutes'), { target: { value: '30' } });
  fireEvent.change(screen.getByLabelText('Open Time'), { target: { value: '07:00' } });
  fireEvent.change(screen.getByLabelText('Close Time'), { target: { value: '19:00' } });

  // Add mock implementation for updateZonePrice
  mockFetch.mockImplementationOnce(async (url, options) => {
    if (url === 'http://localhost:4003/graphql') {
      const body = JSON.parse(options?.body as string);
      
      if (body.query.includes('updateZonePrice')) {
        const updatedZone = body.variables.input;
        zonesData = zonesData.map(zone => 
          zone.zone === updatedZone.zone ? {
            ...zone,
            hourly: updatedZone.hourly,
            maxDuration: updatedZone.maxDuration,
            openTime: updatedZone.openTime,
            closeTime: updatedZone.closeTime
          } : zone
        );

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              updateZonePrice: [{
                zone: updatedZone.zone,
                hourly: updatedZone.hourly,
                maxDuration: updatedZone.maxDuration,
                openTime: updatedZone.openTime,
                closeTime: updatedZone.closeTime
              }]
            }
          })
        });
      }
    }
    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });

  // Submit update
  fireEvent.click(screen.getByText('Update'));

  // Dialog should close after successful update
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // Updated values should be visible in the zone list
  await waitFor(() => {
    expect(screen.getByText('$3.5/hour')).toBeDefined();
    expect(screen.getByText('3h 30m')).toBeDefined();
    expect(screen.getByText('07:00 - 19:00')).toBeDefined();
  });
});

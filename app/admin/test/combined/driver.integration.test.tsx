import { it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

// Add router mock before other imports
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn()
  }))
}));

import ManageDrivers from '../../src/app/components/ManageDrivers';

// Mock data
const mockDrivers = [{
  id: '1',
  name: 'Driver 2',
  email: 'driver2@example.com',
  accountStatus: 'active'
}];

// Track deleted state
let driversData = [...mockDrivers];

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeAll(() => {
  // Configure fetch mock for different endpoints
  mockFetch.mockImplementation(async (url, options) => {
    // Auth login endpoint
    if (url === 'http://localhost:3010/api/v0/auth/login') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'mock-auth-token' })
      });
    }

    // GraphQL endpoint
    if (url === 'http://localhost:4000/graphql') {
      const body = JSON.parse(options?.body as string);
      
      if (body.query.includes('getDrivers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { getDrivers: driversData } })
        });
      }

      if (body.query.includes('suspendUser')) {
        // Update both data sources
        driversData[0].accountStatus = 'suspended';
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { suspendUser: driversData } })
        });
      }

      if (body.query.includes('reinstateUser')) {
        // Update both data sources
        driversData[0].accountStatus = 'active';
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { reinstateUser: driversData } })
        });
      }

      if (body.query.includes('deleteUser')) {
        driversData = []; // Clear drivers after deletion
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { deleteUser: mockDrivers } })
        });
      }
    }

    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();

  driversData = [...mockDrivers]; // Reset data before each test

  // Mock next/headers
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

it('should suspend and reinstate the driver', async () => {
  render(<ManageDrivers onNavigate={() => { }} />);

  // Wait for driver list to load
  const driverElement = await waitFor(() => {
    const element = screen.getByText('Driver 2').closest('[data-testid="driver-item"]');
    expect(element).toBeDefined();
    return element;
  });

  // Find and click suspend button 
  const suspendButton = driverElement?.querySelector('[aria-label="Suspend user"]');
  expect(suspendButton).toBeDefined();
  fireEvent.click(suspendButton as HTMLElement);

  // Verify suspension
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/graphql',
      expect.objectContaining({
        body: expect.stringContaining('suspendUser')
      })
    );
  });

  driversData = [{
    ...mockDrivers[0],
    accountStatus: 'suspended'
  }];

  cleanup();
  render(<ManageDrivers onNavigate={() => { }} />);

  // Wait for status update
  await waitFor(() => {
    const statusElement = screen.getByText('suspended');
    expect(statusElement).toBeDefined();
  });

  // Find restore button after status change using aria-label
  const restoreButton = await waitFor(() => 
    screen.getByRole('button', { name: /restore user/i })
  );
  expect(restoreButton).toBeDefined();
  fireEvent.click(restoreButton);

  // Update driversData again after restore
  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/graphql',
      expect.objectContaining({
        body: expect.stringContaining('reinstateUser')
      })
    );
  });
  
  driversData = [{
    ...mockDrivers[0],
    accountStatus: 'active'
  }];
  cleanup();
  render(<ManageDrivers onNavigate={() => { }} />);

  // Verify final state
  await waitFor(() => {
    const status = screen.getByText('active');
    expect(status).toBeDefined();
  });
}, 15000);

it('should delete the driver', async () => {
  render(<ManageDrivers onNavigate={() => { }} />);

  // Wait for driver list to load
  const driverElement = await waitFor(() => {
    const element = screen.getByText('Driver 2').closest('[data-testid="driver-item"]');
    expect(element).toBeDefined();
    return element;
  });

  // Verify initial fetch
  expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/graphql', 
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Authorization': 'Bearer mock-auth-token'
      })
    })
  );

  // Test delete
  const deleteButton = driverElement?.querySelector('[aria-label="Delete user"]');
  expect(deleteButton).toBeDefined();
  fireEvent.click(deleteButton as HTMLElement);

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:4000/graphql',
      expect.objectContaining({
        body: expect.stringContaining('deleteUser')
      })
    );
  });

  await waitFor(() => {
    expect(screen.queryByText('Driver 2')).toBeNull();
  });
});
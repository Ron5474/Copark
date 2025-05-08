import { it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ManageDrivers from '../../src/app/components/ManageDrivers';

let authToken = '';

beforeAll(async () => {
  authToken = await getAuthToken();
}, 50000);

const testUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
};

const getAuthToken = async () => {
  const response = await fetch('http://localhost:3010/api/v0/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testUser),
  });

  if (!response.ok) {
    throw new Error('Failed to get auth token');
  }

  const data = await response.json();
  return data.id;
};

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  (useRouter as any).mockReturnValue({ push: vi.fn() });

  vi.mock('next/headers', () => ({
    cookies: () => ({
      get: (name: string) => {
        if (name === 'session') {
          return {
            name: 'session',
            value: authToken,
            path: '/',
            expires: new Date(Date.now() + 86400000).toISOString(),
          };
        }
        return null;
      },
      getAll: () => [{
        name: 'session',
        value: authToken,
        path: '/',
        expires: new Date(Date.now() + 86400000).toISOString(),
      }],
    }),
  }));
});

const TEST_DRIVER = {
  name: 'Driver 2',
};

it('should suspend and reinstate the driver', async () => {
  render(<ManageDrivers onNavigate={() => { }} />);

  const driverElement = await waitFor(() => {
    const element = screen.getByText(TEST_DRIVER.name)
      .closest('[data-testid="driver-item"]');
    expect(element).toBeDefined();
    return element;
  });

  const suspendButton = driverElement?.querySelector('[aria-label="Suspend user"]');
  expect(suspendButton).toBeDefined();
  fireEvent.click(suspendButton as HTMLElement);

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const restoreButton = driverElement?.querySelector('[aria-label="Restore user"]');
  expect(restoreButton).toBeDefined();
  fireEvent.click(restoreButton as HTMLElement);
}, 20000);

it('should delete the driver', async () => {
  render(<ManageDrivers onNavigate={() => { }} />);

  const driverElement = await waitFor(() => {
    const element = screen.getByText(TEST_DRIVER.name)
      .closest('[data-testid="driver-item"]');
    expect(element).toBeDefined();
    return element;
  });

  const deleteButton = driverElement?.querySelector('[aria-label="Delete user"]');
  expect(deleteButton).toBeDefined();
  fireEvent.click(deleteButton as HTMLElement);

  await waitFor(() => {
    expect(screen.queryByText(TEST_DRIVER.name)).toBeNull();
  });
}, 20000);
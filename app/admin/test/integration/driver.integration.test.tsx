import { it, expect, vi, beforeEach, describe, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { execSync } from 'child_process';
import path from 'path';
import ManageDrivers from '../../src/app/components/ManageDrivers';


const rootDir = path.resolve(__dirname, '../../../../');
let authToken = '';

beforeAll(async () => {
  // try {
  //   console.log('Starting Docker containers...');
  //   execSync('docker compose down', { cwd: rootDir });
  //   execSync('docker compose up -d', { cwd: rootDir });

  //   await new Promise(resolve => setTimeout(resolve, 10000));
  // } catch (error) {
  //   console.error('Error setting up Docker:', error);
  //   throw error;
  // }

  authToken = await getAuthToken();
}, 50000);

afterAll(() => {
  // try {
  //   console.log('Stopping Docker containers...');
  //   execSync('docker compose down', { cwd: rootDir });
  // } catch (error) {
  //   console.error('Error tearing down Docker:', error);
  // }
});

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

  await waitFor(() => {
    expect(driverElement?.innerHTML).contains('suspended');
  });

  const restoreButton = driverElement?.querySelector('[aria-label="Restore user"]');
  expect(restoreButton).toBeDefined();
  fireEvent.click(restoreButton as HTMLElement);

  await waitFor(() => {
    expect(driverElement?.innerHTML).contains('active');
  });
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
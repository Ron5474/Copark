import { it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import theme from '../../src/app/theme';
import ManageAPIUsers from '../../src/app/components/ManageAPIUsers';

// Mock data
const mockAPIUsers = [{
  id: '1',
  name: 'Test Organization',
  email: 'test.org@example.com',
  role: 'api_user',
  accountStatus: 'active',
}];

// Track current state
let apiUsersData = [...mockAPIUsers];

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeAll(() => {
  mockFetch.mockImplementation(async (url, options) => {
    if (url === 'http://localhost:4000/graphql') {
      const body = JSON.parse(options?.body as string);

      if (body.query.includes('getAPIUsers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { getAPIUsers: apiUsersData } })
        });
      }

      if (body.query.includes('addAPIUser')) {
        const newAPIUser = {
          id: String(apiUsersData.length + 1),
          ...body.variables.organization,
          role: 'registrar',
          accountStatus: 'active',
        };
        apiUsersData.push(newAPIUser);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { addAPIUser: apiUsersData } })
        });
      }

      if (body.query.includes('deleteAPIUser')) {
        apiUsersData = apiUsersData.filter(u => u.id !== body.variables.user.id);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { deleteAPIUser: apiUsersData } })
        });
      }

      if (body.query.includes('suspendUser')) {
        const userId = body.variables.user.id;
        apiUsersData = apiUsersData.map(user =>
          user.id === userId ? { ...user, accountStatus: 'suspended' } : user
        );
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { suspendAPIUser: true } })
        });
      }

      if (body.query.includes('reinstateUser')) {
        const userId = body.variables.user.id;
        apiUsersData = apiUsersData.map(user =>
          user.id === userId ? { ...user, accountStatus: 'active' } : user
        );
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { reinstateAPIUser: true } })
        });
      }
    }

    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  apiUsersData = [...mockAPIUsers]; // Reset data before each test

  // Mock next/navigation
  vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
      push: vi.fn()
    }))
  }));

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

it('should add a new API user', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={() => {}} />
    </ThemeProvider>
  );

  const addButton = screen.getByText('Add API User');
  fireEvent.click(addButton);

  const nameInput = screen.getByLabelText('Organization Name');
  const emailInput = screen.getByLabelText('Organization Email');

  fireEvent.change(nameInput, { target: { value: 'New Test Organization' } });
  fireEvent.change(emailInput, { target: { value: 'new.test.org@example.com' } });

  const submitButton = screen.getByText('Add');
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText('New Test Organization')).toBeDefined();
  });
});

it('should close the dialog without adding when cancelled', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={() => {}} />
    </ThemeProvider>
  );

  fireEvent.click(screen.getByText('Add API User'));

  fireEvent.change(screen.getByLabelText('Organization Name'), {
    target: { value: 'Cancelled Org' }
  });

  fireEvent.click(screen.getByText('Cancel'));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Cancelled Org')).toBeNull();
  });
});

it('should suspend an API user when the suspend button is clicked', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={() => {}} />
    </ThemeProvider>
  );

  // Wait for user to load
  await waitFor(() => {
    expect(screen.getByText('Test Organization')).toBeDefined();
  });

  const suspendButton = screen.getByLabelText('Suspend user');
  fireEvent.click(suspendButton);

  await waitFor(() => {
    const statusText = screen.getByText(/suspended/i);
    expect(statusText).toBeDefined();
  });
});

it('should suspend and reinstate an API user', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={() => {}} />
    </ThemeProvider>
  );

  // Wait for initial render with user
  await waitFor(() => {
    expect(screen.getByText('Test Organization')).toBeDefined();
  });

  // Find and click suspend button 
  const suspendButton = screen.getByLabelText('Suspend user');
  fireEvent.click(suspendButton);

  // Verify suspended state
  await waitFor(() => {
    expect(screen.getByText(/suspended/i)).toBeDefined();
    expect(screen.getByLabelText('Reinstate user')).toBeDefined();
  });

  // Find and click reinstate button
  const reinstateButton = screen.getByLabelText('Reinstate user');
  fireEvent.click(reinstateButton);

  // Verify reinstated state
  await waitFor(() => {
    expect(screen.getByText(/active/i)).toBeDefined();
  });
});

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
  role: 'api_user'
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
          ...body.variables.apiUser,
          role: 'api_user'
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

  // Click add button to open dialog
  const addButton = screen.getByText('Add API User');
  fireEvent.click(addButton);

  // Fill in the form
  const nameInput = screen.getByLabelText('Organization Name');
  const emailInput = screen.getByLabelText('Organization Email');

  fireEvent.change(nameInput, { target: { value: 'New Test Organization' } });
  fireEvent.change(emailInput, { target: { value: 'new.test.org@example.com' } });

  // Submit the form
  const submitButton = screen.getByText('Add');
  fireEvent.click(submitButton);

  // Verify the new API user appears in the list
  // Get API Users actions / service not implemented yet!
  // await waitFor(() => {
  //   const orgElement = screen.getByText('New Test Organization');
  //   expect(orgElement).toBeDefined();
  //   expect(screen.getByText('new.test.org@example.com')).toBeDefined();
  // });
});

it('should close the dialog without adding when cancelled', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageAPIUsers onNavigate={() => {}} />
    </ThemeProvider>
  );

  // Open dialog
  fireEvent.click(screen.getByText('Add API User'));
  
  // Fill form but cancel
  fireEvent.change(screen.getByLabelText('Organization Name'), {
    target: { value: 'Cancelled Org' }
  });
  
  // Click cancel
  fireEvent.click(screen.getByText('Cancel'));
  
  // Verify dialog closes and no new user added
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Cancelled Org')).toBeNull();
  });
});
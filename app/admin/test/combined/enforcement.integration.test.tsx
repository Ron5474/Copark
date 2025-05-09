import { it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ManageEnforcement from '../../src/app/components/ManageEnforcement';

// Mock data
const mockEnforcers = [{
  id: '1',
  name: 'Test Enforcer',  // Changed name to avoid duplicates
  email: 'test.enforcer@copark.com',
  accountStatus: 'active'
}];

// Track current state
let enforcersData = [...mockEnforcers];

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeAll(() => {
  mockFetch.mockImplementation(async (url, options) => {
    if (url === 'http://localhost:4000/graphql') {
      const body = JSON.parse(options?.body as string);
      
      if (body.query.includes('getEnforcers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { getEnforcers: enforcersData } })
        });
      }

      if (body.query.includes('addEnforcer')) {
        const newEnforcer = {
          id: String(enforcersData.length + 1),
          ...body.variables.enforcer,
          accountStatus: 'active'
        };
        enforcersData.push(newEnforcer);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { addEnforcer: enforcersData } })
        });
      }

      if (body.query.includes('suspendUser')) {
        enforcersData = enforcersData.map(e => 
          e.id === body.variables.user.id ? {...e, accountStatus: 'suspended'} : e
        );
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { suspendUser: enforcersData } })
        });
      }

      if (body.query.includes('reinstateUser')) {
        enforcersData = enforcersData.map(e => 
          e.id === body.variables.user.id ? {...e, accountStatus: 'active'} : e
        );
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { reinstateUser: enforcersData } })
        });
      }

      if (body.query.includes('deleteUser')) {
        enforcersData = enforcersData.filter(e => e.id !== body.variables.user.id);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { deleteUser: enforcersData } })
        });
      }
    }

    return Promise.reject(new Error(`Unhandled fetch to ${url}`));
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  enforcersData = [...mockEnforcers]; // Reset data before each test

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

it('should add a new enforcer', async () => {
  render(<ManageEnforcement onNavigate={() => { }} />);

  const addButton = screen.getByText('Add Enforcer');
  fireEvent.click(addButton);

  const nameInput = screen.getByLabelText('Name');
  const emailInput = screen.getByLabelText('Email');

  fireEvent.change(nameInput, { target: { value: 'New Test Enforcer' } }); // Different name
  fireEvent.change(emailInput, { target: { value: 'new.test@copark.com' } });

  const submitButton = screen.getByText('Add');
  fireEvent.click(submitButton);

  await waitFor(() => {
    const enforcerElement = screen.getByText('New Test Enforcer');
    expect(enforcerElement).toBeDefined();
    const statusElement = enforcerElement.parentElement?.querySelector('p:last-child');
    expect(statusElement?.textContent).toBe('active');
  });
});

it('should suspend and reinstate the enforcer', async () => {
  render(<ManageEnforcement onNavigate={() => { }} />);

  // Wait for initial render
  const enforcerElement = await waitFor(() => {
    const element = screen.getByText('Test Enforcer').closest('[data-testid="enforcer-item"]');
    expect(element).toBeDefined();
    return element;
  });

  // Find and click suspend button
  const suspendButton = enforcerElement?.querySelector('[aria-label="Suspend user"]');
  expect(suspendButton).toBeDefined();
  fireEvent.click(suspendButton as HTMLElement);

  // Wait for status to update
  await waitFor(() => {
    const statusElement = screen.getByText('suspended');
    expect(statusElement).toBeDefined();
  });

  // Find restore button after status change
  const restoreButton = enforcerElement?.querySelector('[aria-label="Restore user"]');
  expect(restoreButton).toBeDefined();
  fireEvent.click(restoreButton as HTMLElement);

  // Verify status returns to active
  await waitFor(() => {
    const statusElement = screen.getByText('active');
    expect(statusElement).toBeDefined();
  });
});

it('should delete the enforcer', async () => {
  render(<ManageEnforcement onNavigate={() => { }} />);

  const enforcerElement = await waitFor(() => {
    const element = screen.getByText('Test Enforcer').closest('[data-testid="enforcer-item"]');
    expect(element).toBeDefined();
    return element;
  });

  const deleteButton = enforcerElement?.querySelector('[aria-label="Delete user"]');
  expect(deleteButton).toBeDefined();
  fireEvent.click(deleteButton as HTMLElement);

  await waitFor(() => {
    expect(screen.queryByText('Test Enforcer')).toBeNull();
  });   
});
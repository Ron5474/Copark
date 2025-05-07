import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ManageEnforcement from '../../src/app/components/ManageEnforcement';

const testUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
};

const getAuthToken = async () => {
  const response = await fetch('http://localhost:8000/api/v0/auth/login', {
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

const authToken = await getAuthToken();

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

const TEST_ENFORCER = {
  name: 'Alpha Enforcer Omega Sigma',  
  email: 'test.enforcer@copark.com'
};

it('should add a new enforcer', async () => {
  render(<ManageEnforcement onNavigate={() => { }} />);

  const addButton = screen.getByText('Add Enforcer');
  fireEvent.click(addButton);

  const nameInput = screen.getByLabelText('Name');
  const emailInput = screen.getByLabelText('Email');

  fireEvent.change(nameInput, { target: { value: TEST_ENFORCER.name } });
  fireEvent.change(emailInput, { target: { value: TEST_ENFORCER.email } });

  const submitButton = screen.getByText('Add');
  fireEvent.click(submitButton);

  // Verify user appears in the list with active status
  await waitFor(() => {
    const enforcerElement = screen.getByText(TEST_ENFORCER.name).closest('[data-testid="enforcer-item"]');
    expect(enforcerElement).toBeDefined();
    expect(enforcerElement?.innerHTML).contains('active');
  });
}, 20000);

it('should suspend and reinstate the enforcer', async () => {
  render(<ManageEnforcement onNavigate={() => { }} />);

  const enforcerElement = await waitFor(() => {
    const element = screen.getByText(TEST_ENFORCER.name).closest('[data-testid="enforcer-item"]');
    expect(element).toBeDefined();
    return element;
  });

  const suspendButton = enforcerElement?.querySelector('[aria-label="Suspend user"]');
  expect(suspendButton).toBeDefined();
  fireEvent.click(suspendButton as HTMLElement);

  await waitFor(() => {
    expect(enforcerElement?.innerHTML).contains('suspended');
  });

  const restoreButton = enforcerElement?.querySelector('[aria-label="Restore user"]');
  expect(restoreButton).toBeDefined();
  fireEvent.click(restoreButton as HTMLElement);

  await waitFor(() => {
    expect(enforcerElement?.innerHTML).contains('active');
  });
}, 20000);

it('should delete the enforcer', async () => {
  render(<ManageEnforcement onNavigate={() => { }} />);

  const enforcerElement = await waitFor(() => {
    const element = screen.getByText(TEST_ENFORCER.name).closest('[data-testid="enforcer-item"]');
    expect(element).toBeDefined();
    return element;
  });

  const deleteButton = enforcerElement?.querySelector('[aria-label="Delete user"]');
  expect(deleteButton).toBeDefined();
  fireEvent.click(deleteButton as HTMLElement);

  await waitFor(() => {
    expect(screen.queryByText(TEST_ENFORCER.name)).toBeNull();
  });   
}, 20000);
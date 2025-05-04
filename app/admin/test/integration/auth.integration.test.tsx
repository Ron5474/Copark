import { it, expect, vi, beforeEach, describe } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Page from '../../src/app/login/page';
import Layout from '../../src/app/components/Layout';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@mui/icons-material', () => ({
  Visibility: () => <span>Visibility</span>,
  VisibilityOff: () => <span>VisibilityOff</span>,
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    delete: vi.fn(),
  })),
}));

const mockRouter = {
  push: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (useRouter as any).mockReturnValue(mockRouter);
  window.sessionStorage.clear();
  cleanup();
});

const jason = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
  name: 'Jason Xiong'
}

it('renders login form with all required elements', () => {
  render(<Page />);

  expect(screen.getByLabelText("Email Address")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
  expect(screen.getByRole('button', { name: "Sign In" })).toBeDefined();
});

it('handles successful login', async () => {
  render(<Page />);

  const emailInput = screen.getByLabelText("Email Address").querySelector('input');
  const passwordInput = screen.getByLabelText("Password").querySelector('input');
  const signIn = screen.getByRole('button', { name: "Sign In" });

  if (!emailInput || !passwordInput) {
    throw new Error('Input elements not found');
  }

  fireEvent.change(emailInput, {
    target: { value: jason.email }
  });
  fireEvent.change(passwordInput, {
    target: { value: jason.password }
  });

  fireEvent.click(signIn);

  // Then check for the session storage update and navigation
  await waitFor(() => {
    expect(window.sessionStorage.getItem('name')).toBe(jason.name);
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});

it('handles failed login', async () => {
  render(<Page />);

  const emailInput = screen.getByLabelText("Email Address").querySelector('input');
  const passwordInput = screen.getByLabelText("Password").querySelector('input');
  const signIn = screen.getByRole('button', { name: "Sign In" });

  if (!emailInput || !passwordInput) {
    throw new Error('Input elements not found');
  }

  fireEvent.change(emailInput, {
    target: { value: jason.email }
  });
  fireEvent.change(passwordInput, {
    target: { value: 'wrongpassword' }
  });

  fireEvent.click(signIn);

  // Then check for the session storage and navigation
  await waitFor(() => {
    expect(window.sessionStorage.getItem('name')).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  }, { timeout: 5000 });
});

it('toggles password visibility', () => {
  render(<Page />);

  const passwordInput = screen.getByLabelText("Password").querySelector('input');
  const toggleButton = screen.getByRole('button', { name: "toggle password visibility" });

  if (!passwordInput) {
    throw new Error('Password input not found');
  }

  // Password should be hidden by default
  expect(passwordInput).toHaveProperty('type', 'password');

  // Click toggle button to show password
  fireEvent.click(toggleButton);
  expect(passwordInput).toHaveProperty('type', 'text');

  // Click toggle button again to hide password
  fireEvent.click(toggleButton);
  expect(passwordInput).toHaveProperty('type', 'password');
});

it('handles server error during login', async () => {
  // Mock fetch to simulate a failed response
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    json: async () => ({}),
  });

  render(<Page />);

  const emailInput = screen.getByLabelText("Email Address").querySelector('input');
  const passwordInput = screen.getByLabelText("Password").querySelector('input');
  const signIn = screen.getByRole('button', { name: "Sign In" });

  if (!emailInput || !passwordInput) {
    throw new Error('Input elements not found');
  }

  fireEvent.change(emailInput, {
    target: { value: 'test@example.com' },
  });
  fireEvent.change(passwordInput, {
    target: { value: 'wrongpassword' },
  });

  fireEvent.click(signIn);

  // Wait for the error to be thrown
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3010/api/v0/auth/login',
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

it('handles logout action correctly', async () => {
  render(<Page />);

  const emailInput = screen.getByLabelText("Email Address").querySelector('input');
  const passwordInput = screen.getByLabelText("Password").querySelector('input');
  const signIn = screen.getByRole('button', { name: "Sign In" });

  if (!emailInput || !passwordInput) {
    throw new Error('Input elements not found');
  }

  fireEvent.change(emailInput, {
    target: { value: jason.email },
  });
  fireEvent.change(passwordInput, {
    target: { value: jason.password },
  });

  fireEvent.click(signIn);

  cleanup(); 

  render(<Layout>Test Content</Layout>);

  // Click the logout button
  const logoutButton = screen.getByText("Logout");
  fireEvent.click(logoutButton);

  await waitFor(() => {
    expect(window.sessionStorage.getItem('name')).toBeNull();
  });
});


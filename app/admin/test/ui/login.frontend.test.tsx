import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Page from '../../src/app/login/page';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('../../src/app/login/actions', () => ({
  login: vi.fn(),
}));

vi.mock('@mui/icons-material', () => ({
  Visibility: () => <span>Visibility</span>,
  VisibilityOff: () => <span>VisibilityOff</span>,
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
  const { login } = await import('../../src/app/login/actions');
  (login as any).mockResolvedValueOnce({ name: jason.name });
  
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
  
  await waitFor(() => {
    expect(login).toHaveBeenCalledWith({
      email: jason.email,
      password: jason.password
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});

it('handles failed login', async () => {
  const { login } = await import('../../src/app/login/actions');
  (login as any).mockResolvedValueOnce(undefined);
  
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
  
  await waitFor(() => {
    expect(login).toHaveBeenCalledWith({
      email: jason.email,
      password: 'wrongpassword'
    });
    expect(window.sessionStorage.getItem('name')).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
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


import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Page from '../../src/app/page';

// Mock Next.js navigation and cookies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })
}));

// Mock Material-UI components
vi.mock('@mui/material', () => ({
  ...vi.importActual('@mui/material'),
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Typography: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Paper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => 
    <button onClick={onClick}>{children}</button>,
  IconButton: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => 
    <button onClick={onClick}>{children}</button>,
  AppBar: ({ children }: { children: React.ReactNode }) => <div role="banner">{children}</div>,
  Toolbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Dialog: ({ children, open }: { children: React.ReactNode, open: boolean }) => 
    open ? <div role="dialog">{children}</div> : null,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TextField: ({ label }: { label: string }) => (
    <div>
      <label>{label}</label>
      <input type="text" />
    </div>
  ),
  useTheme: vi.fn(() => ({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' }
    }
  }))
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

it('renders main page with required elements', () => {
  render(<Page />);
  
  expect(screen.getByText("Admin Dashboard")).toBeDefined();
  expect(screen.getByRole('banner')).toBeDefined();
});

it('displays user name from session storage', () => {
  window.sessionStorage.setItem('name', 'Jason Xiong');
  render(<Page />);
  
  expect(screen.getByText(/Logged in as: Jason Xiong/i)).toBeDefined();
});

it('handles navigation to different sections', async () => {
  render(<Page />);
  
  const manageEnforcementButton = screen.getByText('Manage Enforcement');
  fireEvent.click(manageEnforcementButton);

  await waitFor(() => {
    expect(screen.findByText('Manage Enforcer')).toBeDefined(); 
  });
});

it('handles logout action', async () => {
  render(<Page />);
  
  const logoutButton = screen.getByText('Logout');
  fireEvent.click(logoutButton);
  
  await waitFor(() => {
    expect(window.sessionStorage.getItem('name')).toBeNull();
  });
});

it('renders without user name when session is empty', () => {
  render(<Page />);
  
  expect(screen.queryByText(/Jason Xiong/)).toBeNull();
});


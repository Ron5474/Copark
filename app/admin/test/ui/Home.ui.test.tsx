import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Page from '../../src/app/page';


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
  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  InputLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Select: ({ children, value, onChange }: { children: React.ReactNode, value: string, onChange: (e: any) => void }) => (
    <select value={value} onChange={onChange}>{children}</select>
  ),
  MenuItem: ({ children, value }: { children: React.ReactNode, value: string }) => (
    <option value={value}>{children}</option>
  ),
  TableContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHead: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  useTheme: vi.fn(() => ({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' }
    }
  }))
}));


vi.mock('../../src/enforcement/actions', () => ({
  getEnforcers: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'Test Enforcer',
      email: 'test@example.com',
      accountStatus: 'active'
    },
    {
      id: '2',
      name: 'Test Enforcer 2',
      email: 'test2@example.com',
      accountStatus: 'suspended'
    }
  ]),
  addEnforcer: vi.fn(),
  suspendUser: vi.fn()
}));


vi.mock('../../src/driver/actions', () => ({
  getDrivers: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'Driver One',
      email: 'driver1@example.com',
      accountStatus: 'active',
    },
    {
      id: '2',
      name: 'Driver Two',
      email: 'driver2@example.com',
      accountStatus: 'suspended',
    },
  ]),
  suspendUser: vi.fn().mockResolvedValue({}),
  reinstateUser: vi.fn().mockResolvedValue({}),
  deleteUser: vi.fn().mockResolvedValue({}),
}));

const mockRouter = {
  push: vi.fn(),
};

beforeEach(() => {
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

  expect(screen.getByText("Logged in as: Jason Xiong")).toBeDefined();
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

it('displays enforcers list when navigating to manage enforcement', async () => {
  render(<Page />);

  const manageEnforcementButton = screen.getByText('Manage Enforcement');
  fireEvent.click(manageEnforcementButton);

  await waitFor(() => {
    expect(screen.getByText('Test Enforcer')).toBeDefined();
    expect(screen.getByText('Test Enforcer 2')).toBeDefined();
    expect(screen.getByText('active')).toBeDefined();
    expect(screen.getByText('suspended')).toBeDefined();
  });
});

it('handles enforcer suspension', async () => {
  render(<Page />);

  const manageEnforcementButton = screen.getByText('Manage Enforcement');
  fireEvent.click(manageEnforcementButton);

  await waitFor(() => {
    const suspendButton = screen.getAllByRole('button')[0];
    fireEvent.click(suspendButton);
  });


  await waitFor(() => {
    expect(screen.getByText('active')).toBeDefined();
  });
});

it('navigates to Manage Enforcers section', async () => {
  render(<Page />);

  const manageEnforcementButton = screen.getByText('Manage Enforcement');
  fireEvent.click(manageEnforcementButton);

  await waitFor(() => {
    expect(screen.getByText('Manage Enforcers')).toBeDefined();
  });
});

it('navigates to Manage Drivers section', async () => {
  render(<Page />);

  const manageDriversButton = screen.getByText('Manage Drivers');
  fireEvent.click(manageDriversButton);

  await waitFor(() => {
    expect(screen.getByText('Manage Drivers')).toBeDefined();
  });
});

it('navigates to Statistics section', async () => {
  render(<Page />);

  const statisticsButton = screen.getByText('View Statistics');
  fireEvent.click(statisticsButton);

  await waitFor(() => {
    expect(screen.getByText('Statistics Component')).toBeDefined();
  });
});

it('navigates to Reports section', async () => {
  render(<Page />);

  const reportsButton = screen.getByText('Generate Reports');
  fireEvent.click(reportsButton);

  await waitFor(() => {
    expect(screen.getByText('Reports Component')).toBeDefined();
  });
});

it('navigates to API Users section', async () => {
  render(<Page />);

  const apiUsersButton = screen.getByText('Manage API Users');
  fireEvent.click(apiUsersButton);

  await waitFor(() => {
    expect(screen.getByText('Manage API Users')).toBeDefined();
  });
});

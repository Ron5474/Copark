import { it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Page from '../../src/app/page';
import ManageEnforcement from '../../src/app/components/ManageEnforcement';
import { getEnforcers, addEnforcer, suspendUser, reinstateUser, deleteUser } from '../../src/enforcement/actions';

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
  IconButton: ({ 
    children, 
    onClick, 
    'aria-label': ariaLabel 
  }: { 
    children: React.ReactNode, 
    onClick?: () => void,
    'aria-label'?: string 
  }) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  ),
  AppBar: ({ children }: { children: React.ReactNode }) => <div role="banner">{children}</div>,
  Toolbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Dialog: ({ 
    children, 
    open, 
    onClose 
  }: { 
    children: React.ReactNode, 
    open: boolean,
    onClose?: (event: {}, reason: string) => void 
  }) => (
    open ? (
      <div role="dialog">
        <div 
          data-testid="dialog-backdrop" 
          onClick={() => onClose?.({}, 'backdropClick')}
        />
        {children}
      </div>
    ) : null
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TextField: ({ label, onChange }: { label: string, onChange?: (e: any) => void }) => (
    <input data-testid={`input-${label}`} onChange={onChange} />
  ),
  useTheme: vi.fn(() => ({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' }
    }
  }))
}));

// Mock enforcement actions
vi.mock('../../src/enforcement/actions', () => ({
  getEnforcers: vi.fn(),
  addEnforcer: vi.fn(),
  suspendUser: vi.fn(),
  reinstateUser: vi.fn(),
  deleteUser: vi.fn()
}));

const mockRouter = {
  push: vi.fn(),
};

const mockEnforcers = [
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
];

beforeEach(() => {
  vi.clearAllMocks();
  (useRouter as any).mockReturnValue(mockRouter);
  (getEnforcers as Mock).mockResolvedValue(mockEnforcers);
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

it('loads and displays enforcers on mount', async () => {
  render(<ManageEnforcement onNavigate={() => { }} />);

  await waitFor(() => {
    expect(getEnforcers).toHaveBeenCalled();
    expect(screen.getByText('Test Enforcer')).toBeDefined();
    expect(screen.getByText('Test Enforcer 2')).toBeDefined();
  });
});

it('opens add enforcer dialog when clicking add button', async () => {
  render(<ManageEnforcement onNavigate={() => { }} />);

  const addButton = screen.getByText('Add Enforcer');
  fireEvent.click(addButton);

  expect(screen.getByRole('dialog')).toBeDefined();
  expect(screen.getByText('Add New Enforcer')).toBeDefined();
});

it('handles adding a new enforcer', async () => {
  (addEnforcer as Mock).mockResolvedValue([...mockEnforcers, {
    id: '3',
    name: 'New Enforcer',
    email: 'new@example.com',
    accountStatus: 'active'
  }]);

  render(<ManageEnforcement onNavigate={() => { }} />);

  // Open dialog
  fireEvent.click(screen.getByText('Add Enforcer'));

  // Fill form
  fireEvent.change(screen.getByTestId('input-Name'), {
    target: { value: 'New Enforcer' }
  });
  fireEvent.change(screen.getByTestId('input-Email'), {
    target: { value: 'new@example.com' }
  });

  // Submit form
  fireEvent.click(screen.getByText('Add'));

  await waitFor(() => {
    expect(addEnforcer).toHaveBeenCalledWith({
      name: 'New Enforcer',
      email: 'new@example.com'
    });
    expect(getEnforcers).toHaveBeenCalledTimes(2); // Initial + after add
  });
});

it('handles suspending an enforcer', async () => {
  (suspendUser as Mock).mockResolvedValue(mockEnforcers.map(e =>
    e.id === '1' ? { ...e, accountStatus: 'suspended' } : e
  ));

  render(<ManageEnforcement onNavigate={() => { }} />);

  await waitFor(() => {
    const suspendButtons = screen.getAllByRole('button').filter(
      button => button.innerHTML.includes('Gavel')
    );
    fireEvent.click(suspendButtons[0]);
  });

  await waitFor(() => {
    expect(suspendUser).toHaveBeenCalledWith('1');
    expect(getEnforcers).toHaveBeenCalledTimes(2); // Initial + after suspend
  });
});

it('displays correct icon based on enforcer status', async () => {
  render(<ManageEnforcement onNavigate={() => { }} />);

  await waitFor(() => {
    const activeEnforcer = screen.getByText('Test Enforcer').parentElement;
    const suspendedEnforcer = screen.getByText('Test Enforcer 2').parentElement;

    expect(activeEnforcer?.querySelector('[data-testid="GavelIcon"]')).toBeDefined();
    expect(suspendedEnforcer?.querySelector('[data-testid="RestoreIcon"]')).toBeDefined();
  });
});

it('handles navigation back to home', () => {
  const mockNavigate = vi.fn();
  render(<ManageEnforcement onNavigate={mockNavigate} />);

  const homeButton = screen.getByRole('button', { name: 'Go to Home' });
  fireEvent.click(homeButton);

  expect(mockNavigate).toHaveBeenCalledWith('home');
});

it('closes add enforcer dialog when clicking cancel', async () => {
  render(<ManageEnforcement onNavigate={() => {}} />);

  // Open dialog
  const addButton = screen.getByText('Add Enforcer');
  fireEvent.click(addButton);

  // Verify dialog is open
  expect(screen.getByRole('dialog')).toBeDefined();
  
  // Click cancel button
  const cancelButton = screen.getByText('Cancel');
  fireEvent.click(cancelButton);

  // Verify dialog is closed
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

it('closes add enforcer dialog when clicking outside', async () => {
  render(<ManageEnforcement onNavigate={() => {}} />);

  // Open dialog
  const addButton = screen.getByText('Add Enforcer');
  fireEvent.click(addButton);

  // Verify dialog is open
  expect(screen.getByRole('dialog')).toBeDefined();
  
  // Click the backdrop to simulate clicking outside
  const backdrop = screen.getByTestId('dialog-backdrop');
  fireEvent.click(backdrop);
  
  // Verify dialog is closed
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

it('handles reinstating a suspended enforcer', async () => {
  // Mock the reinstate response
  (reinstateUser as Mock).mockResolvedValue(mockEnforcers.map(e =>
    e.id === '2' ? { ...e, accountStatus: 'active' } : e
  ));

  render(<ManageEnforcement onNavigate={() => {}} />);

  // Wait for component to load
  await waitFor(() => {
    expect(screen.getByText('Test Enforcer 2')).toBeDefined();
  });

  // Find the restore button using aria-label
  const restoreButton = screen.getByRole('button', { name: 'Restore user' });
  
  // Click the restore button
  fireEvent.click(restoreButton);

  // Verify the reinstate action was called with correct ID
  await waitFor(() => {
    expect(reinstateUser).toHaveBeenCalledWith('2');
    expect(getEnforcers).toHaveBeenCalledTimes(2);
  });
});

it('deletes an enforcer and removes them from display', async () => {
  // Mock initial state and after deletion state
  (getEnforcers as Mock).mockResolvedValueOnce(mockEnforcers)
    .mockResolvedValueOnce(mockEnforcers.filter(e => e.id !== '1'));
  
  render(<ManageEnforcement onNavigate={() => {}} />);

  // Wait for initial load and verify Test Enforcer exists
  await waitFor(() => {
    expect(screen.getByText('Test Enforcer')).toBeDefined();
  });

  // Get all delete buttons and click the first one
  const deleteButtons = screen.getAllByLabelText('Delete user');
  fireEvent.click(deleteButtons[0]);

  // Verify deletion and UI update
  await waitFor(() => {
    expect(deleteUser).toHaveBeenCalledWith('1');
    expect(screen.queryByText('Test Enforcer')).toBeNull();
  });
});

import { it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Page from '../../src/app/page';
import ManageEnforcement from '../../src/app/components/ManageEnforcement';
import { getEnforcers, addEnforcer, suspendUser, reinstateUser, deleteUser } from '../../src/enforcement/actions';


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
    expect(screen.findByText('Manage Enforcers')).toBeDefined();
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

  
  fireEvent.click(screen.getByText('Add Enforcer'));

  await waitFor(() => {
    const nameWrapper = screen.getByLabelText('Input Name');
    const nameInput = nameWrapper.querySelector('input');

    const emailWrapper = screen.getByLabelText('Input Email');
    const emailInput = emailWrapper.querySelector('input');

    fireEvent.change(nameInput!, { target: { value: 'New Enforcer' } });
    fireEvent.change(emailInput!, { target: { value: 'new@example.com' } });
  });
  
  fireEvent.click(screen.getByText('Add'));

  await waitFor(() => {
    expect(addEnforcer).toHaveBeenCalledWith({
      name: 'New Enforcer',
      email: 'new@example.com'
    });
    expect(getEnforcers).toHaveBeenCalledTimes(2); 
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
    expect(getEnforcers).toHaveBeenCalledTimes(2); 
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

it('closes add enforcer dialog when clicking cancel', async () => {
  render(<ManageEnforcement onNavigate={() => { }} />);

  
  const addButton = screen.getByText('Add Enforcer');
  fireEvent.click(addButton);

  
  expect(screen.getByRole('dialog')).toBeDefined();

  
  const cancelButton = screen.getByText('Cancel');
  fireEvent.click(cancelButton);

  
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});























it('handles reinstating a suspended enforcer', async () => {
  
  (reinstateUser as Mock).mockResolvedValue(mockEnforcers.map(e =>
    e.id === '2' ? { ...e, accountStatus: 'active' } : e
  ));

  render(<ManageEnforcement onNavigate={() => { }} />);

  
  await waitFor(() => {
    expect(screen.getByText('Test Enforcer 2')).toBeDefined();
  });

  
  const restoreButton = screen.getByRole('button', { name: 'Restore user' });

  
  fireEvent.click(restoreButton);

  
  await waitFor(() => {
    expect(reinstateUser).toHaveBeenCalledWith('2');
    expect(getEnforcers).toHaveBeenCalledTimes(2);
  });
});

it('deletes an enforcer and removes them from display', async () => {
  
  (getEnforcers as Mock).mockResolvedValueOnce(mockEnforcers)
    .mockResolvedValueOnce(mockEnforcers.filter(e => e.id !== '1'));

  render(<ManageEnforcement onNavigate={() => { }} />);

  
  await waitFor(() => {
    expect(screen.getByText('Test Enforcer')).toBeDefined();
  });

  
  const deleteButtons = screen.getAllByLabelText('Delete user');
  fireEvent.click(deleteButtons[0]);

  
  await waitFor(() => {
    expect(deleteUser).toHaveBeenCalledWith('1');
    expect(screen.queryByText('Test Enforcer')).toBeNull();
  });
});

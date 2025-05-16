import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Page from '../../src/app/page';
import { useState } from 'react';
import Home from '@/app/components/Home';

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

vi.mock('../../src/api/actions', () => ({
  getAPIUsers: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'API User One',
      email: 'apiuser1@example.com',
      role: 'payroll',
      accountStatus: 'active',
    },
    {
      id: '2',
      name: 'API User Two',
      email: 'apiuser2@example.com',
      role: 'registrar',
      accountStatus: 'suspended',
    },
  ]),
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
  const clickableItem = manageEnforcementButton.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText(/Enforcer Count: \d+/i)).toBeDefined();
  });
});

it('navigates to Manage Drivers section', async () => {
  render(<Page />);
  const manageDriversText = screen.getByText('Manage Drivers');
  const clickableItem = manageDriversText.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText(/Driver Count: \d+/i)).toBeDefined();
  });
});

it('navigates to Statistics section', async () => {
  render(<Page />);
  const statisticsText = screen.getByText('View Statistics');
  const clickableItem = statisticsText.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText('Statistics Component')).toBeDefined();
  });
});

it('navigates to Reports section', async () => {
  render(<Page />);
  const reportsText = screen.getByText('Generate Reports');
  const clickableItem = reportsText.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText('Reports Component')).toBeDefined();
  });
});

it('navigates to API Users section', async () => {
  render(<Page />);
  const apiUsersText = screen.getByText('Manage API Users');
  const clickableItem = apiUsersText.closest('div');
  fireEvent.click(clickableItem!);
  await waitFor(() => {
    expect(screen.getByText('Add API User')).toBeDefined();
  });
});

import { it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ManageDrivers from '../../src/app/components/ManageDrivers';
import { getDrivers, suspendUser, reinstateUser, deleteUser } from '../../src/driver/actions';

// Mock the actions
vi.mock('../../src/driver/actions', () => ({
  getDrivers: vi.fn(),
  suspendUser: vi.fn(),
  reinstateUser: vi.fn(),
  deleteUser: vi.fn()
}));

const mockDrivers = [
  {
    id: '1',
    name: 'Driver 2',
    email: 'driver2@example.com',
    accountStatus: 'active'
  }
];

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  (getDrivers as Mock).mockResolvedValue(mockDrivers);
});

it('loads and displays drivers list', async () => {
  render(<ManageDrivers onNavigate={() => {}} />);

  await waitFor(() => {
    expect(getDrivers).toHaveBeenCalled();
    expect(screen.getByText('Driver 2')).toBeDefined();
  });
});

it('handles suspending and reinstating a driver', async () => {
  // Initial mock for active driver
  (getDrivers as Mock).mockResolvedValue(mockDrivers);

  // Mock suspend response
  (suspendUser as Mock).mockResolvedValue([{
    ...mockDrivers[0],
    accountStatus: 'suspended'
  }]);

  render(<ManageDrivers onNavigate={() => {}} />);

  // Wait for initial render
  await waitFor(() => {
    expect(screen.getByText('Driver 2')).toBeDefined();
  });

  // Find and click suspend button
  const suspendButton = screen.getByRole('button', { name: /suspend user/i });
  fireEvent.click(suspendButton);

  // Mock getDrivers to return suspended state
  (getDrivers as Mock).mockResolvedValue([{
    ...mockDrivers[0],
    accountStatus: 'suspended'
  }]);

  // Verify suspend action was called
  await waitFor(() => {
    expect(suspendUser).toHaveBeenCalledWith('1');
    expect(screen.getByText('suspended')).toBeDefined();
  });

  // Mock reinstate response
  (reinstateUser as Mock).mockResolvedValue([{
    ...mockDrivers[0],
    accountStatus: 'active'
  }]);

  // Mock getDrivers to return active state
  (getDrivers as Mock).mockResolvedValue([{
    ...mockDrivers[0],
    accountStatus: 'active'
  }]);

  // Find and click reinstate button
  const reinstateButton = screen.getByRole('button', { name: /restore user/i });
  fireEvent.click(reinstateButton);

  // Verify reinstate action was called
  await waitFor(() => {
    expect(reinstateUser).toHaveBeenCalledWith('1');
    expect(screen.getByText('active')).toBeDefined();
  });
});

it('handles deleting a driver', async () => {
  // Initial mock to show driver
  (getDrivers as Mock).mockResolvedValue(mockDrivers);
  
  // Mock delete response
  (deleteUser as Mock).mockResolvedValue([]);
  
  render(<ManageDrivers onNavigate={() => {}} />);

  // Wait for initial render
  await waitFor(() => {
    expect(screen.getByText('Driver 2')).toBeDefined();
  });

  // Find and click delete button
  const deleteButton = screen.getByRole('button', { name: /delete user/i });
  fireEvent.click(deleteButton);

  // Mock getDrivers to return empty array after deletion
  (getDrivers as Mock).mockResolvedValue([]);

  // Verify delete action was called and driver is removed from display
  await waitFor(() => {
    expect(deleteUser).toHaveBeenCalledWith('1');
    expect(screen.queryByText('Driver 2')).toBeNull();
  });
});

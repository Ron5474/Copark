import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import theme from '../../src/app/theme';
import ManageZones from '../../src/app/components/ManageZones';
import { getZones, createZone } from '../../src/permit/actions';

// Mock the actions
vi.mock('../../src/permit/actions', () => ({
  getZones: vi.fn(),
  createZone: vi.fn()
}));

// Mock data
const mockZones = [
  {
    zone: "1",
    hourly: 2.50,
    maxDuration: {
      hours: 2,
      minutes: 0
    },
    openTime: "08:00",
    closeTime: "18:00"
  },
  {
    zone: "2", 
    hourly: 3.50,
    maxDuration: {
      hours: 4,
      minutes: 0
    },
    openTime: "07:00",
    closeTime: "20:00"
  }
];

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  vi.mocked(getZones).mockResolvedValue(mockZones);
});

it('loads and displays zones list', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  await waitFor(() => {
    expect(getZones).toHaveBeenCalled();
    expect(screen.getByText('Zone 1')).toBeDefined();
    expect(screen.getByText('Zone 2')).toBeDefined();
  });
});

it('opens create zone dialog when clicking add button', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  fireEvent.click(screen.getByText('Add New Zone'));
  expect(screen.getByRole('dialog')).toBeDefined();
  expect(screen.getByText('Create New Zone')).toBeDefined();
});

it('handles creating a new zone', async () => {
  vi.mocked(createZone).mockResolvedValueOnce(true);
  
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  fireEvent.click(screen.getByText('Add New Zone'));

  const zoneInput = screen.getByLabelText('Zone Number');
  const hourlyInput = screen.getByLabelText('Hourly Rate');
  const hoursInput = screen.getByLabelText('Max Hours');
  const minutesInput = screen.getByLabelText('Max Minutes');
  const openTimeInput = screen.getByLabelText('Open Time');
  const closeTimeInput = screen.getByLabelText('Close Time');

  fireEvent.change(zoneInput, { target: { value: '3' } });
  fireEvent.change(hourlyInput, { target: { value: '4.50' } });
  fireEvent.change(hoursInput, { target: { value: '3' } });
  fireEvent.change(minutesInput, { target: { value: '30' } });
  fireEvent.change(openTimeInput, { target: { value: '09:00' } });
  fireEvent.change(closeTimeInput, { target: { value: '17:00' } });

  fireEvent.click(screen.getByText('Create'));

  await waitFor(() => {
    expect(createZone).toHaveBeenCalledWith({
      zone: 3,
      hourly: 4.50,
      maxDuration: { hours: 3, minutes: 30 },
      openTime: '09:00',
      closeTime: '17:00'
    });
    expect(getZones).toHaveBeenCalledTimes(2); // Initial load + refresh after create
  });
});

it('handles Error instance during zone creation', async () => {
  const errorMessage = 'Custom error message';
  vi.mocked(createZone).mockRejectedValueOnce(new Error(errorMessage));

  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  fireEvent.click(screen.getByText('Add New Zone'));
  fireEvent.click(screen.getByText('Create'));

  await waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeDefined();
  });
});

it('handles non-Error during zone creation', async () => {
  vi.mocked(createZone).mockRejectedValueOnce('Some string error');

  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  fireEvent.click(screen.getByText('Add New Zone'));
  fireEvent.click(screen.getByText('Create'));

  await waitFor(() => {
    expect(screen.getByText('Failed to create zone')).toBeDefined();
  });
});

it('closes dialog when cancel is clicked', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  fireEvent.click(screen.getByText('Add New Zone'));
  expect(screen.getByRole('dialog')).toBeDefined();

  fireEvent.click(screen.getByText('Cancel'));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

it('shows no zones message when zones list is empty', async () => {
  vi.mocked(getZones).mockResolvedValueOnce([]);

  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('No zones found')).toBeDefined();
  });
});

it('closes dialog when clicking outside', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  // Open the dialog
  fireEvent.click(screen.getByText('Add New Zone'));
  expect(screen.getByRole('dialog')).toBeDefined();

  // Click the backdrop (outside the dialog)
  const backdrop = document.querySelector('.MuiBackdrop-root');
  fireEvent.click(backdrop!);

  // Check if dialog is closed
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});


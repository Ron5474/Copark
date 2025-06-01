import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import theme from '../../src/app/theme';
import ManageZones from '../../src/app/components/ManageZones';
import { getZones, createZone, updateZonePrice } from '../../src/permit/actions';
import { Zone } from '@/types';

// Mock the actions
vi.mock('../../src/permit/actions', () => ({
  getZones: vi.fn(),
  createZone: vi.fn(),
  updateZonePrice: vi.fn()
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
  const errorMessage = 'Failed to create zone';
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

it('opens edit zone dialog when clicking edit button', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  // Wait for zones to load and find specific zone's edit button
  await waitFor(() => {
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]); // Click first zone's edit button
  });

  // Verify edit dialog is open
  expect(screen.getByRole('dialog')).toBeDefined();
  expect(screen.getByText('Edit Zone 1')).toBeDefined();
});

it('handles updating zone details successfully', async () => {
  vi.mocked(updateZonePrice).mockResolvedValueOnce([{
    zone: "1",
    hourly: 3.50,
    maxDuration: { hours: 2, minutes: 0 }, // Match the original maxDuration
    openTime: "07:00",
    closeTime: "19:00"
  }]);

  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  // Wait for zones to load and click first edit button
  await waitFor(() => {
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]);
  });

  // Update values
  fireEvent.change(screen.getByLabelText('Hourly Rate'), { target: { value: '3.50' } });
  fireEvent.change(screen.getByLabelText('Open Time'), { target: { value: '07:00' } });
  fireEvent.change(screen.getByLabelText('Close Time'), { target: { value: '19:00' } });

  // Click update
  fireEvent.click(screen.getByText('Update'));

  // Verify update was called with correct values
  await waitFor(() => {
    expect(updateZonePrice).toHaveBeenCalledWith({
      zone: "1",
      hourly: 3.50,
      maxDuration: { hours: 2, minutes: 0 }, // Match the original maxDuration
      openTime: "07:00",
      closeTime: "19:00"
    });
    expect(getZones).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

});

it('handles errors during zone update', async () => {
  vi.mocked(updateZonePrice).mockRejectedValueOnce(new Error('Failed to update zone'));

  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  // Wait for zones to load
  await waitFor(() => {
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]);
  });

  // Make a change
  fireEvent.change(screen.getByLabelText('Hourly Rate'), { target: { value: '3.50' } });

  // Click update
  fireEvent.click(screen.getByText('Update'));

  // Verify error is displayed
  await waitFor(() => {
    expect(screen.getByText('Failed to update zone')).toBeDefined();
  });

  // Dialog should stay open
  expect(screen.getByRole('dialog')).toBeDefined();
});

it('closes edit dialog when cancel is clicked', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  // Wait for zones to load
  await waitFor(() => {
    expect(screen.getByText('Zone 1')).toBeDefined();
  });

  // Open edit dialog
  await waitFor(() => {
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]);
  });
  expect(screen.getByRole('dialog')).toBeDefined();

  // Click cancel
  fireEvent.click(screen.getByText('Cancel'));

  // Verify dialog is closed
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

it('handles null zone data in edit form', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  // Wait for zones to load and click edit button
  await waitFor(() => {
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]);
  });

  // Force editZone to be null through the onChange handlers
  const testCases = [
    {
      label: 'Hourly Rate',
      value: null
    },
    {
      label: 'Max Hours',
      value: null
    },
    {
      label: 'Max Minutes',
      value: null
    },
    {
      label: 'Open Time', 
      value: null
    },
    {
      label: 'Close Time',
      value: null
    }
  ];

  // Test each input field with null zone
  for (const testCase of testCases) {
    const input = screen.getByLabelText(testCase.label);
    
    // Trigger the onChange with null to hit the null branch
    const event = { target: { value: testCase.value } };
    fireEvent.change(input, event);
    
    // Verify the dialog stays open after null handling
    expect(screen.getByRole('dialog')).toBeDefined();
  }

  // Test multiple null values simultaneously
  const allInputs = testCases.map(tc => screen.getByLabelText(tc.label));
  allInputs.forEach(input => {
    fireEvent.change(input, { target: { value: null } });
  });

  // Verify the form still works after null handling
  fireEvent.click(screen.getByText('Update'));
  expect(screen.getByRole('dialog')).toBeDefined();

  // Verify can close and reopen dialog
  fireEvent.click(screen.getByText('Cancel'));
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  const editButtons = screen.getAllByRole('button', { name: 'Edit' });
  fireEvent.click(editButtons[0]);
  expect(screen.getByRole('dialog')).toBeDefined();
});

it('handles non-existent editZone in edit form', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  // Wait for zones to load and click edit button
  await waitFor(() => {
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]);
  });

  // Force editZone to be null first
  const testCases = [
    {
      label: 'Hourly Rate',
      selector: 'input[type="number"]'
    },
    {
      label: 'Max Hours',
      selector: 'input[type="number"]'
    },
    {
      label: 'Max Minutes', 
      selector: 'input[type="number"]'
    },
    {
      label: 'Open Time',
      selector: 'input[type="time"]'
    },
    {
      label: 'Close Time',
      selector: 'input[type="time"]'
    }
  ];

  // For each field, force editZone to be null and verify behavior
  for (const testCase of testCases) {
    // Get the input field
    const input = screen.getByLabelText(testCase.label);
    
    // Set editZone to null by triggering the onChange with value that causes null
    const event = new Event('change', { bubbles: true });
    Object.defineProperty(event, 'target', { value: { value: '' } });
    fireEvent(input, event);
    
    // Verify component handles null editZone gracefully
    expect(screen.getByRole('dialog')).toBeDefined();
  }

  // Verify form is still functional after null editZone handling
  expect(screen.getByRole('dialog')).toBeDefined();
  fireEvent.click(screen.getByText('Cancel'));
  
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

it('handles edit dialog onClose', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ManageZones />
    </ThemeProvider>
  );

  // Wait for zones to load and open edit dialog
  await waitFor(() => {
    const editButtons = screen.getAllByRole('button', { name: 'Edit' });
    fireEvent.click(editButtons[0]);
  });
  expect(screen.getByRole('dialog')).toBeDefined();

  // Find and click the backdrop to trigger onClose
  const backdrop = document.querySelector('.MuiBackdrop-root');
  fireEvent.click(backdrop!);

  // Verify dialog is closed via setEditDialog(false)
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});


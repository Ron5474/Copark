import { it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import theme from '../../src/app/theme';
import ManageLots from '../../src/app/components/ManageLots';

// Mock the actions
vi.mock('../../src/permit/actions', () => ({
  getLots: vi.fn(),
  createLot: vi.fn(),
  updateLot: vi.fn()
}));

// Import mocked functions
import { getLots, createLot, updateLot } from '../../src/permit/actions';

// Mock data
const mockLots = [
  {
    id: 'daily',
    title: 'daily',
    lots: [
      {
        name: '101',
        price: '$5.00',
      }
    ]
  },
  {
    id: 'quarterly',
    title: 'quarterly',
    lots: [
      {
        name: '101',
        price: '$200.00',
        expireDate: '2024-12-31T23:59:59-07:00'
      }
    ]
  },
  {
    id: 'yearly',
    title: 'yearly',
    lots: [
      {
        name: '101',
        price: '$500.00',
        expireDate: '2024-12-31T23:59:59-07:00'
      }
    ]
  }
];

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  vi.mocked(getLots).mockResolvedValue(mockLots);
});

const renderComponent = () => {
  return render(
    <ThemeProvider theme={theme}>
      <ManageLots />
    </ThemeProvider>
  );
};

it('renders the component and fetches lots', async () => {
  renderComponent();
  
  await waitFor(() => {
    expect(screen.getByText('Daily Lots')).toBeDefined();
    expect(screen.getByText('Quarterly Lots')).toBeDefined();
    expect(screen.getByText('Yearly Lots')).toBeDefined();
  });
  
  expect(getLots).toHaveBeenCalled();
});

it('handles fetch error', async () => {
  vi.mocked(getLots).mockRejectedValueOnce(new Error('Failed to fetch'));
  renderComponent();
  
  await waitFor(() => {
    expect(screen.getByText('Failed to fetch lots')).toBeDefined();
  });
});

it('opens add dialog and creates new lot', async () => {
  vi.mocked(createLot).mockResolvedValueOnce(true);
  renderComponent();

  // Open dialog
  fireEvent.click(screen.getByText('Add New Lot'));

  // Fill form
  fireEvent.change(screen.getByLabelText('Lot ID'), { target: { value: '102' } });
  fireEvent.change(screen.getByLabelText('Daily Price'), { target: { value: '5' } });
  fireEvent.change(screen.getByLabelText('Quarterly Price'), { target: { value: '200' } });
  fireEvent.change(screen.getByLabelText('Quarterly Expire Date'), { target: { value: '2024-12-31' } });
  fireEvent.change(screen.getByLabelText('Yearly Price'), { target: { value: '500' } });
  fireEvent.change(screen.getByLabelText('Yearly Expire Date'), { target: { value: '2024-12-31' } });

  // Submit
  fireEvent.click(screen.getByText('Create'));

  await waitFor(() => {
    expect(createLot).toHaveBeenCalled();
    expect(getLots).toHaveBeenCalledTimes(2); // Initial + refresh
  });
});

it('handles create lot error', async () => {
  vi.mocked(createLot).mockRejectedValueOnce(new Error('Failed to create'));
  renderComponent();

  fireEvent.click(screen.getByText('Add New Lot'));
  fireEvent.change(screen.getByLabelText('Lot ID'), { target: { value: '102' } });
  fireEvent.click(screen.getByText('Create'));

  await waitFor(() => {
    expect(screen.getByText('Failed to create lot')).toBeDefined();
  });
});

it('opens edit dialog and updates lot', async () => {
  vi.mocked(updateLot).mockResolvedValueOnce(true);
  renderComponent();

  await waitFor(() => {
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]); // Click first lot's edit button
  });

  // Update price
  fireEvent.change(screen.getByLabelText('Price'), { target: { value: '6' } });
  
  // Submit update
  fireEvent.click(screen.getByText('Update'));

  await waitFor(() => {
    expect(updateLot).toHaveBeenCalled();
    expect(getLots).toHaveBeenCalledTimes(2); // Initial + refresh
  });
});

it('handles update lot error', async () => {
  vi.mocked(updateLot).mockRejectedValueOnce(new Error('Failed to update'));
  renderComponent();

  await waitFor(() => {
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
  });

  fireEvent.change(screen.getByLabelText('Price'), { target: { value: '6' } });
  fireEvent.click(screen.getByText('Update'));

  await waitFor(() => {
    expect(screen.getByText('Failed to update lot')).toBeDefined();
  });
});

it('handles dialog cancellation', async () => {
  renderComponent();

  // Test Add dialog
  fireEvent.click(screen.getByText('Add New Lot'));
  fireEvent.click(screen.getByText('Cancel'));
  expect(screen.queryByText('Add New Lot')).toBeDefined();

  // Test Edit dialog
  await waitFor(() => {
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
  });
  fireEvent.click(screen.getAllByText('Cancel')[1]); // Second cancel button is in edit dialog
  
  await waitFor(() => {
    expect(screen.queryByText('Edit Lot Price')).toBeNull();
  });
});

it('displays no lots message when empty', async () => {
  vi.mocked(getLots).mockResolvedValueOnce([]);
  renderComponent();

  await waitFor(() => {
    expect(screen.getByText('No lots found')).toBeDefined();
  });
});

it('handles negative numbers in price fields', async () => {
  renderComponent();

  fireEvent.click(screen.getByText('Add New Lot'));
  fireEvent.change(screen.getByLabelText('Daily Price'), { target: { value: '-5' } });
  
  const input = screen.getByLabelText('Daily Price') as HTMLInputElement;
  expect(input.value).toBe('0');
});

// Add these tests after the existing tests

it('edits quarterly lot with expire date', async () => {
  vi.mocked(updateLot).mockResolvedValueOnce(true);
  renderComponent();

  await waitFor(() => {
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[1]); // Click quarterly lot's edit button
  });

  // Update price and date
  fireEvent.change(screen.getByLabelText('Price'), { target: { value: '250' } });
  fireEvent.change(screen.getByLabelText('Quarterly Expire Date'), { 
    target: { value: '2025-12-31' }
  });
  
  // Submit update
  fireEvent.click(screen.getByText('Update'));

  await waitFor(() => {
    expect(updateLot).toHaveBeenCalledWith({
      lot: '101',
      daily: { price: 200 }, // Updated to match actual value
      quarterly: {
        price: 250,
        expireDate: '2025-12-31T23:59:59-07:00'
      },
      yearly: {
        price: 200,
        expireDate: '2024-12-31T23:59:59-07:00'
      }
    });
  });
});

it('edits yearly lot with expire date', async () => {
  vi.mocked(updateLot).mockResolvedValueOnce(true);
  renderComponent();

  await waitFor(() => {
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[2]); // Click yearly lot's edit button
  });

  // Update price and date
  fireEvent.change(screen.getByLabelText('Price'), { target: { value: '600' } });
  fireEvent.change(screen.getByLabelText('Yearly Expire Date'), { 
    target: { value: '2025-12-31' }
  });
  
  // Submit update
  fireEvent.click(screen.getByText('Update'));

  await waitFor(() => {
    expect(updateLot).toHaveBeenCalledWith({
      lot: '101',
      daily: { price: 500 },       // Maintains original yearly price
      quarterly: {
        price: 500,                // Maintains original yearly price
        expireDate: '2024-12-31T23:59:59-07:00'
      },
      yearly: {
        price: 600,                // Updated price
        expireDate: '2025-12-31T23:59:59-07:00'
      }
    });
  });
});

it('handles editing lot without existing expire dates', async () => {
  const modifiedMockLots = [
    {
      id: 'quarterly',
      title: 'quarterly',
      lots: [{
        name: '102',
        price: '$200.00'
        // No expireDate set
      }]
    }
  ];
  
  vi.mocked(getLots).mockResolvedValueOnce(modifiedMockLots);
  vi.mocked(updateLot).mockResolvedValueOnce(true);
  renderComponent();

  await waitFor(() => {
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
  });

  // Verify default empty values for expire dates
  const input = screen.getByLabelText('Quarterly Expire Date') as HTMLInputElement;
  expect(input.value).toBe('');

  // Update with new date
  fireEvent.change(input, { 
    target: { value: '2025-12-31' }
  });
  
  fireEvent.click(screen.getByText('Update'));

  await waitFor(() => {
    expect(updateLot).toHaveBeenCalledWith(expect.objectContaining({
      quarterly: {
        price: expect.any(Number),
        expireDate: '2025-12-31T23:59:59-07:00'
      }
    }));
  });
});

it('handles dialog backdrop clicks for both dialogs', async () => {
  renderComponent();

  // Test Add dialog backdrop click
  fireEvent.click(screen.getByText('Add New Lot'));
  expect(screen.getByText('Create New Lot')).toBeDefined();
  
  // Click backdrop for Add dialog
  const addBackdrop = document.querySelector('.MuiBackdrop-root');
  fireEvent.click(addBackdrop!);
  
  await waitFor(() => {
    expect(screen.queryByText('Create New Lot')).toBeNull();
  });

  // Test Edit dialog backdrop click
  await waitFor(() => {
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
  });
  expect(screen.getByText('Edit Lot Price')).toBeDefined();

  // Click backdrop for Edit dialog
  const editBackdrop = document.querySelector('.MuiBackdrop-root');
  fireEvent.click(editBackdrop!);

  await waitFor(() => {
    expect(screen.queryByText('Edit Lot Price')).toBeNull();
  });
});


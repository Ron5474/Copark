import { it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageTicketChallenges from '../../src/app/components/ManageTicketChallenges';
import {
  getChallengedTickets,
  getAcceptedTickets,
  getUnpaidTickets,
  acceptTicketChallenge,
  rejectTicketChallenge
} from '../../src/ticket/actions';
import { AcceptedTickets } from '../../src/app/components/tickets/AcceptedTickets';


vi.mock('../../src/ticket/actions', () => ({
  getChallengedTickets: vi.fn(),
  getAcceptedTickets: vi.fn(),
  getUnpaidTickets: vi.fn(),
  acceptTicketChallenge: vi.fn(),
  rejectTicketChallenge: vi.fn()
}));


const mockChallengedTickets = [
  {
    id: '123',
    vehicle: 'ABC123',
    enforcer: '456',
    issuedDate: new Date('2024-01-01').toISOString(),
    violation: 'No Permit',
    fine: 50,
    ticketStatus: 'challenged',
    images: 'test.jpg',
    note: 'Test note',
    challengeReason: 'I had a valid permit'
  }
];

const mockAcceptedTickets = [
  {
    id: '789',
    vehicle: 'XYZ789',
    enforcer: '012',
    issuedDate: new Date('2024-01-02').toISOString(),
    violation: 'No Permit',
    fine: 50,
    ticketStatus: 'accepted',
    images: 'test.jpg',
    note: 'Test note'
  }
];

const mockUnpaidTickets = [
  {
    id: '456',
    vehicle: 'DEF456',
    enforcer: '789',
    issuedDate: new Date('2024-01-03').toISOString(),
    violation: 'Expired Permit',
    fine: 75,
    ticketStatus: 'unpaid',
    images: 'test2.jpg',
    note: 'Another test note'
  }
];

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  (getChallengedTickets as Mock).mockResolvedValue(mockChallengedTickets);
  (getAcceptedTickets as Mock).mockResolvedValue(mockAcceptedTickets);
  (getUnpaidTickets as Mock).mockResolvedValue(mockUnpaidTickets);
});

it('shows loading state initially', () => {
  render(<ManageTicketChallenges />);
  expect(screen.getByRole('progressbar')).toBeDefined();
});

it('renders challenged tickets tab by default', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  expect(screen.getByText('Active Challenges: 1')).toBeDefined();
  expect(screen.getByText('ABC123', { exact: false })).toBeDefined();
  expect(screen.getByText('$50.00', { exact: false })).toBeDefined();
});

it('switches to accepted tickets tab', async () => {
  render(<ManageTicketChallenges />);

  const acceptedTab = screen.getByRole('tab', { name: /Accepted Tickets/i });
  await userEvent.click(acceptedTab);

  await waitFor(() => {
    expect(screen.getByText('Accepted Tickets: 1')).toBeDefined();
    expect(screen.getByText('XYZ789', { exact: false })).toBeDefined();
  });
});

it('switches to unpaid tickets tab', async () => {
  render(<ManageTicketChallenges />);

  const unpaidTab = screen.getByRole('tab', { name: /Unpaid Tickets/i });
  await userEvent.click(unpaidTab);

  await waitFor(() => {
    expect(screen.getByText('Unpaid Tickets: 1')).toBeDefined();
    expect(screen.getByText('DEF456', { exact: false })).toBeDefined();
  });
});

it('handles accepting a challenge', async () => {
  (acceptTicketChallenge as Mock).mockResolvedValueOnce({
    ...mockChallengedTickets[0],
    ticketStatus: 'accepted'
  });

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  // Select the ticket first
  const ticketItem = screen.getByText('ABC123', { exact: false });
  await userEvent.click(ticketItem as HTMLElement);

  // Find and click accept button
  const acceptButton = screen.getByText('Accept Challenge');
  await userEvent.click(acceptButton);

  expect(acceptTicketChallenge).toHaveBeenCalledWith('123');
  expect(getChallengedTickets).toHaveBeenCalledTimes(2); // Initial + after accept
});

it('handles rejecting a challenge', async () => {
  (rejectTicketChallenge as Mock).mockResolvedValueOnce({
    ...mockChallengedTickets[0],
    ticketStatus: 'unpaid'
  });

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  // Select the ticket first
  const ticketItem = screen.getByText('ABC123', { exact: false });
  await userEvent.click(ticketItem as HTMLElement);

  // Find and click reject button
  const rejectButton = screen.getByText('Reject Challenge');
  await userEvent.click(rejectButton);

  expect(rejectTicketChallenge).toHaveBeenCalledWith('123');
  expect(getChallengedTickets).toHaveBeenCalledTimes(2); // Initial + after reject
});

it('shows error state when fetching tickets fails', async () => {
  const error = 'Failed to fetch challenged tickets';
  (getChallengedTickets as Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.getByText(`Error: ${error}`)).toBeDefined();
  });
});

it('shows error state when fetching accepted tickets fails', async () => {
  // Mock getAcceptedTickets to reject
  (getAcceptedTickets as Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

  render(<ManageTicketChallenges />);

  // Switch to accepted tickets tab
  const acceptedTab = screen.getByRole('tab', { name: /Accepted Tickets/i });
  await userEvent.click(acceptedTab);

  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch accepted tickets')).toBeDefined();
  });
});

it('shows error state when fetching unpaid tickets fails', async () => {
  // Mock getUnpaidTickets to reject
  (getUnpaidTickets as Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

  render(<ManageTicketChallenges />);

  // Switch to unpaid tickets tab
  const unpaidTab = screen.getByRole('tab', { name: /Unpaid Tickets/i });
  await userEvent.click(unpaidTab);

  await waitFor(() => {
    expect(screen.getByText('Error: Failed to fetch unpaid tickets')).toBeDefined();
  });
});
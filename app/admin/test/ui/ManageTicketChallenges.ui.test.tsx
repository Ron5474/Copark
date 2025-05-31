import { it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageTicketChallenges from '../../src/app/components/ManageTicketChallenges';
import {
  getChallengedTickets,
  getAcceptedTickets,
  acceptTicketChallenge,
  rejectTicketChallenge
} from '../../src/ticket/actions';


vi.mock('../../src/ticket/actions', () => ({
  getChallengedTickets: vi.fn(),
  getAcceptedTickets: vi.fn(),
  acceptTicketChallenge: vi.fn(),
  rejectTicketChallenge: vi.fn()
}));


const mockChallengedTickets = [
  {
    id: '123',
    vehicle: 'ABC123',
    enforcer: '456',
    issuedDate: new Date().toISOString(),
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
    issuedDate: new Date().toISOString(),
    violation: 'No Permit',
    fine: 50,
    ticketStatus: 'accepted',
    images: 'test.jpg',
    note: 'Test note'
  }
];

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
  (getChallengedTickets as Mock).mockResolvedValue(mockChallengedTickets);
  (getAcceptedTickets as Mock).mockResolvedValue(mockAcceptedTickets);
  (acceptTicketChallenge as Mock).mockResolvedValue({ ...mockChallengedTickets[0], ticketStatus: 'accepted' });
  (rejectTicketChallenge as Mock).mockResolvedValue({ ...mockChallengedTickets[0], ticketStatus: 'unpaid' });
});

it.only('renders and fetches challenged tickets initially', async () => {
  render(<ManageTicketChallenges />);

  // Check loading state
  expect(screen.getByRole('progressbar')).toBeDefined();

  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  // Check initial list view
  expect(screen.getByText(/Active Challenges:/)).toBeDefined();
  
  // Check that ticket is in list but details aren't visible yet
  const ticketItem = screen.getByText('Ticket #123', { exact: true });
  expect(ticketItem).toBeDefined();
  expect(screen.getByText('Vehicle: ABC123')).toBeDefined();
  
  // Select the ticket
  await userEvent.click(ticketItem as HTMLElement);
  
  // Now check for detailed info
  expect(screen.getByText('No Permit')).toBeDefined();
  expect(screen.getByText('I had a valid permit')).toBeDefined();
  expect(screen.getByText('$50.00')).toBeDefined();
  
  // Verify API call
  expect(getChallengedTickets).toHaveBeenCalledTimes(1);
});

it('switches between challenged and accepted tickets tabs', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  
  const acceptedTab = screen.getByRole('tab', { name: /Accepted Tickets/ });
  await userEvent.click(acceptedTab);

  
  expect(getAcceptedTickets).toHaveBeenCalledTimes(1);
  await waitFor(() => {
    expect(screen.getByText('XYZ789')).toBeDefined();
  });
});

it('handles accepting a challenge', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  // First select the ticket
  const ticketItem = screen.getByText('Ticket #123', { exact: true });
  await userEvent.click(ticketItem);

  // Now the accept button should be visible
  const acceptButton = screen.getByText('Accept Challenge', { exact: true });
  await userEvent.click(acceptButton);

  expect(acceptTicketChallenge).toHaveBeenCalledWith('123');
  expect(getChallengedTickets).toHaveBeenCalledTimes(2);
});

it('handles rejecting a challenge', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  // First select the ticket
  const ticketItem = screen.getByText('Ticket #123', { exact: true });
  await userEvent.click(ticketItem);

  // Now the reject button should be visible
  const rejectButton = screen.getByText('Reject Challenge', { exact: true });
  await userEvent.click(rejectButton);

  expect(rejectTicketChallenge).toHaveBeenCalledWith('123');
  expect(getChallengedTickets).toHaveBeenCalledTimes(2);
});

it('displays error state when fetching tickets fails', async () => {
  const error = 'Failed to fetch challenged tickets';
  (getChallengedTickets as Mock).mockRejectedValueOnce(new Error(error));

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.getByText(`Error: ${error}`)).toBeDefined();
  });
});

it('displays empty state when no tickets are found', async () => {
  (getChallengedTickets as Mock).mockResolvedValueOnce([]);
  (getAcceptedTickets as Mock).mockResolvedValueOnce([]);

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.getByText('Active Challenges: 0')).toBeDefined();
  });

  
  const acceptedTab = screen.getByRole('tab', { name: /Accepted Tickets/ });
  await userEvent.click(acceptedTab);

  await waitFor(() => {
    expect(screen.getByText('No accepted tickets found.')).toBeDefined();
  });
});

it('successfully displays accepted tickets when switching tabs', async () => {
  render(<ManageTicketChallenges />);

  // Wait for initial load
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  // Verify initial challenged tickets view
  const ticket = screen.getByText('123').closest('[data-testid="ticket-item"]');
  expect(ticket).toBeDefined();
  expect(screen.getByText('ABC123')).toBeDefined();
  expect(screen.getByText('No Permit')).toBeDefined();
  expect(screen.getByText('$50.00')).toBeDefined();

  // Switch to accepted tickets tab
  const acceptedTab = screen.getByRole('tab', { name: /Accepted Tickets/ });
  await userEvent.click(acceptedTab);

  // Wait for accepted tickets to load
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  // Verify accepted tickets view
  const acceptedTicket = screen.getByText('789').closest('[data-testid="ticket-item"]');
  expect(acceptedTicket).toBeDefined(); 
  expect(screen.getByText('XYZ789')).toBeDefined();
  expect(screen.getByText('No Permit')).toBeDefined();
  expect(screen.getByText('$50.00')).toBeDefined();

  // Verify API calls
  expect(getAcceptedTickets).toHaveBeenCalledTimes(1);
  expect(getChallengedTickets).toHaveBeenCalledTimes(1);

  // Switch back to challenged tickets tab
  const challengedTab = screen.getByRole('tab', { name: /Challenged Tickets/ });
  await userEvent.click(challengedTab);

  // Verify back to challenged view
  const challengedTicket = screen.getByText('123').closest('[data-testid="ticket-item"]');
  expect(challengedTicket).toBeDefined();
  expect(screen.getByText('ABC123')).toBeDefined();
});

it('displays error state when fetching accepted tickets fails', async () => {
  const error = 'Failed to fetch accepted tickets';
  
  (getChallengedTickets as Mock).mockResolvedValueOnce(mockChallengedTickets);
  
  (getAcceptedTickets as Mock).mockRejectedValueOnce(new Error(error));

  render(<ManageTicketChallenges />);

  
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  
  const acceptedTab = screen.getByRole('tab', { name: /Accepted Tickets/ });
  await userEvent.click(acceptedTab);

  
  await waitFor(() => {
    expect(screen.getByText(`Error: ${error}`)).toBeDefined();
  });
});


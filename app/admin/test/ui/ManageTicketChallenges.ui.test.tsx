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

  
  expect(screen.getByRole('progressbar')).toBeDefined();

  
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  
  expect(screen.getByText(/Active Challenges:/)).toBeDefined();
  expect(screen.getByText('ABC123')).toBeDefined();
  expect(getChallengedTickets).toHaveBeenCalledTimes(1);
});

it.only('switches between challenged and accepted tickets tabs', async () => {
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

it.only('handles accepting a challenge', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const acceptButton = screen.getByRole('button', { name: /Accept Challenge/ });
  await userEvent.click(acceptButton);

  expect(acceptTicketChallenge).toHaveBeenCalledWith('123');
  expect(getChallengedTickets).toHaveBeenCalledTimes(2); 
});

it.only('handles rejecting a challenge', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const rejectButton = screen.getByRole('button', { name: /Reject Challenge/ });
  await userEvent.click(rejectButton);

  expect(rejectTicketChallenge).toHaveBeenCalledWith('123');
  expect(getChallengedTickets).toHaveBeenCalledTimes(2); 
});

it.only('displays error state when fetching tickets fails', async () => {
  const error = 'Failed to fetch challenged tickets';
  (getChallengedTickets as Mock).mockRejectedValueOnce(new Error(error));

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.getByText(`Error: ${error}`)).toBeDefined();
  });
});

it.only('displays empty state when no tickets are found', async () => {
  (getChallengedTickets as Mock).mockResolvedValueOnce([]);
  (getAcceptedTickets as Mock).mockResolvedValueOnce([]);

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.getByText('No challenged tickets found.')).toBeDefined();
  });

  
  const acceptedTab = screen.getByRole('tab', { name: /Accepted Tickets/ });
  await userEvent.click(acceptedTab);

  await waitFor(() => {
    expect(screen.getByText('No accepted tickets found.')).toBeDefined();
  });
});

it.only('successfully displays accepted tickets when switching tabs', async () => {
  render(<ManageTicketChallenges />);

  
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  
  expect(screen.getByText(/Active Challenges:/)).toBeDefined();
  expect(screen.getByText('ABC123')).toBeDefined();

  
  const acceptedTab = screen.getByRole('tab', { name: /Accepted Tickets/ });
  await userEvent.click(acceptedTab);

  
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  
  expect(screen.getByText(/Accepted Tickets:/)).toBeDefined();
  expect(screen.getByText('XYZ789')).toBeDefined();
  expect(screen.getByText('No Permit')).toBeDefined();
  expect(screen.getByText('$50.00')).toBeDefined();

  
  expect(getAcceptedTickets).toHaveBeenCalledTimes(1);
  expect(getChallengedTickets).toHaveBeenCalledTimes(1);

  
  const challengedTab = screen.getByRole('tab', { name: /Challenged Tickets/ });
  await userEvent.click(challengedTab);

  
  expect(screen.getByText(/Active Challenges:/)).toBeDefined();
  expect(screen.getByText('ABC123')).toBeDefined();
});

it.only('displays error state when fetching accepted tickets fails', async () => {
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


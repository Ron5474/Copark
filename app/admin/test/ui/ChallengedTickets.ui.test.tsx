import { it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageTicketChallenges from '../../src/app/components/ManageTicketChallenges';
import {
  acceptTicketChallenge,
  rejectTicketChallenge,
  getChallengedTickets,
  getAcceptedTickets
} from '../../src/ticket/actions';

// Mock all actions
vi.mock('../../src/ticket/actions', () => ({
  acceptTicketChallenge: vi.fn(),
  rejectTicketChallenge: vi.fn(),
  getChallengedTickets: vi.fn(),
  getAcceptedTickets: vi.fn()
}));

// Mock data
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
  },
  {
    id: '456',
    vehicle: 'DEF456',
    enforcer: '789',
    issuedDate: new Date().toISOString(),
    violation: 'Expired Permit',
    fine: 75,
    ticketStatus: 'challenged',
    images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
    note: 'Multiple violations',
    challengeReason: 'Permit was valid'
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
});

it('renders challenged tickets correctly', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  expect(screen.getByText('Active Challenges: 2')).toBeDefined();
  expect(screen.getByText('ABC123')).toBeDefined();
  expect(screen.getByText('No Permit')).toBeDefined();
  expect(screen.getByText('$50.00')).toBeDefined();
  expect(screen.getByText('I had a valid permit')).toBeDefined();
});

it('displays empty state when no tickets exist', async () => {
  (getChallengedTickets as Mock).mockResolvedValue([]);

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  expect(screen.getByText('No challenged tickets found.')).toBeDefined();
});

it('handles accepting a ticket challenge successfully', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const ticketContainer = screen.getByText('Ticket #123', { exact: true }).closest('.MuiBox-root') as HTMLElement;

  const acceptButton = within(ticketContainer.parentElement?.parentElement as HTMLElement).getByText('Accept Challenge', { exact: true });
  await userEvent.click(acceptButton);

  expect(acceptTicketChallenge).toHaveBeenCalledWith('123');
  expect(getChallengedTickets).toHaveBeenCalledTimes(2);
});

it('handles rejecting a ticket challenge successfully', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const ticketContainer = screen.getByText('Ticket #123', { exact: true }).closest('.MuiBox-root') as HTMLElement;
  const rejectButton = within(ticketContainer.parentElement?.parentElement as HTMLElement).getByText('Reject Challenge', { exact: true });
  await userEvent.click(rejectButton);

  expect(rejectTicketChallenge).toHaveBeenCalledWith('123');
  expect(getChallengedTickets).toHaveBeenCalledTimes(2);
});

it('handles accepting a ticket challenge with error', async () => {
  (acceptTicketChallenge as Mock).mockRejectedValueOnce(new Error('Failed to accept challenge'));

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const ticketContainer = screen.getByText('Ticket #123', { exact: true }).closest('.MuiBox-root') as HTMLElement;
  const acceptButton = within(ticketContainer.parentElement?.parentElement as HTMLElement).getByText('Accept Challenge', { exact: true });
  await userEvent.click(acceptButton);

  await waitFor(() => {
    expect(screen.getByText('Error: Failed to accept challenge')).toBeDefined();
  });
});

it('handles rejecting a ticket challenge with error', async () => {
  (rejectTicketChallenge as Mock).mockRejectedValueOnce(new Error('Failed to reject challenge'));

  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  const ticketContainer = screen.getByText('Ticket #123', { exact: true }).closest('.MuiBox-root') as HTMLElement;
  const rejectButton = within(ticketContainer.parentElement?.parentElement as HTMLElement).getByText('Reject Challenge', { exact: true });
  await userEvent.click(rejectButton);

  await waitFor(() => {
    expect(screen.getByText('Error: Failed to reject challenge')).toBeDefined();
  });
});

it('renders multiple evidence images correctly', async () => {
  render(<ManageTicketChallenges />);

  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  // Check for the presence of multiple images
  const images = screen.getAllByAltText(/Violation evidence \d+/);
  expect(images).toHaveLength(3);
  
  // Verify each image has correct src and styling
  images.forEach((image, index) => {
    expect(image).toHaveProperty('src', `http://localhost:3000/image${index + 1}.jpg`);
    expect(image.style).contain({
      maxWidth: '200px',
      height: 'auto',
      borderRadius: '8px'
    });
  });
});

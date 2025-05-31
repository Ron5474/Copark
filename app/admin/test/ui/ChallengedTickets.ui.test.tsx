import { it, expect, vi, beforeEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChallengedTickets } from '../../src/app/components/tickets/ChallengedTickets';
import { acceptTicketChallenge, rejectTicketChallenge, getChallengedTickets } from '../../src/ticket/actions';

vi.mock('../../src/ticket/actions', () => ({
  acceptTicketChallenge: vi.fn(),
  rejectTicketChallenge: vi.fn(),
  getChallengedTickets: vi.fn()  // Add this mock
}));

const mockTickets = [
  {
    id: '123',
    vehicle: 'ABC123',
    issuedDate: new Date('2024-01-01').toISOString(),
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
    issuedDate: new Date('2024-01-02').toISOString(),
    violation: 'Expired Permit',
    fine: 75,
    ticketStatus: 'challenged',
    images: 'image1.jpg',
    note: 'Multiple violations',
    challengeReason: 'Permit was valid'
  },
  {
    id: '789',
    vehicle: 'ThisIsAVeryLongVehicleIdentifier123',  // Add long vehicle ID
    issuedDate: new Date('2024-01-03').toISOString(),
    violation: 'No Permit',
    fine: 60,
    ticketStatus: 'challenged',
    images: 'test.jpg',
    note: 'Test note',
    challengeReason: 'Wrong vehicle'
  }
];

const onTicketsUpdate = vi.fn();
const onError = vi.fn();

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('renders list of challenged tickets', () => {
  render(
    <ChallengedTickets
      tickets={mockTickets}
      onTicketsUpdate={onTicketsUpdate}
      onError={onError}
    />
  );

  expect(screen.getByText('Active Challenges: 3')).toBeDefined();
});

it('displays ticket details when selected', async () => {
  render(
    <ChallengedTickets
      tickets={mockTickets}
      onTicketsUpdate={onTicketsUpdate}
      onError={onError}
    />
  );

  const ticket = screen.getByText('Ticket #123');
  await userEvent.click(ticket);

  expect(screen.getByText('I had a valid permit')).toBeDefined();
  expect(screen.getByText('No Permit')).toBeDefined();
  expect(screen.getByText('$50.00')).toBeDefined();
});

it('handles accepting a challenge', async () => {
  vi.mocked(acceptTicketChallenge).mockResolvedValueOnce(mockTickets[0]);
  vi.mocked(getChallengedTickets).mockResolvedValueOnce([mockTickets[1]]); // Mock directly instead of re-mocking module

  render(
    <ChallengedTickets
      tickets={mockTickets}
      onTicketsUpdate={onTicketsUpdate}
      onError={onError}
    />
  );

  const ticket = screen.getByText('Ticket #123');
  await userEvent.click(ticket);

  const acceptButton = screen.getByText('Accept Challenge');
  await userEvent.click(acceptButton);

  expect(acceptTicketChallenge).toHaveBeenCalledWith('123');
  
  await waitFor(() => {
    expect(onTicketsUpdate).toHaveBeenCalledWith([mockTickets[1]]);
    expect(screen.getByText('No Ticket Selected')).toBeDefined();
  });
});

it('handles rejecting a challenge', async () => {
  vi.mocked(rejectTicketChallenge).mockResolvedValueOnce(mockTickets[0]);
  vi.mocked(getChallengedTickets).mockResolvedValueOnce([mockTickets[1]]); // Mock directly instead of re-mocking module

  render(
    <ChallengedTickets
      tickets={mockTickets}
      onTicketsUpdate={onTicketsUpdate}
      onError={onError}
    />
  );

  const ticket = screen.getByText('Ticket #123');
  await userEvent.click(ticket);

  const rejectButton = screen.getByText('Reject Challenge');
  await userEvent.click(rejectButton);

  expect(rejectTicketChallenge).toHaveBeenCalledWith('123');
  
  await waitFor(() => {
    expect(onTicketsUpdate).toHaveBeenCalledWith([mockTickets[1]]);
    expect(screen.getByText('No Ticket Selected')).toBeDefined();
  });
});

it('handles errors when accepting challenge', async () => {
  const error = new Error('Failed to accept challenge');
  vi.mocked(acceptTicketChallenge).mockRejectedValueOnce(error);

  render(
    <ChallengedTickets
      tickets={mockTickets}
      onTicketsUpdate={onTicketsUpdate}
      onError={onError}
    />
  );

  const ticket = screen.getByText('Ticket #123');
  await userEvent.click(ticket);

  const acceptButton = screen.getByText('Accept Challenge');
  await userEvent.click(acceptButton);

  expect(onError).toHaveBeenCalledWith('Failed to accept challenge');
  expect(screen.getByText('An error occurred while managing the ticket challenge.')).toBeDefined();
});

it('handles errors when rejecting challenge', async () => {
  const error = new Error('Failed to reject challenge');
  vi.mocked(rejectTicketChallenge).mockRejectedValueOnce(error);

  render(
    <ChallengedTickets
      tickets={mockTickets}
      onTicketsUpdate={onTicketsUpdate}
      onError={onError}
    />
  );

  const ticket = screen.getByText('Ticket #123');
  await userEvent.click(ticket);

  const rejectButton = screen.getByText('Reject Challenge');
  await userEvent.click(rejectButton);

  expect(onError).toHaveBeenCalledWith('Failed to reject challenge');
  expect(screen.getByText('An error occurred while managing the ticket challenge.')).toBeDefined();
});

it('displays no tickets selected message initially', () => {
  render(
    <ChallengedTickets
      tickets={mockTickets}
      onTicketsUpdate={onTicketsUpdate}
      onError={onError}
    />
  );

  expect(screen.getByText('No Ticket Selected')).toBeDefined();
});

it('truncates long vehicle identifiers', () => {
  render(
    <ChallengedTickets
      tickets={[mockTickets[2]]} // Use the ticket with long vehicle ID
      onTicketsUpdate={onTicketsUpdate}
      onError={onError}
    />
  );

  // Should not show full vehicle ID
  expect(screen.queryByText('Vehicle: ThisIsAVeryLongVehicleIdentifier123')).toBeNull();
});


import { it, expect, vi, beforeEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AcceptedTickets } from '@/app/components/tickets/AcceptedTickets';

const mockAcceptedTickets = [
  {
    id: '123',
    vehicle: 'ABC123',
    enforcer: 'ENF123',
    issuedDate: new Date('2024-01-01'),
    violation: 'No Permit',
    fine: 50,
    ticketStatus: 'accepted',
    images: 'test.jpg',
    note: 'Test note'
  },
  {
    id: '456',
    vehicle: 'DEF456',
    enforcer: 'ENF456',
    issuedDate: new Date('2024-01-02'),
    violation: 'Expired Permit',
    fine: 75,
    ticketStatus: 'accepted',
    images: 'image1.jpg',
    note: 'Multiple violations'
  },
  {
    id: '789',
    vehicle: 'ThisIsAVeryLongVehicleIdentifier123',
    enforcer: 'ENF789',
    issuedDate: new Date('2024-01-03'),
    violation: 'Invalid Zone',
    fine: 60,
    ticketStatus: 'accepted',
    images: 'test3.jpg',
    note: 'Test note'
  }
];

beforeEach(() => {
  cleanup();
});

it('displays error message when error prop is provided', () => {
  const errorMessage = 'Failed to fetch accepted tickets';

  render(
    <AcceptedTickets
      tickets={[]}
      error={errorMessage}
    />
  );

  expect(screen.getByText(errorMessage)).toBeDefined();
});

it('renders list of accepted tickets', () => {
  render(
    <AcceptedTickets
      tickets={mockAcceptedTickets}
      error={null}
    />
  );

  expect(screen.getByText('Accepted Tickets: 3')).toBeDefined();
  expect(screen.getByText('ABC123', { exact: false })).toBeDefined();
  expect(screen.getByText('DEF456', { exact: false })).toBeDefined();

  // Verify ACCEPTED status chips are present
  const statusChips = screen.getAllByText('ACCEPTED');
  expect(statusChips).toHaveLength(mockAcceptedTickets.length);
});

it('displays ticket details when selected', async () => {
  render(
    <AcceptedTickets
      tickets={mockAcceptedTickets}
      error={null}
    />
  );

  const ticket = screen.getByText('Ticket #123');
  await userEvent.click(ticket);

  expect(screen.getByText('No Permit')).toBeDefined();
  expect(screen.getByText('$50.00')).toBeDefined();
  expect(screen.getByText('Test note')).toBeDefined();
  expect(screen.getByAltText('Evidence')).toBeDefined();
});

it('truncates long vehicle identifiers', () => {
  render(
    <AcceptedTickets
      tickets={[mockAcceptedTickets[2]]}
      error={null}
    />
  );

  expect(screen.queryByText('ThisIsAVeryLongVehicleIdentifier123')).toBeNull();
  expect(screen.getByText('ThisIsAVeryLongV...', { exact: false })).toBeDefined();
});

it('displays no ticket selected message initially', () => {
  render(
    <AcceptedTickets
      tickets={mockAcceptedTickets}
      error={null}
    />
  );

  expect(screen.getByText('No Ticket Selected')).toBeDefined();
  expect(screen.getByText('Select a ticket from the list to view its details')).toBeDefined();
});

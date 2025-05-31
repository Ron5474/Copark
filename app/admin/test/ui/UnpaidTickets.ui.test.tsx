import { it, expect, vi, beforeEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnpaidTickets } from '@/app/components/tickets/UnpaidTickets';

const mockUnpaidTickets = [
	{
		id: '123',
		vehicle: 'ABC123',
		enforcer: 'ENF123',
		issuedDate: new Date('2024-01-01'),
		violation: 'No Permit',
		fine: 50,
		ticketStatus: 'unpaid',
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
		ticketStatus: 'unpaid',
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
		ticketStatus: 'unpaid',
		images: 'test3.jpg',
		note: 'Test note'
	}
];

beforeEach(() => {
	cleanup();
});

it('renders list of unpaid tickets', () => {
	render(<UnpaidTickets tickets={mockUnpaidTickets} />);

	expect(screen.getByText('Unpaid Tickets: 3')).toBeDefined();
	expect(screen.getByText('ABC123', { exact: false })).toBeDefined();
	expect(screen.getByText('DEF456', { exact: false })).toBeDefined();

	// Verify UNPAID status chips are present
	const statusChips = screen.getAllByText('UNPAID');
	expect(statusChips).toHaveLength(mockUnpaidTickets.length);
});

it('displays ticket details when selected', async () => {
	render(<UnpaidTickets tickets={mockUnpaidTickets} />);

	const ticket = screen.getByText('Ticket #123');
	await userEvent.click(ticket);

	expect(screen.getByText('No Permit')).toBeDefined();
	expect(screen.getByText('$50.00')).toBeDefined();
	expect(screen.getByText('Test note')).toBeDefined();
	expect(screen.getByAltText('Evidence')).toBeDefined();
});

it('truncates long vehicle identifiers', () => {
	render(<UnpaidTickets tickets={[mockUnpaidTickets[2]]} />);

	expect(screen.queryByText('ThisIsAVeryLongVehicleIdentifier123')).toBeNull();
	expect(screen.getByText('ThisIsAVeryLongV...', { exact: false })).toBeDefined();
});

it('displays no ticket selected message initially', () => {
	render(<UnpaidTickets tickets={mockUnpaidTickets} />);

	expect(screen.getByText('No Ticket Selected')).toBeDefined();
	expect(screen.getByText('Select a ticket from the list to view its details')).toBeDefined();
});


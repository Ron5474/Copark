/**
 * @vitest-environment node
 */

import { beforeAll, afterAll, test, expect } from 'vitest';
import { reset, shutdown } from './db';
import { TicketService } from '../src/ticket/service';
import { NewTicket, TicketInput } from '../src/ticket/schema';

const ticketService = new TicketService();

beforeAll(async () => {
  await reset();
});

afterAll(async () => {
  await shutdown();
});

test('getTickets should return a list of enforcers', async () => {
    const tickets = await ticketService.getTickets();

    // console.log(enforcers)
    expect(tickets).toHaveLength(2);
    expect(tickets[0].issuedDate).toBe("2025-05-08T04:04:49.353Z");
    expect(tickets[0].ticketStatus).toBe('unpaid');

    expect(tickets[1].issuedDate).toBe("2025-05-08T04:05:49.356Z");
    expect(tickets[0].ticketStatus).toBe('unpaid');
});
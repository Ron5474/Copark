/**
 * @vitest-environment node
 */

import { beforeAll, afterAll, test, expect } from 'vitest';
import { SignJWT } from 'jose';

import db from './db';
import { TicketService } from '../src/ticket/service';
import { NewTicket, TicketInput } from '../src/ticket/schema';

const ticketService = new TicketService();

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET + 'apiexit')

beforeAll(async () => {
  await db.reset();
});

afterAll(async () => {
  await db.shutdown();
});

async function encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
  }

test('getTickets should return a list of enforcers', async () => {
    const tickets = await ticketService.getTickets();

    expect(tickets).toHaveLength(2);
    expect(tickets[0].ticketStatus).toBe('unpaid');
    expect(tickets[1].ticketStatus).toBe('unpaid');
});

test('createTicket should return a newTicket', async () => {
    const newTicket: NewTicket = {
        vehicle: await encrypt('00000000-0000-0000-0000-000000000000'),
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 100,
        violation: 'speeding',
        images: 'image1.jpg',
    };

    const ticket = await ticketService.createTicket(newTicket);

    // console.log(ticket)
    expect(ticket).toHaveProperty('id');
    expect(ticket).toHaveProperty('vehicle', newTicket.vehicle);
    expect(ticket).toHaveProperty('enforcer', newTicket.enforcer);
    expect(ticket).toHaveProperty('fine', newTicket.fine);
    expect(ticket).toHaveProperty('violation', newTicket.violation);
    expect(ticket).toHaveProperty('images', newTicket.images);
});
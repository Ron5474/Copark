/**
 * @vitest-environment node
 */

import { beforeAll, afterAll, test, expect } from 'vitest';
import { SignJWT } from 'jose';

import db from './db';
import { TicketService } from '../src/ticket/service';
import { ModifyTicketInput, NewTicket, TicketInput } from '../src/ticket/schema';

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

test('getTickets should return a list of tickets', async () => {
    const tickets = await ticketService.getTickets();

    expect(tickets).toHaveLength(3);
    expect(tickets[0].ticketStatus).toBe('unpaid');
    expect(tickets[1].ticketStatus).toBe('unpaid');
    expect(tickets[2].ticketStatus).toBe('unpaid');
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

test('createTicket should return a newTicket (with no image)', async () => {
    const newTicket: NewTicket = {
        vehicle: await encrypt('00000000-0000-0000-0000-000000000000'),
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 100,
        violation: 'speeding',
    };

    const ticket = await ticketService.createTicket(newTicket);

    // console.log(ticket)
    expect(ticket).toHaveProperty('id');
    expect(ticket).toHaveProperty('vehicle', newTicket.vehicle);
    expect(ticket).toHaveProperty('enforcer', newTicket.enforcer);
    expect(ticket).toHaveProperty('fine', newTicket.fine);
    expect(ticket).toHaveProperty('violation', newTicket.violation);
    expect(ticket).not.toHaveProperty('images', newTicket.images);
});

test('createTicket should error with bad id', async () => {
    const newTicket: NewTicket = {
        vehicle: await encrypt('00000000-0000-0000-0000-000000000000'),
        enforcer: 'not a uuid',
        fine: 100,
        violation: 'speeding',
    };

    await expect(ticketService.createTicket(newTicket))
        .rejects
        .toThrow('Invalid enforcer or vehicle ID.');
});

test('createTicket should return a newTicket', async () => {
    const newTicket: NewTicket = {
        vehicle: await encrypt('00000000-0000-0000-0000-000000000000'),
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 100000000,
        violation: 'blowing up a red light',
        images: 'image1.jpg',
    };

    const ticket = await ticketService.createTicket(newTicket);

    const modifiedTicket: ModifyTicketInput = {
        id: ticket.id,
        vehicle: await encrypt('12341234-0000-0000-0000-000000000000'),
        fine: 9,
        violation: 'vaporizing a small child',
        images: 'image213.jpg',
    };

    const modifiedTicketResult = await ticketService.modifyTicket(modifiedTicket);
    expect(modifiedTicketResult).toHaveProperty('id');
    expect(modifiedTicketResult).toHaveProperty('vehicle', modifiedTicket.vehicle);
    expect(modifiedTicketResult).toHaveProperty('fine', modifiedTicket.fine);
    expect(modifiedTicketResult).toHaveProperty('violation', modifiedTicket.violation);
    expect(modifiedTicketResult).toHaveProperty('images', modifiedTicket.images);
  });

test('createTicket should error with no ticket ID', async () => {
    const newTicket: NewTicket = {
        vehicle: await encrypt('00000000-0000-0000-0000-000000000000'),
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 100000000,
        violation: 'blowing up a red light',
        images: 'image1.jpg',
    };

    const ticket = await ticketService.createTicket(newTicket);

    const modifiedTicket: ModifyTicketInput = {
        id: ticket.id + 'extra',
        vehicle: await encrypt('12341234-0000-0000-0000-000000000000'),
        fine: 9,
        violation: 'vaporizing a small child',
        images: 'image213.jpg',
    };

    await expect(ticketService.modifyTicket(modifiedTicket))
        .rejects
        .toThrow('Invalid or missing ticket ID.');
  });

test('createTicket should error with no update fields', async () => {
  const newTicket: NewTicket = {
      vehicle: await encrypt('00000000-0000-0000-0000-000000000000'),
      enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
      fine: 100000000,
      violation: 'blowing up a red light',
      images: 'image1.jpg',
  };

  const ticket = await ticketService.createTicket(newTicket);

  const modifiedTicket: ModifyTicketInput = {
      id: ticket.id,
  };

  await expect(ticketService.modifyTicket(modifiedTicket))
      .rejects
      .toThrow('No fields provided to update.');
});

test('createTicket should error with no update fields', async () => {
  const modifiedTicket: ModifyTicketInput = {
      id: await encrypt('00000000-0000-0000-0000-000000000000'),
      fine: 100000000,
      violation: 'blowing up a red light',
      images: 'image1.jpg',
  };

  await expect(ticketService.modifyTicket(modifiedTicket))
      .rejects
      .toThrow('No update found.');
});

test('deleteTicket should delete a ticket', async () => {
    const newTicket: NewTicket = {
        vehicle: await encrypt('00000000-0000-0000-0000-000000000000'),
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 12344321,
        violation: 'blowing up a red light',
        images: 'image1.jpg',
    };

    const ticket = await ticketService.createTicket(newTicket);

    const deletedTicket: TicketInput = {
        id: ticket.id,
    };

    const deletedTicketRes = await ticketService.deleteTicket(deletedTicket);
    // console.log(deletedTicketRes);
    expect(deletedTicketRes).toHaveProperty('id');
    expect(deletedTicketRes).toHaveProperty('vehicle', newTicket.vehicle);
    expect(deletedTicketRes).toHaveProperty('enforcer', newTicket.enforcer);
    expect(deletedTicketRes).toHaveProperty('fine', newTicket.fine);
    expect(deletedTicketRes).toHaveProperty('violation', newTicket.violation);
  });

test('deleteTicket should delete a ticket', async () => {
    const newTicket: NewTicket = {
        vehicle: await encrypt('00000000-0000-0000-0000-000000000000'),
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 12344321,
        violation: 'blowing up a red light',
        images: 'image1.jpg',
    };

    const ticket = await ticketService.createTicket(newTicket);

    const deletedTicket: TicketInput = {
        id: ticket.id + 'extra',
    };

    await expect(ticketService.deleteTicket(deletedTicket))
      .rejects
      .toThrow('No delete found.');
  });
/**
 * @vitest-environment node
 */

import { afterAll, test, expect, beforeEach } from 'vitest';
import { SignJWT } from 'jose';

import db from './db';
import { TicketService } from '../src/ticket/service';
import { ModifyTicketInput, NewTicket, TicketInput } from '../src/ticket/schema';


const ticketService = new TicketService();

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

beforeEach(async () => {
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

test('getTickets should return all unpaid tickets', async () => {
    const tickets = await ticketService.getTickets();

    expect(tickets).toHaveLength(8);
    expect(tickets[0].ticketStatus).toBe('unpaid');
    expect(tickets[1].ticketStatus).toBe('unpaid');
    expect(tickets[2].ticketStatus).toBe('unpaid');
});

test('createTicket should successfully create a ticket with all fields', async () => {
    const newTicket: NewTicket = {
        vehicle: '00000000-0000-0000-0000-000000000000',
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 100,
        violation: 'speeding',
        images: 'image1.jpg',
    };

    const ticket = await ticketService.createTicket(newTicket);

    expect(ticket).toHaveProperty('id');
    expect(ticket).toHaveProperty('vehicle', newTicket.vehicle);
    expect(ticket).toHaveProperty('enforcer', newTicket.enforcer);
    expect(ticket).toHaveProperty('fine', newTicket.fine);
    expect(ticket).toHaveProperty('violation', newTicket.violation);
    expect(ticket).toHaveProperty('images', newTicket.images);
});

test('createTicket should successfully create a ticket without images', async () => {
    const newTicket: NewTicket = {
        vehicle: '00000000-0000-0000-0000-000000000000',
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 100,
        violation: 'speeding',
    };

    const ticket = await ticketService.createTicket(newTicket);

    expect(ticket).toHaveProperty('id');
    expect(ticket).toHaveProperty('vehicle', newTicket.vehicle);
    expect(ticket).toHaveProperty('enforcer', newTicket.enforcer);
    expect(ticket).toHaveProperty('fine', newTicket.fine);
    expect(ticket).toHaveProperty('violation', newTicket.violation);
    expect(ticket).not.toHaveProperty('images', newTicket.images);
});

test('createTicket should throw an error for invalid enforcer ID', async () => {
    const newTicket: NewTicket = {
        vehicle: '00000000-0000-0000-0000-000000000000',
        enforcer: 'not a uuid',
        fine: 100,
        violation: 'speeding',
    };

    await expect(ticketService.createTicket(newTicket))
        .rejects
        .toThrow('Invalid enforcer or vehicle ID.');
});

test('modifyTicket should successfully update a ticket', async () => {
    const newTicket: NewTicket = {
        vehicle: '00000000-0000-0000-0000-000000000000',
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 100000000,
        violation: 'blowing up a red light',
        images: 'image1.jpg',
    };

    const ticket = await ticketService.createTicket(newTicket);

    const modifiedTicket: ModifyTicketInput = {
        id: ticket.id,
        vehicle: '12341234-0000-0000-0000-000000000000',
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

test('modifyTicket should successfully update a ticket without new vehicleID', async () => {
    const newTicket: NewTicket = {
        vehicle: '00000000-0000-0000-0000-000000000000',
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 100000000,
        violation: 'blowing up a red light',
        images: 'image1.jpg',
    };

    const ticket = await ticketService.createTicket(newTicket);

    const modifiedTicket: ModifyTicketInput = {
        id: ticket.id,
        fine: 9,
        violation: 'vaporizing a small child',
        images: 'image213.jpg',
    };

    const modifiedTicketResult = await ticketService.modifyTicket(modifiedTicket);

    expect(modifiedTicketResult).toHaveProperty('id');
    expect(modifiedTicketResult).toHaveProperty('vehicle', newTicket.vehicle);
    expect(modifiedTicketResult).toHaveProperty('fine', modifiedTicket.fine);
    expect(modifiedTicketResult).toHaveProperty('violation', modifiedTicket.violation);
    expect(modifiedTicketResult).toHaveProperty('images', modifiedTicket.images);
});

test('modifyTicket should throw an error for invalid ticket ID', async () => {
    const newTicket: NewTicket = {
        vehicle: '00000000-0000-0000-0000-000000000000',
        enforcer: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 100000000,
        violation: 'blowing up a red light',
        images: 'image1.jpg',
    };

    const ticket = await ticketService.createTicket(newTicket);

    const modifiedTicket: ModifyTicketInput = {
        id: ticket.id + 'extra',
        vehicle: '12341234-0000-0000-0000-000000000000',
        fine: 9,
        violation: 'vaporizing a small child',
        images: 'image213.jpg',
    };

    await expect(ticketService.modifyTicket(modifiedTicket))
        .rejects
        .toThrow('Invalid or missing ticket ID.');
});

test('modifyTicket should throw an error when no fields are provided to update', async () => {
    const newTicket: NewTicket = {
        vehicle: '00000000-0000-0000-0000-000000000000',
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

test('modifyTicket should throw an error when ticket ID does not match any record', async () => {
    const modifiedTicket: ModifyTicketInput = {
        id: await encrypt('00000000-0000-0000-0000-000000000000'),
        fine: 100000000,
        violation: 'blowing up a red light',
        images: 'image1.jpg',
    };

    await expect(ticketService.modifyTicket(modifiedTicket))
        .rejects
        .toThrow('Ticket not found.');
});

test('deleteTicket should successfully delete a ticket', async () => {
    const newTicket: NewTicket = {
        vehicle: '00000000-0000-0000-0000-000000000000',
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

    expect(deletedTicketRes).toHaveProperty('id');
    expect(deletedTicketRes).toHaveProperty('vehicle');
    expect(deletedTicketRes).toHaveProperty('enforcer');
    expect(deletedTicketRes).toHaveProperty('fine', newTicket.fine);
    expect(deletedTicketRes).toHaveProperty('violation', newTicket.violation);
});

test('deleteTicket should throw an error for invalid ticket ID', async () => {
    const newTicket: NewTicket = {
        vehicle: '00000000-0000-0000-0000-000000000000',
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

test('getTicketsForVehicleID should return tickets for the provided vehicle IDs', async () => {
    const vehicleid1 = 'f26adf21-f967-4283-8417-f72298bc7bbe';

    const tickets = await ticketService.getTicketsForVehicleID([vehicleid1]);

    expect(tickets).toBeDefined();
    expect(tickets).toHaveLength(1);

    expect(tickets![0]).toHaveProperty('violation', 'parking');
    expect(tickets![0]).toHaveProperty('ticketStatus', 'unpaid');
});

test('getTicketsByDay should return tickets by day', async () => {
    const ticketsByDay = await ticketService.getAllTicketsCount();

    const date = new Date();
    const today = date.toISOString().split('T')[0];
    date.setDate(date.getDate() - 1);
    const yest = date.toISOString().split('T')[0];

    const todayEntry = ticketsByDay.find(entry => entry.date === today);
    const yestEntry = ticketsByDay.find(entry => entry.date === yest);

    expect(yestEntry?.tickets).toHaveLength(1);
    expect(todayEntry?.tickets).toHaveLength(7);
});

test('getTicketsIssuedByEnforcer should return tickets issued by provided enforcer', async () => {
    const tickets = await ticketService.getTicketsPerDayFromEnforcer(await encrypt('431b3711-73bb-4c90-afcf-59116217c0db'));

    expect(tickets).toHaveLength(1);
});

test('getTicketsIssuedByEnforcer should return empty array for issued by badly provided enforcer', async () => {
    const tickets = await ticketService.getTicketsPerDayFromEnforcer(await encrypt('00000000-0000-0000-1111-000000000000'));

    expect(tickets).toStrictEqual([]);
});


// test('getTicketsForUserJWT should return tickets for the provided userJWT', async () => {
//     const userID = '0f99f921-594e-4387-9d05-e6e80d8aa54a'

//     const tickets = await ticketService.getTicketsForUserJWT(await encrypt(userID));

//     console.log(tickets);
//     expect(tickets).toBeDefined();

//     expect(tickets![0]).toHaveProperty('violation', 'parking');
//     expect(tickets![0]).toHaveProperty('ticketStatus', 'unpaid');
// });
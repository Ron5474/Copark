import { test, beforeAll, afterAll, expect } from 'vitest'
import * as http from 'http'
// @ts-ignore
import supertest from 'supertest'

import { app, bootstrap } from '../src/app'
import { Ticket, NewTicket, TicketInput, ModifyTicketInput } from '../src/ticket/schema'

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
  await bootstrap()
});

afterAll(() => {
  server.close();
});
  
test('Ticket schema loads correctly', () => {
  const testTicket = new Ticket();
  testTicket.id = '1234';
  testTicket.vehicle = 'vehicle1';
  testTicket.enforcer = 'enforcer1';
  testTicket.issuedDate = new Date('2025-05-11T12:00:00Z');
  testTicket.violation = 'speeding';
  testTicket.fine = 100;
  testTicket.ticketStatus = 'active';
  testTicket.images = 'image1.jpg';

  expect(testTicket).toBeDefined();
  expect(testTicket.id).toBe('1234');
  expect(testTicket.vehicle).toBe('vehicle1');
  expect(testTicket.enforcer).toBe('enforcer1');
  expect(testTicket.issuedDate.toISOString()).toBe('2025-05-11T12:00:00.000Z');
  expect(testTicket.violation).toBe('speeding');
  expect(testTicket.fine).toBe(100);
  expect(testTicket.ticketStatus).toBe('active');
  expect(testTicket.images).toBe('image1.jpg');
});

test('NewTicket schema loads correctly', () => {
  const testNewTicket = new NewTicket();
  testNewTicket.vehicle = 'vehicle1';
  testNewTicket.enforcer = 'enforcer1';
  testNewTicket.fine = 100;
  testNewTicket.violation = 'speeding';
  testNewTicket.images = 'image1.jpg';

  expect(testNewTicket).toBeDefined();
  expect(testNewTicket.vehicle).toBe('vehicle1');
  expect(testNewTicket.enforcer).toBe('enforcer1');
  expect(testNewTicket.fine).toBe(100);
  expect(testNewTicket.violation).toBe('speeding');
  expect(testNewTicket.images).toBe('image1.jpg');
});

test('NewTicket schema loads correctly even without images', () => {
  const testNewTicket = new NewTicket();
  testNewTicket.vehicle = 'vehicle1';
  testNewTicket.enforcer = 'enforcer1';
  testNewTicket.fine = 100;
  testNewTicket.violation = 'speeding';

  expect(testNewTicket).toBeDefined();
  expect(testNewTicket.vehicle).toBe('vehicle1');
  expect(testNewTicket.enforcer).toBe('enforcer1');
  expect(testNewTicket.fine).toBe(100);
  expect(testNewTicket.violation).toBe('speeding');
  expect(testNewTicket.images).toBeUndefined();
});

test('TicketInput schema loads correctly', () => {
  const testTicketInput = new TicketInput();
  testTicketInput.id = '1234';

  expect(testTicketInput).toBeDefined();
  expect(testTicketInput.id).toBe('1234');
});

test('ModifyTicketInput schema loads correctly', () => {
  const testModifyTicketInput = new ModifyTicketInput();
  testModifyTicketInput.id = '1234';
  testModifyTicketInput.vehicle = 'vehicle1';
  testModifyTicketInput.violation = 'speeding';
  testModifyTicketInput.fine = 100;
  testModifyTicketInput.ticketStatus = 'active';
  testModifyTicketInput.images = 'image1.jpg';

  expect(testModifyTicketInput).toBeDefined();
  expect(testModifyTicketInput.id).toBe('1234');
  expect(testModifyTicketInput.vehicle).toBe('vehicle1');
  expect(testModifyTicketInput.violation).toBe('speeding');
  expect(testModifyTicketInput.fine).toBe(100);
  expect(testModifyTicketInput.ticketStatus).toBe('active');
  expect(testModifyTicketInput.images).toBe('image1.jpg');
});

test('GET playground', async () => {
    await supertest(server)
      .get('/playground')
      .expect(200)
})
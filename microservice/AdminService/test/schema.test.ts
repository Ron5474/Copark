import { test, beforeAll, afterAll, expect } from 'vitest';
import * as http from 'http';
import db from './db';
import { app, bootstrap } from '../src/app';
import {
  User,
  NewUser,
  UserInput,
  APIUser,
  APIUserID,
  ViolationBreakdown,
  EnforcerBreakdown,
  TicketReport,
  ZoneStats,
  LotStats,
  PermitReport
} from '../src/admin/schema';


let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

beforeAll(async () => {
  server = http.createServer(app);
  server.listen();
  await bootstrap();
  return db.reset();
});

afterAll(() => {
  db.shutdown();
  server.close();
});

// Test Data
export const UserData = {
  id: '1234',
  name: 'Enforcer 1',
  email: 'enforcer1@outlook.com',
  accountStatus: 'active',
  password: 'securepassword',
};

test('User schema loads correctly', () => {
  // Create instance of User
  const testUser = new User();
  testUser.id = UserData.id;
  testUser.name = UserData.name;
  testUser.email = UserData.email;
  testUser.accountStatus = UserData.accountStatus;
  testUser.password = UserData.password;

  expect(testUser).toBeDefined();
  expect(testUser.id).toBe(UserData.id);
  expect(testUser.name).toBe(UserData.name);
  expect(testUser.email).toBe(UserData.email);
  expect(testUser.accountStatus).toBe(UserData.accountStatus);
  expect(testUser.password).toBe(UserData.password);
});

test('NewUser input type validation', () => {
  const newUser: NewUser = {
    name: 'Enforcer 2',
    email: 'enforcer2@outlook.com',
  };

  expect(newUser.name).toBeDefined();
  expect(newUser.name).toBe('Enforcer 2');
  expect(newUser.email).toBeDefined();
  expect(newUser.email).toBe('enforcer2@outlook.com');
});

test('UserInput input type validation', () => {
  const UserInput: UserInput = {
    id: '1234',
  };

  expect(UserInput.id).toBeDefined();
  expect(UserInput.id).toBe('1234');
});

test('APIUser Object Validation', () => {
  const apiUser = new APIUser()
  apiUser.id = '1234'
  expect(apiUser.id).toBeDefined();
});

test('APIUserID Object Validation', () => {
  const apiUserID = new APIUserID()
  apiUserID.id = '1234'
  expect(apiUserID.id).toBeDefined();
});

test('ViolationBreakdown schema loads correctly', () => {
  const vb = new ViolationBreakdown();
  vb.violation = 'No Permit';
  vb.count = 5;

  expect(vb).toBeDefined();
  expect(vb.violation).toBe('No Permit');
  expect(vb.count).toBe(5);
});

test('EnforcerBreakdown schema loads correctly', () => {
  const eb = new EnforcerBreakdown();
  eb.enforcer = 'Enforcer 1';
  eb.count = 10;

  expect(eb).toBeDefined();
  expect(eb.enforcer).toBe('Enforcer 1');
  expect(eb.count).toBe(10);
});

test('TicketReport schema loads correctly', () => {
  const vb = new ViolationBreakdown();
  vb.violation = 'No Permit';
  vb.count = 5;

  const eb = new EnforcerBreakdown();
  eb.enforcer = 'Enforcer 1';
  eb.count = 10;

  const tr = new TicketReport();
  tr.totalTickets = 100;
  tr.unpaidTickets = 20;
  tr.paidTickets = 80;
  tr.totalRevenue = 5000;
  tr.violationBreakdown = [vb];
  tr.enforcerBreakdown = [eb];

  expect(tr).toBeDefined();
  expect(tr.totalTickets).toBe(100);
  expect(tr.unpaidTickets).toBe(20);
  expect(tr.paidTickets).toBe(80);
  expect(tr.totalRevenue).toBe(5000);
  expect(tr.violationBreakdown).toEqual([vb]);
  expect(tr.enforcerBreakdown).toEqual([eb]);
});

test('ZoneStats schema loads correctly', () => {
  const zs = new ZoneStats();
  zs.area = 'Zone A';
  zs.totalPermits = 50;

  expect(zs).toBeDefined();
  expect(zs.area).toBe('Zone A');
  expect(zs.totalPermits).toBe(50);
});

test('LotStats schema loads correctly', () => {
  const ls = new LotStats();
  ls.area = 'Lot 1';
  ls.durationType = 'Daily';
  ls.totalPermits = 30;

  expect(ls).toBeDefined();
  expect(ls.area).toBe('Lot 1');
  expect(ls.durationType).toBe('Daily');
  expect(ls.totalPermits).toBe(30);
});

test('PermitReport schema loads correctly', () => {
  const zs = new ZoneStats();
  zs.area = 'Zone A';
  zs.totalPermits = 50;

  const ls = new LotStats();
  ls.area = 'Lot 1';
  ls.durationType = 'Daily';
  ls.totalPermits = 30;

  const pr = new PermitReport();
  pr.totalPermits = 100;
  pr.activePermits = 80;
  pr.expiredPermits = 20;
  pr.totalRevenue = 2000;
  pr.zoneBreakdown = [zs];
  pr.lotBreakdown = [ls];

  expect(pr).toBeDefined();
  expect(pr.totalPermits).toBe(100);
  expect(pr.activePermits).toBe(80);
  expect(pr.expiredPermits).toBe(20);
  expect(pr.totalRevenue).toBe(2000);
  expect(pr.zoneBreakdown).toEqual([zs]);
  expect(pr.lotBreakdown).toEqual([ls]);
});
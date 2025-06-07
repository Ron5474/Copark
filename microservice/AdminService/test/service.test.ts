/**
 * @vitest-environment node
 */

import { beforeAll, afterAll, test, expect } from 'vitest';
import db from './db';
import { AdminService } from '../src/admin/service';
import { APICredential, NewUser, UserInput } from '../src/admin/schema';

const adminService = new AdminService();

import { jwtVerify } from 'jose';

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

async function decrypt(token: string): Promise<string | undefined> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);

    return payload.id as string;
  } catch (error) {
    return undefined;
  }
}

beforeAll(async () => {
  await db.reset();
});

afterAll(async () => {
  await db.shutdown();
});

test('getEnforcers should return a list of enforcers', async () => {
    const enforcers = await adminService.getEnforcers();

    // console.log(enforcers)
    expect(enforcers).toHaveLength(2);
    expect(enforcers[0].name).toBe('James Bond');
    expect(enforcers[0].accountStatus).toBe('active');

    expect(enforcers[1].name).toBe('John Wick');
    expect(enforcers[1].accountStatus).toBe('active');
});

test('AddEnforcer should add an enforcer', async () => {
    const enforcer: NewUser = { name: 'Enforcer 3', email: 'enforcer3@outlook.com' };
    await adminService.addEnforcer(enforcer);

    const enforcers = await adminService.getEnforcers();

    expect(enforcers).toHaveLength(3);
    expect(enforcers[2].name).toBe('John Wick');
    expect(enforcers[2].email).toBe('babayaga@copark.com');
    expect(enforcers[2].accountStatus).toBe('active');
});

test('AddEnforcer should return undefined on attempting to add an already existing enforcer', async () => {
    const enforcer: NewUser = { name: 'Enforcer 3', email: 'enforcer3@outlook.com' };
    const result = await adminService.addEnforcer(enforcer);
    expect(result).toBeUndefined();
});

test('suspendUser should suspend an enforcer', async () => {
    const enforcer: NewUser = { name: 'Michelle Obama', email: 'michelle.obama@example.com' };
    const addedEnforcers = await adminService.addEnforcer(enforcer);
  
    const enforcerInput: UserInput = { id: addedEnforcers[0].id };
    const updatedEnforcers = await adminService.suspendUser(enforcerInput);
  
    expect(updatedEnforcers).toHaveLength(1);
    expect(updatedEnforcers[0].name).toBe('Michelle Obama');
    expect(updatedEnforcers[0].accountStatus).toBe('suspended');
});
  
test('suspendUser should not work with a bad jwt input', async () => {
    const enforcer: NewUser = { name: 'Michelle Obama', email: 'michelle.obamas@example.com' };
    const addedEnforcers = await adminService.addEnforcer(enforcer);
  
    const enforcerInput: UserInput = { id: addedEnforcers[0].id + 'extra text' };
    const updatedEnforcers = await adminService.suspendUser(enforcerInput);
  
    expect(updatedEnforcers).toHaveLength(0);
});

test('reinstateUser should reinstate a suspended user', async () => {
    const enforcer: NewUser = { name: 'Barack Obama', email: 'Barack.obama@example.com' };
    const addedEnforcers = await adminService.addEnforcer(enforcer);
  
    const userInput: UserInput = { id: addedEnforcers[0].id };
    const updatedEnforcers = await adminService.suspendUser(userInput);
  
    expect(updatedEnforcers).toHaveLength(1);
    expect(updatedEnforcers[0].accountStatus).toBe('suspended');

    const reinstatedUser = await adminService.reinstateUser(userInput);
    expect(reinstatedUser).toHaveLength(1);
    expect(reinstatedUser[0].accountStatus).toBe('active');
});

test('getDrivers should return a list of drivers', async () => {
    const enforcers = await adminService.getDrivers();

    expect(enforcers).toHaveLength(4);
    expect(enforcers[0].name).toBe('Bryant Oliver');
    expect(enforcers[0].accountStatus).toBe('active');

    expect(enforcers[1].name).toBe('Driver 1');
    expect(enforcers[1].accountStatus).toBe('active');
});

test('deleteUser should delete a user', async () => {
    const enforcer: NewUser = { name: 'barracks Obama', email: 'barracks.obama@example.com' };
    const addedEnforcers = await adminService.addEnforcer(enforcer);
  
    const enforcerInput: UserInput = { id: addedEnforcers[0].id };
    const updatedEnforcers = await adminService.deleteUser(enforcerInput);
  
    expect(updatedEnforcers).toHaveLength(1);
    expect(updatedEnforcers[0].name).toBe('barracks Obama');
    expect(updatedEnforcers[0].accountStatus).toBe('deleted');
});

test('AddAPIUser returns undefined for repeated addition', async () => {
    const apiUser: APICredential = { name: 'Santa Cruz PD', email: 'scpd@gmail.com', role: 'police' };
    await adminService.addAPIUser(apiUser)

    const enforcers = await adminService.addAPIUser(apiUser);

    expect(enforcers).toBeUndefined()
});

test('getAPIUsers should return all API users with different roles', async () => {
  // Add test API users with different roles
  const payrollUser: APICredential = { 
    name: 'UCSC Payroll', 
    email: 'payroll@ucsc.edu', 
    role: 'payroll' 
  };
  const registrarUser: APICredential = { 
    name: 'UCSC Registrar', 
    email: 'registrar@ucsc.edu', 
    role: 'registrar' 
  };
  const policeUser: APICredential = { 
    name: 'Campus Police', 
    email: 'police@ucsc.edu', 
    role: 'campusPolice' 
  };

  await adminService.addAPIUser(payrollUser);
  await adminService.addAPIUser(registrarUser);
  await adminService.addAPIUser(policeUser);

  const apiUsers = await adminService.getAPIUsers();

  // Verify we get all API users
  expect(apiUsers).toHaveLength(4);

  // Verify each role type is present
  const roles = apiUsers.map(user => user.role);
  expect(roles).toContain('payroll');
  expect(roles).toContain('registrar');

  // Verify user properties
  const payrollUserResult = apiUsers.find(u => u.email === 'payroll@ucsc.edu');
  expect(payrollUserResult).toBeDefined();
  expect(payrollUserResult?.name).toBe('UCSC Payroll');
  expect(payrollUserResult?.role).toBe('payroll');

  // Verify users are sorted by name
  const names = apiUsers.map(user => user.name);
  const sortedNames = [...names].sort();
  expect(names).toEqual(sortedNames);
});

test('getEnforcerbyID should return the correct name for a valid enforcer ID', async () => {
  // Add a new enforcer to get a known ID
  const enforcer: NewUser = { name: 'Agent Smith', email: 'smith@matrix.com' };
  const added = await adminService.addEnforcer(enforcer);
  if (!added || added.length === 0) {
    throw new Error('Failed to add enforcer');
  }
  const enforcerId = added[0].id;

  const rawId = await decrypt(enforcerId);

  if (!rawId) {
    throw new Error('Failed to decrypt enforcer ID');
  }

  const name = await adminService.getEnforcerbyID(rawId);
  expect(name).toBe('Agent Smith');
});

test('getEnforcerbyID should return undefined for a non-existent enforcer ID', async () => {
  const name = await adminService.getEnforcerbyID('00000000-0000-0000-0000-000000000000');
  expect(name).toBeUndefined();
});

test('getEnforcerbyID should return undefined for an invalid ID format', async () => {
  await expect(adminService.getEnforcerbyID('not-a-uuid')).rejects.toBeDefined();
});

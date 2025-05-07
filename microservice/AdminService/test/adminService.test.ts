/**
 * @vitest-environment node
 */

import { beforeAll, afterAll, test, expect } from 'vitest';
import { reset, shutdown } from './db';
import { AdminService } from '../src/admin/service';
import { NewUser, UserInput } from '../src/admin/schema';

const adminService = new AdminService();

beforeAll(async () => {
  await reset();
});

afterAll(async () => {
  await shutdown();
});

test('getEnforcers should return a list of enforcers', async () => {
    const enforcers = await adminService.getEnforcers();

    // console.log(enforcers)
    expect(enforcers).toHaveLength(2);
    expect(enforcers[0].name).toBe('Enforcer 1');
    expect(enforcers[0].accountStatus).toBe('active');

    expect(enforcers[1].name).toBe('Enforcer 2');
    expect(enforcers[1].accountStatus).toBe('active');
});

test('AddEnforcer should add an enforcer', async () => {
    const enforcer: NewUser = { name: 'Enforcer 3', email: 'enforcer3@outlook.com' };
    await adminService.addEnforcer(enforcer);

    const enforcers = await adminService.getEnforcers();

    expect(enforcers).toHaveLength(3);
    expect(enforcers[2].name).toBe('Enforcer 3');
    expect(enforcers[2].email).toBe('enforcer3@outlook.com');
    expect(enforcers[2].accountStatus).toBe('active');
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
    const enforcer: NewUser = { name: 'Michelle Obama', email: 'michelle.obama@example.com' };
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

    expect(enforcers).toHaveLength(2);
    expect(enforcers[0].name).toBe('Driver 1');
    expect(enforcers[0].accountStatus).toBe('active');

    expect(enforcers[1].name).toBe('Driver 2');
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
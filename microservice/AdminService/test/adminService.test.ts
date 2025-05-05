/**
 * @vitest-environment node
 */

import { beforeAll, afterAll, test, expect } from 'vitest';
import { reset, shutdown } from '../db';
import { AdminService } from '../src/admin/service';
import { NewEnforcementUser, EnforcementUserInput } from '../src/admin/schema';
import e = require('express');

const adminService = new AdminService();

beforeAll(async () => {
  await reset();
});

afterAll(async () => {
  await shutdown();
});

test('getEnforcers should return a list of enforcers', async () => {
    const enforcers = await adminService.getEnforcers();

    expect(enforcers).toHaveLength(2);
    expect(enforcers[0].name).toBe('Enforcer 1');
    expect(enforcers[0].accountStatus).toBe('active');

    expect(enforcers[1].name).toBe('Enforcer 2');
    expect(enforcers[1].accountStatus).toBe('active');
  });

test('AddEnforcer should add an enforcer', async () => {
    const enforcer: NewEnforcementUser = { name: 'Enforcer 3', email: 'enforcer3@outlook.com' };
    await adminService.addEnforcer(enforcer);

    const enforcers = await adminService.getEnforcers();

    expect(enforcers).toHaveLength(3);
    expect(enforcers[2].name).toBe('Enforcer 3');
    expect(enforcers[2].email).toBe('enforcer3@outlook.com');
    expect(enforcers[2].accountStatus).toBe('active');
});

test('suspendEnforcer should suspend an enforcer', async () => {
    const enforcer: NewEnforcementUser = { name: 'Michelle Obama', email: 'michelle.obama@example.com' };
    const addedEnforcers = await adminService.addEnforcer(enforcer);
  
    const enforcerInput: EnforcementUserInput = { id: addedEnforcers[0].id };
    const updatedEnforcers = await adminService.suspendEnforcer(enforcerInput);
  
    expect(updatedEnforcers).toHaveLength(1);
    expect(updatedEnforcers[0].name).toBe('Michelle Obama');
    expect(updatedEnforcers[0].accountStatus).toBe('suspended');
});
  
test('suspendEnforcer should suspend an enforcer', async () => {
    const enforcer: NewEnforcementUser = { name: 'Michelle Obama', email: 'michelle.obama@example.com' };
    const addedEnforcers = await adminService.addEnforcer(enforcer);
  
    const enforcerInput: EnforcementUserInput = { id: addedEnforcers[0].id + 'extra text' };
    const updatedEnforcers = await adminService.suspendEnforcer(enforcerInput);
  
    expect(updatedEnforcers).toHaveLength(0);
});
  
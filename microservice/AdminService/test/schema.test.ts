import { test, beforeAll, afterAll, expect } from 'vitest';
import * as http from 'http';
import * as db from '../db';
import { app, bootstrap } from '../src/app';
import { EnforcementUser, NewEnforcementUser, EnforcementUserInput } from '../src/admin/schema'; // Adjust to your schema import

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
export const enforcementUserData = {
  id: '1234',
  name: 'Enforcer 1',
  email: 'enforcer1@outlook.com',
  accountStatus: 'active',
  password: 'securepassword',
};

test('EnforcementUser schema loads correctly', () => {
  // Create instance of EnforcementUser
  const enforcementUser = new EnforcementUser();
  enforcementUser.id = enforcementUserData.id;
  enforcementUser.name = enforcementUserData.name;
  enforcementUser.email = enforcementUserData.email;
  enforcementUser.accountStatus = enforcementUserData.accountStatus;
  enforcementUser.password = enforcementUserData.password;

  expect(enforcementUser).toBeDefined();
  expect(enforcementUser.id).toBe(enforcementUserData.id);
  expect(enforcementUser.name).toBe(enforcementUserData.name);
  expect(enforcementUser.email).toBe(enforcementUserData.email);
  expect(enforcementUser.accountStatus).toBe(enforcementUserData.accountStatus);
  expect(enforcementUser.password).toBe(enforcementUserData.password);
});

test('NewEnforcementUser input type validation', () => {
  const newEnforcementUser: NewEnforcementUser = {
    name: 'Enforcer 2',
    email: 'enforcer2@outlook.com',
  };

  expect(newEnforcementUser.name).toBeDefined();
  expect(newEnforcementUser.name).toBe('Enforcer 2');
  expect(newEnforcementUser.email).toBeDefined();
  expect(newEnforcementUser.email).toBe('enforcer2@outlook.com');
});

test('EnforcementUserInput input type validation', () => {
  const enforcementUserInput: EnforcementUserInput = {
    id: '1234',
  };

  expect(enforcementUserInput.id).toBeDefined();
  expect(enforcementUserInput.id).toBe('1234');
});

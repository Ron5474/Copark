import { test, beforeAll, afterAll, expect } from 'vitest';
import * as http from 'http';
import db from './db';
import { app, bootstrap } from '../src/app';
import { User, NewUser, UserInput } from '../src/admin/schema'; // Adjust to your schema import

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

import { test, beforeAll, afterAll, expect } from 'vitest'
import * as http from 'http'
import supertest from 'supertest'

import { app, bootstrap } from '../src/app'
import { Vehicle, VehicleID } from '../src/vehicle/schema'

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
  await bootstrap()
});

afterAll(() => {
  server.close();
});

// Test Data
export const VehicleData = {
  id: '1234',
  plate: 'TEST123',
  country: 'The Greatest Country',
  state: 'Greatest State',
  nickname: 'secret',
}
  
test('User schema loads correctly', () => {
  // Create instance of User
  const testUser = new Vehicle()
  testUser.id = VehicleData.id
  testUser.plate = VehicleData.plate
  testUser.country = VehicleData.country
  testUser.state = VehicleData.state
  testUser.nickname = VehicleData.nickname

  expect(testUser).toBeDefined()
});

test('VehicleID schema loads correctly', () => {
  // Create instance of User
  const testUser = new VehicleID()
  testUser.id = VehicleData.id

  expect(testUser).toBeDefined()
});


test('GET playground', async () => {
    await supertest(server)
      .get('/playground')
      .expect(200)
})
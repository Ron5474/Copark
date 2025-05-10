/*
#######################################################################
#
# Copyright (C) 2025 Copark Inc. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import {test, afterAll, expect, vi, beforeEach} from 'vitest'

import db from './db'
import { VehicleService } from '../src/vehicle/service'
import { SignJWT, jwtVerify } from 'jose'

vi.mock('server-only', () => ({}))

const encodedKey = new TextEncoder().encode(process.env.MASTER_SECRET + 'apiexit')

beforeEach( async () => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
})

async function encrypt(userId: string): Promise<string> {
  return new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(encodedKey)
  }

// async function decrypt(token: string): Promise<string | undefined> {
//   try {
//     const { payload } = await jwtVerify(token, encodedKey)

//     return payload.id as string; // Extract the `id` from the payload
//   } catch (error) {
//     void error;
//     // console.error('Failed to decrypt token:', error);
//     return undefined; // Return undefined if the token is invalid or expired
//   }
// }
// Minor Change
let mock_driver1_ID: string;
let mock_driver2_ID: string;

beforeEach(async () => {
  mock_driver1_ID = await encrypt("b20ec061-2957-4c3b-b193-c8b40138e8f1");
  mock_driver2_ID = await encrypt("6c83442f-90ca-46ae-bf31-a79ed4a0d1ce");
});

const mock_vehicle1 = {
  "plate": "YM2BCC5",
  "country": "USA",
  "state": "California"
}

const mock_vehicle2 = {
  "plate": "YM2BCC6",
  "country": "USA",
  "state": "California",
  "nickname": "electric fiat"
}

const update_vehicle1 = {
  "state": "Texas"
}

test('getMyVehicles - Returns Correct Number (0)', async () => {

  const vehicles = await new VehicleService().getMyVehicles(mock_driver1_ID)
  expect(vehicles.length).toBe(0)
})

test('getMyVehicles - Returns Correct Number (2)', async () => {
  await new VehicleService().registerVehicle(mock_driver1_ID, mock_vehicle1)
  await new VehicleService().registerVehicle(mock_driver1_ID, mock_vehicle2)
  const vehicles = await new VehicleService().getMyVehicles(mock_driver1_ID)
  expect(vehicles.length).toBe(2)
})

test('getMyVehicles - does not show Driver2 vehicles belonging to Driver1', async () => {
  await new VehicleService().registerVehicle(mock_driver1_ID, mock_vehicle1)
  await new VehicleService().registerVehicle(mock_driver1_ID, mock_vehicle2)
  const vehicles = await new VehicleService().getMyVehicles(mock_driver2_ID)
  expect(vehicles.length).toBe(0)
})

test('updateVehicle - updates vehicle table correctly', async () => {
  const vehicle = await new VehicleService().registerVehicle(mock_driver1_ID, mock_vehicle1)
  await new VehicleService().updateVehicle(mock_driver1_ID, {id: vehicle.id, ...update_vehicle1})
  const vehicles = await new VehicleService().getMyVehicles(mock_driver1_ID)
  expect(vehicles[0].state).toBe('Texas')
})

test('updateVehicle - Throws error because no vehicle exists', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new VehicleService().updateVehicle(mock_driver1_ID, {id: mock_driver2_ID, ...update_vehicle1}))
  .rejects.toThrow('Vehicle not found or not owned by user')
})

test('findVehicleByPlate - Returns Correct Vehicle', async () => {
  await new VehicleService().registerVehicle(mock_driver1_ID, mock_vehicle2)
  const vehicle = await new VehicleService().findVehicleByPlate(mock_vehicle2.plate)
  expect(vehicle.nickname).toBe(mock_vehicle2.nickname)
})

test('findVehicleByPlate - Returns null if no Vehicle found', async () => {
  const vehicle = await new VehicleService().findVehicleByPlate(mock_vehicle2.plate)
  expect(vehicle).toBeNull()
})

test('getVehicleById - Returns Correct Vehicle', async () => {
  const vehicleService = new VehicleService();

  // Register a vehicle to test retrieval
  const registeredVehicle = await vehicleService.registerVehicle(mock_driver1_ID, mock_vehicle1);

  // Retrieve the vehicle by its ID
  const retrievedVehicle = await vehicleService.getVehicleById({ id: registeredVehicle.id });

  // Validate the retrieved vehicle matches the registered vehicle
  expect(retrievedVehicle).not.toBeNull();
  expect(retrievedVehicle?.plate).toBe(mock_vehicle1.plate);
  expect(retrievedVehicle?.country).toBe(mock_vehicle1.country);
  expect(retrievedVehicle?.state).toBe(mock_vehicle1.state);
});

test('getVehicleById - Returns null if Vehicle not found', async () => {
  const vehicleService = new VehicleService();

  // Attempt to retrieve a vehicle with a non-existent ID
  const retrievedVehicle = await vehicleService.getVehicleById({ id: 'non-existent-id' });

  // Validate that the result is null
  expect(retrievedVehicle).toBeNull();
});

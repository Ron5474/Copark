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
import { Vehicle } from '../src/vehicle/schema'
import { SignJWT } from 'jose'
import {http, HttpHandler, HttpResponse} from 'msw'
import { setupServer } from 'msw/node'
vi.mock('server-only', () => ({}))

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)
// const emailEncodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)

export const handlers: HttpHandler[] = [
  http.get('http://localhost:3010/api/v0/auth/driver/id', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (token) {
      return HttpResponse.json({ id: token, name: 'John Doe', role: ['driver'] });
    } else {
      return new HttpResponse(null, { status: 401 });
    }
  }),
];
const server = setupServer(...handlers)
server.listen();

beforeEach(() => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
})

async function encrypt(userId: string): Promise<string> {
  return new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5y')
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

// async function logEncrypted() {
//   console.log(await encrypt("b20ec061-2957-4c3b-b193-c8b40138e8f1"));
//   console.log(await encrypt("39f48f9f-2693-446b-ad98-8e0db1ef14bd"));
// }

const invalidDriverJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImIyMGVjMDYxLTI5NTctNGMzYi1iMTkzLWM4YjQwMTM4ZThmMSIsImlhdCI6MTc0NzA2NzM2NSwiZXhwIjoxOTA0ODU1MzY1fQ.pPIDRd0PtW97OkgD03LqeS9LI9TCRq7CwXpoDdM7K3k"
// const validDriverJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjM5ZjQ4ZjlmLTI2OTMtNDQ2Yi1hZDk4LThlMGRiMWVmMTRiZCIsImlhdCI6MTc0NzA2NzM2NSwiZXhwIjoxOTA0ODU1MzY1fQ.U90qXFiG-nLiqqbL32KwhGaLdlZc0NyA6XDnetN1SRQ"
const validDriverJWT = encrypt('b1eab387-1000-4ee3-a746-d59366e44f06');

beforeEach(async () => {
  mock_driver1_ID = "b20ec061-2957-4c3b-b193-c8b40138e8f1"
  mock_driver2_ID = "6c83442f-90ca-46ae-bf31-a79ed4a0d1ce"
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

test('RegisterVehicle with same plate twice - Throws error', async () => {
  // // eslint-disable-next-line @typescript-eslint/no-empty-function
  // vi.spyOn(console, 'error').mockImplementation(() => {})
  const vehicleService = new VehicleService();
  await vehicleService.registerVehicle(mock_vehicle1, mock_driver1_ID)
  await expect(vehicleService.registerVehicle(mock_vehicle1, mock_driver1_ID))
  .rejects.toThrow('This license plate is already registered')
})

test('getMyVehicles - Returns Correct Number (0)', async () => {

  const vehicles = await new VehicleService().getMyVehicles(mock_driver1_ID)
  expect(vehicles.length).toBe(0)
})

test('getMyVehicles - Returns Correct Number (2)', async () => {
  await new VehicleService().registerVehicle(mock_vehicle1, mock_driver1_ID)
  await new VehicleService().registerVehicle(mock_vehicle2, mock_driver1_ID)
  const vehicles = await new VehicleService().getMyVehicles(mock_driver1_ID)
  expect(vehicles.length).toBe(2)
})

test('getMyVehicles - does not show Driver2 vehicles belonging to Driver1', async () => {
  await new VehicleService().registerVehicle(mock_vehicle1, mock_driver1_ID)
  await new VehicleService().registerVehicle(mock_vehicle2, mock_driver1_ID)
  const vehicles = await new VehicleService().getMyVehicles(mock_driver2_ID)
  expect(vehicles.length).toBe(0)
})

test('updateVehicle - updates vehicle table correctly', async () => {
  const vehicle = await new VehicleService().registerVehicle(mock_vehicle1, mock_driver1_ID)
  await new VehicleService().updateVehicle({id: vehicle.id, ...update_vehicle1}, mock_driver1_ID)
  const vehicles = await new VehicleService().getMyVehicles(mock_driver1_ID)
  expect(vehicles[0].state).toBe('Texas')
})

test('updateVehicle - Throws error because no vehicle exists', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new VehicleService().updateVehicle({id: mock_driver2_ID, ...update_vehicle1}, mock_driver1_ID))
  .rejects.toThrow('Vehicle not found or not owned by user')
})

test('findVehicleByPlate - Returns Correct Vehicle', async () => {
  await new VehicleService().registerVehicle(mock_vehicle2, mock_driver1_ID)
  const vehicle = await new VehicleService().findVehicleByPlate(mock_vehicle2.plate)
  expect((vehicle as Vehicle).nickname).toBe(mock_vehicle2.nickname)
})

test('findVehicleByPlate - Returns null if no Vehicle found', async () => {
  const vehicle = await new VehicleService().findVehicleByPlate(mock_vehicle2.plate)
  expect(vehicle).toBeNull()
})

test('findOwnerByVehicleID - Returns null if no Vehicle found', async () => {
  const vehicle = await new VehicleService().findOwnerByVehicleID("b20ec061-2957-4c3b-b193-c8b40138e8f1")
  expect(vehicle).toBeNull()
})

test('findOwnerByVehicleID - Returns Valid owner if Vehicle found', async () => {
  const vehicle = await new VehicleService().findOwnerByVehicleID("f2d7800e-67ce-41aa-b1fe-38e679112e0e")
  // console.log('Vehicle: ', vehicle)
  expect(vehicle).toBeDefined()
})

test('getVehicleById - Returns Correct Vehicle', async () => {
  const vehicleService = new VehicleService();

  // Register a vehicle to test retrieval
  const registeredVehicle = await vehicleService.registerVehicle(mock_vehicle1, mock_driver1_ID);

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
  const retrievedVehicle = await vehicleService.getVehicleById({ id: 'd0578d50-76ee-4db6-a402-4b2614b161ce' });

  // Validate that the result is null
  expect(retrievedVehicle).toBeNull();
});

test('getVehicleByUserId - Returns Empty Array if no vehicle not found', async () => {
  const vehicleService = new VehicleService();
  // console.log('invalidDriverJWT', invalidDriverJWT)
  const vehicles = await vehicleService.getVehicleByUserId(invalidDriverJWT);
  expect(vehicles.length).toBe(0);
});

test('getVehicleByUserId - Returns Array of length 1', async () => {
  const vehicleService = new VehicleService();
  const resolvedValidDriverJWT = await validDriverJWT;
  // console.log('resolvedValidDriverJWT', resolvedValidDriverJWT)
  const vehicles = await vehicleService.getVehicleByUserId(resolvedValidDriverJWT);

  // console.log('body !!!!' + vehicles)
  expect(vehicles.length).toBe(1);
});
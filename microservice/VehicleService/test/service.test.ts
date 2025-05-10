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

vi.mock('server-only', () => ({}))


beforeEach( async () => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
})

const mock_driver1_ID = "b20ec061-2957-4c3b-b193-c8b40138e8f1"
const mock_driver2_ID = "6c83442f-90ca-46ae-bf31-a79ed4a0d1ce"

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


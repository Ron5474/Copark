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
import {PermitService} from '../src/permit/service'

vi.mock('server-only', () => ({}))

const permitDetails = {
  vehicle: '12345678-1234-1234-1234-567890abcdef',
  zone: '27',
  duration: {'minutes': 30, 'hours': 0},
  paymentMethod: 'paypal'
}

const enforcementDetails = {
  vehicle: permitDetails.vehicle,
  zone: permitDetails.zone,
}

const policeDetails = '12345678-1234-1234-1234-567890abcdef'

beforeEach( async () => {
  return db.reset()
})

afterAll(() => {
  db.shutdown()
})

const permitService = new PermitService()

test('Purchasing permit works', async () => {
  const receipt = await permitService.purchaseMyZonePermit(permitDetails)
  expect(receipt).toBeDefined()
})

test('Purchasing different duration', async () => {
  const receipt = await permitService.purchaseMyZonePermit({...permitDetails, duration: {minutes: 0, hours: 2}})
  expect(receipt.type).toBe('zone')
})

test('Purchasing different duration', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(permitService.purchaseMyZonePermit({...permitDetails, zone: '13'}))
      .rejects.toThrow('Zone 13 not found')
})

// test('Transaction failed', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   await expect(permitService.purchaseMyZonePermit({...permitDetails, duration: {minutes: 0, hours: 2}}))
//       .rejects.toThrow('Purchase unsuccessful')
// })

test('Vehicle has valid permit', async () => {
  await permitService.purchaseMyZonePermit(permitDetails)
  const { isValid } = await permitService.isValidZonePermit(enforcementDetails)
  expect(isValid).toBe(true)
})

test('Vehicle does not have valid permit', async () => {
  await permitService.purchaseMyZonePermit(permitDetails)
  const { isValid } = await permitService.isValidZonePermit({ ...enforcementDetails, vehicle: '11111111-1234-1234-1234-567890abcdef' })
  expect(isValid).toBe(false)
})

test('Vehicle has permit, wrong zone', async () => {
  await permitService.purchaseMyZonePermit(permitDetails)
  const { isValid } = await permitService.isValidZonePermit({...enforcementDetails, zone: '17' })
  expect(isValid).toBe(false)
})

test('Vehicle has valid permit (Police)', async () => {
  await permitService.purchaseMyZonePermit(permitDetails)
  const { isValid } = await permitService.isValidPermitPolice(policeDetails)
  expect(isValid).toBe(true)
})

test('Vehicle does not have valid permit (Police)', async () => {
  await permitService.purchaseMyZonePermit(permitDetails)
  const { isValid } = await permitService.isValidPermitPolice('11111111-1234-1234-1234-567890abcdef')
  expect(isValid).toBe(false)
})

test('getMyPermits returns empty', async () => {
  const { active } = await permitService.getMyPermits(permitDetails.vehicle)
  expect(active.length).toBe(0)
})

test('getMyPermits returns active permit', async () => {
  await permitService.purchaseMyZonePermit(permitDetails)
  const { active } = await permitService.getMyPermits(permitDetails.vehicle)
  expect(active.length).toBe(1)
})

test('zoneDetails gives correct hourly on weekday', async () => {
  const { hourly } = await permitService.getZoneDetails('123', 3) // Wednesday
  expect(hourly).toBe(2.45)
})

test('zoneDetails gives correct daily on weekend', async () => {
  const { daily } = await permitService.getZoneDetails('123', 0) // Sunday
  expect(daily).toBe(7.95)
})

test('zoneDetails gives correct daily on weekend', async () => {
  await expect(permitService.getZoneDetails('12312312312312312312123', 0)).rejects.toThrow('Zone 12312312312312312312123 not found')
})

test('getPermitsByDay retusn permits by day bought', async () => {
  const permits = await permitService.getAllPermitsByDay()
  console.log(permits)
  expect(permits.length).toBe(1)
});
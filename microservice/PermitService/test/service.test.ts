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
  vehicle: 'f2d7800e-67ce-41aa-b1fe-38e679112e0e',
  zone: '27',
  duration: {'minutes': 30, 'hours': 0},
  paymentMethod: 'paypal'
}

const policeDetails = 'f2d7800e-67ce-41aa-b1fe-38e679112e0e'

beforeEach( async () => {
  return db.reset()
})

afterAll(() => {
  db.shutdown()
})

const permitService = new PermitService()

test('Purchasing zone permit works', async () => {
  const receipt = await permitService.purchaseMyZonePermit(permitDetails)
  expect(receipt).toBeDefined()
})

test('Purchasing zone different duration', async () => {
  const receipt = await permitService.purchaseMyZonePermit({...permitDetails, duration: {minutes: 0, hours: 2}})
  expect(receipt.type).toBe('zone')
})

test('Purchasing unknown zone', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(permitService.purchaseMyZonePermit({...permitDetails, zone: '13'}))
      .rejects.toThrow('Zone 13 not found')
})

test('Vehicle has valid permit', async () => {
  await permitService.purchaseMyZonePermit(permitDetails)
  const permits = await permitService.getValidPermit(permitDetails.vehicle)
  expect(permits.length).toBe(1)
  expect(permits[0].area).toBe('27')
  expect(permits[0].type).toBe('zone')
})

test('Vehicle has expired permit', async () => {
  const now = new Date('2025-01-01T12:00:00Z')
  vi.useFakeTimers()
  vi.setSystemTime(now)

  await permitService.purchaseMyZonePermit(permitDetails)

  // Simulate time passing (e.g. 31 minutes later)
  vi.setSystemTime(new Date(now.getTime() + 31 * 60 * 1000))

  const permits = await permitService.getValidPermit(permitDetails.vehicle)
  expect(permits.length).toBe(0)

  vi.useRealTimers()
})

test('Vehicle does not have valid permit', async () => {
  await permitService.purchaseMyZonePermit(permitDetails)
  const permits = await permitService.getValidPermit( '11111111-1234-1234-1234-567890abcdef' )
  expect(permits.length).toBe(0)
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
  const { active } = await permitService.getMyPermits([permitDetails.vehicle])
  expect(active.length).toBe(0)
})

test('getMyPermits returns active permit', async () => {
  await permitService.purchaseMyZonePermit(permitDetails)
  const { active } = await permitService.getMyPermits([permitDetails.vehicle])
  expect(active.length).toBe(1)
})

test('zoneDetails gives correct hourly on weekday', async () => {
  const { hourly } = await permitService.getZoneDetails('123', 3) // Wednesday
  expect(hourly).toBe(2.45)
})

test('zoneDetails errors on wrong zone', async () => {
  await expect(permitService.getZoneDetails('12312312312312312312123', 0)).rejects.toThrow('Zone 12312312312312312312123 not found')
})

test('getPermitsByDay retusn permits by day bought', async () => {
  const permits = await permitService.getAllPermitsByDay()
  expect(permits.length).toBe(1)
});

test('admin create zone', async () => {
  expect(await permitService.createNewZone({
    zone: 789,
    weekday: {
      hourly: 2.50,
      maxDuration: {minutes: 30, hours: 1},
      openTime: '07:00',
      closeTime: '20:00'
    },
    weekend: {
      hourly: 2.50,
      maxDuration: {minutes: 30, hours: 1},
      openTime: '07:00',
      closeTime: '20:00'
    }
  }))
})

test('admin creates zone that already exists', async () => {
  expect(await permitService.createNewZone({
    zone: 27,
    weekday: {
      hourly: 2.02,
      openTime: '07:00',
      closeTime: '20:00'
    },
    weekend: {}
  })).toBeFalsy()
})

test('lotDetails gives correct A daily permit', async () => {
  const { daily } = await permitService.getLotDetails('A')
  expect(daily.price).toBe(12)
})

test('lotDetails errors on wrong lot type', async () => {
  await expect(permitService.getLotDetails('12312312312312312312123')).rejects.toThrow('Lot type 12312312312312312312123 not found')
})

test('getAllLotDetails gives correct daily permits', async () => {
  const data = await permitService.getAllLotDetails()
  expect(data[0].lots.length).toBeGreaterThanOrEqual(5) // 5 daily permit lots (or more)
})

test('admin create lot', async () => {
  expect(await permitService.createNewLot({
    lot: 'F',
    daily: {price: 10},
    quarterly: {price: 50, expireDate: '2025-06-12T23:59:59-07:00'},
    yearly: {price: 200, expireDate: '2025-06-12T23:59:59-07:00'}
  }))
})

test('admin creates lot that already exists', async () => {
  expect(await permitService.createNewLot({
    lot: 'ANY',
    daily: {price: 15}
  })).toBeFalsy()
})

test('Purchasing daily lot permit works', async () => {
  const receipt = await permitService.purchaseMyLotPermit({
    vehicle: '12345678-1234-1234-1234-567890abcdef',
    lot: 'A',
    duration: 'daily',
    paymentMethod: 'paypal'
  })
  expect(receipt).toBeDefined()
})

test('Purchasing quarterly lot permit works', async () => {
  const receipt = await permitService.purchaseMyLotPermit({
    vehicle: '12345678-1234-1234-1234-567890abcdef',
    lot: 'A',
    duration: 'quarterly',
    paymentMethod: 'paypal'
  })
  expect(receipt).toBeDefined()
})

test('Purchasing yearly lot permit works', async () => {
  const receipt = await permitService.purchaseMyLotPermit({
    vehicle: '12345678-1234-1234-1234-567890abcdef',
    lot: 'A',
    duration: 'yearly',
    paymentMethod: 'paypal'
  })
  expect(receipt).toBeDefined()
})

// test('Attempting to purchase a lot permit for one that doesnt have prices errors out', async () => { // TODO: should we allow lots to not offer all duration types?
//   await expect(permitService.purchaseMyLotPermit({
//     vehicle: '12345678-1234-1234-1234-567890abcdef',
//     lot: 'T',
//     duration: 'quarterly',
//     paymentMethod: 'paypal'
//   })).rejects.toThrow('Lot type T does not have quarterly duration option')
// })

test('Purchasing wrong lot permit doesn\'t work', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(permitService.purchaseMyLotPermit({
    vehicle: '12345678-1234-1234-1234-567890abcdef',
    lot: 'A',
    duration: 'biweekly',
    paymentMethod: 'paypal'
  })).rejects.toThrow('Incorrect permit option')
})

test('getZones properly returns zones', async () => {
  const receipt = await permitService.getZones()
  expect(receipt).toBeDefined()
})

test('updateZonePrice updates the zone hourly price and returns updated zone', async () => {
  const updatedZone = {
    zone: '27',
    hourly: 9.99,
    maxDuration: { hours: 2, minutes: 30 },
    openTime: '06:00',
    closeTime: '22:00'
  };

  const result = await permitService.updateZonePrice(updatedZone);

  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result[0].zone).toBe('27');
  expect(result[0].hourly).toBe(9.99);
  expect(result[0].maxDuration).toEqual({ hours: 2, minutes: 30 });
  expect(result[0].openTime).toBe('06:00');
  expect(result[0].closeTime).toBe('22:00');
});

test('updateZonePrice throws if zone does not exist', async () => {
  await expect(
    permitService.updateZonePrice({
      zone: '999999',
      hourly: 5.55
    })
  ).rejects.toThrow('Zone 999999 not found');
});
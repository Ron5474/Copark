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
import {sendPermitEmail} from '../src/permit/emailClient'

vi.mock('server-only', () => ({}))

const zonePermitDetails = {
  plate: '7RON123',
  vehicleId: 'f2d7800e-67ce-41aa-b1fe-38e679112e0e',
  zone: '27',
  duration: {'minutes': 30, 'hours': 0},
  paymentMethod: 'paypal',
  transactionId: 'stripeTransactionID',
}

const lotPermitDetails = {
  plate: 'Testing :)',
  vehicleId: '12345678-1234-1234-1234-567890abcdef',
  lot: 'A',
  duration: 'quarterly',
  paymentMethod: 'paypal',
  transactionId: 'stripeTransactionID',
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
  const receipt = await permitService.purchaseMyZonePermit(zonePermitDetails)
  expect(receipt).toBeDefined()
})

test('Purchasing zone different duration', async () => {
  const receipt = await permitService.purchaseMyZonePermit({...zonePermitDetails, duration: {minutes: 0, hours: 2}})
  expect(receipt.type).toBe('zone')
})

test('Purchasing unknown zone', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(permitService.purchaseMyZonePermit({...zonePermitDetails, zone: '13'}))
      .rejects.toThrow('Zone 13 not found')
})

test('Purchasing same zone permit transaction ID twice', async () => {
  const now = new Date('2025-05-29T12:00:00Z')
  vi.setSystemTime(now)
  await permitService.purchaseMyZonePermit(zonePermitDetails, now.toISOString())

  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(permitService.purchaseMyZonePermit(zonePermitDetails, now.toISOString())).rejects.toThrow(`Permit for vehicle ${zonePermitDetails.plate} already exists for zone ${zonePermitDetails.zone} with transaction ID ${zonePermitDetails.transactionId}`)
  vi.useRealTimers()
})

test('Purchasing same zone permit twice', async () => {
  const now = new Date('2025-05-29T12:00:00Z')
  vi.setSystemTime(now)
  await permitService.purchaseMyZonePermit(zonePermitDetails, now.toISOString())

  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(permitService.purchaseMyZonePermit({...zonePermitDetails, transactionId: 'somethingElse', duration: {hours: 0, minutes: 30}}, now.toISOString()))
      .rejects.toThrow(`Vehicle ${zonePermitDetails.plate} already has an active permit of this type in zone ${zonePermitDetails.zone}`)
  vi.useRealTimers()
})

test('Vehicle has valid permit', async () => {
  const now = new Date('2025-05-29T12:00:00Z')
  vi.setSystemTime(now)

  await permitService.purchaseMyZonePermit(zonePermitDetails, now.toISOString())
  const permits = await permitService.getValidPermit(zonePermitDetails.vehicleId, now.toISOString())
  expect(permits.length).toBe(1)
  expect(permits[0].area).toBe('27')
  expect(permits[0].type).toBe('zone')
  vi.useRealTimers()
})

// how do you change time mid test?
// test('Vehicle has expired permit', async () => {
//   const now = new Date('2025-01-01T12:00:00Z')
//   vi.useFakeTimers()
//   vi.setSystemTime(now)

//   await permitService.purchaseMyZonePermit(zonePermitDetails)

//   // Simulate time passing (e.g. 31 minutes later)
//   vi.useRealTimers()
//   vi.useFakeTimers()
//   vi.setSystemTime(new Date(now.getTime() + 31 * 60 * 1000))

//   const permits = await permitService.getValidPermit(zonePermitDetails.vehicle)
//   expect(permits.length).toBe(0)

//   vi.useRealTimers()
// })

test('Vehicle does not have valid permit', async () => {
  await permitService.purchaseMyZonePermit(zonePermitDetails)
  const permits = await permitService.getValidPermit( '11111111-1234-1234-1234-567890abcdef' )
  expect(permits.length).toBe(0)
})

test('Vehicle has valid permit (Police)', async () => {
  await permitService.purchaseMyZonePermit(zonePermitDetails)
  const { isValid } = await permitService.isValidPermitPolice(policeDetails)
  expect(isValid).toBe(true)
})

test('Vehicle does not have valid permit (Police)', async () => {
  await permitService.purchaseMyZonePermit(zonePermitDetails)
  const { isValid } = await permitService.isValidPermitPolice('11111111-1234-1234-1234-567890abcdef')
  expect(isValid).toBe(false)
})

test('getMyPermits returns empty', async () => {
  const { active } = await permitService.getMyPermits([zonePermitDetails.vehicleId])
  expect(active.length).toBe(0)
})

test('getMyPermits returns active permit', async () => {
  await permitService.purchaseMyZonePermit(zonePermitDetails)
  const { active } = await permitService.getMyPermits([zonePermitDetails.vehicleId])
  expect(active.length).toBe(1)
})

test('zoneDetails gives correct hourly on weekday', async () => {
  const { hourly } = await permitService.getZoneDetails('123', 3) // Wednesday
  expect(hourly).toBe(2.45)
})

test('zoneDetails gives correct hourly on weekday', async () => {
  const { hourly } = await permitService.getZoneDetails('123', 0) // Sunday
  expect(hourly).toBe(2.95)
})

test('zoneDetails errors on wrong zone', async () => {
  await expect(permitService.getZoneDetails('12312312312312312312123', 0)).rejects.toThrow('Zone 12312312312312312312123 not found')
})

test('getPermitsByDay returns permits by day bought', async () => {
  const permits = await permitService.getAllPermitsByDay()
  expect(permits.length).toBe(1) // expects 1 from previous test
})

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
    lot: 'O',
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

test('admin updates lot', async () => {
  expect(await permitService.updateLot({
    lot: 'ANY',
    daily: {price: 100},
    quarterly: {price: 500, expireDate: '2025-06-12T23:59:59-07:00'},
    yearly: {price: 2000, expireDate: '2025-06-12T23:59:59-07:00'}
  }))
})

test('admin updates lot that doesn\'t exist', async () => {
  expect(await permitService.updateLot({
    lot: 'O',
    daily: {price: 15}
  })).toBeFalsy()
})

test('Purchasing daily lot permit works', async () => {
  const receipt = await permitService.purchaseMyLotPermit({...lotPermitDetails, duration: 'daily'})
  expect(receipt).toBeDefined()
})

test('Purchasing a lot permit in advance', async () => {
  const now = new Date('2025-03-27T12:00:00Z')
  vi.setSystemTime(now)

  const receipt = await permitService.purchaseMyLotPermit(lotPermitDetails)

  const today = new Date().toISOString()

  expect(receipt.activeDate).not.toBe(today)
  
  vi.useRealTimers()
})

test('getAllPermits can return future permits', async () => {
  const now = new Date('2025-03-27T12:00:00Z')
  vi.setSystemTime(now)

  await permitService.purchaseMyLotPermit(lotPermitDetails)

  const permits = await permitService.getAllPermits(false)
  expect(permits.length).toBe(2) // expects 1 from previous tests

  vi.useRealTimers()
})

test('getAllPermits can return expired permits', async () => {
  const now = new Date('2025-03-27T12:00:00Z')
  vi.setSystemTime(now)

  await permitService.purchaseMyLotPermit({...lotPermitDetails, lot: 'B'})

  const future = new Date('2025-07-04T12:00:00Z')
  vi.setSystemTime(future)

  const permits = await permitService.getAllPermits(false)
  expect(permits.length).toBe(2) // expects 1 from previous tests

  vi.useRealTimers()
})

test('Purchasing an expired lot permit doesn\'t work', async () => {
  const now = new Date('2025-07-04T12:00:00Z')
  vi.setSystemTime(now)

  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(permitService.purchaseMyLotPermit(lotPermitDetails)).rejects.toThrow('This permit type has expired')
  
  vi.useRealTimers()
})

test('Purchasing same lot permit transaction ID twice', async () => {
  const now = new Date('2025-03-27T12:00:00Z')
  vi.setSystemTime(now)
  await permitService.purchaseMyLotPermit(lotPermitDetails)

  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(permitService.purchaseMyLotPermit(lotPermitDetails)).rejects.toThrow(`Permit for vehicle ${lotPermitDetails.plate} already exists for lot ${lotPermitDetails.lot} with transaction ID ${lotPermitDetails.transactionId}`)
  vi.useRealTimers()
})

test('Purchasing same lot permit twice - different durations', async () => {
  const now = new Date('2025-05-15T12:00:00Z')
  vi.setSystemTime(now)
  await permitService.purchaseMyLotPermit(lotPermitDetails)

 vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(permitService.purchaseMyLotPermit({...lotPermitDetails, transactionId: 'somethingElse', duration: 'daily'}))
      .rejects.toThrow(`Vehicle ${lotPermitDetails.plate} already has an active permit of this type in lot ${lotPermitDetails.lot}`)
  vi.useRealTimers()
})

// test('Purchasing quarterly lot permit works', async () => {
//   const receipt = await permitService.purchaseMyLotPermit({
//     vehicle: '12345678-1234-1234-1234-567890abcdef',
//     lot: 'A',
//     duration: 'quarterly',
//     paymentMethod: 'paypal'
//   })
//   expect(receipt).toBeDefined()
// })

// test('Purchasing yearly lot permit works', async () => {
//   const receipt = await permitService.purchaseMyLotPermit({
//     vehicle: '12345678-1234-1234-1234-567890abcdef',
//     lot: 'A',
//     duration: 'yearly',
//     paymentMethod: 'paypal'
//   })
//   expect(receipt).toBeDefined()
// })

// test('Attempting to purchase a lot permit for one that doesnt have prices errors out', async () => { // TODO: should we allow lots to not offer all duration types?
//   await expect(permitService.purchaseMyLotPermit({
//     vehicle: '12345678-1234-1234-1234-567890abcdef',
//     lot: 'T',
//     duration: 'quarterly',
//     paymentMethod: 'paypal'
//   })).rejects.toThrow('Lot type T does not have quarterly duration option')
// })

test('Purchasing wrong lot permit doesn\'t work', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  await expect(permitService.purchaseMyLotPermit({...lotPermitDetails, duration: 'biweekly'})).rejects.toThrow('Incorrect permit option')
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
  }

  const result = await permitService.updateZonePrice(updatedZone)

  expect(result).toBeDefined()
  expect(Array.isArray(result)).toBe(true)
  expect(result[0].zone).toBe('27')
  expect(result[0].hourly).toBe(9.99)
  expect(result[0].maxDuration).toEqual({ hours: 2, minutes: 30 })
  expect(result[0].openTime).toBe('06:00')
  expect(result[0].closeTime).toBe('22:00')
})

test('updateZonePrice updates the zone hourly price and returns updated zone', async () => {
  const updatedZone = {
    zone: '999',
  }

  const result = await permitService.updateZonePrice(updatedZone)

  expect(result).toBeDefined()
  expect(Array.isArray(result)).toBe(true)
  expect(result[0].zone).toBe('999')
  expect(result[0].hourly).toBe(0)
  expect(result[0].maxDuration).toEqual({ hours: 0, minutes: 0 })
  expect(result[0].openTime).toBe('00:00')
  expect(result[0].closeTime).toBe('23:59')
})

test('updateZonePrice throws if zone does not exist', async () => {
  await expect(
    permitService.updateZonePrice({
      zone: '999999',
      hourly: 5.55
    })
  ).rejects.toThrow('Zone 999999 not found')
})

test('generatePermitReport returns correct permit report structure', async () => {
  await permitService.purchaseMyZonePermit(zonePermitDetails)

  const report = await permitService.generatePermitReport({ numDays: 999 })

  expect(report).toBeDefined()
  expect(typeof report.totalPermits).toBe('number')
  expect(typeof report.activePermits).toBe('number')
  expect(typeof report.expiredPermits).toBe('number')
  expect(typeof report.totalRevenue).toBe('number')
  expect(Array.isArray(report.zoneBreakdown)).toBe(true)
  expect(Array.isArray(report.lotBreakdown)).toBe(true)
})

test('sendPermitEmail logs error when fetch fails', async () => {
  // Mock fetch to throw
  global.fetch = vi.fn().mockRejectedValue(new Error('Simulated failure'))

  // Spy on console.error
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

  await sendPermitEmail({
    to: 'test@example.com',
    subject: 'Test',
    html: '<p>Test</p>',
  })

  expect(errorSpy).toHaveBeenCalledWith(
    'EmailService failed:',
    expect.any(Error)
  )

  errorSpy.mockRestore()
})
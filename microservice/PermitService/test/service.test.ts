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
  zone: '0',
  duration: {'minutes': 30, 'hours': 0},
  paymentMethod: 'paypal'
}

const enforcementDetails = {
  vehicle: '12345678-1234-1234-1234-567890abcdef',
}

beforeEach( async () => {
  return db.reset()
})

afterAll(() => {
  db.shutdown()
})

test('Purchasing permit works', async () => {
  const receipt = await new PermitService().purchaseMyZonePermit(permitDetails)
  expect(receipt).toBeDefined()
})

test('Purchasing different duration', async () => {
  const receipt = await new PermitService().purchaseMyZonePermit({...permitDetails, duration: {minutes: 0, hours: 2}})
  expect(receipt.type).toBe('zone')
})

test('Vehicle has valid permit', async () => {
  await new PermitService().purchaseMyZonePermit(permitDetails)
  const { isValid } = await new PermitService().isValidPermit(enforcementDetails)
  expect(isValid).toBe(true)
})

test('Vehicle does not have valid permit', async () => {
  await new PermitService().purchaseMyZonePermit(permitDetails)
  const { isValid } = await new PermitService().isValidPermit({ vehicle: '11111111-1234-1234-1234-567890abcdef' })
  expect(isValid).toBe(false)
})

test('Vehicle has valid permit', async () => {
  await new PermitService().purchaseMyZonePermit(permitDetails)
  const { isValid } = await new PermitService().isValidZonePermit({...enforcementDetails, zone: '0'})
  expect(isValid).toBe(true)
})

test('Vehicle does not have valid permit', async () => {
  await new PermitService().purchaseMyZonePermit(permitDetails)
  const { isValid } = await new PermitService().isValidZonePermit({ vehicle: '11111111-1234-1234-1234-567890abcdef', zone: '0' })
  expect(isValid).toBe(false)
})

test('Vehicle has permit, wrong zone', async () => {
  await new PermitService().purchaseMyZonePermit(permitDetails)
  const { isValid } = await new PermitService().isValidZonePermit({...enforcementDetails, zone: '12' })
  expect(isValid).toBe(false)
})

// test('Transaction failed', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   await expect(new PermitService().purchaseMyZonePermit({...permitDetails, duration: {minutes: 0, hours: 2}}))
//       .rejects.toThrow('Purchase unsuccessful')
// })


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
  expect(receipt.permitType).toBe('zone')
})

// test('Transaction failed', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   await expect(new PermitService().purchaseMyZonePermit({...permitDetails, duration: {minutes: 0, hours: 2}}))
//       .rejects.toThrow('Purchase unsuccessful')
// })


import { test, beforeAll, afterAll, expect } from 'vitest'
import * as http from 'http'
import { app, bootstrap } from '../src/app'
import {
  Permit,
  MyPermits,
  Duration,
  ZoneDetails,
  Receipt,
  Confirmation,
  DurationInput,
  CheckedPermit,
  IsValidPolice,
  PermitsByDay,
  LotTypeDetails,
  LotDetails,
  Lot,
  LotGroup,
  Zone,
} from '../src/permit/schema'

let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
  await bootstrap()
})

afterAll(() => {
  server.close()
})
  
test('Permit schema loads correctly', () => {
    const testPermit = new Permit()
    testPermit.vehicle = 'vehicle1'
    testPermit.type = 'temporary'
    testPermit.activeDate = '2025-05-11T12:00:00.000Z'
    testPermit.expireDate = '2025-05-11T12:00:00.000Z'

    expect(testPermit).toBeDefined()
    expect(testPermit.vehicle).toBe('vehicle1')
    expect(testPermit.type).toBe('temporary')
    expect(testPermit.activeDate).toBe('2025-05-11T12:00:00.000Z')
    expect(testPermit.expireDate).toBe('2025-05-11T12:00:00.000Z')
})

test('MyPermits schema loads correctly', () => {
  const permit = new Permit()
  permit.vehicle = 'v'
  permit.type = 't'
  permit.activeDate = 'a'
  permit.expireDate = 'e'

  const myPermits = new MyPermits()
  myPermits.future = [permit]
  myPermits.active = [permit]
  myPermits.expired = [permit]

  expect(myPermits).toBeDefined()
  expect(myPermits.future[0]).toBe(permit)
  expect(myPermits.active[0]).toBe(permit)
  expect(myPermits.expired[0]).toBe(permit)
})

test('Duration schema loads correctly', () => {
  const duration = new Duration()
  duration.minutes = 30
  duration.hours = 2

  expect(duration).toBeDefined()
  expect(duration.minutes).toBe(30)
  expect(duration.hours).toBe(2)
})

test('ZoneDetails schema loads correctly', () => {
  const duration = new Duration()
  duration.minutes = 15
  duration.hours = 1

  const zoneDetails = new ZoneDetails()
  zoneDetails.hourly = 2
  zoneDetails.maxDuration = duration
  zoneDetails.openTime = '08:00'
  zoneDetails.closeTime = '18:00'

  expect(zoneDetails).toBeDefined()
  expect(zoneDetails.hourly).toBe(2)
  expect(zoneDetails.maxDuration).toBe(duration)
  expect(zoneDetails.openTime).toBe('08:00')
  expect(zoneDetails.closeTime).toBe('18:00')
})

test('Receipt schema loads correctly', () => {
  const receipt = new Receipt()
  receipt.service = 0.5
  receipt.subTotal = 10
  receipt.total = 12

  expect(receipt).toBeDefined()
  expect(receipt.service).toBe(0.5)
  expect(receipt.subTotal).toBe(10)
  expect(receipt.total).toBe(12)
})

test('Confirmation schema loads correctly', () => {
  const receipt = new Receipt()
  receipt.service = 1
  receipt.subTotal = 10
  receipt.total = 12

  const confirmation = new Confirmation()
  confirmation.type = 'purchase'
  confirmation.purchaseDate = '2025-05-11'
  confirmation.activeDate = '2025-05-12'
  confirmation.expireDate = '2025-05-13'
  confirmation.receipt = receipt
  confirmation.paymentMethod = 'credit'

  expect(confirmation).toBeDefined()
  expect(confirmation.type).toBe('purchase')
  expect(confirmation.purchaseDate).toBe('2025-05-11')
  expect(confirmation.activeDate).toBe('2025-05-12')
  expect(confirmation.expireDate).toBe('2025-05-13')
  expect(confirmation.receipt).toBe(receipt)
  expect(confirmation.paymentMethod).toBe('credit')
})

test('DurationInput schema loads correctly', () => {
  const durationInput = new DurationInput()
  durationInput.minutes = 45
  durationInput.hours = 3

  expect(durationInput).toBeDefined()
  expect(durationInput.minutes).toBe(45)
  expect(durationInput.hours).toBe(3)
})

test('CheckedPermit schema loads correctly', () => {
  const checkedPermit = new CheckedPermit()
  checkedPermit.type = 'zone'
  checkedPermit.area = 'abc'

  expect(checkedPermit).toBeDefined()
  expect(checkedPermit.type).toBe('zone')
  expect(checkedPermit.area).toBe('abc')
})

test('IsValidPolice schema loads correctly', () => {
  const isValidPolice = new IsValidPolice()
  isValidPolice.isValid = false

  expect(isValidPolice).toBeDefined()
  expect(isValidPolice.isValid).toBe(false)
})

test('PermitsByDay schema loads correctly', () => {
  const permitsByDay = new PermitsByDay()
  permitsByDay.date = '2025-05-11'
  permitsByDay.permits = [new Permit()]

  expect(permitsByDay).toBeDefined()
  expect(permitsByDay.date).toBe('2025-05-11')
  expect(permitsByDay.permits).toHaveLength(1)
})

test('LotDetails schema loads correctly', () => {
  const dailyLotDetails = new LotTypeDetails()
  dailyLotDetails.price = 5
  
  const quarterlyLotDetails = new LotTypeDetails()
  quarterlyLotDetails.expireDate = '2025-06-12T23:59:59-07:00'
  quarterlyLotDetails.price = 100
  
  const yearlyLotDetails = new LotTypeDetails()
  yearlyLotDetails.expireDate = '2025-06-12T23:59:59-07:00'
  yearlyLotDetails.price = 300

  const lotDetails = new LotDetails()
  lotDetails.daily = dailyLotDetails
  lotDetails.quarterly = quarterlyLotDetails
  lotDetails.yearly = yearlyLotDetails

  expect(lotDetails).toBeDefined()
  expect(lotDetails.daily.price).toBe(5)
  expect(lotDetails.daily.expireDate).toBeUndefined()
  expect(lotDetails.quarterly.price).toBe(100)
  expect(lotDetails.quarterly.expireDate).toBe('2025-06-12T23:59:59-07:00')
  expect(lotDetails.yearly.price).toBe(300)
  expect(lotDetails.yearly.expireDate).toBe('2025-06-12T23:59:59-07:00')
})

test('Empty LotDetails (under construction) schema loads correctly', () => {
  const lotDetails = new LotDetails()

  expect(lotDetails).toBeDefined()
  expect(lotDetails.daily).toBeUndefined()
  expect(lotDetails.quarterly).toBeUndefined()
  expect(lotDetails.yearly).toBeUndefined()
})

test('Lot schema loads correctly', () => {
  const lot = new Lot()
  lot.price = '5'
  lot.name = 'A'

  expect(lot).toBeDefined()
  expect(lot.price).toBe('5')
  expect(lot.name).toBe('A')
})

test('LotGroup schema loads correctly', () => {
  const lotA = new Lot()
  lotA.price = '5'
  lotA.name = 'A'

  const lotGroup = new LotGroup()
  lotGroup.id = 'id'
  lotGroup.title = 'A'
  lotGroup.lots = [lotA]

  expect(lotGroup).toBeDefined()
  expect(lotGroup.id).toBe('id')
  expect(lotGroup.title).toBe('A')
  expect(lotGroup.lots.length).toBe(1)
  expect(lotGroup.lots[0]).toBe(lotA)
})

test('Zone schema loads correctly', () => {
  const duration = new Duration()
  duration.hours = 2
  duration.minutes = 0

  const zone = new Zone()
  zone.zone = '10'
  zone.hourly = 2.50
  zone.maxDuration = duration
  zone.openTime = '07:00'
  zone.closeTime = '20:00'

  expect(zone).toBeDefined()
  expect(zone.zone).toBe('10')
  expect(zone.hourly).toBe(2.50)
  expect(zone.maxDuration).toBe(duration)
  expect(zone.openTime).toBe('07:00')
  expect(zone.closeTime).toBe('20:00')
})
import {test, afterAll, expect, vi, beforeEach} from 'vitest'

import db from './db'
import {PictureService} from '../src/picture/service'

import {plateBase64} from './licenseplate'
vi.mock('server-only', () => ({}))

beforeEach( async () => {
  return db.reset()
})

afterAll(() => {
  db.shutdown()
})

const pictureService = new PictureService()

test('recognizing a plate works', async () => {
  const plate = await pictureService.recognizePlate({ image: plateBase64 })
  expect(plate).toBeDefined()
})

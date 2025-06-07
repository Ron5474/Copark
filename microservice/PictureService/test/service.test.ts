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


test('recognizing a plate works', async () => {
  const plate = await pictureService.recognizePlate({ image: plateBase64 })
  expect(plate).toBeDefined()
})

// Test: throws on invalid image format
test('recognizePlate throws on invalid image format', async () => {
  await expect(
    pictureService.recognizePlate({ image: 'not-a-base64-image' })
  ).rejects.toThrow('Invalid image format')
})

// Test: parseBase64Image works for valid input
test('parseBase64Image extracts mime and data', () => {
  // @ts-ignore
  const fn = pictureService['parseBase64Image'].bind(pictureService)
  const dataUrl = 'data:image/png;base64,abcd1234'
  const [mime, data] = fn(dataUrl)
  expect(mime).toBe('image/png')
  expect(data).toBe('abcd1234')
})

// Test: parseBase64Image throws on invalid input
test('parseBase64Image throws on invalid input', () => {
  // @ts-ignore
  const fn = pictureService['parseBase64Image'].bind(pictureService)
  expect(() => fn('invalid')).toThrow('Invalid data URL format')
})

// Test: parseGeminiResponse parses JSON
test('parseGeminiResponse parses JSON', () => {
  // @ts-ignore
  const fn = pictureService['parseGeminiResponse'].bind(pictureService)
  const text = '{"plate":"ABC123","state":"CA","confidence":99}'
  const result = fn(text)
  expect(result).toEqual({ plate: 'ABC123', state: 'CA', confidence: 99 })
})

// Test: parseGeminiResponse falls back to parseTextResponse
test('parseGeminiResponse falls back to parseTextResponse', () => {
  // @ts-ignore
  const fn = pictureService['parseGeminiResponse'].bind(pictureService)
  const text = 'plate: XYZ789 state: NY confidence: 88'
  const result = fn(text)
  expect(result).toEqual({ plate: 'XYZ789', state: 'NY', confidence: 88 })
})

// Test: parseGeminiResponse returns default on error
test('parseGeminiResponse returns default on error', () => {
  // @ts-ignore
  const fn = pictureService['parseGeminiResponse'].bind(pictureService)
  const text = '{invalid json'
  const result = fn(text)
  expect(result).toEqual({ plate: '', state: 'UNKNOWN', confidence: 0 })
})

// Test: parseTextResponse extracts fields
test('parseTextResponse extracts fields', () => {
  // @ts-ignore
  const fn = pictureService['parseTextResponse'].bind(pictureService)
  const text = 'plate: QWE123 state: TX confidence: 77'
  const result = fn(text)
  expect(result).toEqual({ plate: 'QWE123', state: 'TX', confidence: 77 })
})

// Test: parseTextResponse returns defaults if not found
test('parseTextResponse returns defaults if not found', () => {
  // @ts-ignore
  const fn = pictureService['parseTextResponse'].bind(pictureService)
  const text = 'no plate here'
  const result = fn(text)
  expect(result).toEqual({ plate: 'HERE', state: 'UNKNOWN', confidence: 0 })
})
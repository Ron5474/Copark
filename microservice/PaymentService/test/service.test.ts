import {test, afterAll, expect, beforeEach} from 'vitest'

import db from './db'
import {PaymentService} from '../src/payment/service'


beforeEach( async () => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
})
const sessionDetails = {
  "amount": 1000,
  "currency": "usd",
  "type": "payment",
  "item": "zone 1 daily pass",
  "description": "8:00 AM - 8:00 PM",
  "locale": "en",
};

const sessionWithImage = {
  "amount": 1000,
  "currency": "usd",
  "type": "payment",
  "item": "zone 1 daily pass",
  "description": "8:00 AM - 8:00 PM",
  "locale": "en",
  "image": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif"
}

const paymentDetails = {
  "id": "1234567890",
  "amount": 1000,
  "currency": "usd",
  "status": "succeeded",
  "payment_method": "pm_card_visa",
  "type": "dailyPass",
}
const userUUID1 = "abcdef12-3456-7890-abcd-ef1234567890"
const userUUID2 = "12345678-90ab-cdef-1234-567890abcdef"

test('createSession without id throws error', async () => {
  const service = new PaymentService()
  await expect(service.payment(sessionDetails)).rejects.toThrow("User ID is required")
})

test('createSession with id returns session url', async () => {
  const service = new PaymentService()
  const url = await service.payment(sessionDetails, "1234567890")
  expect(url).toBeDefined()
  expect(url).toContain("https://checkout.stripe.com/c/pay")
})

test('createSession with image returns session url', async () => {
  const service = new PaymentService()
  const url = await service.payment(sessionWithImage, "1234567890")
  expect(url).toBeDefined()
  expect(url).toContain("https://checkout.stripe.com/c/pay")
})
test('Complete payment without id throws error', async () => {
  const service = new PaymentService()
  await expect(service.completePayment(paymentDetails)).rejects.toThrow("User ID is required")
})

test('adding same transaction twice returns undefined', async () => {
  const service = new PaymentService()
  await service.completePayment(paymentDetails, userUUID1)
  const res = await service.completePayment(paymentDetails, userUUID2)
  expect(res).not.toBeDefined()
})
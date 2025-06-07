import {test, expect, beforeAll, afterAll, beforeEach, vi} from 'vitest'
// @ts-expect-error: supertest types may not match expected types in this context
import supertest from 'supertest'
import * as http from 'http'
import db from './db'

import * as authService from '../src/payment/auth'
import authApp from '../../AuthService/src/app'
import { app } from '../src/app'
import { SignJWT } from 'jose'

const driver = {
    "name": "Derik Driver",
    "email": "derik@copark.space",
    "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
    "sub": "1234567890",
  }

const sessionDetails = {
  type: "dailyPass",
  item: "zone 1 daily pass",
  currency: "USD",
  amount: 1000,
  description: "8:00 AM - 8:00 PM",
  locale: "en",
}

let server: http.Server
let authServer: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`
const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)

beforeAll(async () => {
  // Start your GraphQL server
  server = http.createServer(app)
  server.listen()

  // Start your Auth server
  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => {
    authServer.listen(AUTH_PORT, () => {
      resolve()
    })
  })

  return
})

beforeEach( async () => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  authServer.close()
})

// const validJWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkcml2ZXItaWQtMTIzIiwiZW1haWwiOiJkcml2ZXJAYm9va3MuY29tIiwicGljdHVyZSI6Imh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vaW1nIiwibmFtZSI6IkZha2UgRHJpdmVyIiwiaWF0IjoxNzQ2ODM2ODUzLCJleHAiOjE5MDQ2MjQ4NTN9.YipxWgvsQIRpjSoIbnNla741EI1klV5Fkf2A5mlhpMY"
const invalidDriverJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImIyMGVjMDYxLTI5NTctNGMzYi1iMTkzLWM4YjQwMTM4ZThmMSIsImlhdCI6MTc0NzA2NzM2NSwiZXhwIjoxOTA0ODU1MzY1fQ.pPIDRd0PtW97OkgD03LqeS9LI9TCRq7CwXpoDdM7K3k"

async function signupAsDriver(): Promise<string> {
  const token = await  new SignJWT(driver)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(encodedKey)

  // Sign up
  await supertest(AUTH_SERVICE_URL)
    .post('/api/v0/auth/driver/signup')
    .send({ authToken: token })

  const response = await supertest(AUTH_SERVICE_URL)
    .put('/api/v0/auth/driver/onboarding')
    .set('Authorization', `Bearer ${token}`)
    .send({newState: 'complete'})

  // console.log('Status:', response.status)
  // console.log('Headers:', response.headers)
  // console.log('Body:', response.body)

  const validStatuses = [200, 201, 204];
  if (!validStatuses.includes(response.status)) {
    throw new Error(`Login failed with status ${response.status}`)
  }

  return token
}

async function login(): Promise<string | undefined> {
    const token = await signupAsDriver()
    const response = await supertest(AUTH_SERVICE_URL)
      .get('/api/v0/auth/driver/login')
      .set('Authorization', `Bearer ${token}`)

    // console.log('Status:', response.status)
    // console.log('Headers:', response.headers)
    // console.log('Body:', response.body)

    if (response.status !== 200) {
      throw new Error(`Login failed with status ${response.status}`)
    }

    return token
  }

test('Get docs page', async () => {
    await supertest(server)
      .get('/api/v0/docs/')
      .expect(200)
})

test('Post /api/v0/payment/pay - should return 302', async () => {
  const token = await login()
  const response = await supertest(app)
    .post('/api/v0/payment/pay')
    .set('Authorization', `Bearer ${token}`)
    .send(sessionDetails)

  expect(response.status).toBe(302)
  expect(response.body).toHaveProperty('url')
  expect(response.body.url).toMatch(/https:\/\/checkout.stripe.com\/c\/pay*/) 
})

test('Post /api/v0/payment/complete - should return 201', async () => {
  const token = await login()
  const response = await supertest(app)
    .post('/api/v0/payment/complete')
    .set('Authorization', `Bearer ${token}`)
    .send({
      id: 'pi_123',
      status: 'succeeded',
      payment_method: 'pm_card_visa',
      amount: 1000,
      currency: 'USD',
      type: 'dailyPass',
    })

  expect(response.status).toBe(201)
})

test('Post /api/v0/payment/complete - by non-existant driver should return 401', async () => {
  const response = await supertest(app)
    .post('/api/v0/payment/complete')
    .set('Authorization', `Bearer ${invalidDriverJWT}`)
    .send({
      id: 'pi_123',
      status: 'succeeded',
      payment_method: 'pm_card_visa',
      amount: 1000,
      currency: 'USD',
      type: 'dailyPass',
    })

  expect(response.status).toBe(401)
})

test('Post /api/v0/payment/pay - Stripe error returns 500', async () => {
  const stripeSecretKey = process.env.STRIPE_SECRET
  process.env.STRIPE_SECRET = 'sk_test_invalid_key'
  const token = await login()
  const response = await supertest(app)
    .post('/api/v0/payment/pay')
    .set('Authorization', `Bearer ${token}`)
    .send(sessionDetails)

  process.env.STRIPE_SECRET = stripeSecretKey;
  expect(response.status).toBe(500)
})

test('Post /api/v0/payment/pay - should return 401', async () => {
  const response = await supertest(app)
    .post('/api/v0/payment/pay')
    .send(sessionDetails)

  expect(response.status).toBe(401)
  expect(response.body).toHaveProperty('message', 'Unauthorized')
})

test('Post /api/v0/payment/complete - should return 401', async () => {
  const token = await login();
  const response = await supertest(app)
    .post('/api/v0/payment/complete')
    .set('Authorization', `${token}`)
    .send(sessionDetails)

  expect(response.status).toBe(401)
  expect(response.body).toHaveProperty('message', 'Unauthorized')
})

test('Post /api/v0/payment/complete - same transaction twice returns 200', async () => {
  const token = await login()
  const response = await supertest(app)
    .post('/api/v0/payment/complete')
    .set('Authorization', `Bearer ${token}`)
    .send({
      id: 'pi_123',
      status: 'succeeded',
      payment_method: 'pm_card_visa',
      amount: 1000,
      currency: 'USD',
      type: 'dailyPass',
    })

  expect(response.status).toBe(201)

  const secondResponse = await supertest(app)
    .post('/api/v0/payment/complete')
    .set('Authorization', `Bearer ${token}`)
    .send({
      id: 'pi_123',
      status: 'succeeded',
      payment_method: 'pm_card_visa',
      amount: 1000,
      currency: 'USD',
      type: 'dailyPass',
    })

  expect(secondResponse.status).toBe(200)
})

test('Throw Internal Server Error', async () => {
    vi.spyOn(authService.AuthService.prototype, 'check').mockImplementation(() => {
        throw new Error()
    })
  
    const token = await login();
    await supertest(app)
      .post('/api/v0/payment/complete')
      .set('Authorization', `${token}`)
      .send(sessionDetails)
      .expect(500)
    // await supertest(server)
    //   .post('/api/v0/auth/check')
    //   .set('Authorization', `Bearer ${validJWT}`)
    //   .send(["driver"])
    //   .expect(500)
})
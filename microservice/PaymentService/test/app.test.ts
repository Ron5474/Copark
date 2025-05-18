import {test, expect, beforeAll, afterAll, beforeEach} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import authApp from '../../AuthService/src/app'
import db from './db'
import app from '../src/app'
import { SignJWT } from 'jose'

// const validDriver = {
//   "name": "Driver 1",
//   "email": "driver1@outlook.com",
//   "picture": "https://www.google.com/image.png",
//   "sub": "12345677",
// }

const driver = {
    "name": "Derik Driver",
    "email": "derik@copark.space",
    "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
    "sub": "1234567890",
  }

// const driver3 = {
//   "id": "b1eab387-1000-4ee3-a746-d59366e44f06",
//   "sub": "12345679",
//   "name": "Driver 3",
//   "role": "[\"driver\"]",
//   "email": "driver3@outlook.com",
//   "picture": "https://www.google.com/img3",
//   "accountStatus": "active"
// }

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`
const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)

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
beforeAll(async () => {
  server = http.createServer(app)
  server.listen()

  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => {
    authServer.listen(AUTH_PORT, () => {
      resolve()
    })
  })

  return
})

beforeEach(async () => {
  return db.reset();
})

afterAll(async () => {
  db.shutdown()
  server.close()
  authServer.close()
})

async function loginAsDriver(): Promise<string | undefined> {
  const token = new SignJWT(driver)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30m')
    .sign(encodedKey)
  const response = await supertest(AUTH_SERVICE_URL)
    .post('/api/v0/auth/driver/login')
    .set('Authorization', `Bearer ${await token}`)
  // console.log('response', response.body)
  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}`)
  }
  return token
  }

test('Post /api/v0/payment/pay - should return 302', async () => {
  const token = await loginAsDriver()
  const response = await supertest(app)
    .post('/api/v0/payment/pay')
    .set('Authorization', `Bearer ${token}`)
    .send(sessionDetails)

  expect(response.status).toBe(302)
  expect(response.body).toHaveProperty('url')
  expect(response.body.url).toMatch(/https:\/\/checkout\.stripe\.com\/pay/) 
})
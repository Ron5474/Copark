import { test, beforeAll, afterAll, expect } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { SignJWT } from 'jose'
import { vehicle } from 'app/driver/tests/combined/mockService'

let server: http.Server
let authServer: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`

const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET + 'apiexit')

const adminUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
}

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
  await bootstrap()

  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => {
    authServer.listen(AUTH_PORT, () => resolve())
  })

  return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  authServer.close()
})

async function encrypt(userId: string): Promise<string> {
    return new SignJWT({ id: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
  }


async function loginAsAdmin(): Promise<string> {
  const response = await supertest(AUTH_SERVICE_URL)
    .post('/api/v0/auth/login')
    .send(adminUser)

  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}`)
  }

  return response.body.id
}

test('Admin can create a ticket with images (using variables)', async () => {
  const token = await loginAsAdmin()

  const vehicleid = await encrypt('00000000-0000-0000-0000-000000000000')
  const enforcerid = await encrypt('00000000-0000-0000-0000-000000000000')

  const query = `
    mutation CreateTicket($input: NewTicket!) {
      createTicket(newTicket: $input) {
        id
        vehicle
        fine
        violation
        images
      }
    }
  `

  const variables = {
    input: {
      vehicle: vehicleid,
      enforcer: enforcerid,
      fine: 150,
      violation: "speeding",
      images: "photo1.jpg",
    },
  }

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query, variables })
    .expect(200)

  expect(response.body.errors).toBeUndefined()
  expect(response.body.data.createTicket.images).toBe("photo1.jpg")
})

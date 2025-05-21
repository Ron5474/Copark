import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
// @ts-expect-error: supertest types may not match expected types in this context
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { app as VehicleApp, bootstrap as VehicleBoot } from '../../VehicleService/src/app'

let server: http.Server
let authServer: http.Server
let vehcServer: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`
const VEHC_PORT = 4001
// const VEHC_SERVICE_URL = `http://localhost:${VEHC_PORT}`

// const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET + 'apiexit')

beforeAll(async () => {
  // Start your GraphQL server
  server = http.createServer(app)
  server.listen()
  await bootstrap()

  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => {
    authServer.listen(AUTH_PORT, () => resolve())
  })

  vehcServer = http.createServer(VehicleApp)
  await new Promise<void>((resolve) => {
    vehcServer.listen(VEHC_PORT, () => resolve())
  })
  await VehicleBoot()

  return db.reset()
})

beforeEach( async () => {
  return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  authServer.close()
  vehcServer.close()
})


const nextAuthJWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3NDY3Njg5MjMsImV4cCI6MTg0MTQ2MzQ0MiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiMTA5MTY0MjQwOTk2MDEyNTE1NiIsImVtYWlsIjoiZGVyaWtAY29wYXJrLnNwYWNlIiwicGljdHVyZSI6IlwiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2JTT2M0MFc3ZEpJd1VkanNZQzNVSmdwUzdRSjBSR2Yyb3ZKSXF6S3ZzbW1NUFBnPXM5Ni1jIiwibmFtZSI6IkRlcmlrIERyaXZlciJ9.D23uY9TRN-3UKSK8NxdgSP208iaCc8TuzWIYgYMfhwE"

// const policeJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFiZTQwNWM2LTc0MDAtNGQyMy05Zjg2LTAwZWFkMTU3MjlmNSIsImlhdCI6MTc0NzI2MzIyMSwiZXhwIjoxOTA1MDUxMjIxfQ.UVVWAjg2-asw8gfqoxljHZSVX4Mn_1FzOV85CagVbUQ"

const adminUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
}

// const enforcerUser = {
//   email: 'jxiong0822@outlook.com',
//   password: 'password1',
// }

async function loginAs(who: string): Promise<string | undefined> {
  if (who === "driver") {
    const response = await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/driver/login')
      .set('Authorization', `Bearer ${nextAuthJWT}`)

    if (response.status !== 200) {
      throw new Error(`Login failed with status ${response.status}`)
    }

    return response.body
  }

  else if (who === "enforcement") {
    const response = await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/login')
      .send({
        email: 'enforcer1@outlook.com',
        password: 'password1',
      })

    if (response.status !== 200) {
      throw new Error(`Enforcement login failed with status ${response.status}`)
    }

    return response.body.id

  } 
  
  else {
    const response = await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/login')
      .send(adminUser)

    if (response.status !== 200) {
      throw new Error(`Login failed with status ${response.status}`)
    }

    return response.body?.id
  }
}


const purchaseZonePermitQuery = `
mutation PurchaseZonePermit($input: PurchaseZoneInput!) {
  purchaseZonePermit(input: $input) {
    type
    area
    purchaseDate
    activeDate
    expireDate
    receipt {
      service
      subTotal
      total
    }
    paymentMethod
  }
}`

const purchaseZoneInput = {
  input: {
    vehicle: "12345678-1234-1234-1234-567890abcdef",
    zone: "123",
    duration: {'minutes': 30, 'hours': 0},
    paymentMethod: "paypal"
  }
}

test('Errors out with wrong permissions', async () => {
  const token = await loginAs("enforcement")

  const confirmation = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: purchaseZonePermitQuery,
      variables: purchaseZoneInput
    })

  expect(confirmation.body.errors).toBeDefined()
  expect(confirmation.body.errors[0].message)
  .toBe("Access denied! You don't have permission for this action!")
})

test('Errors out with no auth header', async () => {
  const confirmation = await supertest(server)
    .post('/graphql')
    .send({ 
      query: purchaseZonePermitQuery,
      variables: purchaseZoneInput
    })

  expect(confirmation.body.errors).toBeDefined()
  expect(confirmation.body.errors[0].message)
  .toBe("Access denied! You don't have permission for this action!")
})

test('GET /playground returns the GraphQL Playground HTML', async () => {
    const response = await supertest(server)
        .get('/playground')
        .expect(200);

    expect(response.text).toContain('<title>GraphQL Playground</title>');
});
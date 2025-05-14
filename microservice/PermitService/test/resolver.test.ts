import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
// @ts-expect-error: supertest types may not match expected types in this context
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'

let server: http.Server
let authServer: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`


beforeAll(async () => {
  // Start your GraphQL server
  server = http.createServer(app)
  server.listen()
  await bootstrap()

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


const nextAuthJWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3NDY3Njg5MjMsImV4cCI6MTg0MTQ2MzQ0MiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiMTA5MTY0MjQwOTk2MDEyNTE1NiIsImVtYWlsIjoiZGVyaWtAY29wYXJrLnNwYWNlIiwicGljdHVyZSI6IlwiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2JTT2M0MFc3ZEpJd1VkanNZQzNVSmdwUzdRSjBSR2Yyb3ZKSXF6S3ZzbW1NUFBnPXM5Ni1jIiwibmFtZSI6IkRlcmlrIERyaXZlciJ9.D23uY9TRN-3UKSK8NxdgSP208iaCc8TuzWIYgYMfhwE"

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

  } else {
    const response = await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/login')
      .send(adminUser)

    if (response.status !== 200) {
      throw new Error(`Login failed with status ${response.status}`)
    }

    return response.body?.id
  }
}

// const isValidQuery = `
//       query {
//         isValidZonePermit {
//           vehicle
//           zone
//         }
//       }
//     `

const purchaseZonePermitQuery = `
mutation PurchaseZonePermit($input: PurchaseZoneInput!) {
  purchaseZonePermit(input: $input) {
    type
    zone
    purchaseDate
    activeDate
    expireDate
    receipt {
      tax
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


const myPermitsQuery = `
query MyPermits($vehicleID: String!) {
  myPermits(vehicleID: $vehicleID) {
    future {
      vehicle
      type
      zone
      activeDate
      expireDate
    }
    active {
      vehicle
      type
      zone
      activeDate
      expireDate
    }
    expired {
      vehicle
      type
      zone
      activeDate
      expireDate
    }
  }
}`

const myPermitsInput = {
  vehicleID: "12345678-1234-1234-1234-567890abcdef"
}

const zoneDetailsQuery = `
query ZoneDetails($zone: String!) {
  zoneDetails(zone: $zone) {
    daily
    hourly
    maxDuration {
      minutes
      hours
    }
    openTime
    closeTime
  }
}`

const zoneDetailsInput = {
  zone: "123"
}

// const isValidPermitInput = {
//   vehicle: "12345678-1234-1234-1234-567890abcdef"
// }

test('Permit service is running', async () => {
  const status = await supertest(server)
    .post('/graphql')
    .send({ 
      query: `
        query { permitServiceStatus }
      `,
    })

  expect(status.body.data.permitServiceStatus).toBe("Permit service is running")
})

test('Driver can purchase a zone permit', async () => {
  const token = await loginAs("driver")

  const confirmation = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: purchaseZonePermitQuery,
      variables: purchaseZoneInput
    })

  expect(confirmation.body.data.purchaseZonePermit.type).toBe("zone")
})

test('Enforcer gets invalid permit', async () => {
  const token = await loginAs("enforcement")

  const confirmation = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: purchaseZonePermitQuery,
      variables: purchaseZoneInput
    })

  expect(confirmation.body.data.purchaseZonePermit.type).toBe("zone")
})

test('Driver has no permits', async () => {
  const token = await loginAs("driver")

  const permits = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: myPermitsQuery,
      variables: myPermitsInput
    })

  expect(permits.body.data.myPermits.active.length).toBe(0)
})

test('Driver has no permits', async () => {
  const token = await loginAs("driver")

  const details = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: zoneDetailsQuery,
      variables: zoneDetailsInput
    })

  expect(details.body.data.zoneDetails.hourly).toBe(2.45)
})

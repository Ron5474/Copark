import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
// @ts-expect-error: supertest types may not match expected types in this context
import supertest from 'supertest'
import * as http from 'http'
import { SignJWT } from 'jose'

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

// const encodedKey = new TextEncoder().encode(process.env.MICROSERVICE_INTERNAL_SECRET)
const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)

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

const driver = {
    "name": "Derik Driver",
    "email": "derik@copark.space",
    "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
    "sub": "1234567890",
  }

// async function encrypt(userId: string): Promise<string> {
//   return new SignJWT({ id: userId })
//     .setProtectedHeader({ alg: 'HS256' })
//     .setIssuedAt()
//     .setExpirationTime('5y')
//     .sign(encodedKey)
//   }

// const validDriverJWT = encrypt('b1eab387-1000-4ee3-a746-d59366e44f06');


// const nextAuthJWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3NDY3Njg5MjMsImV4cCI6MTg0MTQ2MzQ0MiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiMTA5MTY0MjQwOTk2MDEyNTE1NiIsImVtYWlsIjoiZGVyaWtAY29wYXJrLnNwYWNlIiwicGljdHVyZSI6IlwiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2JTT2M0MFc3ZEpJd1VkanNZQzNVSmdwUzdRSjBSR2Yyb3ZKSXF6S3ZzbW1NUFBnPXM5Ni1jIiwibmFtZSI6IkRlcmlrIERyaXZlciJ9.D23uY9TRN-3UKSK8NxdgSP208iaCc8TuzWIYgYMfhwE"

// const policeJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFiZTQwNWM2LTc0MDAtNGQyMy05Zjg2LTAwZWFkMTU3MjlmNSIsImlhdCI6MTc0NzI2MzIyMSwiZXhwIjoxOTA1MDUxMjIxfQ.UVVWAjg2-asw8gfqoxljHZSVX4Mn_1FzOV85CagVbUQ"

const adminUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
}

// const enforcerUser = {
//   email: 'jxiong0822@outlook.com',
//   password: 'password1',
// }

async function loginAs(who: string, defaultVehicle=true): Promise<{token: string, vid: string} | undefined> {
  if (who === "driver") {
    const token = await  new SignJWT(driver)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)

    // Sign up
    await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/driver/signup')
      .send({ authToken: token })

    // Add Vehicle
    const addVehicle = await supertest(vehcServer)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ 
        query: regVehicleQuery,
        variables: derikVehicleInput
      })

    const vid = addVehicle.body.data.registerVehicle.id
    const setDefaultVehicleInput = {
      input: {
        id: vid
      }
    }
    if (defaultVehicle) {
      await supertest(server)
        .post('/graphql')
        .set('Authorization', 'Bearer ' + token)
        .send({ 
          query: SetDefaultVehicle,
          variables: setDefaultVehicleInput
        })
    }
    
    const response = await supertest(AUTH_SERVICE_URL)
      .put('/api/v0/auth/driver/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({newState: 'complete'})

    const validStatuses = [200, 201, 204];
    if (!validStatuses.includes(response.status)) {
      throw new Error(`Login failed with status ${response.status}`)
    }

    return { token, vid }
  } else if (who === "enforcement") {
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

const regVehicleQuery = `
mutation RegisterVehicle($input: RegisterVehicleInput!) {
  registerVehicle(input: $input) {
    id
    plate
    country
    state
    nickname
  }
}`

const SetDefaultVehicle = `
mutation SetDefaultVehicle($input: setDefaultVehicleInput!) {
  setDefaultVehicle(input: $input) {
    id
  }
}`

const derikVehicleInput = {
  input: {
    plate: "DERIK123",
    country: "US",
    state: "California",
    nickname: "Derik's Vehicle"
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
  const { token } = await loginAs("enforcement")

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

test('Right permissions', async () => {
  const { token, vid } = await loginAs("driver")

  const confirmation = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: purchaseZonePermitQuery,
      variables: {...purchaseZoneInput, vehicle: vid}
    })

  expect(confirmation.body.errors).toBeUndefined()
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
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

const policeJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFiZTQwNWM2LTc0MDAtNGQyMy05Zjg2LTAwZWFkMTU3MjlmNSIsImlhdCI6MTc0NzI2MzIyMSwiZXhwIjoxOTA1MDUxMjIxfQ.UVVWAjg2-asw8gfqoxljHZSVX4Mn_1FzOV85CagVbUQ"

const adminUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
}

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

// const purchaseZonePermitQuery = `
// mutation PurchaseZonePermit($input: PurchaseZoneInput!) {
//   purchaseZonePermit(input: $input) {
//     type
//     area
//     purchaseDate
//     activeDate
//     expireDate
//     receipt {
//       service
//       subTotal
//       total
//     }
//     paymentMethod
//   }
// }`

// const purchaseZoneInput = {
//   input: {
//     vehicle: "12345678-1234-1234-1234-567890abcdef",
//     zone: "123",
//     duration: {'minutes': 30, 'hours': 0},
//     paymentMethod: "paypal"
//   }
// }

const isValidZonePermitQuery = `
query IsValid($input: IsValidPermitInput!) {
  isValidZonePermit(input: $input) {
    isValid
    type
    area
  }
}`

const isValidZonePermitInput = {
  input: {
    vehicle: "0000000",
    zone: "123"
  }
}

const ValidZonePermitInput = {
  input: {
    vehicle: "JCDE544",
    zone: "123"
  }
}

const isValidPermitByPoliceQuery = `
query IsValidPolice($plate: String!) {
  isValidPermitByPolice(plate: $plate) {
    isValid
  }
}`

const isValidPermitByPoliceInput = {
  plate: "7RON123",
}

const nonExistentPlateInput = {
  plate: "1AAA111",
}

const myPermitsQuery = `
query MyPermits($vehicleID: String!) {
  myPermits(vehicleID: $vehicleID) {
    future {
      vehicle
      type
      area
      activeDate
      expireDate
    }
    active {
      vehicle
      type
      area
      activeDate
      expireDate
    }
    expired {
      vehicle
      type
      area
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

// test('Driver can purchase a zone permit', async () => {
//   const token = await loginAs("driver")

//   const confirmation = await supertest(server)
//     .post('/graphql')
//     .set('Authorization', 'Bearer ' + token)
//     .send({ 
//       query: purchaseZonePermitQuery,
//       variables: purchaseZoneInput
//     })

//   expect(confirmation.body.data.purchaseZonePermit.type).toBe("zone")
// })

test('Enforcer gets invalid permit', async () => {
  const token = await loginAs("enforcement")

  const isValid = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: isValidZonePermitQuery,
      variables: isValidZonePermitInput
    })
    
  expect(isValid.body.data.isValidZonePermit.isValid).toBe(false)
})

test('Enforcer gets valid permit', async () => {
  const token = await loginAs("enforcement")

  const isValid = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ 
      query: isValidZonePermitQuery,
      variables: ValidZonePermitInput
    })

  // expect(isValid.body.data.isValidZonePermit.isValid).toBe(false)
  console.log(isValid.body)
  expect(isValid.body.data.isValidZonePermit.isValid).toBe(true)

})

test('Police gets invalid permit', async () => {
  const isValid = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + policeJWT)
    .send({ 
      query: isValidPermitByPoliceQuery,
      variables: isValidPermitByPoliceInput
    })

  expect(isValid.body.data.isValidPermitByPolice.isValid).toBe(false)
})

test('Police gets invalid for nonexistent plate', async () => {
  const isValid = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + policeJWT)
    .send({ 
      query: isValidPermitByPoliceQuery,
      variables: nonExistentPlateInput
    })
    
  expect(isValid.body.data.isValidPermitByPolice.isValid).toBe(false)
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

test('Admin can get ticket stats grouped by day', async () => {
  const token = await loginAs("admin");

  const query = `
    query GetPermitStats {
      getPermitStats {
        date
        permits {
          vehicle
          area
          activeDate
          expireDate
        }
      }
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query })
    .expect(200);

  expect(response.body.errors).toBeUndefined();
  const stats = response.body.data.getPermitStats;
  expect(Array.isArray(stats)).toBe(true);
  expect(stats.length).toBeGreaterThan(0);
  stats.forEach((dayStat: any) => {
    expect(dayStat).toHaveProperty('date');
    expect(Array.isArray(dayStat.permits)).toBe(true);
    dayStat.permits.forEach((permit: any) => {
      expect(permit).toHaveProperty('vehicle');
    });
  });
});
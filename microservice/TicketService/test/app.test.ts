import { test, beforeAll, afterAll, expect } from 'vitest'
// @ts-expect-error: supertest types may not match expected types in this context
import supertest from 'supertest'
import * as http from 'http'
import { SignJWT } from 'jose'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { app as emailApp } from '../../EmailService/src/app'
import { app as VehicleApp, bootstrap as VehicleBoot } from '../../VehicleService/src/app'

let server: http.Server
let authServer: http.Server
let emailServer: http.Server
let vehcServer: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`
const EMAIL_PORT = 3015
const VEHC_PORT = 4001

const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)

// beforeAll(async () => {
//   // Start your GraphQL server
//   server = http.createServer(app)
//   server.listen()
//   await bootstrap()

//   // Start your Auth server
//   authServer = http.createServer(authApp)
//   await new Promise<void>((resolve) => {
//     authServer.listen(AUTH_PORT, () => {
//     //   console.log(`Auth service running on ${AUTH_SERVICE_URL}`)
//       resolve()
//     })
//   })

//   return db.reset()
// })

beforeAll(async () => {
  // Start your GraphQL server
  server = http.createServer(app)
  server.listen()
  await bootstrap()

  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => {
    authServer.listen(AUTH_PORT, () => resolve())
  })
  
  emailServer = http.createServer(emailApp)
  await new Promise<void>((resolve) => {
    emailServer.listen(EMAIL_PORT, () => resolve())
  })

  vehcServer = http.createServer(VehicleApp)
  await new Promise<void>((resolve) => {
    vehcServer.listen(VEHC_PORT, () => resolve())
  })
  await VehicleBoot()

  return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  authServer.close()
  vehcServer.close()
})

// Test data
const adminUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
}

const driver = {
    "name": "Derik Driver",
    "email": "derik@copark.space",
    "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
    "sub": "1234567890",
  }
  

async function loginAs(who: string, defaultVehicle=true): Promise<{token: string, vid?: string} | undefined> {
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

    const validStatuses = [200, 201, 204]
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
    return { token: response.body.id }
  } else {
    const response = await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/login')
      .send(adminUser)

    if (response.status !== 200) {
      throw new Error(`Login failed with status ${response.status}`)
    }
    return { token: response.body?.id }
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


test('Errors out with no auth header', async () => {
  const query = `
    query {
      getTickets {
        id
        vehicle
        enforcer
        fine
        violation
        images
      }
    }
  `

  const response = await supertest(server)
    .post('/graphql')
    .send({ query })
    .expect(200)

  expect(response.body.errors).toBeDefined()
  expect(response.body.errors[0].message).toMatch("Unauthorized: Missing Authorization header")
  
})

test('Errors out with badly formed auth header', async () => {
    const token = await loginAs("admin")

    const query = `
      query {
        getTickets {
          id
          vehicle
          enforcer
          fine
          violation
          images
        }
      }
    `
  
    const response = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token + 'extra garbage')
      .send({ query })
      .expect(200)
  
    expect(response.body.errors).toBeDefined()
    expect(response.body.errors[0].message).toMatch("Unauthorized312")

})

test('Errors out with wrong permissions', async () => {
    const token = await loginAs("driver")

    const query = `
      query {
        getTickets {
          id
          vehicle
          enforcer
          fine
          violation
          images
        }
      }
    `
  
    const response = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query })
      .expect(200)
  
    expect(response.body.errors).toBeDefined()
    expect(response.body.errors[0].message).toMatch("Unauthorized312")
})

test('GET /playground returns the GraphQL Playground HTML', async () => {
    const response = await supertest(server)
        .get('/playground')
        .expect(200);

    expect(response.text).toContain('<title>GraphQL Playground</title>');
});
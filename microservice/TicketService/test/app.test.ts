import { test, beforeAll, afterAll, expect } from 'vitest'
// @ts-ignore
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
    //   console.log(`Auth service running on ${AUTH_SERVICE_URL}`)
      resolve()
    })
  })

  return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  authServer.close()
})

// Test data
const adminUser = {
  email: 'jxiong0822@outlook.com',
  password: 'password1',
}

const driverUser = {
    email: 'driver1@outlook.com',
    password: 'password1',
  }
  

async function loginAsUser(user: { email: string; password: string }): Promise<string | undefined> {
    const response = await supertest(AUTH_SERVICE_URL)
        .post('/api/v0/auth/login')
        .send(user)

    if (response.status !== 200) {
        throw new Error(`Login failed with status ${response.status}`)
    }

    // console.log('Login response:', response.body)
    return response.body?.id
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
    const token = await loginAsUser(adminUser)

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
    const token = await loginAsUser(driverUser)

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
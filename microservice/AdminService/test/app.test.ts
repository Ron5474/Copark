import { test, beforeAll, afterAll, expect } from 'vitest'
// @ts-ignore
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'

let server: http.Server
let authServer: http.Server

const AUTH_PORT = 3014
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

// const enforcerToAdd = {
//   name: 'New Enforcer',
//   email: 'newenforcer@domain.com',
// }

async function loginAsAdmin(): Promise<string | undefined> {
  const response = await supertest(AUTH_SERVICE_URL)
    .post('/api/v0/auth/login')
    .send(adminUser)

  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}`)
  }

  return response.body?.id
}

test('Admin can get a list of enforcers', async () => {
  const token = await loginAsAdmin()

  const query = `
    query {
      getEnforcers {
        id
        name
        email
        accountStatus
      }
    }
  `

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query })
    .expect(200)

  expect(response.body.errors).toBeUndefined()
  expect(response.body.data.getEnforcers).toBeInstanceOf(Array)
  expect(response.body.data.getEnforcers.length).toBeGreaterThan(0)
})

test('Errors out with no auth header', async () => {  
    const query = `
      query {
        getEnforcers {
          id
          name
          email
          accountStatus
        }
      }
    `
  
    const response = await supertest(server)
      .post('/graphql')
      .send({ query })
      .expect(200)
  
    expect(response.body.errors).toBeDefined()
  })

test('Errors out with bad auth header', async () => {
const token = await loginAsAdmin()

const query = `
    query {
    getEnforcers {
        id
        name
        email
        accountStatus
    }
    }
`

const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token + 'invalidtoken')
    .send({ query })
    .expect(200)

expect(response.body.errors).toBeDefined();
expect(response.body.errors[0].message).toBe("Unauthorized312")
})

test('GET /playground returns the GraphQL Playground HTML', async () => {
const response = await supertest(server)
    .get('/playground')
    .expect(200);

expect(response.text).toContain('<title>GraphQL Playground</title>');
});
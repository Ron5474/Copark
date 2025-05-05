import { test, beforeAll, afterAll, expect } from 'vitest'
// @ts-ignore
import supertest from 'supertest'
import * as http from 'http'

import * as db from './db'
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

const enforcerToAdd = {
  name: 'New Enforcer',
  email: 'newenforcer@domain.com',
}

async function loginAsAdmin(): Promise<string | undefined> {
  const response = await supertest(AUTH_SERVICE_URL)
    .post('/api/v0/auth/login')
    .send(adminUser)

//   console.log('Status:', response.status)
//   console.log('Headers:', response.headers)
//   console.log('Body:', response.body)

  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}`)
  }

  return response.body?.id
}

// Test case for the `getEnforcers` query
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

// Test case for the `addEnforcer` mutation
test('Admin can add a new enforcer', async () => {
  const token = await loginAsAdmin()

  const mutation = `
    mutation {
      addEnforcer(enforcer: { name: "${enforcerToAdd.name}", email: "${enforcerToAdd.email}" }) {
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
    .send({ query: mutation })
    .expect(200)

  expect(response.body.errors).toBeUndefined()
  expect(response.body.data.addEnforcer).toBeInstanceOf(Array)
  expect(response.body.data.addEnforcer.length).toEqual(1)
  expect(response.body.data.addEnforcer[0].name).toBe(enforcerToAdd.name)
})

test('Admin can suspend an enforcer', async () => {
    const token = await loginAsAdmin()
  
    const getEnforcersQuery = `
      query {
        getEnforcers {
          id
          name
          accountStatus
        }
      }
    `
  
    const enforcerListResponse = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: getEnforcersQuery })
      .expect(200)
  
    expect(enforcerListResponse.body.errors).toBeUndefined()
    const enforcers = enforcerListResponse.body.data.getEnforcers
    expect(enforcers.length).toBeGreaterThan(0)
  
    const targetId = enforcers[0].id
  
    const suspendMutation = `
      mutation {
        suspendUser(user: { id: "${targetId}" }) {
          id
          name
          accountStatus
        }
      }
    `
  
    const suspendResponse = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: suspendMutation })
      .expect(200)
  
  
    expect(suspendResponse.body.errors).toBeUndefined()
    const suspended = suspendResponse.body.data.suspendUser
    expect(suspended[0].accountStatus).toBe('suspended')
  })
  
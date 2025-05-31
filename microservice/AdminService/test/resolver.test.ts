import { test, beforeAll, afterAll, expect } from 'vitest'
// @ts-ignore
import supertest from 'supertest'
import * as http from 'http'
import killPort from 'kill-port'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { app as ticketApp, bootstrap as ticketBoot } from '../../TicketService/src/app'
import { app as permitApp, bootstrap as permitBoot } from '../../PermitService/src/app'

const AUTH_PORT = 3010
const TICKET_PORT = 4002
const PERMIT_PORT = 4003

let server: http.Server
let ticketServer: http.Server
let permitServer: http.Server
let authServer: http.Server

const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`

beforeAll(async () => {
  // Start AdminService GraphQL server
  server = http.createServer(app)
  server.listen()
  await bootstrap()

  // Start TicketService
  ticketServer = http.createServer(ticketApp)
  await new Promise<void>((resolve) => {
    ticketServer.listen(TICKET_PORT, () => resolve())
  })
  await ticketBoot()

  // Start PermitService
  permitServer = http.createServer(permitApp)
  await new Promise<void>((resolve) => {
    permitServer.listen(PERMIT_PORT, () => resolve())
  })
  await permitBoot()

  // Force kill anything on AUTH_PORT
  try {
    await killPort(AUTH_PORT)
  } catch (error) {
    console.log(`No process was running on port ${AUTH_PORT}`)
  }

  // Start AuthService
  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => {
    authServer.listen(AUTH_PORT, () => resolve())
  })

  return db.reset()
}, 100000)

afterAll(() => {
  db.shutdown()
  ticketServer.close()
  permitServer.close()
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

  // console.log('Status:', response.status)
  // console.log('Headers:', response.headers)
  // console.log('Body:', response.body)

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
  
  test('Admin can get a list of drivers', async () => {
    const token = await loginAsAdmin();
  
    const query = `
      query {
        getDrivers {
          id
          name
          email
          accountStatus
        }
      }
    `;
  
    const response = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query })
      .expect(200);
  
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.getDrivers).toBeInstanceOf(Array);
    expect(response.body.data.getDrivers.length).toBeGreaterThan(0);
  });
  
  test('Admin can reinstate a suspended user', async () => {
    const token = await loginAsAdmin();
  
    // First, suspend a user to reinstate later
    const getEnforcersQuery = `
      query {
        getEnforcers {
          id
          name
          accountStatus
        }
      }
    `;
  
    const enforcerListResponse = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: getEnforcersQuery })
      .expect(200);
  
    expect(enforcerListResponse.body.errors).toBeUndefined();
    const enforcers = enforcerListResponse.body.data.getEnforcers;
    expect(enforcers.length).toBeGreaterThan(0);
  
    const targetId = enforcers[0].id;
  
    // Suspend the user
    const suspendMutation = `
      mutation {
        suspendUser(user: { id: "${targetId}" }) {
          id
          name
          accountStatus
        }
      }
    `;
  
    const suspendResponse = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: suspendMutation })
      .expect(200);
  
    expect(suspendResponse.body.errors).toBeUndefined();
    const suspended = suspendResponse.body.data.suspendUser;
    expect(suspended[0].accountStatus).toBe('suspended');
  
    // Reinstate the user
    const reinstateMutation = `
      mutation {
        reinstateUser(user: { id: "${targetId}" }) {
          id
          name
          accountStatus
        }
      }
    `;
  
    const reinstateResponse = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query: reinstateMutation })
      .expect(200);
  
    expect(reinstateResponse.body.errors).toBeUndefined();
    const reinstated = reinstateResponse.body.data.reinstateUser;
    expect(reinstated[0].accountStatus).toBe('active');
  });

test('Admin can delete an enforcer', async () => {
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

  const deleteMutation = `
    mutation {
      deleteUser(user: { id: "${targetId}" }) {
        id
        name
        accountStatus
      }
    }
  `

  const deleteResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: deleteMutation })
    .expect(200)

  expect(deleteResponse.body.errors).toBeUndefined()
  const deleted = deleteResponse.body.data.deleteUser
  expect(deleted[0].accountStatus).toBe('deleted')
})

test('Admin can add a payroll organization', async () => {
  const token = await loginAsAdmin()

  const mutation = `
    mutation {addAPIUser(organization: {
      name: "Santa Cruz Payroll"
      email: "scpy@gmail.com"
      role: "payroll"
      }){
      id
      }
    }
  `

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: mutation })
    .expect(200)

  expect(response.body.errors).toBeUndefined()
  expect(response.body.data.addAPIUser.id).toBeDefined()
})

test('Admin can get a list of API users', async () => {
  const token = await loginAsAdmin()

  // First add a police organization to ensure there's data to retrieve
  const addOrgMutation = `
    mutation {addAPIUser(organization: {
      name: "Santa Cruz PD"
      email: "scpd@gmail.com"
      role: "campusPolice"
      }){
      id
      }
    }
  `

  const addResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: addOrgMutation })
    .expect(200)

  expect(addResponse.body.errors).toBeUndefined()
  expect(addResponse.body.data.addAPIUser.id).toBeDefined()

  // Then query for API users
  const query = `
    query {
      getAPIUsers {
        id
        name
        email
        role
      }
    }
  `

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query })
    .expect(200)

  expect(response.body.errors).toBeUndefined()
  expect(response.body.data.getAPIUsers).toBeInstanceOf(Array)
  expect(response.body.data.getAPIUsers.length).toBeGreaterThan(0)
  
  const apiUsers = response.body.data.getAPIUsers
  expect(apiUsers[0]).toHaveProperty('id')
  expect(apiUsers[0]).toHaveProperty('name')
  expect(apiUsers[0]).toHaveProperty('email')
  expect(apiUsers[0]).toHaveProperty('role')
})

test('Admin can generate a report with ticket and permit summary', async () => {
  const token = await loginAsAdmin();

  const query = `
    query {
      generateReport(numDays: 30)
    }
  `;

  const response = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query })
    .expect(200);

  expect(response.body.errors).toBeUndefined();
  expect(response.body.data.generateReport).toBeDefined();
  expect(typeof response.body.data.generateReport).toBe('string');
});

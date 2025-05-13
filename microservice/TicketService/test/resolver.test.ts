import { test, beforeAll, afterAll, expect } from 'vitest'
// @ts-ignore

import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { SignJWT } from 'jose'
import { vehicle } from 'api/campusPolice/test/mockService'

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

test('Admin can create a ticket with images', async () => {
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

test('Admin can get all tickets', async () => {
  const token = await loginAsAdmin()

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

  expect(response.body.errors).toBeUndefined()
  expect(response.body.data.getTickets.length).toBe(4)
})

test('Admin can modify a ticket with images', async () => {
  const token = await loginAsAdmin()

  const vehicleid = await encrypt('00000000-0000-0000-0000-000000000001')
  const enforcerid = await encrypt('00000000-0000-0000-0000-000000000002')

  const createQuery = `
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

  const createVariables = {
    input: {
      vehicle: vehicleid,
      enforcer: enforcerid,
      fine: 150,
      violation: "speeding",
      images: "photo1.jpg",
    },
  }

  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: createQuery, variables: createVariables })
    .expect(200)

  expect(createResponse.body.errors).toBeUndefined()
  const ticketId = createResponse.body.data.createTicket.id

  const modifyQuery = `
    mutation ModifyTicket($input: ModifyTicketInput!) {
      modifyTicket(input: $input) {
        id
        vehicle
        enforcer
        fine
        violation
        ticketStatus
        images
      }
    }
  `

  const modifyVariables = {
    input: {
      id: ticketId,
      fine: 200,
      violation: "illegal parking",
      ticketStatus: "resolved",
      images: "photo2.jpg",
    },
  }  

  const modifyResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: modifyQuery, variables: modifyVariables })
    .expect(200)

  // console.log(modifyResponse.body.data.modifyTicket)
  expect(modifyResponse.body.errors).toBeUndefined()
  expect(modifyResponse.body.data.modifyTicket.id).toBe(ticketId)
  expect(modifyResponse.body.data.modifyTicket.fine).toBe(200)
  expect(modifyResponse.body.data.modifyTicket.violation).toBe("illegal parking")
  expect(modifyResponse.body.data.modifyTicket.images).toBe("photo2.jpg")
})

test('Admin can delete a ticket', async () => {
  const token = await loginAsAdmin()

  const vehicleid = await encrypt('00000000-0000-0000-0000-000000000000')
  const enforcerid = await encrypt('00000000-0000-0000-0000-000000000000')

  const createQuery = `
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

  const createVariables = {
    input: {
      vehicle: vehicleid,
      enforcer: enforcerid,
      fine: 150,
      violation: "speeding",
      images: "photo1.jpg",
    },
  }

  const createResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: createQuery, variables: createVariables })
    .expect(200)

  expect(createResponse.body.errors).toBeUndefined()
  const ticketId = createResponse.body.data.createTicket.id

  const deleteQuery = `
    mutation DeleteTicket($id: TicketInput!) {
      deleteTicket(id: $id) {
        id
      }
    }
  `

  const deleteVariables = {
    id: {
      id: ticketId,
    },
  }
  
  const deleteResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: deleteQuery, variables: deleteVariables })
    .expect(200)

  expect(deleteResponse.body.errors).toBeUndefined()
  expect(deleteResponse.body.data.deleteTicket.id).toBe(ticketId)

  const getQuery = `
    query {
      getTickets {
        id
      }
    }
  `

  const getResponse = await supertest(server)
    .post('/graphql')
    .set('Authorization', 'Bearer ' + token)
    .send({ query: getQuery })
    .expect(200)

  expect(getResponse.body.errors).toBeUndefined()
  const ticketIds = getResponse.body.data.getTickets.map((ticket: any) => ticket.id)
  expect(ticketIds).not.toContain(ticketId)
})
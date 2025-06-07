import { test, beforeAll, afterAll, expect, beforeEach, vi } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'
import {setupServer} from 'msw/node'

import { auth, ticket } from './mockService'
import app from '../src/app'

let server: http.Server
const mockServer = setupServer()

beforeEach(() => {
  vi.resetModules()
  auth(mockServer)
  ticket(mockServer)
  
})

beforeAll(async () => {
  // Start your GraphQL server
  mockServer.listen({onUnhandledRequest: 'bypass'})
  server = http.createServer(app)
  server.listen()

  return
})

afterAll(() => {
  mockServer.close()
  server.close()
})


test('Registrar can check if employee has outstanding tickets', async () => {
  const response = await supertest(server)
    .get(`/api/v0/registrar/check?email=fake-employee@ucsc.edu`)
    .set('Authorization', 'Bearer fake-token')
    .expect(200)
  expect(response.body).toBe(true)
})

test('Registrar cannot check if employee has outstanding tickets W/O Authorization', async () => {
  await supertest(server)
    .get(`/api/v0/registrar/check?email=fake-employee@ucsc.edu`)
    .expect(401)
})

test('Registrar cannot look up employee outstanding ticket if /auth/check fails', async () => {
  auth(mockServer, true) //fail auth/check endpoint
  await supertest(server)
    .get(`/api/v0/registrar/check?email=fake-employee@ucsc.edu`)
    .set('Authorization', 'Bearer fake-token')
    .expect(401)
})

test('GET /docs page swagger UI returns 404', async () => {
  await supertest(server)
    .get(`/api/v0/docs/`)
    .expect(404)
})

test('GET /docs page swagger UI', async () => {
  process.env.API_DOCS = 'true' //enable docs for test
  await supertest(server)
    .get(`/api/v0/docs/`)
    .expect(200)
})
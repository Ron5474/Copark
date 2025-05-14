import { test, beforeAll, afterAll, expect, beforeEach, vi } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'
import {setupServer} from 'msw/node'

import { auth, vehicle } from './mockService'
import app from '../src/app'

let server: http.Server
const mockServer = setupServer()

beforeEach(() => {
  vi.resetModules()
  auth(mockServer)
  vehicle(mockServer)
  
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

const findByPlateInput = {
  plate: "TEST123"
}

test('Police can look-up cars using plate number', async () => {
  const response = await supertest(server)
    .get(`/api/v0/police/check?plate=${findByPlateInput.plate}`)
    .set('Authorization', 'Bearer fake-token')
    .expect(200)
  expect(response.body).toBe(true)
})

test('Police cannot look up plates W/O Authorization', async () => {
  await supertest(server)
    .get(`/api/v0/police/check?plate=${findByPlateInput.plate}`)
    .expect(401)
})

test('Police cannot look up plates if /auth/check fails', async () => {
  auth(mockServer, true) //fail auth/check endpoint
  await supertest(server)
    .get(`/api/v0/police/check?plate=${findByPlateInput.plate}`)
    .set('Authorization', 'Bearer fake-token')
    .expect(401)
})


test('GET /docs page swagger UI', async () => {
  await supertest(server)
    .get(`/api/v0/docs/`)
    .expect(200)
})
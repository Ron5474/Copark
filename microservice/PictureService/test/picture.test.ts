import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { plateBase64 } from './licenseplate'

let server: http.Server
let pictureServer: http.Server
let authServer: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`

beforeAll(async () => {
  server = http.createServer(app)
  server.listen()
  await bootstrap()

  authServer = http.createServer(authApp)
  await new Promise<void>((resolve) => authServer.listen(AUTH_PORT, resolve))

  pictureServer = http.createServer(app)
  await bootstrap()
  await new Promise<void>((resolve) => pictureServer.listen(4004, resolve))
  return db.reset()
})

beforeEach( async () => {
  return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  authServer.close()
  pictureServer.close()
})

async function loginAsEnforcer(): Promise<string> {
  const res = await supertest(AUTH_SERVICE_URL)
    .post('/api/v0/auth/login')
    .send({
      email: 'enforcer1@outlook.com',
      password: 'password1',
    })

  if (res.status !== 200) throw new Error('Login failed')
  return res.body.id
}

test('Enforcer can extract plate from image', async () => {
  const token = await loginAsEnforcer()

  const response = await supertest(pictureServer)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: `
        mutation Recognize($input: RecognizePlateInput!) {
          recognizePlate(input: $input) {
            plate
            confidence
          }
        }
      `,
      variables: {
        input: { image: plateBase64}
      }
    })

  expect(response.status).toBe(200)
  // console.log(response.body)
  // expect(response.body.data.recognizePlate.plate).toBeTypeOf('string')
  // expect(response.body.data.recognizePlate.confidence).toBeGreaterThanOrEqual(0)
}, 6000)


test('Throws Error When Authorization not set', async () => {

  const response = await supertest(pictureServer)
    .post('/graphql')
    .send({
      query: `
        mutation Recognize($input: RecognizePlateInput!) {
          recognizePlate(input: $input) {
            plate
            confidence
          }
        }
      `,
      variables: {
        input: { image: plateBase64}
      }
    })

  expect(response.status).toBe(200)
  expect(response.body.errors).toBeDefined()
  // console.log(response.body)
  // expect(response.body.data.recognizePlate.plate).toBeTypeOf('string')
  // expect(response.body.data.recognizePlate.confidence).toBeGreaterThanOrEqual(0)
}, 6000)


test('Throws Error When Authorization is random', async () => {

  const response = await supertest(pictureServer)
    .post('/graphql')
    .set('Authorization', `Bearer randomToken`)
    .send({
      query: `
        mutation Recognize($input: RecognizePlateInput!) {
          recognizePlate(input: $input) {
            plate
            confidence
          }
        }
      `,
      variables: {
        input: { image: plateBase64}
      }
    })

  expect(response.status).toBe(200)
  expect(response.body.errors).toBeDefined()
  // console.log(response.body)
  // expect(response.body.data.recognizePlate.plate).toBeTypeOf('string')
  // expect(response.body.data.recognizePlate.confidence).toBeGreaterThanOrEqual(0)
}, 6000)

test('Can query ping and get pong response', async () => {
  const token = await loginAsEnforcer()
  const response = await supertest(pictureServer)
    .post('/graphql')
    .set('Authorization', `Bearer ${token}`)
    .send({
      query: `
        query {
          ping
        }
      `,
    })

  expect(response.status).toBe(200)
  expect(response.body.data.ping).toBe('pong')
})
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

const driverUser = {
  email: 'driver1@outlook.com',
  password: 'password1',
}

async function loginAs(credentials: { email: string; password: string }): Promise<string | undefined> {
    const response = await supertest(AUTH_SERVICE_URL)
        .post('/api/v0/auth/login')
        .send(credentials)

    if (response.status !== 200) {
        throw new Error(`Login failed with status ${response.status}`)
    }

    return response.body?.id
}

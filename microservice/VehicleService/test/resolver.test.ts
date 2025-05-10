import { test, beforeAll, afterAll, expect } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'
import { beforeEach } from 'node:test'

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

  return
})

beforeEach(() => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
  authServer.close()
})
const nextAuthJWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3NDY3Njg5MjMsImV4cCI6MTg0MTQ2MzQ0MiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiMTA5MTY0MjQwOTk2MDEyNTE1NiIsImVtYWlsIjoiZGVyaWtAY29wYXJrLnNwYWNlIiwicGljdHVyZSI6IlwiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2JTT2M0MFc3ZEpJd1VkanNZQzNVSmdwUzdRSjBSR2Yyb3ZKSXF6S3ZzbW1NUFBnPXM5Ni1jIiwibmFtZSI6IkRlcmlrIERyaXZlciJ9.D23uY9TRN-3UKSK8NxdgSP208iaCc8TuzWIYgYMfhwE"

// const driver = {
//     "name": "Derik Driver",
//     "email": "derik@copark.space",
//     "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
//     "sub": "1234567890",
//   }

async function loginAsDriver(): Promise<string | undefined> {
    const response = await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/driver/login')
      .set('Authorization', `Bearer ${nextAuthJWT}`)
  
    // console.log('Status:', response.status)
    // console.log('Headers:', response.headers)
    // console.log('Body:', response.body)
  
    if (response.status !== 200) {
      throw new Error(`Login failed with status ${response.status}`)
    }
  
    return response.body
  }

test('Driver can get a list of their vehicles', async () => {
    const token = await loginAsDriver()
  
    const query = `
      query {
        myVehicles {
          id
          plate
          country
          state
        }
      }
    `
    const response = await supertest(server)
      .post('/graphql')
      .set('Authorization', 'Bearer ' + token)
      .send({ query })
      .expect(200)

    expect(response.body.data.myVehicles.length).toBe(0)
  })
// import { test, beforeAll, afterAll, expect } from 'vitest'
// import supertest from 'supertest'
// import * as http from 'http'

// import { app, bootstrap } from '../src/app'
// import authApp from '../../AuthService/src/app'

// let pictureServer: http.Server
// let authServer: http.Server

// const PICTURE_PORT = 4005
// const AUTH_PORT = 3010
// const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`

// beforeAll(async () => {
//   // Start PictureService
//   pictureServer = http.createServer(app)
//   await bootstrap()
//   await new Promise<void>((resolve) => {
//     pictureServer.listen(PICTURE_PORT, () => resolve())
//   })

//   // Start AuthService mock/server
//   authServer = http.createServer(authApp)
//   await new Promise<void>((resolve) => {
//     authServer.listen(AUTH_PORT, () => resolve())
//   })
// })

// afterAll(() => {
//   pictureServer.close()
//   authServer.close()
// })

// // Helper: login as enforcement user
// async function loginAsEnforcer(): Promise<string> {
//   const response = await supertest(AUTH_SERVICE_URL)
//     .post('/api/v0/auth/login')
//     .send({
//       email: 'enforcer1@outlook.com',
//       password: 'password1',
//     })

//   if (response.status !== 200) {
//     throw new Error('Failed to login as enforcement')
//   }

//   return response.body.id // This is your JWT
// }

// // Test: Recognize plate from base64 image
// test('Enforcer can recognize plate from image', async () => {
//   const token = await loginAsEnforcer()

//   const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAyCAYAAADhC9ZwAAAACXBIWXMAAAsSAAALEgHS3X78AAACNklEQVR4nO2YMW7DMAxF7aB9/2cgN9yCIjYAivItaD4qVw6mgaSITxT4xzR2xUbdFe1WEIfvG8f+HD1CBoBAEBAEAQBbMuwsPG0K6JzQ/jD/AGzJ5dkwJrYmFxMr0bc8rhNwJXoBtkQQAAnR+YO1cO3oEqI3KCN/CtX1ZAWAv2Km+eYLoF9whG04wv6NeB7mDWAk+AKwl3xvFoNvzUzfxXm57TD6UP8ReBsHKhdoNdGz3ugEQuQoRBM9XYGTevFg9EuEvLgN9OlMCL1zX2yy+2l8NPL1YNAZCJbK+eqJYXgjlIFp1F3SGjNkjmtj7guVMeUkfdtmgOV7lby3vfj2H9N+WwfwW6g+iCqL/F6Bf5rbfp4DZehkYKiJ9DrBteqEF6C0HTjCF0Kh3gXrMu3DCEKfHIE0OxyMQfo4gQxxvFtiBFPBaCD5e9GSQHrjwYcF8XyzuwYYw23YWH1S31ZaWToWYVrflDdfuHnXTXfu9DFU4ZVu69gXu7wJLaU6MbjBQAAAAAAAAAAwCVkB2x6Q+Hy0+EAAAAASUVORK5CYII="


//   const mutation = `
//     mutation Recognize($input: RecognizePlateInput!) {
//       recognizePlate(input: $input) {
//         plate
//         confidence
//       }
//     }
//   `

//   const response = await supertest(pictureServer)
//     .post('/graphql')
//     .set('Authorization', `Bearer ${token}`)
//     .send({
//       query: mutation,
//       variables: {
//         input: {
//           image: base64Image
//         }
//       }
//     })

//   expect(response.status).toBe(200)
//   expect(response.body.data.recognizePlate).toBeDefined()
//   expect(response.body.data.recognizePlate.plate).toBeTypeOf('string')
//   expect(response.body.data.recognizePlate.confidence).toBeGreaterThanOrEqual(0)
// })
import { test, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import { app, bootstrap } from '../src/app'
import authApp from '../../AuthService/src/app'

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

  const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="


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
        input: { image: base64Image }
      }
    })

  expect(response.status).toBe(200)
  expect(response.body.data.recognizePlate.plate).toBeTypeOf('string')
  expect(response.body.data.recognizePlate.confidence).toBeGreaterThanOrEqual(0)
})

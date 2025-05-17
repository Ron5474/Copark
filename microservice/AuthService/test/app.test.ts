import {test, beforeAll, afterAll, beforeEach, vi} from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import * as authService from '../src/auth/service'
import  db from './db'
import app from '../src/app'

const validJWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkcml2ZXItaWQtMTIzIiwiZW1haWwiOiJkcml2ZXJAYm9va3MuY29tIiwicGljdHVyZSI6Imh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vaW1nIiwibmFtZSI6IkZha2UgRHJpdmVyIiwiaWF0IjoxNzQ2ODM2ODUzLCJleHAiOjE5MDQ2MjQ4NTN9.YipxWgvsQIRpjSoIbnNla741EI1klV5Fkf2A5mlhpMY"

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>

beforeAll(async () => {
    server = http.createServer(app)
    return server.listen()
  })

beforeEach(async () => {
  return db.reset()
})

afterAll(() => {
    db.shutdown()
    server.close()
  })

test('Get docs page', async () => {
    await supertest(server)
      .get('/api/v0/docs/')
      .expect(200)
})

test('Check throws error w/o authorization', async () => {
  await supertest(server)
    .post('/api/v0/auth/check')
    .send(["admin"])
    .expect(401)
})

test('Send Invalid Body Throws error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'log').mockImplementation(() => {})
    await supertest(server)
      .post('/api/v0/auth/check')
      .set('Authorization', `Bearer ${validJWT}`)
      .send("this-is-fake-data")
      .expect(401)
})

test('Throw Internal Server Error', async () => {
    vi.spyOn(authService.AuthService.prototype, 'check').mockImplementation(() => {
        throw new Error()
    })
  
    await supertest(server)
      .post('/api/v0/auth/check')
      .set('Authorization', `Bearer ${validJWT}`)
      .send(["driver"])
      .expect(500)
})
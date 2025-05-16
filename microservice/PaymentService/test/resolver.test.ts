/*
#######################################################################
#
# Copyright (C) 2025 Copark Inc. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import { test, beforeAll, afterAll, expect } from 'vitest'
import supertest from 'supertest'
import * as http from 'http'

import db from './db'
import app from '../src/app'



let server: http.Server

const nextAuthJWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3NDY3Njg5MjMsImV4cCI6MTg0MTQ2MzQ0MiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiMTA5MTY0MjQwOTk2MDEyNTE1NiIsImVtYWlsIjoiZGVyaWtAY29wYXJrLnNwYWNlIiwicGljdHVyZSI6IlwiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2JTT2M0MFc3ZEpJd1VkanNZQzNVSmdwUzdRSjBSR2Yyb3ZKSXF6S3ZzbW1NUFBnPXM5Ni1jIiwibmFtZSI6IkRlcmlrIERyaXZlciJ9.D23uY9TRN-3UKSK8NxdgSP208iaCc8TuzWIYgYMfhwE"
const validJWT = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkcml2ZXItaWQtMTIzIiwiZW1haWwiOiJkcml2ZXJAYm9va3MuY29tIiwicGljdHVyZSI6Imh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vaW1nIiwibmFtZSI6IkZha2UgRHJpdmVyIiwiaWF0IjoxNzQ2ODM2ODUzLCJleHAiOjE5MDQ2MjQ4NTN9.YipxWgvsQIRpjSoIbnNla741EI1klV5Fkf2A5mlhpMY"

const AUTH_PORT = 3010
// const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`

beforeAll(async () => {

  // Start your Auth server
  server = http.createServer(app)
  await new Promise<void>((resolve) => {
    server.listen(AUTH_PORT, () => {
      resolve()
    })
  })

  return db.reset()
})

afterAll(() => {
  db.shutdown()
  server.close()
})

const admin = {
  "email": "jxiong0822@outlook.com",
  "password": "password1"
}

test('Admin can login successfully', async () => {  
  await supertest(server)
    .post('/api/v0/auth/login')
    .send({ email: admin.email, password: admin.password })
    .expect(200)
})

test('Invalid Admin Credentials throws Error', async () => {  
  await supertest(server)
    .post('/api/v0/auth/login')
    .send({ email: admin.email, password: "some-fake-pass" })
    .expect(404)
})

test('Driver can login successfully', async () => {  
  await supertest(server)
    .post('/api/v0/auth/driver/login')
    .set('Authorization', `Bearer ${nextAuthJWT}`)
    .expect(200)
})

test('getDriverId works successfully', async () => {  
  await supertest(server)
    .get('/api/v0/auth/driver/id')
    .set('Authorization', `Bearer ${nextAuthJWT}`)
    .expect(200)
})

test('check admin works successfully', async () => {
  await supertest(server)
    .post('/api/v0/auth/check')
    .set('Authorization', `Bearer ${validJWT}`)
    .send(["admin"])
    .expect(200)
})

test('Can get userID by Email', async () => {  
  const response = await supertest(server)
    .get('/api/v0/auth/id')
    .query({ email: 'jxiong32@outlook.com' })
    .expect(200)

  expect(response.body).toBeDefined()
  expect(typeof response.body).toBe('object')
})


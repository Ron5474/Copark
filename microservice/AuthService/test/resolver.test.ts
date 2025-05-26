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
import { SignJWT } from 'jose'

import db from './db'
import app from '../src/app'

const encodedKey = new TextEncoder().encode(process.env.JWT_SECRET)
let server: http.Server

const AUTH_PORT = 3010
const AUTH_SERVICE_URL = `http://localhost:${AUTH_PORT}`

const driver = {
  "name": "Derik Driver",
  "email": "derik@copark.space",
  "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
  "sub": "1234567890",
}

async function signupAsDriver(driver): Promise<string | undefined> {
    const token = await  new SignJWT(driver)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
    // console.log("Driver token:", token)

    // Sign up
    await supertest(AUTH_SERVICE_URL)
      .post('/api/v0/auth/driver/signup')
      .send({ authToken: token })
    
    const response = await supertest(AUTH_SERVICE_URL)
      .put('/api/v0/auth/driver/onboarding')
      .set('Authorization', `Bearer ${token}`)
      .send({newState: 'complete'})

    // console.log('Status:', response.status)
    // console.log('Headers:', response.headers)
    // console.log('Body:', response.body)

    const validStatuses = [200, 201, 204];
    if (!validStatuses.includes(response.status)) {
      throw new Error(`Login failed with status ${response.status}`)
    }

    return token
}

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

test('Driver can Signup successfully', async () => {
  const token = await  new SignJWT(driver)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
  
  await supertest(server)
    .post('/api/v0/auth/driver/signup')
    .send({ authToken: token })
    .expect(201)
})

test('Driver can Onboard successfully', async () => {
  const token = await  new SignJWT(driver)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30m')
      .sign(encodedKey)
  
  await supertest(server)
    .post('/api/v0/auth/driver/signup')
    .send({ authToken: token })
  
  await supertest(AUTH_SERVICE_URL)
    .put('/api/v0/auth/driver/onboarding')
    .set('Authorization', `Bearer ${token}`)
    .send({newState: 'complete'})
    .expect(204)
})

test('Driver can login successfully', async () => {
  const token = await signupAsDriver(driver)
  await supertest(server)
    .get('/api/v0/auth/driver/login')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
})

test('Admin can get driver details', async () => {  
  const res = await supertest(server)
    .post('/api/v0/auth/login')
    .send({ email: admin.email, password: admin.password })
  
  await supertest(server)
    .post('/api/v0/auth/driver/email')
    .send({id: '39f48f9f-2693-446b-ad98-8e0db1ef14bd'})
    .set('Authorization', `Bearer ${res.body.id}`)
    .expect(200)
})

test('getDriverId works successfully', async () => {
  const token = await signupAsDriver(driver)
  await supertest(server)
    .get('/api/v0/auth/driver/id')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
})

test('check admin works successfully', async () => {
  const res = await supertest(server)
    .post('/api/v0/auth/login')
    .send({ email: admin.email, password: admin.password })

  await supertest(server)
    .post('/api/v0/auth/check')
    .set('Authorization', `Bearer ${res.body.id}`)
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


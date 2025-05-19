import { test, expect, beforeAll, afterAll } from 'vitest'
import * as http from 'http'
import supertest from 'supertest'
import { app } from '../src/app'

let server: http.Server

beforeAll(async () => {
  server = http.createServer(app)
  await new Promise<void>((resolve) => server.listen(3015, resolve))
})

afterAll(() => {
  server.close()
})

test('EmailService sends email successfully', async () => {
  const response = await supertest(server)
    .post('/email/send')
    .send({
      to: 'ysmohame@ucsc.edu',
      subject: 'Test Email from EmailService',
      text: 'Plain text fallback',
      html: '<strong>This is a test email</strong>',
    })

  expect(response.status).toBe(200)
  expect(response.body.message).toBe('Email sent.')
})

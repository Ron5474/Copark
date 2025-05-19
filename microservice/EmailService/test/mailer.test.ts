import { test, expect, beforeAll, afterAll, vi } from 'vitest'
import * as http from 'http'
import supertest from 'supertest'
import { app } from '../src/app'
import * as mailer from '../src/email/mailer'

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

test('EmailService handles sendEmail failure (catch block)', async () => {
  vi.spyOn(mailer, 'sendEmail').mockRejectedValueOnce(new Error('Simulated failure'))

  const response = await supertest(server)
    .post('/email/send')
    .send({
      to: 'ysmohame@ucsc.edu',
      subject: 'This should fail',
      text: 'Fail test',
      html: '<strong>This should fail</strong>',
    })

  expect(response.status).toBe(500)
  expect(response.body).toEqual({ error: 'Failed to send email.' })
})
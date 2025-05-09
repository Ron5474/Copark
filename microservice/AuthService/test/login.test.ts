/*
#######################################################################
#
# Copyright (C) 2025 Ronak A. Patel. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import {test, afterAll, expect, vi, beforeEach} from 'vitest'

import db from './db'
import {AuthService} from '../src/auth/service'

vi.mock('server-only', () => ({}))

const driver = {
  "name": "Derik Driver",
  "email": "derik@copark.space",
  "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
  "sub": "1234567890",
}
const fake_driver = {
  "name": "Derik Driver",
  "email": "derik@copark.space",
  "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
  "sub": "1234567890",
  "id": "fake-id"
}

beforeEach( async () => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
})

test('OAuth User can login successfully', async () => {
  const user = await new AuthService().driverLogin(driver)
  expect(user).toBeDefined()
})

test('OAuth User login twice returns undefined', async () => {
  await new AuthService().driverLogin(driver)
  const user = await new AuthService().driverLogin(driver)
  expect(user).not.toBeDefined()
})

test('OAuth Undefined user throws error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new AuthService().driverLogin(undefined)).rejects.toThrow('Unauthorized')
})

test('OAuth user with id throws error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new AuthService().driverLogin(fake_driver)).rejects.toThrow('Unauthorized')
})

test('getOauthUser() returns JWT for the current user', async () => {
  await new AuthService().driverLogin(driver)
  const user = await new AuthService().getOauthUser(driver)
  expect(user).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/) // JWT Regex Comparison
})

test('getOauthUser() Undefined user throws error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new AuthService().getOauthUser(undefined)).rejects.toThrow('Unauthorized')
})

test('getOauthUser() user with id throws error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new AuthService().getOauthUser(fake_driver)).rejects.toThrow('Unauthorized')
})

test('getOauthUser() fake user returns undefined', async () => {
  const user = await new AuthService().getOauthUser(driver)
  expect(user).not.toBeDefined()
})

// test('Incorrect User Login', async () => {
//   const user = await authenticate({email: 'anna@books.com', password: 'fakepass'})
//   expect(user).not.toBeDefined()
// })
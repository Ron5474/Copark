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

import {test, afterAll, expect, vi, beforeEach} from 'vitest'

import db from './db'
import {AuthService} from '../src/auth/service'
import { OauthLoginData, SessionUser } from '../src'
import { pool } from '../src/auth/db';

vi.mock('server-only', () => ({}))

const driver = {
  "name": "Derik Driver",
  "email": "derik@copark.space",
  "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
  "sub": "1234567890",
}
const fake_driver = {
  "name": "Fake Driver",
  "email": "fake@copark.space",
  "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
  "sub": "1234567890",
  "id": "fake-id"
}

const admin = {
  "email": "jxiong0822@outlook.com",
  "password": "password1"
}

const validJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjYwMjk2N2Y1LTNlM2YtNGNjMS04M2U4LTIwZWUyYWNmYzUxOSIsImlhdCI6MTc0NjgyNTMyNywiZXhwIjoxOTA0NjEzMzI3fQ.4RRWucLmBID-1zSKaHhXVlueWsSffvrucuUpUGb6wqo"
// const nextAuthJWT = "eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiQnJ5YW50IE9saXZlciIsImVtYWlsIjoiYmNvbGl2ZXJAdWNzYy5lZHUiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2JTT2M0MFc3ZEpJd1VkanNZQzNVSmdwUzdRSjBSR2Yyb3ZKSXF6S3ZzbW1NUFBnPXM5Ni1jIiwic3ViIjoiMTA5MTY0MjQwOTk2MDE1NjkwNTQwIiwiaWF0IjoxNzQ2NTczODA5LCJleHAiOjE3NDkxNjU4MDl9.SXrO5Rr0JNcEYXWjR5BLM44fSZzR6Uv0yKy2YxRw1bw"
const nextAuthJWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3NDY3Njg5MjMsImV4cCI6MTg0MTQ2MzQ0MiwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiMTA5MTY0MjQwOTk2MDEyNTE1NiIsImVtYWlsIjoiZGVyaWtAY29wYXJrLnNwYWNlIiwicGljdHVyZSI6IlwiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jS2JTT2M0MFc3ZEpJd1VkanNZQzNVSmdwUzdRSjBSR2Yyb3ZKSXF6S3ZzbW1NUFBnPXM5Ni1jIiwibmFtZSI6IkRlcmlrIERyaXZlciJ9.D23uY9TRN-3UKSK8NxdgSP208iaCc8TuzWIYgYMfhwE"
const invalidNextAuthJWT = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3NDY3NzAxNjAsImV4cCI6MTc3ODMwNjE2MCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsImVtYWlsIjoianJvY2tldEBleGFtcGxlLmNvbSJ9.THjfN4vdCqJ5HremhRJ7NajSSPxLCImilD2q3zwym0s"
const numJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6NSwiaWF0IjoxNzQ2ODM4NzA2LCJleHAiOjE5MDQ2MjY3MDZ9.XYbiNsZsIVBgANgCzeKsu5R6Zw4_sRm0H1GDrsVNvyE"

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

beforeEach( async () => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
})

test('OAuth User can login successfully', async () => {
  const user = await new AuthService().driverSignup(driver)
  expect(user).toBeDefined()
})

test('OAuth User login twice returns undefined', async () => {
  await new AuthService().driverSignup(driver)
  const user = await new AuthService().driverSignup(driver)
  expect(user).not.toBeDefined()
})

test('OAuth Undefined user throws error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new AuthService().driverSignup(undefined)).rejects.toThrow('Unauthorized')
})

test('OAuth user with id throws error', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new AuthService().driverSignup(fake_driver)).rejects.toThrow('Unauthorized')
})

test('getOauthUser() returns JWT for the current user', async () => {
  await new AuthService().driverSignup(driver)
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

test('Admin can login successfully', async () => {
  const user = await new AuthService().authenticate(admin)
  expect(user.name).toBe('Jason Xiong')
})

test('Incorrect admin fails login', async () => {
  const incorrect = {'email': 'ronak@books.com', 'password': 'secure-password'}
  const user = await new AuthService().authenticate(incorrect)
  expect(user).not.toBeDefined()
})

test('AuthService Check() works fine with correct admin JWT', async () => {
  const user = await new AuthService().authenticate(admin)
  const new_user = await new AuthService().check(`Bearer ${user.id}`, ["admin"])
  expect((new_user as SessionUser).id).toMatch(uuidRegex)
})

// test('generate JWT', async () => {
//   const jwt = await new AuthService().encrypt('602967f5-3e3f-4cc1-83e8-20ee2acfc519')
//   // const jwt = await new AuthService().encryptNum(5)
//   console.log('JWT:', jwt)
//   expect(jwt).toBeDefined()
// })

test('AuthService Check() works fine with correct OAuth JWT', async () => {
  const new_user = await new AuthService().check(`Bearer ${nextAuthJWT}`, ["driver"])
  expect((new_user as OauthLoginData).name).toBe('Derik Driver')
})

test('AuthService Check() throws error for invalid driver', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new AuthService().check(`Bearer ${validJWT}`, ["driver"])).rejects.toThrow('Unauthorized3')
})

test('AuthService Check() throws error for undefined header', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new AuthService().check(undefined, ["driver"])).rejects.toThrow('Unauthorized')
})


test('AuthService Check() throws error for admin using driver role', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const user = await new AuthService().authenticate(admin)
  await expect(new AuthService().check(`Bearer ${user.id}`, ["driver"])).rejects.toThrow('Unauthorized3')
})

test('AuthService Check() throws error for driver with invalid JWT', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new AuthService().check(`Bearer ${invalidNextAuthJWT}`, ["driver"])).rejects.toThrow('Unauthorized3')
})

test('AuthService Check() throws error for driver with JWT containing Integer', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  await expect(new AuthService().check(`Bearer ${numJWT}`, ["admin"])).rejects.toThrow('Unauthorized3')
})

test('getIDByEmail returns encrypted ID for valid email', async () => {
  const authService = new AuthService();

  // Mock database response
  vi.spyOn(pool, 'query').mockResolvedValueOnce({
    rows: [{ id: '1234' }],
    rowCount: 1,
  } as any);

  const email = 'test@example.com';
  const result = await authService.getIDByEmail(email);

  expect(result).toBeDefined();
  expect(result).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
});


test('getIDByEmail returns undefined for invalid email', async () => {
  const authService = new AuthService();

  // Mock database response
  vi.spyOn(pool, 'query').mockResolvedValueOnce({
    rows: [],
    rowCount: 0,
  } as any);

  const email = 'invalid@example.com';
  const result = await authService.getIDByEmail(email);

  expect(result).toBeUndefined();
});

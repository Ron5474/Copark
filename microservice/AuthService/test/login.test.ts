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

import {test, beforeAll, afterAll, expect, vi} from 'vitest'

import db from './db'
import {AuthService} from '../src/auth/service'

vi.mock('server-only', () => ({}))

// vi.mock('../../src/auth/auth', () => ({
//   encrypt: vi.fn(() => Promise.resolve('valid-jwt'))
// }))

beforeAll( async () => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
})

test('Correct User Login', async () => {
  const user = await new AuthService().driverLogin({
    "name": "Derik Driver",
    "email": "derik@copark.space",
    "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
    "sub": "1234567890",
  })
  expect(user).toBeDefined()
})


// test('Incorrect User Login', async () => {
//   const user = await authenticate({email: 'anna@books.com', password: 'fakepass'})
//   expect(user).not.toBeDefined()
// })
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
import {PermitService} from '../src/permit/service'

vi.mock('server-only', () => ({}))

const permitDetails = {
  vehicle: '6124352',
  zone: '0',
  duration: {'minutes': 30, 'hours': 0},
  paymentMethod: 'paypal'
}
// const fake_driver = {
//   "name": "Fake Driver",
//   "email": "fake@copark.space",
//   "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
//   "sub": "1234567890",
//   "id": "fake-id"
// }

// const admin = {
//   "email": "jxiong0822@outlook.com",
//   "password": "password1"
// }
const permService = new PermitService();

beforeEach( async () => {
    return db.reset()
})

afterAll(() => {
  db.shutdown()
})

test('Purchasing permit works', async () => {
  const receipt = await permService.purchaseMyZonePermit(permitDetails)
  // const receipt = await new PermitService().purchaseMyZonePermit(permitDetails)
  expect(receipt).toBeDefined()
})

// test('OAuth User login twice returns undefined', async () => {
//   await new AuthService().driverLogin(driver)
//   const user = await new AuthService().driverLogin(driver)
//   expect(user).not.toBeDefined()
// })

// test('OAuth Undefined user throws error', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   await expect(new AuthService().driverLogin(undefined)).rejects.toThrow('Unauthorized')
// })

// test('OAuth user with id throws error', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   await expect(new AuthService().driverLogin(fake_driver)).rejects.toThrow('Unauthorized')
// })

// test('getOauthUser() returns JWT for the current user', async () => {
//   await new AuthService().driverLogin(driver)
//   const user = await new AuthService().getOauthUser(driver)
//   expect(user).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/) // JWT Regex Comparison
// })

// test('getOauthUser() Undefined user throws error', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   await expect(new AuthService().getOauthUser(undefined)).rejects.toThrow('Unauthorized')
// })

// test('getOauthUser() user with id throws error', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   await expect(new AuthService().getOauthUser(fake_driver)).rejects.toThrow('Unauthorized')
// })

// test('getOauthUser() fake user returns undefined', async () => {
//   const user = await new AuthService().getOauthUser(driver)
//   expect(user).not.toBeDefined()
// })

// test('Admin can login successfully', async () => {
//   const user = await new AuthService().authenticate(admin)
//   expect(user.name).toBe('Jason Xiong')
// })

// test('Incorrect admin fails login', async () => {
//   const incorrect = {'email': 'ronak@books.com', 'password': 'secure-password'}
//   const user = await new AuthService().authenticate(incorrect)
//   expect(user).not.toBeDefined()
// })

// test('AuthService Check() works fine with correct admin JWT', async () => {
//   const user = await new AuthService().authenticate(admin)
//   const new_user = await new AuthService().check(`Bearer ${user.id}`, ["admin"])
//   expect((new_user as SessionUser).id).toMatch(uuidRegex)
// })

// // test('generate JWT', async () => {
// //   // const jwt = await new AuthService().encrypt('602967f5-3e3f-4cc1-83e8-20ee216fc519')
// //   console.log('JWT:', jwt)
// //   expect(jwt).toBeDefined()
// // });

// test('AuthService Check() works fine with correct OAuth JWT', async () => {
//   const new_user = await new AuthService().check(`Bearer ${nextAuthJWT}`, ["driver"])
//   expect((new_user as OauthLoginData).name).toBe('Derik Driver')
// })

// test('AuthService Check() throws error for invalid driver', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   await expect(new AuthService().check(`Bearer ${validJWT}`, ["driver"])).rejects.toThrow('Unauthorized3')
// })

// test('AuthService Check() throws error for undefined header', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   await expect(new AuthService().check(undefined, ["driver"])).rejects.toThrow('Unauthorized')
// })


// test('AuthService Check() throws error for admin using driver role', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   const user = await new AuthService().authenticate(admin)
//   await expect(new AuthService().check(`Bearer ${user.id}`, ["driver"])).rejects.toThrow('Unauthorized3')
// })

// test('AuthService Check() throws error for driver with invalid JWT', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   await expect(new AuthService().check(`Bearer ${invalidNextAuthJWT}`, ["driver"])).rejects.toThrow('Unauthorized3')
// })

// // test('Incorrect User Login', async () => {
// //   const user = await authenticate({email: 'anna@books.com', password: 'fakepass'})
// //   expect(user).not.toBeDefined()
// // })

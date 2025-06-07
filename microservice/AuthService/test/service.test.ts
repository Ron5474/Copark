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

import {test, afterAll, expect, vi, beforeEach, describe, afterEach} from 'vitest'

import db from './db'
import {AuthService} from '../src/auth/service'
import { OauthUser, SessionUser } from '../src'
import { OauthLoginData } from '../src/auth'
import { pool } from '../src/auth/db'

import { AuthController } from '../src/auth/api';

vi.mock('server-only', () => ({}))

const driver: OauthLoginData = {
  "type": "OauthUserData",
  "name": "Derik Driver",
  "email": "derik@copark.space",
  "picture": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWRzMmJldTdzMWtncDBweGtvM21kYnRyeDk1cHpvNnU5MWVycXEybiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/keyufLabLaJKh3xnVy/giphy.gif",
  "sub": "1091642409960125156",
}
const fake_driver: SessionUser = {
  "type": "SessionUser",
  "id": "fake-id"
}

const admin = {
  "email": "jxiong0822@outlook.com",
  "password": "password1"
}

const validJWT = "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjYwMjk2N2Y1LTNlM2YtNGNjMS04M2U4LTIwZWUyYWNmYzUxOSIsImlhdCI6MTc0NjgyNTMyNywiZXhwIjoxOTA0NjEzMzI3fQ.4RRWucLmBID-1zSKaHhXVlueWsSffvrucuUpUGb6wqo"
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
  const driverUUID = await new AuthService().getOauthUser(driver)
  await new AuthService().setOnBoardingState(driverUUID?.id, 'complete')
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

test('returns 400 if decryptOauth returns undefined', async () => {
  // Arrange
  const controller = new AuthController();

  // Mock decryptOauth to return undefined
  vi.spyOn(AuthService.prototype, 'decryptOauth').mockResolvedValueOnce(undefined);

  // Spy on setStatus to verify it was called with 400
  const setStatusSpy = vi.spyOn(controller, 'setStatus' as any); // if setStatus is protected/private

  // Act
  const result = await controller.driverSignup({ authToken: 'invalid.token' });

  // Assert
  expect(result).toBeUndefined();
  expect(setStatusSpy).toHaveBeenCalledWith(400);
});

test('OAuth User unauthorized if pool.query fails', async () => {
  const auth = new AuthService()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(pool, 'query').mockRejectedValueOnce(new Error("Database failure"))

  const data: OauthLoginData = {
      type: "OauthUserData",
      name: "Alice",
      email: "alice@example.com",
      picture: "http://example.com/pic.jpg",
      sub: "google-oauth2|abc123"
    }

    await expect(auth.driverSignup(data)).rejects.toThrow("Unauthorized")
})

test('getOauthUser() returns JWT for the current user', async () => {
  await new AuthService().driverSignup(driver)
  const user = await new AuthService().getOauthUser(driver)
  expect(user?.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/) // JWT Regex Comparison
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

test('getDriverbyID returns Correct User', async () => {
  await new AuthService().driverSignup(driver)
  const user = await new AuthService().getOauthUser(driver)
  const driverDetails = await new AuthService().getDriverByID((user as OauthUser).id)
  expect(driverDetails?.email).toBe("derik@copark.space")
})

test('Admin can login successfully', async () => {
  const user = await new AuthService().authenticate(admin)
  expect(user?.name).toBe('Jason Xiong')
})

test('Incorrect admin fails login', async () => {
  const incorrect = {'email': 'ronak@books.com', 'password': 'secure-password'}
  const user = await new AuthService().authenticate(incorrect)
  expect(user).not.toBeDefined()
})

test('AuthService Check() works fine with correct admin JWT', async () => {
  const user = await new AuthService().authenticate(admin)
  const new_user = await new AuthService().check(`Bearer ${user?.id}`, ["admin"])
  expect((new_user as SessionUser).id).toMatch(uuidRegex)
})

// test('AuthService Check() driver using admin token', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'log').mockImplementation(() => {})
//   const user = await new AuthService().authenticate(admin)
//   await expect(new AuthService().check(`Bearer ${user}`, ["police"])).rejects.toThrow('Unauthorized3')
// })

test('AuthService Check() throws error for invalid driver', async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'error').mockImplementation(() => {})
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  vi.spyOn(console, 'log').mockImplementation(() => {})
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
  await expect(new AuthService().check(`Bearer ${user?.id}`, ["driver"])).rejects.toThrow('Unauthorized3')
})

// test('AuthService Check() throws error for driver using admin role', async () => {
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   vi.spyOn(console, 'error').mockImplementation(() => {})

//   const user = await new AuthService().authenticate(driver)
//   await expect(new AuthService().check(`Bearer ${user?.id}`, ["admin"])).rejects.toThrow('Unauthorized3')
// })

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
  vi.spyOn(pool, 'query').mockResolvedValue({
    rows: [{ id: '1234' }],
    rowCount: 1,
  } as any)

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

  expect(result).toBeNull();
});

test('setOnBoardingState throws error if userId is undefined', async () => {
  const authService = new AuthService();
  await expect(authService.setOnBoardingState(undefined, 'completed')).rejects.toThrow('Unauthorized');
});

test('decryptOauth returns undefined and logs error for invalid token', async () => {
  const authService = new AuthService();
  // Patch jwtVerify to throw an error
  const jose = require('jose');
  const jwtVerifySpy = vi.spyOn(jose, 'jwtVerify').mockRejectedValueOnce(new Error('Invalid token'));

  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  const result = await authService.decryptOauth('bad.token.value');
  expect(result).toBeUndefined();
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Error in decryptOauth:'), expect.any(Error));

  logSpy.mockRestore();
  jwtVerifySpy.mockRestore();
});

test('decryptOauth returns undefined and logs error for invalid token payload', async () => {
  const authService = new AuthService();
  const jose = require('jose');
  const jwtVerifySpy = vi.spyOn(jose, 'jwtVerify').mockResolvedValueOnce({
    payload: { name: 'Test', email: 'test@example.com' }
  });

  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  const result = await authService.decryptOauth('fake.token.without.required.fields');
  console.log(result);
  expect(result).toBeUndefined();
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Error in decryptOauth:'), expect.any(Error));

  logSpy.mockRestore();
  jwtVerifySpy.mockRestore();
});

test('activeDriver throws error if userId is undefined', async () => {
  const authService = new AuthService();
  await expect(authService.activeDriver(undefined)).rejects.toThrow('Unauthorized');
});

test('activeDriver returns undefined if no user found', async () => {
  const authService = new AuthService();
  vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [] } as any);

  const result = await authService.activeDriver('some-user-id');
  expect(result).toBeUndefined();
});

test('driverSignup returns "first-vehicle" if onboardingStatus is first-vehicle', async () => {
  const authService = new AuthService();
  const data: OauthLoginData = {
    type: "OauthUserData",
    name: "Test User",
    email: "testuser@example.com",
    picture: "http://example.com/pic.jpg",
    sub: "oauth2|testsub"
  };

  vi.spyOn(pool, 'query')
    .mockResolvedValueOnce({ rows: [] } as any)
    .mockResolvedValueOnce({ rows: [{ status: 'first-vehicle' }] } as any);

  const result = await authService.driverSignup(data);
  expect(result).toBe('first-vehicle');
});

describe('AuthService.check edge cases', () => {
  let AuthServiceLocal: typeof AuthService;
  let jwtVerifyMock: any;

  beforeEach(async () => {
    vi.resetModules();
    jwtVerifyMock = vi.fn();
    vi.doMock('jose', () => ({ jwtVerify: jwtVerifyMock }));
    // Dynamically import after mocking
    AuthServiceLocal = (await import('../src/auth/service')).AuthService;
  });

  afterEach(() => {
    vi.resetModules();
    vi.unmock('jose');
  });

  test('check throws "Invalid token payload" if payload.id is not a string', async () => {
    jwtVerifyMock.mockResolvedValueOnce({ payload: { id: 123 } });
    const authService = new AuthServiceLocal();
    await expect(authService.check('Bearer sometoken', ['admin'])).rejects.toThrow('Unauthorized3');
  });

  test('check throws "Unauthorized1" if getUserById returns null', async () => {
    jwtVerifyMock.mockResolvedValueOnce({ payload: { id: 'user-id' } });
    const authService = new AuthServiceLocal();
    vi.spyOn(authService, 'getUserById' as keyof AuthService).mockResolvedValueOnce(null);
    await expect(authService.check('Bearer sometoken', ['admin'])).rejects.toThrow('Unauthorized3');
  });

  test('check throws "Unauthorized1" if getOauthUser returns null', async () => {
    jwtVerifyMock.mockResolvedValueOnce({
      payload: { name: 'n', email: 'e', picture: 'p', sub: 's' }
    });
    const authService = new AuthServiceLocal();
    vi.spyOn(authService, 'getOauthUser' as keyof AuthService).mockResolvedValueOnce(null);
    await expect(authService.check('Bearer sometoken', ['admin'])).rejects.toThrow('Unauthorized3');
  });

  test('check throws "Invalid token payload" if payload is missing required oauth fields', async () => {
    jwtVerifyMock.mockResolvedValueOnce({ payload: { name: 'n', email: 'e' } });
    const authService = new AuthServiceLocal();
    await expect(authService.check('Bearer sometoken', ['admin'])).rejects.toThrow('Unauthorized3');
  });
});

test('getUserById returns user object if found', async () => {
  const authService = new AuthService();
  const mockUser = {
    id: 'user-123',
    data: { name: 'Test User', email: 'test@example.com', role: ['admin'] }
  };
  vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [mockUser] } as any);

  // @ts-ignore: Accessing private method for test
  const result = await authService['getUserById']('user-123');
  expect(result).toEqual({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: ['admin'],
  });
});

test('getUserById returns undefined if user not found', async () => {
  const authService = new AuthService();
  vi.spyOn(pool, 'query').mockResolvedValueOnce({ rows: [] } as any);

  // @ts-ignore: Accessing private method for test
  const result = await authService['getUserById']('not-found');
  expect(result).toBeUndefined();
});
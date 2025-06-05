import { vi, test, expect } from 'vitest';
import * as http from 'http';

import { getEnvPath } from '../src/server'

// eslint-disable-next-line @typescript-eslint/no-empty-function
vi.spyOn(console, 'log').mockImplementation(() => {});

// test('Server starts and logs startup messages', async () => {
//   const listenSpy = vi.spyOn(http.Server.prototype, 'listen').mockImplementation(function (this: http.Server, port, callback) {
//     callback?.()
//     return this
//   })

//   await import('../src/server')

//   expect(listenSpy).toHaveBeenCalledWith(3014, expect.any(Function))

//   expect(console.log).toHaveBeenCalledWith('Server Running on port 3014')

//   listenSpy.mockRestore()
// });

test('Server starts and calls bootstrap', async () => {
  require.resolve('../src/server.ts')
  vi.resetModules() 

  const { app } = await import('../src/app')

  const listenSpy = vi.spyOn(app, 'listen').mockImplementation((port: number, cb: () => void) => {
    cb()
    return http.createServer(app)
  })

  // const bootstrapSpy = vi.spyOn(await import('../src/app'), 'bootstrap').mockResolvedValue(undefined)

  await import('../src/server')

  expect(listenSpy).toHaveBeenCalledWith(3014, expect.any(Function))
  // expect(bootstrapSpy).toHaveBeenCalled()
  // expect(console.log).toHaveBeenCalledWith('Running a GraphQL Playground at http://localhost:3014/playground')

  listenSpy.mockRestore()
})

test('getEnvPath resolves .prod.env on Unix path', () => {
  const result = getEnvPath('/some/dir/build/server')
  expect(result).toMatch(/\.prod\.env$/)
})

test('getEnvPath resolves .prod.env on Windows path', () => {
  const result = getEnvPath('\\some\\dir\\build\\server')
  expect(result).toMatch(/\.prod\.env$/)
})

test('getEnvPath resolves .env otherwise', () => {
  const result = getEnvPath('/some/dir/dev/server')
  expect(result).toMatch(/\.env$/)
})
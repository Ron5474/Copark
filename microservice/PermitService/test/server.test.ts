import { vi, test, expect, afterEach } from 'vitest'
import * as http from 'http'

// import { bootstrap } from '../src/app'
import { getEnvPath } from '../src/server'

afterEach(() => {
  vi.restoreAllMocks()
})

vi.mock('../src/app', async () => {
  const actual = await vi.importActual('../src/app')
  return {
    ...actual,
    bootstrap: vi.fn(() => Promise.resolve()),
  }
})

vi.spyOn(console, 'log').mockImplementation(() => undefined)

// test('Server starts and calls bootstrap', async () => {
//   const listenSpy = vi.spyOn(http.Server.prototype, 'listen').mockImplementation(function (this: http.Server, port, callback) {
//     callback?.()
//     return this
//   })

//   // Import the server
//   await import('../src/server')

//   expect(listenSpy).toHaveBeenCalledWith(4003, expect.any(Function))
//   expect(bootstrap).toHaveBeenCalled()
//   expect(console.log).toHaveBeenCalledWith('Running a GraphQL Playground at http://localhost:4003/playground')
// })

test('Server starts and calls bootstrap', async () => {
  require.resolve('../src/server.ts')
  vi.resetModules() 

  const { app } = await import('../src/app')

  const listenSpy = vi.spyOn(app, 'listen').mockImplementation((port: number, cb: () => void) => {
    cb()
    return http.createServer(app)
  })

  const bootstrapSpy = vi.spyOn(await import('../src/app'), 'bootstrap').mockResolvedValue(undefined)

  await import('../src/server')

  expect(listenSpy).toHaveBeenCalledWith(4003, expect.any(Function))
  expect(bootstrapSpy).toHaveBeenCalled()
  expect(console.log).toHaveBeenCalledWith('Running a GraphQL Playground at http://localhost:4003/playground')

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
import { vi, test, expect } from 'vitest';
import * as http from 'http';

// eslint-disable-next-line @typescript-eslint/no-empty-function
vi.spyOn(console, 'log').mockImplementation(() => {});

test('Server starts and logs startup messages', async () => {
  const listenSpy = vi.spyOn(http.Server.prototype, 'listen').mockImplementation(function (this: http.Server, port, callback) {
    callback?.()
    return this
  })

  await import('../src/server')

  expect(listenSpy).toHaveBeenCalledWith(3010, expect.any(Function))

  expect(console.log).toHaveBeenCalledWith('Server Running on port 3010')

  listenSpy.mockRestore()
});

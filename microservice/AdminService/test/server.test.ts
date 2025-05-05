import { vi, test, expect } from 'vitest';
import * as http from 'http';
import { bootstrap } from '../src/app';

vi.mock('../src/app', async () => {
  const actual = await vi.importActual('../src/app');
  return {
    ...actual,
    bootstrap: vi.fn(() => Promise.resolve()),
  };
});

vi.spyOn(console, 'log').mockImplementation(() => {});

test('Server starts and calls bootstrap', async () => {
  const listenSpy = vi.spyOn(http.Server.prototype, 'listen').mockImplementation(function (this: http.Server, port, callback) {
    callback?.();
    return this;
  });

  // Import the server
  await import('../src/server');

  expect(listenSpy).toHaveBeenCalledWith(4000, expect.any(Function));
  expect(bootstrap).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith('Running a GraphQL Playground at http://localhost:4000/playground');

  listenSpy.mockRestore();
});
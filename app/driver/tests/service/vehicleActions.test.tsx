import { vi, it, expect } from 'vitest';
import * as actions from '@/app/[locale]/vehicle/actions';
import {http, HttpHandler, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

function apis(server: { use: (...handlers: HttpHandler[]) => void; listen: () => void; }, failGet = false) {
  server.use(
    http.post('http://localhost:4001/graphql', async ({ request }) => {
      const body = await request.json();
      if (body && typeof body === 'object' && typeof body.query === 'string') {
        const query = body.query;
        if (query.includes('mutation RegisterVehicle')) {
          return HttpResponse.json({
            errors: [{ message: 'Vehicle already registered' }],
        });
      } else if (query.includes('mutation UpdateVehicle')) {
        if (failGet) {
          return HttpResponse.json({
            errors: [{ message: 'Failed to update vehicle' }],
          }, { status: 200 });
        }
        return HttpResponse.json({
          data: {
            registerVehicle: {
              id: '1',
              state: 'California',
              plate: 'ABC123',
              nickname: 'My Updated Car',
            },
          },
        });
      } else if (query.includes('mutation DeleteVehicle')) {
        if (failGet) {
          return HttpResponse.json({
            errors: [{ message: 'Failed to delete vehicle' }],
          }, { status: 200 });
        }
        return HttpResponse.json({
          data: {
            deleteVehicle: true,
          },
        });
      } else if (query.includes('mutation UpdateDefaultVehicle')) {
        if (failGet) {
          return HttpResponse.json({
            errors: [{ message: 'Failed to update default vehicle' }],
          }, { status: 200 });
        }
        return HttpResponse.json({
          data: {
            updateDefaultVehicle: {
              id: '1',
              plate: 'ABC123',
              state: 'California',
              nickname: 'My Car',
            },
          },
        });
      } else if (query.includes('query defaultVehicle')) {
        if (failGet) {
          return HttpResponse.json({
            errors: [{ message: 'Failed to fetch default vehicle' }],
          }, { status: 200 });
        }
        return HttpResponse.json({
          data: {
            getDefaultVehicle: {
              id: '1',
              plate: 'ABC123',
              state: 'California',
              nickname: 'My Car',
            },
          },
        });
      } else if (query.includes('query GetVehicles')) {
        if (failGet) {
          return HttpResponse.json({
            errors: [{ message: 'Failed to fetch vehicles' }],
          }, { status: 200 });
        }
        return HttpResponse.json({
          data: {
            myVehicles: [
              {
                id: '1',
                plate: 'ABC123',
                state: 'California',
                nickname: 'My Car',
              },
            ],
          },
        });
      }
      }
      return HttpResponse.json({ data: {} });
    })
  )
    };
vi.mock('next/navigation', () => ({
  getLocale: () => 'en',
  redirect: vi.fn()
}));

vi.mock('@/i18n/navigation', () => {
  const mockRedirect = vi.fn();
  return {
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  redirect: mockRedirect,
};});

vi.mock('next/headers', () => {
  const mockCookies = {
    get: vi.fn((name) => {
      if (name === 'auth-token') {
        return { value: 'mocked-auth-token-123' };
      }
      return null;
    }),
    getAll: vi.fn(() => [
      { name: 'auth-token', value: 'mocked-auth-token-123' },
    ]),
    set: vi.fn(),
    delete: vi.fn(),
  }

  return {
    cookies: () => mockCookies,
    headers: () => new Headers(),
  }
})

it('Should register vehicle successfully', async () => {
  apis(server);
  server.listen();
  
  await expect(actions.addVehicle({
    plate: 'ABC123',
    state: 'California',
    nickname: 'My Car',

  })).rejects.toThrow('This plate has already been registered.');
});

it('Should update vehicle successfully', async () => {
  apis(server);
  server.listen();
  
  const result = await actions.editVehicle({
    id: '1',
    nickname: 'My Updated Car',
  });

  expect(result).toEqual({
    id: '1',
    plate: 'ABC123',
    state: 'California',
    nickname: 'My Updated Car',
  });
});

it('Should handle vehicle update failure', async () => {
  apis(server, true);
  server.listen();
  
  await expect(actions.editVehicle({
    id: '1',
    nickname: 'My Updated Car',
  })).rejects.toThrow('Failed to edit vehicle');
});

it('Should delete vehicle successfully', async () => {
  apis(server);
  server.listen();
  
  const result = await actions.deleteVehicle('ABC123', 'California');
  
  expect(result).toBe(true);
});

it('Should handle vehicle deletion failure', async () => {
  apis(server, true);
  server.listen();
  
  const result = await actions.deleteVehicle('ABC123', 'California');
  expect(result).toStrictEqual({
    message: 'Failed to delete vehicle',
    type: 'error',
  });
});

it('returns my vehicles successfully', async () => {
  apis(server);
  server.listen();
  
  const result = await actions.getVehicles();
  
  expect(result).toEqual([
    {
      id: '1',
      plate: 'ABC123',
      state: 'California',
      nickname: 'My Car',
    },
  ]);
})
it('Should handle vehicle fetch failure', async () => {
  apis(server, true);
  server.listen();
  
  await expect(actions.getVehicles()).rejects.toThrow('Failed to fetch vehicles');
});

it('no plate and state should throw error', async () => {
  apis(server);
  server.listen();
  
  await expect(actions.deleteVehicle('AVSC')).rejects.toThrow('Plate and state are required to delete a vehicle');
})

it('Should update default vehicle successfully', async () => {
  apis(server);
  server.listen();
  
  const result = await actions.updateDefaultVehicle('1');
  
  expect(result).toEqual({
    id: '1',
    plate: 'ABC123',
    state: 'California',
    nickname: 'My Car',
  });
});

it('Should handle default vehicle update failure', async () => {
  apis(server, true);
  server.listen();
  
  await expect(actions.updateDefaultVehicle('1')).rejects.toThrow('Failed to update default vehicle');
});

it('Should fetch default vehicle successfully', async () => {
  apis(server);
  server.listen();
  
  const result = await actions.getDefaultVehicle();
  
  expect(result).toEqual({
    id: '1',
    plate: 'ABC123',
    state: 'California',
    nickname: 'My Car',
  });
});

it('Should handle default vehicle fetch failure', async () => {
  apis(server, true);
  server.listen();

  const result = await actions.getDefaultVehicle();
  
  expect(result).toBeNull();
});
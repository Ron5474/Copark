import { vi, it, expect } from 'vitest';
import * as actions from '@/app/[locale]/dashboard/permitActions';
import {http, HttpHandler, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

function permit(server: { use: (arg0: HttpHandler) => void; }, failGet = false) {
  server.use(
    http.post('http://localhost:4003/graphql', async ({ request }) => {
      const body = await request.json();

      if (body && typeof body === 'object' && typeof body.query === 'string') {
        const query = body.query;
        if (query.includes('query GetLotDetails')) {
          if (!failGet) {
            return HttpResponse.json({
              data: {
                allLotDetails: [
                  {
                    id: '1',
                    title: 'Lot 1',
                    lots: [
                      { name: 'Lot A', price: 10 },
                      { name: 'Lot B', price: 20 },
                    ],
                  },
                  {
                    id: '2',
                    title: 'Lot 2',
                    lots: [
                      { name: 'Lot C', price: 15 },
                      { name: 'Lot D', price: 25 },
                    ],
                  },
                ],
              },
            });
          } else {
            return HttpResponse.json(
              {
                errors: [{ message: 'Failed to fetch lot details' }],
              },
              { status: 200 }
            );
          } 
        } else if (query.includes('query GetMyPermits')) {
          if (!failGet) {
            return HttpResponse.json({
              data: {
                myPermits: {
                  active: [
                    {
                      vehicle: 'Car A',
                      type: 'Monthly',
                      area: 'Zone 1',
                      durationType: 'Monthly',
                      activeDate: '2023-10-01',
                      expireDate: '2024-10-01',
                    },
                  ],
                },
              },
            });
          } else {
            return HttpResponse.json(
              {
                errors: [{ message: 'Unkown Query' }],
              },
              { status: 200 }
            );
          }
        }
      } 
    }))
  };

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
});

it('Should fetch lot details successfully', async () => {
  permit(server, false);
  server.listen();

  const result = await actions.getLotDetails();
  
  expect(result).toEqual([
    {
      id: '1',
      title: 'Lot 1',
      lots: [
        { name: 'Lot A', price: 10 },
        { name: 'Lot B', price: 20 },
      ],
    },
    {
      id: '2',
      title: 'Lot 2',
      lots: [
        { name: 'Lot C', price: 15 },
        { name: 'Lot D', price: 25 },
      ],
    },
  ]);
})

it('Should handle error when fetching lot details fails', async () => {
  permit(server, true);
  server.listen();

  await expect(actions.getLotDetails()).rejects.toThrow('Failed to fetch lot details');
});

it('Should fetch my permits successfully', async () => {
  permit(server, false);
  server.listen();

  const result = await actions.getMyPermits();
  
  expect(result).toEqual({
    active: [
      {
        vehicle: 'Car A',
        type: 'Monthly',
        area: 'Zone 1',
        durationType: 'Monthly',
        activeDate: '2023-10-01',
        expireDate: '2024-10-01',
      },
    ],
  });
});

it('Should handle error when fetching my permits fails', async () => {
  permit(server, true);
  server.listen();

  await expect(actions.getMyPermits()).rejects.toThrow('Failed to fetch my permits');
});
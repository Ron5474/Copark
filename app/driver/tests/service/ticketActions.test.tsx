import { vi, it, expect } from 'vitest';
import * as actions from '@/app/[locale]/ticket/actions';
import {http, HttpHandler, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

function ticket(server: { use: (...handlers: HttpHandler[]) => void; listen: () => void; }, failGet = false,) {
  server.use(
    http.post('http://localhost:4002/graphql', async ({ request }) => {
      const body = await request.json();
      if (body && typeof body === 'object' && typeof body.query === 'string') {
        const query = body.query;
        if (query.includes('query getMyTickets')) {
          if (failGet) {
            return HttpResponse.json(
              {
                errors: [{ message: 'Failed to fetch tickets' }],
              },
              { status: 200 }
            );
          }
          return HttpResponse.json({
            data: {
              getMyTickets: [
                {
                  id: '1',
                  vehicle: 'Car A',
                  fine: 50,
                  violation: 'Speeding',
                  images: ['image1.jpg', 'image2.jpg'],
                  ticketStaus: 'Unpaid',
                  ticketDate: '2023-10-01',
                }, {
                  id: '2',
                  vehicle: 'Car B',
                  fine: 75,
                  violation: 'Parking Violation',
                  images: ['image3.jpg'],
                  ticketStaus: 'Paid',
                  ticketDate: '2023-10-02',
                }
              ]
            },
          });
        } else if (query.includes('mutation ChallengeTicket')) {
          if (failGet) {
            return HttpResponse.json(
              {
                errors: [{ message: 'Failed to challenge ticket' }],
              },
              { status: 200 }
            );
          }
            return HttpResponse.json({
              data: {
                challengeTicket: {
                  status: 'Challenged',
                },
              },
            });
          }
        } else {
          return HttpResponse.json(
            {
              errors: [{ message: 'Unknown query' }],
            },
            { status: 400 }
          );
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
})

it('Should fetch tickets successfully', async () => {
  ticket(server, false);
  server.listen();

  const result = await actions.getTickets();

  expect(result).toEqual([
    {
      id: '1',
      vehicle: 'Car A',
      fine: 50,
      violation: 'Speeding',
      images: ['image1.jpg', 'image2.jpg'],
      ticketStaus: 'Unpaid',
      ticketDate: '2023-10-01',
    },
    {
      id: '2',
      vehicle: 'Car B',
      fine: 75,
      violation: 'Parking Violation',
      images: ['image3.jpg'],
      ticketStaus: 'Paid',
      ticketDate: '2023-10-02',
    }
  ]);
});

it('Should handle ticket fetch failure', async () => {
  ticket(server, true);
  server.listen();

  await expect(actions.getTickets()).rejects.toThrow("Failed to fetch tickets");
});

it('Should challenge a ticket successfully', async () => {
  ticket(server, false);
  server.listen();

  const result = await actions.challengeTicket('1', 'Challenging ticket for speeding');

  expect(result).toEqual({
    status: 'Challenged',
  });
});
it('Should handle ticket challenge failure', async () => {
  ticket(server, true);
  server.listen();

  await expect(actions.challengeTicket('1', 'Challenging ticket for speeding')).rejects.toThrow("Failed to challenge ticket");
});